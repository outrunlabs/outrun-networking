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

        let latestId: string = null
        server.onClientConnected.subscribe(({ id }) => {
            latestId = id
        })

        await server.start()
        await client.connect()

        let lastMessage: any = null
        client.onMessageEvent.subscribe(({ message }) => {
            lastMessage = message
        })

        server.send(latestId, message)

        await waitFor(() => lastMessage !== null, "Wait for messaage to be received")

        expect(lastMessage).toEqual(message)
    })
})
