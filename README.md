# Steam Random Game Picker API
This repository holds the back end for my random game picker project. It returns the name and ID of random game from the Steam library of a user configurable via environment variable. It supports picking from a list of games the user has played, games the user has not played, or all the user's games.

This project was created as an experiment to demonstrate some proficency creating back-end projects with Express.js.
It is hosted on a virtual Linux server running in the cloud using docker with a CI/CD pipeline that utilizes GitHub Actions, Docker Hub, and [Watchtower](https://github.com/containrrr/watchtower).

The project runs in tandem with a Vue.js front end, located [here](https://github.com/ryuyan-dev/random-game-front-end).

## Usage

1. Create a .env file at the root of this project that contains the following values
    - `NODE_ENV=local` controls whether or not cors is enabled
    - `STEAM_API_KEY=somekey` your [steam api developer key](https://steamcommunity.com/dev)
    - `STEAM_ID=someid` your steam account [SteamID64](https://developer.valvesoftware.com/wiki/SteamID)
    - `API_PORT=1337` the port number you want the API to run on
    - (OPTIONAL) `REDIS_HOST=host` the location of a Redis server. If present, the API will cache the list of games from steam and only pull an updated list every `CACHE_INTERVAL` minutes
    - (OPTIONAL) `REDIS_PORT` the port of the Redis server (defaults to 6379)
    - (OPTIONAL) `REDIS_PASS` the password of the Redis server, if needed
    - (OPTIONAL) `CACHE_INTERVAL` the number of minutes to cache the data for (defaults to 300, unused if redis is not configured)
2. Run `npm run dev` to develop locally
3. Run `npm start` to run in production mode

# Docker Container

To run an instance of this project via docker, follow step 1 from the above to create a .env file and run the following command:

```
docker run -d --name random-game-api --env-file .env ryuyandev/random-game-api
```
