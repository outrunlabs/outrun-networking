const wrtc = require("electron-webrtc")()

import * as express from "express"
import * as bodyParser from "body-parser"
import * as SimplePeer from "simple-peer"
const nanoid = require("nanoid")

// TODO: Move this to more appropriate place
wrtc.on("error", (err: Error) => console.log(err))

// ConnectionBroker flow:
// - First, client calls /connect to initiate a connection. A SimplePeer is created, and a token is returned.
// - The client creates a Peer that signals with the invite returned in connect.
// - The client should listen for the 'signal' event and callback with
// - At this point, since there is no trickling, the peers should be connected unless there is a connection error.

const getUniqueToken = () => nanoid(48)

export type ConnectionBrokerOptions = {
    port: number
}

export const DefaultBrokerOptions: ConnectionBrokerOptions = {
    port: 80,
}

export type Connection = {
    token: string
    peer: SimplePeer.Instance
    offer: any | null
}

export class ConnectionBroker {
    private _app: express.Express
    private _tokenToConnection: { [token: string]: Connection } = {}

    constructor(private _opts: ConnectionBrokerOptions = DefaultBrokerOptions) {
        this._app = express()
        this._app.use(bodyParser.json())

        this._app.get("/connect", (req, res) => {
            const token = getUniqueToken()
            const peer = new SimplePeer({
                initiator: true,
                wrtc,
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

            peer.on("signal", data => {
                const currentConnection = this._tokenToConnection[token]
                this._tokenToConnection[token] = {
                    ...currentConnection,
                    offer: data,
                }

                res.send(token.toString())
            })
        })

        this._app.get("/redeem/:token", (req, res) => {
            const token = req.params["token"]
            const connection = this._tokenToConnection[token]

            if (connection.offer) {
                res.send(connection.offer)
            }
        })

        this._app.get("/answer/:token", (req, res) => {
            const connection = this._tokenToConnection[req.params.token]

            if (connection && connection.peer) {
                connection.peer.signal(req.body)
            }

            res.send()
        })

        this._app.listen(this._opts.port, () => {
            console.log("listening on " + this._opts.port)
        })
    }
}
