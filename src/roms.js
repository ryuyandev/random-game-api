const { readFile, readdir } = require('fs/promises')
const path = require('path'),
  chance = require('chance').Chance(),
  axios = require('axios');

let supportedPlatforms;

const getRandomConsoleGame = async ({ platform, excludeIds }) => {
  if (!supportedPlatforms) {
    const dataFileNames = await readdir(path.join(__dirname, 'data'))
    supportedPlatforms = dataFileNames
      .filter(name => name.startsWith('gameList_'))
      .map(name => name.substring(name.indexOf('_') + 1, name.indexOf('.')))
  }
  excludeIds = new Set(excludeIds)

  if (!platform)
    platform = chance.pickone(supportedPlatforms)

  if (!supportedPlatforms.includes(platform))
    throw new Error('Unknown platform')

  const games = JSON.parse(await readFile(path.join(__dirname, `data/gameList_${platform}.json`)))
  const filteredGames = games.filter(game => !excludeIds.has(game.id))
  const game = chance.pickone(filteredGames)
  game.platform = platform

  return game
}

const getGameImage = async ({ url, res }) => {
  if (!url) {
    throw new Error('url required for game image')
  }

  let targetUrl
  try {
    targetUrl = new URL(url)
  } catch {
    throw new Error('invalid url for game image')
  }

  if (targetUrl.host !== 'dl.vimm.net') {
    throw new Error('invalid host for game image')
  }

  const response = await axios.get(targetUrl.toString(), {
    responseType: 'stream',
    headers: {
      Referer: 'https://vimm.net/',
    },
    validateStatus: () => true,
  })

  if (response.status >= 400) {
    throw new Error('failed to get game image')
  }

  if (response.headers['content-type']) {
    res.setHeader('Content-Type', response.headers['content-type'])
  }

  response.data.pipe(res)
}

module.exports = {
  getRandomConsoleGame,
  getGameImage,
}
