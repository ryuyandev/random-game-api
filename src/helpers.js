const axios = require('axios')

const errorHandler = (err, req, res, next) => {
  if (!res.headersSent) {
    let message = err.message || 'error'
    if (!err.public && process.env.NODE_ENV === 'production')
      message = 'unhandled exception'

    res.status(err.status || 500)
      .json({ type: 'error', message })
  }

  next(err)
}

const asyncRoute = routeHandler => (req, res, next) => {
  Promise.resolve(routeHandler(req, res, next))
    .catch(err => errorHandler(err, req, res, next))
}

const delay = amount => new Promise(resolve => setTimeout(resolve, amount))

const getTwitchAccessToken = async () => {
    const params = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
    });

    const response = await axios.post('https://id.twitch.tv/oauth2/token', params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    return response.data.access_token;
}

module.exports = {
  errorHandler,
  asyncRoute,
  getTwitchAccessToken,
  delay,
}
