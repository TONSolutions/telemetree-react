export interface IEvent {
  name: string;
  properties: { [key: string]: any } | string;
  send(): Promise<boolean>;
}
