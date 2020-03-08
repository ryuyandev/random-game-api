require('dotenv').config()

const express = require('express'),
  cors = require('cors'),
  axios = require('axios'),
  chance = require('chance').Chance(),
  { errorHandler, asyncRoute } = require('./helpers')

const app = express()

if (process.env.NODE_ENV != 'production')
    app.use(cors())

app.use(errorHandler)

app.get('/get-random-unplayed-game', asyncRoute(async (req, res) => {
  const binHeaders = {
    'secret-key': process.env.JSON_BIN_KEY,
    versioning: false
  }

  const binData = (await axios.get(`https://api.jsonbin.io/b/${process.env.JSON_BIN_ID}/latest`, {
    headers: binHeaders
  })).data

  let games = []
  const currentTime = new Date()
  const elapsedHours = binData.time
    ? (currentTime - new Date(binData.time)) / 1000 / 60 / 60
    : null

  if (elapsedHours !== null && elapsedHours < 12)
    games = binData.games
  else {
    try {
      games = (await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001`, {
        params: {
          key: process.env.STEAM_API_KEY,
          steamid: process.env.STEAM_KEY,
          include_appinfo: 'true',
          format: 'json'
        }
      })).data.response.games
    } catch (e) {
      games = binData.games
    }

    axios.put(`https://api.jsonbin.io/b/${process.env.JSON_BIN_ID}`, {
      games,
      time: currentTime
    }, {
      headers: binHeaders
    })
  }

  const unplayedGames = games.filter(game => game.playtime_forever === 0)
  const unplayedGame = chance.pickone(unplayedGames)
  res.send({
    id: unplayedGame.appid,
    name: unplayedGame.name
  })
}))

app.listen(process.env.API_PORT, () => {
  console.log(`Server listening on port ${process.env.API_PORT}`)
})