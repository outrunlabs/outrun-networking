import { Event, IEvent } from "oni-types"

import { ConnectionBroker } from "./ConnectionBrokerServer"

export type GameplayServerInitializationOptions = {
    wrtc: any
    port: number
}

const DefaultInitializationOptions: GameplayServerInitializationOptions = {
    wrtc: null,
    port: 80,
}

export type ClientId = number

export type Client = {
    id: ClientId
}

export type MessageReceivedEventArgs = {
    client: Client
    message: any
}

export class GameplayServer {
    private _onClientConnected = new Event<Client>()
    private _onClientDisconnected = new Event<Client>()
    private _onMessageReceivedEvent = new Event<MessageReceivedEventArgs>()

    private _connectionBroker: ConnectionBroker

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
            console.log("Dispatching client connected")
            this._onClientConnected.dispatch()

            peer.on("data", (data: any) => {
                this._onMessageReceivedEvent.dispatch({ client: null as any, message: data })
            })
        })
    }

    public send(clients: Client | Client[], message: any): void {}

    public async start(): Promise<void> {
        return this._connectionBroker.start()
    }

    public dispose(): void {
        this._connectionBroker.dispose()
    }
}
