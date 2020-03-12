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

const getOwnedGames = async () => {
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

  return games
}

app.get('/all', asyncRoute(async (req, res) => {
  const games = await getOwnedGames()
  const game = chance.pickone(games)

  res.send({
    id: game.appid,
    name: game.name
  })
}))

app.get('/unplayed', asyncRoute(async (req, res) => {
  const unplayedGames = (await getOwnedGames())
    .filter(game => game.playtime_forever === 0)
  const unplayedGame = chance.pickone(unplayedGames)

  res.send({
    id: unplayedGame.appid,
    name: unplayedGame.name
  })
}))

app.get('/played', asyncRoute(async (req, res) => {
  const playedGames = (await getOwnedGames())
    .filter(game => game.playtime_forever > 0)
  const playedGame = chance.pickone(playedGames)

  res.send({
    id: playedGame.appid,
    name: playedGame.name
  })
}))

app.listen(process.env.API_PORT, () => {
  console.log(`Server listening on port ${process.env.API_PORT}`)
})