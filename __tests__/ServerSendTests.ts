import { GameplayClient } from "./../src/GameplayClient"
import { GameplayServer } from "./../src/GameplayServer"

import * as wrtc from "wrtc"

import { sleep, waitFor } from "./../src/Common/Utility"

describe("ServerSendTests", () => {
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

    it("client can send a message that is received by server", async () => {
        const client = new GameplayClient("http://localhost:8000", { wrtc })

        const message = {
            type: "hello",
            payload: "world",
        }

        let messages: any[] = []
        let serverOnClientConnectedHitCount = 0
        server.onMessageReceived.subscribe(({ client, message }) => {
            messages.push(JSON.parse(message.toString()))
        })

        await server.start()
        await client.connect()

        client.send(message)

        await waitFor(() => messages.length > 0, "Wait for messaage to be received")

        expect(messages).toEqual([message])
    })
})
