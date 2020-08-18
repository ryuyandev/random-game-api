require('dotenv').config()

const express = require('express'),
  cors = require('cors'),
  { errorHandler, asyncRoute } = require('./helpers'),
  { getRandomGame } = require('./games')

const app = express()

if (process.env.NODE_ENV != 'production')
    app.use(cors())

app.use(errorHandler)

app.get('/all', asyncRoute(async (req, res) => {
  const game = await getRandomGame()
  res.send(game)
}))

app.get('/unplayed', asyncRoute(async (req, res) => {
  const game = await getRandomGame(game => game.playtime_forever === 0)
  res.send(game)
}))

app.get('/played', asyncRoute(async (req, res) => {
  const game = await getRandomGame(game => game.playtime_forever > 0)
  res.send(game)
}))

app.listen(process.env.API_PORT, () => {
  console.log(`Server listening on port ${process.env.API_PORT}`)
})
