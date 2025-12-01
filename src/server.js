require('dotenv').config()

const express = require('express'),
  cors = require('cors'),
  { errorHandler, asyncRoute } = require('./helpers'),
  { getRandomSteamGame } = require('./steamGames'),
  { getRandomConsoleGame, getGameImage } = require('./roms')
  

const app = express()

if (process.env.NODE_ENV != 'production')
    app.use(cors())

app.use(errorHandler)

app.get('/all', asyncRoute(async (req, res) => {
  const game = await getRandomSteamGame()
  res.send(game)
}))

app.get('/unplayed', asyncRoute(async (req, res) => {
  const game = await getRandomSteamGame(game => game.playtime_forever === 0)
  res.send(game)
}))

app.get('/played', asyncRoute(async (req, res) => {
  const game = await getRandomSteamGame(game => game.playtime_forever > 0)
  res.send(game)
}))

app.get('/roms', asyncRoute(async (req, res) => {
  const game = await getRandomConsoleGame({ excludeIds: req.query.excludeIds })
  res.send(game)
}))

app.get('/roms/image-proxy', asyncRoute(async (req, res) => {
  await getGameImage({ res, url: req.query.url })
}))

app.get('/roms/:platform', asyncRoute(async (req, res) => {
  const game = await getRandomConsoleGame({ platform: req.params.platform, excludeIds: req.query.excludeIds })
  res.send(game)
}))

app.listen(process.env.API_PORT, () => {
  console.log(`Server listening on port ${process.env.API_PORT}`)
})
