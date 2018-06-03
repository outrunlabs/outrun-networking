import * as SimplePeer from "simple-peer"
import { Event, IEvent } from "oni-types"

import { getUniqueToken } from "./../Common/Utility"
import { ConnectionBroker } from "./ConnectionBrokerServer"

export type GameplayServerInitializationOptions = {
    wrtc: any
    port: number
}

const DefaultInitializationOptions: GameplayServerInitializationOptions = {
    wrtc: null,
    port: 80,
}

export type ClientId = string

export type Client = {
    id: ClientId
}

export type MessageReceivedEventArgs = {
    client: Client
    message: any
}

export type IdToClient = { [key: string]: Client }

export class GameplayServer {
    private _onClientConnected = new Event<Client>()
    private _onClientDisconnected = new Event<Client>()
    private _onMessageReceivedEvent = new Event<MessageReceivedEventArgs>()

    private _connectionBroker: ConnectionBroker
    private _idToClient: { [key: string]: Client } = {}
    private _idToPeer: { [key: string]: SimplePeer.Instance } = {}

    public get onClientConnected(): IEvent<Client> {
        return this._onClientConnected
    }

    public get onClientDisconnected(): IEvent<Client> {
        return this._onClientDisconnected
    }

    public get onMessageReceived(): IEvent<MessageReceivedEventArgs> {
        return this._onMessageReceivedEvent
    }

    constructor(
        initialiationOptions: GameplayServerInitializationOptions = DefaultInitializationOptions,
    ) {
        this._connectionBroker = new ConnectionBroker(initialiationOptions)

        this._connectionBroker.onPeerConnected.subscribe(peer => {
            const token = getUniqueToken()
            console.log("Client connected: " + token)
            const client = {
                id: token,
            }
            this._idToClient[token] = client
            this._onClientConnected.dispatch(client)

            this._idToPeer[token] = peer

            peer.on("data", (data: any) => {
                this._onMessageReceivedEvent.dispatch({ client, message: data })
            })
        })
    }

    public send(clients: ClientId | ClientId[], message: any): void {
        let clientsToSend = []

        if (clients instanceof Array) {
            clientsToSend = [...clients]
        } else {
            clientsToSend = [clients]
        }

        clientsToSend.forEach(cl => {
            this._idToPeer[cl].send(JSON.stringify(message))
        })
    }

    public async start(): Promise<void> {
        return this._connectionBroker.start()
    }

    public dispose(): void {
        this._connectionBroker.dispose()
    }
}
