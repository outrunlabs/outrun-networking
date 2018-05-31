import * as fs from "fs"
import * as path from "path"

import * as minimist from "minimist"

import { Game } from "outrun-game-core"
import { GameplayServer } from "./../GameplayServer"

const args = minimist(process.argv.slice(2))

const port = args.port || 80

const serverFiles = args["_"]

if (serverFiles.length !== 1) {
    console.error("You must provide a file, like: 'start-game-server my-server.js'")
    process.exit(1)
}

let entryPoint = path.join(process.cwd(), args["_"][0])

if (!fs.existsSync(entryPoint)) {
    console.error("Cannot find file: " + entryPoint)
    process.exit(1)
}

const activate = require(entryPoint).activate

if (!activate) {
    console.error("Your server must export an 'activate' method")
    process.exit(1)
}

const wrtc = require("wrtc")

const gameplayServer = new GameplayServer({
    wrtc,
    port: 80,
})

const game = Game.start()
gameplayServer.start()
game.setUpdateRate(30)
game.start()

game.onTick.subscribe(tickEvent =>
    console.log(`[Tick ${tickEvent.tick}]: Incrementing time - ${tickEvent.deltaTime}`),
)

gameplayServer.onClientConnected.subscribe(({ id }) => console.log(`Client connected: ${id}`))

activate({ gameplayServer, game })
