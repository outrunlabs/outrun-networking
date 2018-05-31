import { IEvent, Event } from "oni-types"

import * as request from "request-promise"
import * as SimplePeer from "simple-peer"

export type GameplayClientOptions = {
    wrtc: any
}

const DefaultGameplayClientOptions = {
    wrtc: null,
}

export class GameplayClient {
    private _onConnectedEvent = new Event<void>()
    private _onMessageEvent = new Event<void>()
    private _onDisconnectedEvent = new Event<void>()

    public get onConnectedEvent(): IEvent<void> {
        return this._onConnectedEvent
    }

    constructor(
        private _connectionUrl: string,
        private _opts: GameplayClientOptions = DefaultGameplayClientOptions,
    ) {}

    public async connect(): Promise<void> {
        console.log("Making request to: " + this._connectionUrl)
        const token = await request(`${this._connectionUrl}/connect`)
        console.log("Got token: " + token)
        const invite = await request(`${this._connectionUrl}/redeem/${token}`)

        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            wrtc: this._opts.wrtc,
            channelConfig: {
                ordered: false,
                maxRetransmits: 0,
            },
        })

        peer.on("signal", data => {
            const reply = request(`${this._connectionUrl}/answer/${token}`, {
                method: "POST",
                body: data,
                json: true,
            })
        })

        peer.on("connect", () => {
            console.log("client connected!")
        })

        peer.signal(JSON.parse(invite))
    }

    public disconnect(): void {}

    public send(message: any): void {}
}
