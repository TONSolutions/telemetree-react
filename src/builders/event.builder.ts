import { TwaAnalyticsConfig } from '../components/TwaAnalyticsProvider';
import { CONFIG_API_GATEWAY } from '../constants';
import { EventType } from '../enum/event-type.enum';
import { encrypt } from '../helpers/rsa.helper';
import { IEventBuilder } from '../interfaces';
import { TelegramWebAppData } from '../models';
import { EventQueue } from '../queue/event.queue';
import { HTTPTransport } from '../transports/http';
import { Transport } from '../types';
import { createEvent } from '../utils/create-event';

export class EventBuilder implements IEventBuilder {
  protected transport: Transport | null = null;
  protected config: TwaAnalyticsConfig | null = null;

  constructor(
    protected readonly projectId: string,
    protected readonly apiKey: string,
    protected readonly appName: string,
    protected readonly data: TelegramWebAppData,
    protected readonly queue: EventQueue,
  ) {
    this._init();
  }

  protected async _init(): Promise<void> {
    const client = new HTTPTransport({
      headers: {
        authorization: `Bearer ${this.apiKey}`,
      },
      requestTimeout: 1000,
    });

    this.setTransport(client);

    try {
      const response = await client.send(
        CONFIG_API_GATEWAY + `?project=${this.projectId}`,
        'GET',
      );

      if (response.status === 200) {
        const data = await response.json();
        this.config = data;
      }

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
          this.track(EventType.Click, customProperties);
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
      throw new Error('User ID is not set.');
    }

    const event = createEvent(
      this.appName,
      eventName,
      {
        username: this.data.user?.username,
        firstName: this.data.user?.first_name,
        lastName: this.data.user?.last_name,
        isPremium: this.data.user?.is_premium,
        writeAccess: this.data.user?.allows_write_to_pm,
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
      new Date().getTime().toString(),
      eventName === EventType.Click,
      eventProperties.wallet || undefined,
    );

    if (this.config === null || this.transport === null) {
      return this.queue.add(event);
    }

    try {
      const encryptedBody = encrypt(
        this.config.public_key,
        JSON.stringify(event),
      );
      if (encryptedBody === false) {
        throw new Error('Failed to encrypt event body.');
      }

      await this.transport.send(this.config.host, 'POST', encryptedBody);
    } catch (exception: any) {
      console.error(exception);
    }
  }
}
