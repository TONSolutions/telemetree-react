export { type Transport, type TransportOptions } from './transport';
export {
  type BaseEvent,
  type EventUserDetails,
  type EventDetails,
} from './event';
export interface Task {
  id: string;
  type: string;
  platform: string;
  name: string;
  key_action: string;
  url: string;
  description: string | null;
  image_url: string | null;
  expirationTime: number;
}
