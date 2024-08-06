import { CONFIG_API_GATEWAY, API_GATEWAY_REQUEST_TIMEOUT } from './constants';

export interface TelemetreeConfig {
  apiGateway: string;
  requestTimeout: number;
  defaultSystemEventPrefix: string;
  defaultSystemEventDataSeparator: string;
}

export const defaultConfig: TelemetreeConfig = {
  apiGateway: CONFIG_API_GATEWAY,
  requestTimeout: API_GATEWAY_REQUEST_TIMEOUT,
  defaultSystemEventPrefix: '[TS]',
  defaultSystemEventDataSeparator: ' | ',
};

let config: TelemetreeConfig = { ...defaultConfig };

export const getConfig = (): TelemetreeConfig => config;

export const setConfig = (newConfig: Partial<TelemetreeConfig>): void => {
  config = { ...config, ...newConfig };
};
