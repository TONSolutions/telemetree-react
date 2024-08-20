import { TwaAnalyticsConfig } from '../components/TwaAnalyticsProvider';
import { getConfig } from '../config';
import { EventType } from '../enum/event-type.enum';
import { EventPushHandler } from '../event-push-handler';
import {
  getCurrentUTCTimestamp,
  getCurrentUTCTimestampMilliseconds,
} from '../helpers/date.helper';
import { IEventBuilder } from '../interfaces';
import { TelegramWebAppData } from '../models';
import { TransportFactory } from '../transports/transport-factory';
import { BaseEvent, Transport } from '../types';
import { createEvent } from '../utils/create-event';
import { encryptMessage } from '../helpers/encryption.helper';
import { Logger } from '../utils/logger';

export class EventBuilder implements IEventBuilder {
  private transport: Transport | null = null;
  //private config: TwaAnalyticsConfig | null = null;
  private sessionIdentifier: string = getCurrentUTCTimestampMilliseconds();
  private readonly pushHandler: EventPushHandler = new EventPushHandler(this);
  private isReady: boolean = false;

  constructor(
    private readonly projectId: string,
    private readonly apiKey: string,
    private readonly appName: string,
    private readonly data: TelegramWebAppData,
    private config: TwaAnalyticsConfig,
    private readonly adsUserId?: string,
  ) {
    this.initAsync();
  }

  private async initAsync(): Promise<void> {
    try {
      //await this.loadConfig();
      this.setupTransport();
      await this.pushHandler.flush();
      //this.setupAutoCaptureListener();
      this.isReady = true;
    } catch (error) {
      Logger.error('Initialization error:', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async loadConfig(): Promise<void> {
    const client = TransportFactory.getTransport('http', {
      headers: { authorization: `Bearer ${this.apiKey}` },
      requestTimeout: 1000,
    });

    const response = await client.send(
      `${this.getApiGateway()}?project=${this.projectId}`,
      'GET',
    );
    if (response.status === 200) {
      this.config = await response.json();
    }
  }

  private getApiGateway(): string {
    return getConfig().apiGateway;
  }

  private getRequestTimeout(): number {
    return getConfig().requestTimeout;
  }

  private setupTransport(): void {
    this.transport = TransportFactory.getTransport('http', {
      headers: {
        'x-api-key': this.apiKey,
        'x-project-id': this.projectId,
        'content-type': 'application/json',
      },
      requestTimeout: this.getRequestTimeout(),
    });
  }

  private setupAutoCaptureListener(): void {
    if (this.config?.auto_capture) {
      const trackTags = this.config.autoCaptureTags.map((tag: string) =>
        tag.toUpperCase(),
      );
      document.body?.addEventListener(
        'click',
        this.handleAutoCapture(trackTags),
      );
    }
  }

  private handleAutoCapture = (trackTags: string[]) => (event: MouseEvent) => {
    const config = getConfig();
    const target = event.target as HTMLElement;
    if (target && trackTags.includes(target.tagName)) {
      const customProperties = this.getElementProperties(target);
      this.track(
        `${config.defaultSystemEventPrefix} ${EventType.Click}${config.defaultSystemEventPrefix}${target.innerText}`,
        customProperties,
      );
    }
  };

  private getElementProperties(element: HTMLElement): Record<string, string> {
    const attributes = [
      'id',
      'href',
      'class',
      'name',
      'value',
      'type',
      'placeholder',
      'title',
      'alt',
      'src',
    ];
    return attributes.reduce(
      (props, attr) => {
        if (element.hasAttribute(attr)) {
          props[attr] = element.getAttribute(attr) || '';
        }
        return props;
      },
      {
        text: element.innerText,
        tag: element.tagName.toLowerCase(),
      } as Record<string, string>,
    );
  }

  public getConfig(): TwaAnalyticsConfig | null {
    return this.config;
  }

  public async track(
    eventName: string,
    eventProperties: Record<string, any>,
  ): Promise<void> {
    if (!eventName) {
      throw new Error('Event name is not set.');
    }

    if (!this.data.user?.id) {
      console.error(
        `Event ${eventName} is not tracked because the app is not running inside Telegram.`,
      );
      return;
    }

    if (!eventProperties || typeof eventProperties !== 'object') {
      throw new Error('Event properties are invalid.');
    }

    const event = this.createEventObject(eventName, eventProperties);

    if (!this.isReady) {
      // Queue the event if not ready
      this.pushHandler.push(event);
    } else {
      // Process immediately if ready
      return this.pushHandler.push(event);
    }
  }

  private createEventObject(
    eventName: string,
    eventProperties: Record<string, any>,
  ): BaseEvent {
    const config = getConfig();
    return createEvent(
      this.appName,
      eventName,
      this.getUserDetails(),
      this.getEventDetails(eventProperties),
      this.data.user!.id.toString(),
      this.data.user!.language_code,
      this.data.platform,
      this.data.chat_type || 'N/A',
      this.data.chat_instance || '0',
      getCurrentUTCTimestamp(),
      eventName.startsWith(config.defaultSystemEventPrefix),
      eventProperties.wallet,
      this.sessionIdentifier,
    );
  }

  private getUserDetails() {
    const { user } = this.data;
    return {
      username: user?.username || '',
      firstName: user!.first_name,
      lastName: user?.last_name || '',
      isPremium: user?.is_premium || false,
      writeAccess: user?.allows_write_to_pm || false,
    };
  }

  private getEventDetails(eventProperties: Record<string, any>) {
    return {
      startParameter: this.data.start_param || '',
      path: document.location.pathname,
      params: eventProperties,
    };
  }

  public async processEvent(event: BaseEvent): Promise<void> {
    if (!this.config || !this.transport) {
      Logger.error('EventBuilder: Config or transport not initialized', {
        configExists: !!this.config,
        transportExists: !!this.transport,
      });
      return;
    }

    try {
      const { encryptedKey, encryptedIV, encryptedBody } = encryptMessage(
        this.config.public_key,
        JSON.stringify(event),
      );

      const response = await this.transport.send(
        this.config.events_host,
        'POST',
        JSON.stringify({
          key: encryptedKey,
          iv: encryptedIV,
          body: encryptedBody,
        }),
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Logger.info('Event processed successfully', {
        eventType: event.eventType,
      });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error('Error processing event', {
          error: error.message,
          stack: error.stack,
          eventType: event.eventType,
        });
      } else {
        Logger.error('Unknown error processing event', {
          error,
          eventType: event.eventType,
        });
      }
    }
  }

  public hasRequiredConfig(): boolean {
    return !!this.config && !!this.transport;
  }
}
