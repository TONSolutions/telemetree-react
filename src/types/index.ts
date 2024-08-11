export { type Transport, type TransportOptions } from './transport';
export {
  type BaseEvent,
  type EventUserDetails,
  type EventDetails,
} from './event';
export interface Task {
  id: number;
  type: number;
  platform: number;
  name: string;
  key_action: string;
  url: string;
  description: string;
  image_url: string;
  expirationTime: number;
}
