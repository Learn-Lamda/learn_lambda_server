import { TypedEvent } from "../helpers/typed_event";

export class SocketSubscriber<T> {
  emitter: TypedEvent<T>;
  event: string;
  constructor(emitter: TypedEvent<T>, event: string) {
    this.emitter = emitter;
    this.event = event;
  }
}
