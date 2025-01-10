import { EventBuilder } from '../builders';
import { EventType, TonConnectEvent } from '../enum/event-type.enum';
import { getConfig } from '../config';
import { Logger } from '../utils/logger';

interface TonConnectErrorEvent {
  error: {
    code: number;
    message: string;
  };
  walletName?: string;
}

interface CustomData {
  chain_id?: string;
  provider?: string;
  ton_connect_sdk_lib?: string;
  ton_connect_ui_lib?: string;
}

interface BaseEventDetails {
  wallet_address?: string;
  wallet_type?: string;
  wallet_version?: string;
  custom_data?: CustomData;
}

interface TransactionEvent extends BaseEventDetails {
  boc?: string;
  result?: {
    transactionHash?: string;
    response?: any;
  };
  error?: {
    code: number;
    message: string;
    context?: any;
  };
  transaction?: {
    from: string;
    messages: Array<{
      address: string;
      amount: string;
      payload?: string;
    }>;
    network?: string;
    validUntil?: number;
  };
}

interface WalletConnectionEvent extends BaseEventDetails {
  account: {
    address: string;
    chain: string;
    publicKey?: string;
    walletConfig?: {
      features: string[];
      name: string;
      vendor?: string;
      version?: string;
    };
  };
  wallet: {
    name: string;
    version?: string;
    platform?: string;
  };
  device?: {
    platform?: string;
    appVersion?: string;
  };
}

export class TonConnectObserver {
  private readonly uiScope: string = 'ton-connect-ui-';
  private readonly sdkScope: string = 'ton-connect-';

  private readonly tonConnectEvents: Array<TonConnectEvent> = [
    TonConnectEvent.WalletConnectSuccess,
    TonConnectEvent.WalletConnectError,
    TonConnectEvent.ConnectionRestoringSuccess,
    TonConnectEvent.ConnectionRestoringError,
    TonConnectEvent.TransactionSentForSignature,
    TonConnectEvent.TransactionSigned,
    TonConnectEvent.TransactionSigningFailed,
    TonConnectEvent.WalletDisconnect,
  ];

  private readonly tonConnectUiEvents: Array<TonConnectEvent> = [
    TonConnectEvent.WalletConnectStarted,
    TonConnectEvent.WalletConnectError,
    TonConnectEvent.TransactionSigningFailed,
  ];

  constructor(private readonly eventBuilder: EventBuilder) {
    this.initialize();
  }

