const redis = require('redis'),
  axios = require('axios'),
  chance = require('chance').Chance(),
  { promisify } = require('util')

async function getOwnedGames() {
  const currentTime = new Date(),
    cacheInterval = process.env.CACHE_INTERVAL || 300

  let games = [],
    client = null,
    getAsync = null

  if (process.env.REDIS_HOST) {
    client = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASS
    })

    getAsync = promisify(client.get).bind(client)

    const cacheTime = await getAsync('cacheTime')
    const elapsedMinutes = cacheTime && (currentTime - new Date(cacheTime)) / 1000 / 60

    if (elapsedMinutes < cacheInterval)
      games = JSON.parse(await getAsync('games')) || []
  }

  if (!games.length) {
    try {
      games = (await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001`, {
        params: {
          key: process.env.STEAM_API_KEY,
          steamid: process.env.STEAM_ID,
          include_appinfo: 'true',
          format: 'json'
        }
      })).data.response.games
    } catch (e) {
      if (getAsync)
        games = JSON.parse(await getAsync('games'))
    }

    if (client)
      client.mset('cacheTime', currentTime, 'games', JSON.stringify(games))
  }

  return games
}

const getRandomGame = async filter => {
  let games = await getOwnedGames()

  if (filter)
    games = games.filter(filter)

  const game = chance.pickone(games)

  return {
    id: game.appid,
    name: game.name
  }
}

module.exports = {
  getRandomGame
}