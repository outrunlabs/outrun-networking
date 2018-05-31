import { GameplayClient } from "./../src/GameplayClient"
import { GameplayServer } from "./../src/GameplayServer"

import * as wrtc from "wrtc"

const sleep = (time: number): Promise<void> => {
    return new Promise<void>(resolve => {
        window.setTimeout(() => resolve(), time)
    })
}

const waitFor = async (
    func: () => boolean,
    message: string,
    timeout: number = 1000,
): Promise<void> => {
    const tries = 10
    let currentTry = 1
    let lastValue = func()

    while (!lastValue && currentTry <= tries) {
        await sleep(timeout / tries)
        lastValue = func()
        currentTry++
    }

    if (currentTry > tries) {
        throw new Error("WaitFor failed: " + message)
    }
}

describe("ConnectionTests", () => {
    let server: GameplayServer
    beforeEach(() => {
        server = new GameplayServer({
            wrtc,
            port: 8000,
        })
    })

    afterEach(() => {
        server.dispose()
    })
    it("connects", async () => {
        const client = new GameplayClient("http://localhost:8000", { wrtc })

        let serverOnClientConnectedHitCount = 0
        server.onClientConnected.subscribe(() => {
            serverOnClientConnectedHitCount++
            console.log("New hit count: " + serverOnClientConnectedHitCount)
        })

        console.log("server starting...")
        await server.start()
        console.log("server started")
        try {
            await client.connect()
        } catch (ex) {
            console.log("ERROR: " + ex)
        }

        await waitFor(() => serverOnClientConnectedHitCount === 1, "Wait for client to connect")
    })
})
