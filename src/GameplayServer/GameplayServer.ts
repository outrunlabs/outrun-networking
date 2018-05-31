import { Event, IEvent } from "oni-types";

export type GameplayServerInitializationOptions = {};

export type ClientId = number;

export type Client = {
  id: ClientId;
};

export type NetworkMessage = {};

export class GameplayServer {
  private _onClientConnected = new Event<Client>();
  private _onClientDisconnected = new Event<Client>();

  public get onClientConnected(): IEvent<Client> {
    return this._onClientConnected;
  }

  public get onClientDisconnected(): IEvent<Client> {
    return this._onClientDisconnected;
  }

  constructor(initialiationOptions?: GameplayServerInitializationOptions) {}

  public send(clients: Client | Client[], message: NetworkMessage): void {}

  public start(): void {}

  public stop(): void {}
}
