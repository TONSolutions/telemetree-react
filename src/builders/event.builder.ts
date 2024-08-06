import { TwaAnalyticsConfig } from '../components/TwaAnalyticsProvider';
import { CONFIG_API_GATEWAY, DEFAULT_SYSTEM_EVENT_PREFIX } from '../constants';
import { EventType } from '../enum/event-type.enum';
import { EventPushHandler } from '../event-push-handler';
import { getCurrentUTCTimestamp, getCurrentUTCTimestampMilliseconds } from '../helpers/date.helper';
import { IEventBuilder } from '../interfaces';
import { TelegramWebAppData } from '../models';
import { TransportFactory } from '../transports/transport-factory';
import { BaseEvent, Transport } from '../types';
import { createEvent } from '../utils/create-event';
import { encryptMessage } from '../helpers/encryption.helper';

export class EventBuilder implements IEventBuilder {
  private transport: Transport | null = null;
  private config: TwaAnalyticsConfig | null = null;
  private sessionIdentifier: string = getCurrentUTCTimestampMilliseconds();
  private readonly pushHandler: EventPushHandler = new EventPushHandler(this);

  constructor(
    private readonly projectId: string,
    private readonly apiKey: string,
    private readonly appName: string,
    private readonly data: TelegramWebAppData,
  ) {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.loadConfig();
      this.setupTransport();
      await this.pushHandler.flush();
      this.setupAutoCaptureListener();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private async loadConfig(): Promise<void> {
    const client = TransportFactory.getTransport('http', {
      headers: { authorization: `Bearer ${this.apiKey}` },
      requestTimeout: 1000,
    });

    const response = await client.send(`${CONFIG_API_GATEWAY}?project=${this.projectId}`, 'GET');
    if (response.status === 200) {
      this.config = await response.json();
    }
  }

  private setupTransport(): void {
    this.transport = TransportFactory.getTransport('http', {
      headers: {
        'x-api-key': this.apiKey,
        'x-project-id': this.projectId,
        'content-type': 'application/json',
      },
      requestTimeout: 1500,
    });
  }

  private setupAutoCaptureListener(): void {
    if (this.config?.auto_capture) {
      const trackTags = this.config.auto_capture_tags.map((tag: string) => tag.toUpperCase());
      document.body?.addEventListener('click', this.handleAutoCapture(trackTags));
    }
  }

  private handleAutoCapture = (trackTags: string[]) => (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target && trackTags.includes(target.tagName)) {
      const customProperties = this.getElementProperties(target);
      this.track(
        `${DEFAULT_SYSTEM_EVENT_PREFIX} ${EventType.Click}${DEFAULT_SYSTEM_EVENT_PREFIX}${target.innerText}`,
        customProperties,
      );
    }
  };

  private getElementProperties(element: HTMLElement): Record<string, string> {
    const attributes = ['id', 'href', 'class', 'name', 'value', 'type', 'placeholder', 'title', 'alt', 'src'];
    return attributes.reduce((props, attr) => {
      if (element.hasAttribute(attr)) {
        props[attr] = element.getAttribute(attr) || '';
      }
      return props;
    }, {
      text: element.innerText,
      tag: element.tagName.toLowerCase(),
    } as Record<string, string>);
  }

  public getConfig(): TwaAnalyticsConfig | null {
    return this.config;
  }

  public async track(eventName: string, eventProperties: Record<string, any>): Promise<void> {
    if (!eventName) {
      throw new Error('Event name is not set.');
    }

    if (!this.data.user?.id) {
      console.error(`Event ${eventName} is not tracked because the app is not running inside Telegram.`);
      return;
    }

    const event = this.createEventObject(eventName, eventProperties);
    return this.pushHandler.push(event);
  }

  private createEventObject(eventName: string, eventProperties: Record<string, any>): BaseEvent {
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
      eventName.startsWith(DEFAULT_SYSTEM_EVENT_PREFIX),
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
      console.error('Config or transport not initialized');
      return;
    }

    try {
      const { encryptedKey, encryptedIV, encryptedBody } = encryptMessage(
        this.config.public_key,
        JSON.stringify(event),
      );

      await this.transport.send(
        this.config.host,
        'POST',
        JSON.stringify({ key: encryptedKey, iv: encryptedIV, body: encryptedBody }),
      );
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }
}