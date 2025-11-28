require('dotenv').config()
const { writeFile } = require('fs/promises')
const path = require('path')
const axios = require('axios')
const { delay, getTwitchAccessToken } = require('./helpers');

const platform = '35';

(async () => {
    const accessToken = await getTwitchAccessToken()
    const games = []
    let response, offset = 0
    do {
        response = await axios.post('https://api.igdb.com/v4/games', `
            fields name, cover.image_id, screenshots.image_id;
            where platforms = ${platform};
            limit 500;
            offset ${offset};
        `, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain',
            }
        })
        games.push(...response.data)
        console.log(`Added ${response.data.length} games to list. ${games.length} total`)
        offset += 500;
        await delay(500);
    } while (response.data.length === 500)

    await writeFile(path.join(__dirname, `data/gameList_${platform}.json`), JSON.stringify(games))
})()