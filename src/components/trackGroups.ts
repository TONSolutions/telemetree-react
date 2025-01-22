import {EventBuilder} from "../builders";
import {Telegram} from "../telegram";
import {webViewHandler} from "../telegram/telegram";
import {EventType} from "../enum/event-type.enum";

export enum TrackGroups {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

const trackGroupLow = (eventBuilder: EventBuilder, webApp?: Telegram.WebApp) => {
  webViewHandler?.onEvent('invoice_closed', (event: string, data?: object) => {
    eventBuilder.track(EventType.InvoiceClosed, {
      ...data,
    });
  });

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

    const originalOpenInvoice = webApp.openInvoice;

    webApp.openInvoice = (url: string, callback: any) => {
      const slug = url.split('/').pop() || '';

      eventBuilder.track(`${EventType.InvoiceOpened}: ${slug}`, {
        url: url,
        slug: slug,
        timestamp: Date.now(),
      });

      return originalOpenInvoice.call(webApp, url, callback);
    };
  }
}

const trackGroupMedium = (eventBuilder: EventBuilder, webApp?: Telegram.WebApp) => {
  trackGroupLow(eventBuilder, webApp);
  if (webApp) {
    const originalOpenLink = webApp.openLink;
    const originalOpenTelegramLink = webApp.openTelegramLink;

    webApp.openLink = (url: string, options?: any) => {
      eventBuilder.track(`${EventType.OpenLink}: ${url}`, {
        url: url,
        options: options,
        timestamp: Date.now(),
      });

      return originalOpenLink.call(webApp, url, options);
    };

    webApp.openTelegramLink = (url: string, options?: any) => {
      eventBuilder.track(`${EventType.OpenTgLink}: ${url}`, {
        url: url,
        options: options,
        timestamp: Date.now(),
      });

      return originalOpenTelegramLink.call(webApp, url, options);
    };
  }
}

const trackGroupHigh = (eventBuilder: EventBuilder, webApp?: Telegram.WebApp) => {
  trackGroupMedium(eventBuilder, webApp);

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

  webViewHandler?.onEvent('phone_requested', (event: string, data?: object) => {
    eventBuilder.track(EventType.PhoneRequested, {
      ...data,
    });
  });

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

  if (webApp) {
    // Store original methods
    const originalClose = webApp.close;
    const originalSwitchInlineQuery = webApp.switchInlineQuery;
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
  }
}

export {trackGroupLow, trackGroupMedium, trackGroupHigh};