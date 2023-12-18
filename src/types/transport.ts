export interface Transport {
  send(
    apiGateway: string,
    method: 'POST' | 'GET',
    payload: string,
  ): Promise<any>;
}

export interface TransportOptions {
  headers: Record<string, string>;
  requestTimeout: number;
}
