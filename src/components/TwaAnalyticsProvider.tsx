import {
  createContext,
  FunctionComponent,
  memo,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EventBuilder } from '../builders';
import { loadTelegramWebAppData, webViewHandler } from '../telegram/telegram';
import { TaskManager, TaskManagerError } from '../modules/task-manager';
import { Logger } from '../utils/logger';
import { handleError } from '../utils/error-handler';
import { sanitize } from '../utils/sanitize';

export type TwaAnalyticsProviderOptions = {
  projectId: string;
  apiKey: string;
  appName: string;
  adsUserId?: string;
};

export type TwaAnalyticsProviderProps = {
  children: ReactNode;
} & TwaAnalyticsProviderOptions;

export const TwaAnalyticsProviderContext = createContext<EventBuilder | null>(
  null,
);

export type TwaAnalyticsConfig = {
  host: string;
  auto_capture: boolean;
  auto_capture_tags: string[];
  auto_capture_classes: string[];
  public_key: string;
};

function getElementProperties(element: HTMLElement): Record<string, string> {
  try {
    return {
      tagName: element.tagName,
      id: sanitize(element.id),
      className: sanitize(element.className),
    };
  } catch (error) {
    Logger.error('Error accessing element properties:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}

const TwaAnalyticsProvider: FunctionComponent<TwaAnalyticsProviderProps> = ({
  children,
  adsUserId,
  ...options
}) => {
  if (!options.projectId) {
    throw new Error('TWA Analytics Provider: Missing projectId');
  }

  const telegramWebAppData = loadTelegramWebAppData();
  const [tasksHost, setTasksHost] = useState<string | null>(null);

  const eventBuilder = useMemo(() => {
    return new EventBuilder(
      options.projectId,
      options.apiKey,
      options.appName,
      telegramWebAppData,
      adsUserId,
    );
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `https://analytics-backend-python-co9bzgwn9.vercel.app/public-api/config?project=${options.projectId}`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        setTasksHost(data.tasks_host || 'https://api.telemetree.io');
      } catch (error) {
        console.error('Error fetching config:', error);
        setTasksHost('https://api.telemetree.io'); // Set default if fetch fails
      }
    };
    fetchConfig();
  }, [options.projectId]);

  useEffect(() => {
    let taskManager: TaskManager | null = null;
    if (tasksHost) {
      taskManager = new TaskManager(
        adsUserId,
        tasksHost,
        telegramWebAppData,
        (error: TaskManagerError) => {
          Logger.error('TaskManager error:', {
            message: error.message,
            code: error.code,
          });
        },
      );
      taskManager.initializeTasks();
    }

    return () => {
      if (taskManager) {
        taskManager.cleanup();
      }
    };
  }, [adsUserId, tasksHost, telegramWebAppData]);

  return (
    <TwaAnalyticsProviderContext.Provider value={eventBuilder}>
      {children}
    </TwaAnalyticsProviderContext.Provider>
  );
};

export default memo(TwaAnalyticsProvider);
