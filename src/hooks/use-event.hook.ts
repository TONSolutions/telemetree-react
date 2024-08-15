import { useContext } from 'react';
import { EventBuilder } from '../builders';
import { TwaAnalyticsProviderContext } from '../components';

export function useTWAEvent(): EventBuilder {
  const context = useContext(TwaAnalyticsProviderContext);

  if (!context?.eventBuilder || !(context.eventBuilder instanceof EventBuilder)) {
    throw new Error(
      'TwaAnalyticsProvider is not configured. Please, set up <TwaAnalyticsProvider /> before using this hook.',
    );
  }

  return context.eventBuilder;
}
