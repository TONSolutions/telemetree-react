import { useContext } from 'react';
import { EventBuilder } from '../builders';
import { TwaAnalyticsProviderContext } from '../components';
import {Logger} from "../utils/logger";

export function useTWAEvent(): EventBuilder | null {
  const context = useContext(TwaAnalyticsProviderContext);

  if (!context?.eventBuilder || !(context.eventBuilder instanceof EventBuilder)) {
    Logger.warn(
      'TwaAnalyticsProvider is not configured. Please, set up <TwaAnalyticsProvider /> before using this hook.',
    );

    return null;
  }

  return context.eventBuilder;
}
