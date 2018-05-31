import { IEvent, Event } from "oni-types";

export class GameplayClient {
  private _onConnectedEvent = new Event<void>();
  private _onMessageEvent = new Event<void>();
  private _onDisconnectedEvent = new Event<void>();

  constructor(private _connectionUrl: string) {}

  public connect(): void {}

  public disconnect(): void {}

  public send(message: any): void {}
}
