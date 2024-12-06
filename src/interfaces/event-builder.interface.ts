export interface IEventBuilder {
  track(eventName: string, eventProperties: Record<string, any>): Promise<void>;
}
