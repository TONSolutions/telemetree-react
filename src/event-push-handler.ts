import { EventBuilder } from './builders';
import { BaseEvent } from './types';

export class EventPushHandler {
  protected eventsQueue: BaseEvent[] = [];
  protected isProcessing: boolean = false;

  constructor(
    protected readonly client: EventBuilder & {
      hasRequiredConfig: () => boolean;
    },
  ) {}

  public push(event: BaseEvent): void {
    this.eventsQueue.push(event);
    this.processQueue();
  }

  public processQueue(): void {
    if (this.isProcessing === true || !this.client.hasRequiredConfig()) {
      return;
    }

    this.isProcessing = true;
    this.flush().then(() => {
      this.isProcessing = false;
      if (this.eventsQueue.length > 0) {
        this.processQueue();
      }
    });
  }

  async flush(): Promise<void> {
    const events = this.eventsQueue;
    this.eventsQueue = [];

    if (events.length === 0) {
      return;
    }

    try {
      const executeEvents = events.map((event) =>
        this.client.processEvent.bind(this.client)(event),
      );
      await Promise.all(executeEvents);
    } catch (error) {
      console.error(`Error during event processing: ${error}`);
      // Additional error handling logic can be added here
    }

    const executeEvents = events.map((event) =>
      this.client.processEvent.bind(this.client)(event),
    );
    await Promise.all(executeEvents);
  }
}
