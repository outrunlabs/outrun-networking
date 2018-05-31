import * as http from "http"

import * as express from "express"
import * as bodyParser from "body-parser"
import * as SimplePeer from "simple-peer"
const nanoid = require("nanoid")

import { Event, IEvent } from "oni-types"

// ConnectionBroker flow:
// - First, client calls /connect to initiate a connection. A SimplePeer is created, and a token is returned.
// - The client creates a Peer that signals with the invite returned in connect.
// - The client should listen for the 'signal' event and callback with
// - At this point, since there is no trickling, the peers should be connected unless there is a connection error.

const getUniqueToken = () => nanoid(48)

export type ConnectionBrokerOptions = {
    wrtc: any
    port: number
}

export const DefaultBrokerOptions: ConnectionBrokerOptions = {
    port: 80,
    wrtc: null,
}

export type Connection = {
    token: string
    peer: SimplePeer.Instance
    offer: any | null
}

export class ConnectionBroker {
    private _app: express.Express
    private _tokenToConnection: { [token: string]: Connection } = {}
    private _server: http.Server
    private _onPeerConnectedEvent = new Event<SimplePeer.Instance>()

    public get onPeerConnected(): IEvent<SimplePeer.Instance> {
        return this._onPeerConnectedEvent
    }

    constructor(private _opts: ConnectionBrokerOptions = DefaultBrokerOptions) {
        this._app = express()
        this._app.use(bodyParser.json())

        this._app.get("/connect", (req, res) => {
            console.log("test!")
            const token = getUniqueToken()
            console.log("tokeN: " + token)
            const peer = new SimplePeer({
                initiator: true,
                wrtc: this._opts.wrtc,
                trickle: false,
                channelConfig: {
                    ordered: false,
                    maxRetransmits: 0,
                },
            })

            this._tokenToConnection[token] = {
                token,
                peer,
                offer: null,
            }

            console.log("created peer")

            peer.on("signal", data => {
                console.log("Got peer signal!")
                const currentConnection = this._tokenToConnection[token]
                this._tokenToConnection[token] = {
                    ...currentConnection,
                    offer: data,
                }

                res.send(token.toString())
            })

            peer.on("connect", () => {
                console.log("connect!")
                this._onPeerConnectedEvent.dispatch(peer)
            })
        })

        this._app.get("/redeem/:token", (req, res) => {
            const token = req.params["token"]
            console.log("redeem - token: " + token)
            const connection = this._tokenToConnection[token]

            if (connection.offer) {
                res.send(connection.offer)
            }
        })

        this._app.post("/answer/:token", (req, res) => {
            const token = req.params.token
            console.log("answer - token: " + token)
            const connection = this._tokenToConnection[token]

            if (connection && connection.peer) {
                connection.peer.signal(req.body)
            }

            res.send()
        })
    }

    public start(): Promise<void> {
        return new Promise(resolve => {
            this._server = this._app.listen(this._opts.port, () => {
                console.log("listening on " + this._opts.port)
                resolve()
            })
        })
    }

    public dispose(): void {
        const peers = Object.keys(this._tokenToConnection).forEach(key =>
            this._tokenToConnection[key].peer.destroy(),
        )
        this._server.close()
    }
}
