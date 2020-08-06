# Steam Random Game Picker API
This repository holds the back end for my random game picker project.

This project was created as an experiment to demonstrate some proficency creating back-end projects with Express.js.
It is hosted on a virtual Linux server running in the cloud using docker with a CI/CD pipeline that utilizes GitHub Actions, Docker Hub, and [Watchtower](https://github.com/containrrr/watchtower).

The project runs in tandem with a Vue.js front end, located [here](https://github.com/ryuyan-dev/random-game-front-end).

## Usage

1. Create a .env file at the root of this project that contains the following values
    - `NODE_ENV=local` controls whether or not cors is enabled
    - `STEAM_API_KEY=somekey` your [steam api developer key](https://steamcommunity.com/dev)
    - `STEAM_ID=someid` your steam account [SteamID64](https://developer.valvesoftware.com/wiki/SteamID)
    - `API_PORT=1337` the port number you want the API to run on
2. Run `npm run dev` to develop locally
3. Run `npm start` to run in production mode

# Docker Container

To run an instance of this project via docker, run the following command:

```
docker run -d --name random-game-api --env-file .env ryuyandev/random-game-api
```
