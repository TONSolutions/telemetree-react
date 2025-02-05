import React, {
  createContext,
  FunctionComponent,
  memo,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';
import { EventBuilder } from '../builders';
import { loadTelegramWebAppData, webViewHandler } from '../telegram/telegram';
import { EventType } from '../enum/event-type.enum';
import { getConfig } from '../config';
import { Telegram } from '../telegram';
import { TonConnectObserver } from '../observers/ton-connect.observer';
import { Logger } from '../utils/logger';
import {trackGroupHigh, trackGroupLow, trackGroupMedium, TrackGroups} from "./trackGroups";
import {TelegramWebAppData} from "../models";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: Telegram.WebApp;
      WebView?: Telegram.WebView;
    };
    __telemetreeSessionStarted?: boolean;
    __telemetreeTonObserverStarted?: boolean;
  }
}

export const TwaAnalyticsProviderContext = createContext<EventBuilder | null>(
  null,
);

export type TwaAnalyticsProviderOptions = {
  projectId: string;
  apiKey: string;
  trackGroup?: TrackGroups | false;
  telegramWebAppData?: TelegramWebAppData;
};

export type TwaAnalyticsProviderProps = {
  children: ReactNode;
} & TwaAnalyticsProviderOptions;

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
  const trackGroup = options.trackGroup !== undefined ? options.trackGroup : TrackGroups.HIGH;

  if (!options.projectId) {
    throw new Error('TWA Analytics Provider: Missing projectId');
  }

  const telegramWebAppData =
    options.telegramWebAppData || loadTelegramWebAppData();

  const eventBuilder = useMemo(() => {
    return new EventBuilder(
      options.projectId,
      options.apiKey,
      telegramWebAppData,
      trackGroup
    );
  }, []);

  // Initialize TON Connect observer with await
  useEffect(() => {
    let observer: TonConnectObserver | null = null;

    if (trackGroup) {
      if (!window.__telemetreeTonObserverStarted) {
        try {
          observer = new TonConnectObserver(eventBuilder);
          window.__telemetreeTonObserverStarted = true;
          Logger.info('TON Connect observer initialized successfully');
        } catch (error) {
          Logger.error('Failed to initialize TON Connect observer', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }
    return () => {
      observer?.destroy();
    };
  }, [eventBuilder]);

  useEffect(() => {
    const webApp = window?.Telegram?.WebApp;

    if (trackGroup) {
      if (trackGroup === TrackGroups.LOW) {
        trackGroupLow(eventBuilder, webApp);
      }

      if (trackGroup === TrackGroups.MEDIUM) {
        trackGroupMedium(eventBuilder, webApp);
      }

      if (trackGroup === TrackGroups.HIGH) {
        trackGroupHigh(eventBuilder, webApp);
      }
    }
  }, [eventBuilder]);

  return (
    <TwaAnalyticsProviderContext.Provider value={eventBuilder}>
      {children}
    </TwaAnalyticsProviderContext.Provider>
  );
};

// Export the component as default
export default TwaAnalyticsProvider;
