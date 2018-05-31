import { GameplayClient } from "./../src/GameplayClient"
import { GameplayServer } from "./../src/GameplayServer"

const sleep = (time: number): Promise<void> => {
    return new Promise<void>(resolve => {
        window.setTimeout(() => resolve(), time)
    })
}

const waitFor = (func: () => boolean, message: string, timeout: number = 1000) => {
    const tries = 10
    let currentTry = 1
    let lastValue = func()

    while (!lastValue && currentTry <= tries) {
        sleep(timeout / tries)
        currentTry++
    }

    if (currentTry > tries) {
        throw new Error("WaitFor failed " + message)
    }
}

describe("ConnectionTests", () => {
    it("connects", async () => {
        const server = new GameplayServer()
        const client = new GameplayClient("http://127.0.0.1")

        let serverOnClientConnectedHitCount = 0
        server.onClientConnected.subscribe(() => {
            serverOnClientConnectedHitCount++
        })

        server.start()
        client.connect()

        await waitFor(() => serverOnClientConnectedHitCount === 1, "Wait for client to connect")
    })
})
