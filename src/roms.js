const { readFile, readdir } = require('fs/promises')
const { Readable } = require('stream')
const path = require('path'),
  chance = require('chance').Chance();

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

  const response = await fetch(targetUrl.toString(), {
    headers: {
      Referer: 'https://vimm.net/',
    },
  })

  if (!response.ok || !response.body) {
    throw new Error('failed to fetch game image')
  }

  const contentType = response.headers.get('content-type')
  if (contentType) {
    res.setHeader('Content-Type', contentType)
  }

  const stream = Readable.fromWeb(response.body)
  stream.pipe(res)
}

module.exports = {
  getRandomConsoleGame,
  getGameImage,
}
