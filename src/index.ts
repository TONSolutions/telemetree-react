import { Logger, LogLevel } from './utils/logger';
import { getConfig, setConfig, type TelemetreeConfig } from './config';
import { TaskManager } from './modules';

Logger.setLevel(
  import.meta.env.MODE === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
);

export { useTWAEvent, useTMATasks } from './hooks';
export {
  type TwaAnalyticsProviderProps,
  type TwaAnalyticsProviderOptions,
  TwaAnalyticsProvider,
} from './components';
export {
  type BaseEvent,
  type EventDetails,
  type EventUserDetails,
} from './types/event';
export { TaskManager } from './modules';
