import { GameplayClient } from "./../src/GameplayClient"
import { GameplayServer } from "./../src/GameplayServer"

import * as wrtc from "wrtc"

import { sleep, waitFor } from "./../src/Common/Utility"

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
        })

        await server.start()
        await client.connect()

        await waitFor(() => serverOnClientConnectedHitCount === 1, "Wait for client to connect")
    })

    it("multiple clients can connect", async () => {
        const client1 = new GameplayClient("http://localhost:8000", { wrtc })
        const client2 = new GameplayClient("http://localhost:8000", { wrtc })

        let serverOnClientConnectedHitCount = 0
        server.onClientConnected.subscribe(() => {
            serverOnClientConnectedHitCount++
            console.log("New hit count: " + serverOnClientConnectedHitCount)
        })

        await server.start()
        await client1.connect()
        await client2.connect()

        await waitFor(
            () => serverOnClientConnectedHitCount === 2,
            "Wait for all clients to connect",
        )
    })

    it("clients should have unique ids", async () => {
        const client1 = new GameplayClient("http://localhost:8000", { wrtc })
        const client2 = new GameplayClient("http://localhost:8000", { wrtc })

        let clientIds: string[] = []
        server.onClientConnected.subscribe(({ id }) => {
            clientIds.push(id)
        })

        await server.start()
        await client1.connect()
        await client2.connect()

        await waitFor(() => clientIds.length === 2, "Wait for all clients to connect")

        expect(clientIds[0]).not.toEqual(clientIds[1])
        expect(typeof clientIds[0]).toBe("string")
        expect(typeof clientIds[1]).toBe("string")
    })
})
