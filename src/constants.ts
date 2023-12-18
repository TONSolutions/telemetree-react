export const CONFIG_API_GATEWAY =
  'https://config.ton.solutions/v1/client/config';
export const API_GATEWAY_REQUEST_TIMEOUT = 10000;

export const BASE_OPTIONS = {
  apiGateway: CONFIG_API_GATEWAY,
  method: 'GET',
  isCorsEnabled: true,
  requestTimeout: API_GATEWAY_REQUEST_TIMEOUT,
};
