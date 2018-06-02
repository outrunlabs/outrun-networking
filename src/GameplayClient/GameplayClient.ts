import { IEvent, Event } from "oni-types"

import * as request from "request-promise"
import * as SimplePeer from "simple-peer"

export type GameplayClientOptions = {
    wrtc: any
}

const DefaultGameplayClientOptions = {
    wrtc: null,
}

export type ClientMessageEventArgs = {
    message: any
}

export class GameplayClient {
    private _onConnectedEvent = new Event<void>()
    private _onMessageEvent = new Event<ClientMessageEventArgs>()
    private _onDisconnectedEvent = new Event<void>()
    private _peer: SimplePeer.Instance | null = null

    public get onConnectedEvent(): IEvent<void> {
        return this._onConnectedEvent
    }

    public get onMessageEvent(): IEvent<ClientMessageEventArgs> {
        return this._onMessageEvent
    }

    constructor(
        private _connectionUrl: string,
        private _opts: GameplayClientOptions = DefaultGameplayClientOptions,
    ) {}

    public async connect(): Promise<void> {
        return new Promise(async res => {
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
            this._peer = peer

            peer.on("signal", data => {
                const reply = request(`${this._connectionUrl}/answer/${token}`, {
                    method: "POST",
                    body: data,
                    json: true,
                })
            })

            peer.on("connect", () => {
                console.log("client connected!")
                res()
            })

            peer.on("data", msg => {
                this._onMessageEvent.dispatch({
                    message: msg,
                })
            })

            peer.signal(JSON.parse(invite))
        })
    }

    public disconnect(): void {}

    public send(message: any): void {
        if (this._peer) {
            this._peer.send(JSON.stringify(message))
        }
    }
}
