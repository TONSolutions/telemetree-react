import { TwaAnalyticsConfig } from '../components/TwaAnalyticsProvider';
import {
  CONFIG_API_GATEWAY,
  DEFAULT_SYSTEM_EVENT_DATA_SEPARATOR,
  DEFAULT_SYSTEM_EVENT_PREFIX,
} from '../constants';
import { EventType } from '../enum/event-type.enum';
import { EventPushHandler } from '../event-push-handler';
import {
  getCurrentUTCTimestamp,
  getCurrentUTCTimestampMilliseconds,
} from '../helpers/date.helper';
import { encryptMessage } from '../helpers/encryption.helper';
import { IEventBuilder } from '../interfaces';
import { TelegramWebAppData } from '../models';
import { TransportFactory } from '../transports/transport-factory';
import { BaseEvent, Transport } from '../types';
import { createEvent } from '../utils/create-event';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export class EventBuilder implements IEventBuilder {
  protected transport: Transport | null = null;
  protected config: TwaAnalyticsConfig | null = null;
  protected sessionIdentifier: string | null = null;
  protected readonly pushHandler: EventPushHandler = new EventPushHandler(this);

  private fingerprint: string | null = null;

  private async initializeFingerprint(): Promise<void> {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      this.fingerprint = result.visitorId;
    } catch (error) {
      console.error('Error initializing fingerprint:', error);
    }
  }

  constructor(
    protected readonly projectId: string,
    protected readonly apiKey: string,
    protected readonly appName: string,
    protected readonly data: TelegramWebAppData,
  ) {
    this._init();
  }

  public setSessionIdentifier(sessionIdentifier: string): this {
    this.sessionIdentifier = sessionIdentifier;
    return this;
  }

  protected async _init(): Promise<void> {
    const client = TransportFactory.getTransport('http', {
      headers: {
        authorization: `Bearer ${this.apiKey}`,
      },
      requestTimeout: 1000,
    });

    await this.initializeFingerprint();

    this.setSessionIdentifier(getCurrentUTCTimestampMilliseconds());

    try {
      const response = await client.send(
        CONFIG_API_GATEWAY + `?project=${this.projectId}`,
        'GET',
      );

      if (response.status === 200) {
        const data = await response.json();
        this.config = data;
      }

      client.setOptions({
        headers: {
          'x-api-key': `${this.apiKey}`,
          'x-project-id': `${this.projectId}`,
          'content-type': 'application/json',
        },
        requestTimeout: 1500,
      });
      this.setTransport(client);

      await this.pushHandler.flush();

      this.setupAutoCaptureListener();
    } catch (exception) {
      console.error(`Cannot load config: ${exception}`);
    }
  }

  protected setupAutoCaptureListener(): void {
    const config = this.getConfig();

    if (config !== null && config.auto_capture === true) {
      const trackTags = config.auto_capture_tags.map((tag: string) =>
        tag.toUpperCase(),
      );
      document.querySelector('body')?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const customProperties = {} as any;
        const resolveAttributes = [
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
        if (target && trackTags.includes(target.tagName)) {
          for (const attribute of resolveAttributes) {
            if (target.hasAttribute(attribute)) {
              customProperties[attribute] = target.getAttribute(attribute);
            }
          }
          customProperties['text'] = target.innerText;
          customProperties['tag'] = target.tagName.toLowerCase();
          this.track(
            `${DEFAULT_SYSTEM_EVENT_PREFIX} ${EventType.Click}${DEFAULT_SYSTEM_EVENT_DATA_SEPARATOR}${target.innerText}`,
            customProperties,
          );
        }
      });
    }
  }

  public getConfig(): TwaAnalyticsConfig | null {
    return this.config;
  }

  public setTransport(transport: Transport): this {
    this.transport = transport;
    return this;
  }

  async track(
    eventName: string,
    eventProperties: Record<string, any>,
  ): Promise<void> {
    if (eventName === null) {
      throw new Error('Event name is not set.');
    }

    if (!this.data.user?.id) {
      console.error(
        `Event ${eventName} is not tracked because the app is not running inside Telegram.`,
      );
      return;
    }

    const event = createEvent(
      this.appName,
      eventName,
      {
        username: this.data.user?.username || '',
        firstName: this.data.user.first_name,
        lastName: this.data.user?.last_name || '',
        isPremium: this.data.user?.is_premium || false,
        writeAccess: this.data.user?.allows_write_to_pm || false,
      },
      {
        startParameter: this.data.start_param || '',
        path: document.location.pathname,
        params: eventProperties,
      },
      this.data.user?.id.toString(),
      this.data.user?.language_code,
      this.data.platform,
      this.data.chat_type || 'N/A',
      this.data.chat_instance || '0',
      getCurrentUTCTimestamp(),
      eventName.startsWith(DEFAULT_SYSTEM_EVENT_PREFIX),
      eventProperties.wallet || undefined,
      this.sessionIdentifier || undefined,
    );

    event.fingerprint = this.fingerprint;

    return this.pushHandler.push(event);
  }

  public async processEvent(event: BaseEvent): Promise<void> {
    if (this.config === null || this.transport === null) {
      console;
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
        JSON.stringify({
          key: encryptedKey,
          iv: encryptedIV,
          body: encryptedBody,
        }),
      );
    } catch (exception: any) {
      console.error(exception);
    }
  }
}
