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
import { getCurrentUTCTimestamp } from '../helpers/date.helper';

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

const TonConnectLocalStorageKey = 'ton-connect-storage_bridge-connection';
const TonConnectProviderNameLocalStorageKey = 'ton-connect-ui_preferred-wallet';

export type TwaAnalyticsConfig = {
  host: string;
  auto_capture: boolean;
  auto_capture_tags: string[];
  auto_capture_classes: string[];
  public_key: string;
};

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
    webViewHandler?.onEvent('main_button_pressed', (event: string) => {
      eventBuilder.track(EventType.MainButtonPressed, {});
    });

    webViewHandler?.onEvent('settings_button_pressed', (event: string) => {
      eventBuilder.track(EventType.SettingsButtonPressed, {});
    });

    webViewHandler?.onEvent('invoice_closed', (event: string, data?: object) => {
      eventBuilder.track(EventType.InvoiceClosed, {
        ...data,
      });
    });

    webViewHandler?.onEvent('clipboard_text_received', (event: string, data?: object) => {
      eventBuilder.track(EventType.ClipboardTextReceived, {
        ...data,
      });
    });

    webViewHandler?.onEvent('popup_closed', (event: string, data?: object) => {
      eventBuilder.track(EventType.PopupClosed, {});
    });

    webViewHandler?.onEvent('write_access_requested', (event: string, data?: object) => {
      eventBuilder.track(EventType.WriteAccessRequested, {});
    });

    webViewHandler?.onEvent('qr_text_received', (event: string, data?: object) => {
      eventBuilder.track(EventType.QRTextReceived, {
        ...data,
      });
    });

    webViewHandler?.onEvent('phone_requested', (event: string, data?: object) => {
      eventBuilder.track(EventType.PhoneRequested, {
        ...data,
      });
    });
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

          if (lastAddress === wallets[0].address) {
            return;
          }

          const walletProvider = localStorage.getItem(
            TonConnectProviderNameLocalStorageKey,
          );

          const customProperties = {
            wallet: wallets[0].address,
            walletProvider: walletProvider || 'unknown',
          };
          lastAddress = wallets[0].address;

          eventBuilder.track(EventType.Wallet, customProperties);
        } catch (exception) {
          console.error(exception);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <TwaAnalyticsProviderContext.Provider value={eventBuilder}>
      {children}
    </TwaAnalyticsProviderContext.Provider>
  );
};

export default memo(TwaAnalyticsProvider);
