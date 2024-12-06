import { Transport, TransportOptions } from '../types';
import { HTTPTransport } from './http';

export class TransportFactory {
  static readonly transports: Record<string, any> = {
    http: HTTPTransport,
  };

  static getTransport(name: string, options: TransportOptions): Transport {
    if (!this.transports[name]) {
      return new HTTPTransport(options);
    }

    return new this.transports[name](options);
  }
}
