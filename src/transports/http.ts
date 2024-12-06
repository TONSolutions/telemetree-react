import { Transport, TransportOptions } from '../types';
import { getConfig } from '../config';

export const defaultHttpTransportOptions = (
  apiKey: string,
  method: string = 'POST',
): TransportOptions => {
  const config = getConfig();
  return {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    requestTimeout: config.requestTimeout,
  };
};

export class HTTPTransport implements Transport {
  public constructor(protected _options: TransportOptions) {
    if (!('fetch' in window)) {
      throw new Error('Fetch is not available in this browser.');
    }

    if (!this._options.headers) {
      this._options.headers = {};
    }
  }

  public setOptions(options: TransportOptions): void {
    this._options = options;
  }

  public send(
    apiGateway: string,
    method: 'POST' | 'GET',
    payload?: string,
  ): Promise<Response> {
    const options: RequestInit = {
      method: method,
      headers: this._options.headers,
      mode: 'cors',
      redirect: 'follow',
    };

    if (method === 'POST' && payload) {
      options.body = payload;
    }

    return new Promise((resolve, reject) => {
      window
        .fetch(apiGateway, options)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
