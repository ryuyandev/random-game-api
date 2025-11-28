require('dotenv').config()
const { writeFile } = require('fs/promises')
const path = require('path')
const axios = require('axios')
const { delay, getTwitchAccessToken } = require('./helpers');

(async () => {
    const accessToken = await getTwitchAccessToken()
    const platforms = []
    let response, offset = 0
    do {
        response = await axios.post('https://api.igdb.com/v4/platforms', `
            fields name, slug, platform_logo.image_id;
            limit 500;
            offset ${offset};
        `, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain',
            }
        })
        platforms.push(...response.data)
        console.log(`Added ${response.data.length} platforms to list. ${platforms.length} total`)
        offset += 500;
        await delay(500);
    } while (response.data.length === 500)

    await writeFile(path.join(__dirname, `data/platforms.json`), JSON.stringify(platforms))
})()