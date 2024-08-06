import {
  createContext,
  FunctionComponent,
  memo,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';
import { EventBuilder } from '../builders';
import { loadTelegramWebAppData, webViewHandler } from '../telegram/telegram';
import { TonConnectStorageData } from '../models/tonconnect-storage-data';
import { EventType } from '../enum/event-type.enum';
import { getConfig } from '../config';
import { TaskManager } from '../utils/taskManager';

export type TwaAnalyticsProviderOptions = {
  projectId: string;
  apiKey: string;
  appName: string;
};

export type TwaAnalyticsProviderProps = {
  children: ReactNode;
} & TwaAnalyticsProviderOptions;

export const TwaAnalyticsProviderContext = createContext<EventBuilder | null>(
  null,
);

const WalletConnectedKey = 'walletConnected';

const TonConnectLocalStorageKey = 'ton-connect-storage_bridge-connection';
const TonConnectProviderNameLocalStorageKey = 'ton-connect-ui_preferred-wallet';

export type TwaAnalyticsConfig = {
  host: string;
  auto_capture: boolean;
  auto_capture_tags: string[];
  auto_capture_classes: string[];
  public_key: string;
};

function getElementProperties(element: HTMLElement): Record<string, string> {
  return {
    tagName: element.tagName,
    id: element.id,
    className: element.className,
    // Add any other properties you want to capture
  };
}

/**
 * @param children JSX to insert.
 * @param [options] additional options.
 * @constructor
 */
const TwaAnalyticsProvider: FunctionComponent<TwaAnalyticsProviderProps> = ({
  children,
  ...options
}) => {
  if (!options.projectId) {
    throw new Error('TWA Analytics Provider: Missing projectId');
  }

  const telegramWebAppData = loadTelegramWebAppData();

  const eventBuilder = useMemo(() => {
    return new EventBuilder(
      options.projectId,
      options.apiKey,
      options.appName,
      telegramWebAppData,
    );
  }, []);

  useEffect(() => {
    const taskManager = new TaskManager();
    taskManager.initializeTasks();
  }, []);

  useEffect(() => {
    webViewHandler?.onEvent('main_button_pressed', (event: string) => {
      eventBuilder.track(EventType.MainButtonPressed, {});
    });

    webViewHandler?.onEvent('settings_button_pressed', (event: string) => {
      eventBuilder.track(EventType.SettingsButtonPressed, {});
    });

    webViewHandler?.onEvent(
      'invoice_closed',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.InvoiceClosed, {
          ...data,
        });
      },
    );

    webViewHandler?.onEvent(
      'clipboard_text_received',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.ClipboardTextReceived, {
          ...data,
        });
      },
    );

    webViewHandler?.onEvent('popup_closed', (event: string, data?: object) => {
      eventBuilder.track(EventType.PopupClosed, {});
    });

    webViewHandler?.onEvent(
      'write_access_requested',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.WriteAccessRequested, {});
      },
    );

    webViewHandler?.onEvent(
      'qr_text_received',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.QRTextReceived, {
          ...data,
        });
      },
    );

    webViewHandler?.onEvent(
      'phone_requested',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.PhoneRequested, {
          ...data,
        });
      },
    );
  }, []);

  useEffect(() => {
    const locationPath = location.pathname;
    eventBuilder.track(`${EventType.PageView} ${locationPath}`, {
      path: locationPath,
    });
  }, []);

  useEffect(() => {
    let lastAddress: null | string = null;
    const interval = setInterval(() => {
      const tonConnectStoredData = localStorage.getItem(
        TonConnectLocalStorageKey,
      );
      if (tonConnectStoredData) {
        try {
          const parsedData = JSON.parse(
            tonConnectStoredData,
          ) as TonConnectStorageData;
          const wallets = parsedData.connectEvent?.payload?.items || [];
          if (wallets && wallets.length === 0) {
            return;
          }

          const currentAddress = wallets[0].address;
          const walletConnected = localStorage.getItem(WalletConnectedKey);

          if (lastAddress !== currentAddress || !walletConnected) {
            const walletProvider = localStorage.getItem(
              TonConnectProviderNameLocalStorageKey,
            );

            const customProperties = {
              wallet: currentAddress,
              walletProvider: walletProvider || 'unknown',
            };
            lastAddress = currentAddress;

            localStorage.setItem(WalletConnectedKey, 'true');

            eventBuilder.track(EventType.Wallet, customProperties);
          }
        } catch (exception) {
          console.error(exception);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const config = getConfig();
    if (eventBuilder.getConfig()?.auto_capture) {
      const trackTags =
        eventBuilder
          .getConfig()
          ?.auto_capture_tags?.map((tag: string) => tag.toUpperCase()) ?? [];
      document.body?.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target && trackTags.includes(target.tagName)) {
          const customProperties = getElementProperties(target);
          eventBuilder.track(
            `${config.defaultSystemEventPrefix} ${EventType.Click}${config.defaultSystemEventPrefix}${target.innerText}`,
            customProperties,
          );
        }
      });
    }
  }, [eventBuilder]);

  return (
    <TwaAnalyticsProviderContext.Provider value={eventBuilder}>
      {children}
    </TwaAnalyticsProviderContext.Provider>
  );
};

export default memo(TwaAnalyticsProvider);
