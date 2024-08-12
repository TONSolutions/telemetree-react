import { configApiGateway, apiGatewayRequestTimeout } from './constants';

export interface TelemetreeConfig {
  apiGateway: string;
  requestTimeout: number;
  defaultSystemEventPrefix: string;
  defaultSystemEventDataSeparator: string;
}

export const defaultConfig: TelemetreeConfig = {
  apiGateway: configApiGateway,
  requestTimeout: apiGatewayRequestTimeout,
  defaultSystemEventPrefix: '[TS]',
  defaultSystemEventDataSeparator: ' | ',
};

let config: TelemetreeConfig = { ...defaultConfig };

export const getConfig = (): TelemetreeConfig => config;

export const setConfig = (newConfig: Partial<TelemetreeConfig>): void => {
  config = { ...config, ...newConfig };
};
