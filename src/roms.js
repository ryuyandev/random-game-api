const { readFile } = require('fs/promises')
const path = require('path'),
  chance = require('chance').Chance()

const allowedPlatforms = {
  'n64': 4,
  'gb': 33,
  'gbc': 22,
  'gba': 24,
  'nes': 18,
  'snes': 19,
  'genesis': 29,
  'gamegear': 35,
}

const getRandomConsoleGame = async slug => {
  if (!slug)
    slug = chance.pickone(Object.keys(allowedPlatforms))

  if (!(slug in allowedPlatforms))
    throw new Error('Unknown platform')

  const platforms = JSON.parse(await readFile(path.join(__dirname, 'data/platforms.json')))
  const games = JSON.parse(await readFile(path.join(__dirname, `data/gameList_${allowedPlatforms[slug]}.json`)))
  const platform = platforms.find(platform => platform.id === allowedPlatforms[slug])
  const game = chance.pickone(games)

  return { platform, game }
}

module.exports = {
  getRandomConsoleGame,
}