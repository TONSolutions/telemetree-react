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
import { Telegram } from '../telegram';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: Telegram.WebApp;
      WebView?: Telegram.WebView;
    };
    __telemetreeSessionStarted?: boolean;
  }
}

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

    webViewHandler?.onEvent(
      'secondary_button_pressed',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.SecondaryButtonPressed, {
          ...data,
        });
      },
    );

    webViewHandler?.onEvent('prepared_message_sent', (event: string) => {
      eventBuilder.track(EventType.PreparedMessageSent, {});
    });

    webViewHandler?.onEvent(
      'fullscreen_changed',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.FullScreenChanged, {
          ...data,
        });
      },
    );

    webViewHandler?.onEvent('home_screen_added', (event: string) => {
      eventBuilder.track(EventType.HomeScreenAdded, {});
    });

    webViewHandler?.onEvent(
      'home_screen_checked',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.HomeScreenChecked, {
          ...data,
        });
      },
    );

    webViewHandler?.onEvent('emoji_status_set', (event: string) => {
      eventBuilder.track(EventType.EmojiStatusSet, {});
    });

    webViewHandler?.onEvent(
      'location_checked',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.LocationChecked, {
          ...data,
        });
      },
    );

    webViewHandler?.onEvent(
      'location_requested',
      (event: string, data?: object) => {
        eventBuilder.track(EventType.LocationRequested, {
          ...data,
        });
      },
    );

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

    webViewHandler?.onEvent('web_app_request_fullscreen', (event: string) => {
      eventBuilder.track(EventType.WebAppRequestFullscreen, {
        timestamp: Date.now(),
      });
    });

    webViewHandler?.onEvent('web_app_exit_fullscreen', (event: string) => {
      eventBuilder.track(EventType.WebAppExitFullscreen, {
        timestamp: Date.now(),
      });
    });

    const webApp = window?.Telegram?.WebApp;
    if (webApp) {
      // Track session start and initial page view when WebApp is initialized
      if (!window.__telemetreeSessionStarted) {
        window.__telemetreeSessionStarted = true;

        // Track session start
        eventBuilder.track(EventType.SessionStart, {
          timestamp: Date.now(),
          platform: webApp.platform,
          version: webApp.version,
          colorScheme: webApp.colorScheme,
          viewportHeight: webApp.viewportHeight,
          viewportStableHeight: webApp.viewportStableHeight,
          isExpanded: webApp.isExpanded,
        });

        // Track initial page view
        const locationPath = location.pathname || '/';
        eventBuilder.track(`${EventType.PageView} ${locationPath}`, {
          path: locationPath,
          timestamp: Date.now(),
        });
      }

      // Store original methods
      const originalClose = webApp.close;
      const originalSwitchInlineQuery = webApp.switchInlineQuery;
      const originalOpenInvoice = webApp.openInvoice;
      const originalShareToStory = webApp.shareToStory;

      webApp.close = () => {
        eventBuilder.track(EventType.SessionEnd, {
          timestamp: Date.now(),
          platform: webApp.platform,
          version: webApp.version,
          colorScheme: webApp.colorScheme,
          viewportHeight: webApp.viewportHeight,
          viewportStableHeight: webApp.viewportStableHeight,
          isExpanded: webApp.isExpanded,
        });

        // Tiny delay to ensure event gets sent
        setTimeout(() => {
          originalClose.call(webApp);
        }, 50);
      };

      webApp.switchInlineQuery = (
        query: string,
        chat_types?: Array<'users' | 'bots' | 'groups' | 'channels'>,
      ) => {
        // Track the event with query and chat_types data
        eventBuilder.track(`${EventType.SwitchInlineQuery}: ${query}`, {
          query: query,
          chat_types: chat_types || [],
          timestamp: Date.now(),
        });

        // Call original method
        return originalSwitchInlineQuery.call(webApp, query, chat_types);
      };

      webApp.openInvoice = (url: string) => {
        const slug = url.split('/').pop() || '';

        eventBuilder.track(`${EventType.InvoiceOpened}: ${slug}`, {
          url: url,
          slug: slug,
          timestamp: Date.now(),
        });

        return originalOpenInvoice.call(webApp, url);
      };

      let lastViewportHeight = webApp.viewportHeight;
      let isCurrentlyExpanded = false;

      const viewportChangeHandler = (event: { isStateStable: boolean }) => {
        // Fullscreen tracking only
        const heightIncreased = webApp.viewportHeight > lastViewportHeight;

        if (heightIncreased && !isCurrentlyExpanded) {
          isCurrentlyExpanded = true;
          eventBuilder.track(EventType.WebAppRequestFullscreen, {
            timestamp: Date.now(),
            isStateStable: event.isStateStable,
            previousViewportHeight: lastViewportHeight,
            newViewportHeight: webApp.viewportHeight,
            viewportStableHeight: webApp.viewportStableHeight,
          });
        } else if (!heightIncreased && isCurrentlyExpanded) {
          isCurrentlyExpanded = false;
          eventBuilder.track(EventType.WebAppExitFullscreen, {
            timestamp: Date.now(),
            isStateStable: event.isStateStable,
            previousViewportHeight: lastViewportHeight,
            newViewportHeight: webApp.viewportHeight,
            viewportStableHeight: webApp.viewportStableHeight,
          });
        }

        lastViewportHeight = webApp.viewportHeight;
      };

      webApp.onEvent('viewportChanged', viewportChangeHandler);

      webApp.shareToStory = (media_url: string, params?: { text?: string }) => {
        eventBuilder.track(`${EventType.ShareToStory}: ${media_url}`, {
          media_url: media_url,
          text: params?.text,
          timestamp: Date.now(),
        });

        return originalShareToStory.call(webApp, media_url, params);
      };

      return () => {
        // Restore original methods on cleanup
        webApp.close = originalClose;
        webApp.switchInlineQuery = originalSwitchInlineQuery;
        webApp.openInvoice = originalOpenInvoice;
        webApp.shareToStory = originalShareToStory;
        webApp.offEvent('viewportChanged', viewportChangeHandler);
      };
    }
  }, [eventBuilder]);

  return (
    <TwaAnalyticsProviderContext.Provider value={eventBuilder}>
      {children}
    </TwaAnalyticsProviderContext.Provider>
  );
};

export default memo(TwaAnalyticsProvider);
