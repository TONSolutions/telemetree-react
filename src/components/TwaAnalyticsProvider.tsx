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
    webViewHandler?.onEvent('main_button_pressed', (event: string) => {
      eventBuilder.track(EventType.MainButtonPressed, {});
    });

    webViewHandler?.onEvent('settings_button_pressed', (event: string) => {
      eventBuilder.track(EventType.SettingsButtonPressed, {});
    });

    webViewHandler?.onEvent('back_button_pressed', (event: string) => {
      eventBuilder.track(EventType.BackButtonPressed, {});
    });

    webViewHandler?.onEvent('secondary_button_pressed', (event: string, data?: object) => {
      eventBuilder.track(EventType.SecondaryButtonPressed, {
        ...data,
      });
    });

    webViewHandler?.onEvent('prepared_message_sent', (event: string) => {
      eventBuilder.track(EventType.PreparedMessageSent, {});
    });

    webViewHandler?.onEvent('fullscreen_changed', (event: string, data?: object) => {
      eventBuilder.track(EventType.FullScreenChanged, {
        ...data,
      });
    });

    webViewHandler?.onEvent('home_screen_added', (event: string) => {
      eventBuilder.track(EventType.HomeScreenAdded, {});
    });

    webViewHandler?.onEvent('home_screen_checked', (event: string, data?: object) => {
      eventBuilder.track(EventType.HomeScreenChecked, {
        ...data,
      });
    });

    webViewHandler?.onEvent('emoji_status_set', (event: string) => {
      eventBuilder.track(EventType.EmojiStatusSet, {});
    });

    webViewHandler?.onEvent('location_checked', (event: string, data?: object) => {
      eventBuilder.track(EventType.LocationChecked, {
        ...data,
      });
    });

    webViewHandler?.onEvent('location_requested', (event: string, data?: object) => {
      eventBuilder.track(EventType.LocationRequested, {
        ...data,
      });
    });

    webViewHandler?.onEvent('accelerometer_started', (event: string) => {
      eventBuilder.track(EventType.AccelerometerStarted, {});
    });

    webViewHandler?.onEvent('accelerometer_stopped', (event: string) => {
      eventBuilder.track(EventType.AccelerometerStopped, {});
    });

    webViewHandler?.onEvent('accelerometer_changed', (event: string) => {
      eventBuilder.track(EventType.AccelerometerChanged, {});
    });

    webViewHandler?.onEvent('device_orientation_started', (event: string) => {
      eventBuilder.track(EventType.DeviceOrientationStarted, {});
    });

    webViewHandler?.onEvent('device_orientation_stopped', (event: string) => {
      eventBuilder.track(EventType.DeviceOrientationStopped, {});
    });

    webViewHandler?.onEvent('device_orientation_changed', (event: string) => {
      eventBuilder.track(EventType.DeviceOrientationChanged, {});
    });

    webViewHandler?.onEvent('device_orientation_failed', (event: string) => {
      eventBuilder.track(EventType.DeviceOrientationFailed, {});
    });

    webViewHandler?.onEvent('gyroscope_started', (event: string) => {
      eventBuilder.track(EventType.GyroscropeStarted, {});
    });

    webViewHandler?.onEvent('gyroscope_stopped', (event: string) => {
      eventBuilder.track(EventType.GyroscropeStopped, {});
    });

    webViewHandler?.onEvent('gyroscope_changed', (event: string) => {
      eventBuilder.track(EventType.GyroscropeChanged, {});
    });

    webViewHandler?.onEvent('gyroscope_failed', (event: string) => {
      eventBuilder.track(EventType.GyroscropeFailed, {});
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
