import { Transport, TransportOptions } from '../types';

export const defaultHttpTransportOptions = (
  apiKey: string,
  method: string = 'POST',
): TransportOptions => {
  return {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    requestTimeout: 10000,
  };
};

export class HTTPTransport implements Transport {
  public constructor(protected readonly _options: TransportOptions) {
    if (!('fetch' in window)) {
      throw new Error('Fetch is not available in this browser.');
    }

    if (!this._options.headers) {
      this._options.headers = {};
    }
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
