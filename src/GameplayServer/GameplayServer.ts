import { Event, IEvent } from "oni-types"

import { ConnectionBroker } from "./ConnectionBrokerServer"

export type GameplayServerInitializationOptions = {
    wrtc: any
}

const DefaultInitializationOptions: GameplayServerInitializationOptions = {
    wrtc: null,
}

export type ClientId = number

export type Client = {
    id: ClientId
}

export type NetworkMessage = {}

export class GameplayServer {
    private _onClientConnected = new Event<Client>()
    private _onClientDisconnected = new Event<Client>()

    private _connectionBroker: ConnectionBroker

    public get onClientConnected(): IEvent<Client> {
        return this._onClientConnected
    }

    public get onClientDisconnected(): IEvent<Client> {
        return this._onClientDisconnected
    }

    constructor(
        initialiationOptions: GameplayServerInitializationOptions = DefaultInitializationOptions,
    ) {
        this._connectionBroker = new ConnectionBroker({
            port: 80,
            wrtc: initialiationOptions.wrtc,
        })
    }

    public send(clients: Client | Client[], message: NetworkMessage): void {}

    public async start(): Promise<void> {
        return this._connectionBroker.start()
    }

    public dispose(): void {
        this._connectionBroker.dispose()
    }
}
