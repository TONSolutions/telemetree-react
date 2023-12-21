export interface Transport {
  send(
    apiGateway: string,
    method: 'POST' | 'GET',
    payload?: string,
  ): Promise<any>;
  setOptions(options: TransportOptions): void;
}

export interface TransportOptions {
  headers: Record<string, string>;
  requestTimeout: number;
}