  private initialize(): void {
    // Add listeners for UI events
    this.tonConnectUiEvents.forEach((event) => {
      const eventName = `${this.uiScope}${event}`;
      window.addEventListener(eventName, ((e: CustomEvent) => {
        Logger.debug(`UI Event received: ${eventName}`, {
          detail: e.detail,
          raw: e,
        });
        if (e.detail) {
          this.dispatchEvent(event, e.detail).catch((error) => {
            Logger.error('Failed to dispatch UI event', {
              event,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }
      }) as EventListener);
    });

    // Add listeners for SDK events
    this.tonConnectEvents.forEach((event) => {
      const eventName = `${this.sdkScope}${event}`;
      window.addEventListener(eventName, ((e: CustomEvent) => {
        Logger.debug(`SDK Event received: ${eventName}`, {
          detail: e.detail,
          raw: e,
        });
        if (e.detail) {
          this.dispatchEvent(event, e.detail).catch((error) => {
            Logger.error('Failed to dispatch SDK event', {
              event,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }
      }) as EventListener);
    });

    Logger.info('TonConnect observer initialized');
  }

  public async dispatchEvent(
    eventName: string,
    eventDetails: any,
  ): Promise<void> {
    const config = getConfig();
    Logger.debug('Raw event details:', { eventName, eventDetails }); // Add this debug log
    try {
      switch (eventName) {
        case TonConnectEvent.WalletConnectSuccess: {
          const details = eventDetails as WalletConnectionEvent;
          await this.eventBuilder.track(
            `${EventType.Wallet}`,
            {
              wallet: details?.account?.address || details?.wallet_address,
              provider: details?.wallet?.name || 'unknown',
              chain: details?.account?.chain,
              wallet_type: eventDetails.wallet_type,
              wallet_version: eventDetails.wallet_version,
              sdk_version: eventDetails.custom_data?.ton_connect_sdk_lib,
              ui_version: eventDetails.custom_data?.ton_connect_ui_lib,
              timestamp: Date.now(),
            },
          );
          break;
        }

        case TonConnectEvent.TransactionSentForSignature: {
          await this.eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.TransactionSentForSignature}`,
            {
              messages: eventDetails.messages?.map((msg: any) => ({
                address: msg.address,
                amount: msg.amount,
                payload: msg.payload,
              })),
              from: eventDetails.from,
              network: eventDetails.network,
              validUntil: eventDetails.valid_until,
              // Add wallet details
              wallet_type: eventDetails.wallet_type,
              wallet_version: eventDetails.wallet_version,
              // Add custom data
              chain_id: eventDetails.custom_data?.chain_id,
              provider: eventDetails.custom_data?.provider,
              sdk_version: eventDetails.custom_data?.ton_connect_sdk_lib,
              ui_version: eventDetails.custom_data?.ton_connect_ui_lib,
              timestamp: Date.now(),
            },
          );
          break;
        }

        case TonConnectEvent.TransactionSigned: {
          const details = eventDetails as TransactionEvent;
          await this.eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.TransactionSigned}`,
            {
              boc: details?.boc,

              from: eventDetails.from,
              messages: eventDetails.messages,
              valid_until: eventDetails.valid_until,
              auth_type: eventDetails.auth_type,

              wallet_type: eventDetails.wallet_type,
              wallet_version: eventDetails.wallet_version,
              wallet_address: eventDetails.wallet_address,

              timestamp: Date.now(),
            },
          );
          break;
        }

        case TonConnectEvent.TransactionSigningFailed: {
          await this.eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.TransactionSigningFailed}`,
            {
              error_code: eventDetails.error_code,
              error_message: eventDetails.error_message,
              is_success: eventDetails.is_success,

              from: eventDetails.from,
              messages: eventDetails.messages,
              valid_until: eventDetails.valid_until,
              auth_type: eventDetails.auth_type,

              wallet_type: eventDetails.wallet_type,
              wallet_version: eventDetails.wallet_version,
              wallet_address: eventDetails.wallet_address,

              timestamp: Date.now(),
            },
          );
          break;
        }

        case TonConnectEvent.WalletDisconnect: {
          await this.eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.WalletDisconnected}`,
            {
              lastWallet: eventDetails?.wallet_address,
              timestamp: Date.now(),
            },
          );
          break;
        }

        case TonConnectEvent.ConnectionRestoringError: {
          await this.eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.WalletConnectionRestoreError}`,
            {
              wallet_type: eventDetails.wallet_type,
              wallet_version: eventDetails.wallet_version,
              wallet: eventDetails?.wallet_address,
              timestamp: Date.now(),
            },
          );
          break;
        }

        case TonConnectEvent.ConnectionRestoringSuccess: {
          await this.eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.WalletConnectionRestored}`,
            {
              wallet_type: eventDetails.wallet_type,
              wallet_version: eventDetails.wallet_version,
              wallet: eventDetails?.wallet_address,
              timestamp: Date.now(),
            },
          );
          break;
        }

        case TonConnectEvent.ConnectionRestoringStarted: {
          await this.eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.WalletConnectionRestoringStarted}`,
            {
              wallet_type: eventDetails.wallet_type,
              wallet_version: eventDetails.wallet_version,
              wallet: eventDetails?.wallet_address,
              timestamp: Date.now(),
            },
          );
          break;
        }
      }
    } catch (error) {
      Logger.error('Error dispatching event', {
        eventName,
        error: error instanceof Error ? error.message : String(error),
        rawDetails: eventDetails,
      });
    }
  }

  public destroy(): void {
    // Store listeners to remove them properly
    const listeners = new Map<string, EventListener>();

    // Remove UI event listeners
    this.tonConnectUiEvents.forEach((event) => {
      const eventName = `${this.uiScope}${event}`;
      const listener = listeners.get(eventName);
      if (listener) {
        window.removeEventListener(eventName, listener);
      }
    });

    // Remove SDK event listeners
    this.tonConnectEvents.forEach((event) => {
      const eventName = `${this.sdkScope}${event}`;
      const listener = listeners.get(eventName);
      if (listener) {
        window.removeEventListener(eventName, listener);
      }
    });
  }
}
