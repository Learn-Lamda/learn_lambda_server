export interface Listener<T> {
  (event: T): any;
}

export interface Disposable {
  dispose(): void;
}

export class TypedEvent<T> {
  private listeners: Listener<T>[] = [];

  public listenersOnces: Listener<T>[] = [];

  waitedEvent(predicate: (e: T) => boolean) {
    return new Promise<T>((resolve, _reject) => {
      this.on((e) => {
        const isContinueWatching = predicate(e);
        if (!isContinueWatching) {
          resolve(e);
        }
      });
    });
  }
  on = (listener: Listener<T>): Disposable => {
    this.listeners.push(listener);
    return {
      dispose: () => this.off(listener),
    };
  };

  once = (listener: Listener<T>): void => {
    this.listenersOnces.push(listener);
  };

  off = (listener: Listener<T>) => {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
  };

  emit = (event: T) => {
    this.listeners.forEach((listener) => listener(event));

    if (this.listenersOnces.length > 0) {
      const toCall = this.listenersOnces;
      this.listenersOnces = [];
      toCall.forEach((listener) => listener(event));
    }
  };

  pipe = (te: TypedEvent<T>): Disposable => {
    return this.on((e) => te.emit(e));
  };
}
