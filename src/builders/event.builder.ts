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
import {TrackGroups} from "../components/trackGroups";

export class EventBuilder implements IEventBuilder {
  private transport: Transport | null = null;
  private config: TwaAnalyticsConfig | null = null;
  private sessionIdentifier: string = getCurrentUTCTimestampMilliseconds();
  private readonly pushHandler: EventPushHandler = new EventPushHandler(this);

  constructor(
    private readonly projectId: string,
    private readonly apiKey: string,
    private readonly data: TelegramWebAppData,
    protected readonly trackGroup: TrackGroups | false | null = null,
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

  public getTrackGroup() {
    return this.trackGroup;
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
    if (this.config?.auto_capture && (this.trackGroup == TrackGroups.MEDIUM || this.trackGroup == TrackGroups.HIGH)) {
      const trackTags = this.config.auto_capture_tags.map((tag: string) =>
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
    // console.debug('[Telemetree] Track called:', {
    //   eventName,
    //   properties: eventProperties,
    // });

    if (!eventName) {
      throw new Error('Event name is not set.');
    }

    if (!this.data.user?.id) {
      console.error(
        `Event ${eventName} is not tracked because the app is not running inside Telegram.`,
      );
      return;
    }

    const event = this.createEventObject(eventName, eventProperties);
    // console.debug('[Telemetree] Created event object:', event);

    return this.pushHandler.push(event);
  }

  private createEventObject(
    eventName: string,
    eventProperties: Record<string, any>,
  ): BaseEvent {
    const config = getConfig();
    // Ensure wallet address is properly extracted from properties
    const walletAddress = eventProperties.wallet || eventProperties.address;

    return createEvent(
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
      walletAddress, // Modified to handle both wallet and address properties
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
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    const paramsObj: Record<string, string> = {};

    for (const [key, value] of urlParams.entries()) {
      paramsObj[key] = value;
    }

    const paramsString = Object.keys(paramsObj).length === 0 ? "" : Object.keys(paramsObj).map(key => `${key}: ${paramsObj[key]}`).join(', ');


    return {
      startParameter: this.data.start_param || paramsString,
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
        this.config.host,
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

      // Enhanced logging with clearer transaction details
      const params = event.eventDetails.params;
      Logger.info('Event processed successfully', {
        eventType: event.eventType,
        details: {
          ...params,
          // Add transaction summary if messages exist
          ...(params.messages?.[0] && {
            transaction: {
              from: params.from,
              to: params.messages[0].address,
              amount: params.messages[0].amount,
            },
          }),
          // Keep original messages array for full details
          timestamp: event.timestamp,
        },
      });
    } catch (error) {
      Logger.error('Error processing event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        eventType: event.eventType,
        details: {
          params: event.eventDetails?.params,
          timestamp: event.eventDetails?.params?.timestamp || event.timestamp,
        },
      });
    }
  }
}
