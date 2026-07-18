import { Injectable } from '@nestjs/common';

@Injectable()
export class SingleFlightService {
  private readonly inflight = new Map<string, Promise<unknown>>();

  async run<TValue>(key: string, factory: () => Promise<TValue>): Promise<TValue> {
    const current = this.inflight.get(key);
    if (current) return current as Promise<TValue>;
    const promise = factory().finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise);
    return promise;
  }
}
