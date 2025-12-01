require('dotenv').config()
const { writeFile } = require('fs/promises')
const path = require('path')
const axios = require('axios')
const https = require('https')
const cheerio = require('cheerio');

const system = 'N64';

(async () => {
  const games = []
  for (let i = 64; i < 91; i++) {
    const section = i === 64
      ? 'number'
      : String.fromCharCode(i)

    try {
      // Get current page HTML
      const response = await axios.get(`https://vimm.net/vault/?p=list&system=${system}&section=${section}`, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      })

      // Load HTML into cheerio
      const page = cheerio.load(response.data)

      // Extract data from page
      const data = page.extract({
        games: [
            {
            selector: 'main.mainContent > table tr > td:first-child',
            value: {
              name: {
                selector: 'a',
                value: 'innerHTML',
              },
              id: {
                selector: 'a',
                value: el => page(el).attr('href').split('/').pop(),
              },
            }
          },
        ]
      })

      // Add detected games to list
      games.push(...data.games)
      console.log(`Added ${data.games.length} games to list. ${games.length} total`)
    } catch (err) {
      if (err.isAxiosError && err.response?.status === 404) {
        console.log('No games found')
        continue
      } else {
        console.error(err)
        return
      }
    }
  }

  await writeFile(path.join(__dirname, `data/gameList_${system.toLowerCase()}.json`), JSON.stringify(games))
})()