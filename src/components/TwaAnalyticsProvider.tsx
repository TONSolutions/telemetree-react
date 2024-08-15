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
import {configApiGateway} from "../constants";

export type TwaAnalyticsProviderOptions = {
  projectId: string;
  apiKey: string;
  appName: string;
  adsUserId?: string;
};

export type TwaAnalyticsProviderProps = {
  children: ReactNode;
} & TwaAnalyticsProviderOptions;

export type TwaAnalyticsProviderContextType = {
  eventBuilder: EventBuilder | null;
  taskManager: TaskManager | null;
  isInitialized: boolean;
};

export const TwaAnalyticsProviderContext = createContext<TwaAnalyticsProviderContextType | null>(
  null,
);

export type TwaAnalyticsConfig = {
  host: string;
  autoCapture: boolean;
  autoCaptureTags: string[];
  autoCaptureClasses: string[];
  publicKey: string;
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
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const eventBuilder = useMemo(() => {
    return new EventBuilder(
      options.projectId,
      options.apiKey,
      options.appName,
      telegramWebAppData,
      adsUserId,
    );
  }, []);

  const newTaskManager = useMemo(() => {
    let taskManager: TaskManager | null = null;
    if (tasksHost && token) {
      taskManager = new TaskManager(
        adsUserId,
        tasksHost,
        token,
        telegramWebAppData,
        (error: TaskManagerError) => {
          Logger.error('TaskManager error:', {
            message: error.message,
            code: error.code,
          });
        },
      );
    }

    return taskManager;
  }, [adsUserId, tasksHost, token, telegramWebAppData]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `${configApiGateway}?project=${options.projectId}`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        setTasksHost(data.tasks_host || 'https://api.telemetree.io');
        setToken(data.token || '');
      } catch (error) {
        console.error('Error fetching config:', error);
        setTasksHost('https://api.telemetree.io'); // Set default if fetch fails
      }
    };
    fetchConfig();
  }, [options.projectId]);

  useEffect(() => {
    let taskManager: TaskManager | null = null;
    if (tasksHost && token) {
      taskManager = new TaskManager(
        adsUserId,
        tasksHost,
        token,
        telegramWebAppData,
        (error: TaskManagerError) => {
          Logger.error('TaskManager error:', {
            message: error.message,
            code: error.code,
          });
        },
      );
      taskManager.initializeTasks()
        .then(r => {
          setIsInitialized(true);
        });
    }

    return () => {
      if (taskManager) {
        taskManager.cleanup();
      }
    };
  }, [adsUserId, tasksHost, token, telegramWebAppData]);

  const contextValue = useMemo(() => ({
    eventBuilder,
    taskManager: newTaskManager,
    isInitialized,
  }), [eventBuilder, newTaskManager, isInitialized]);

  return (
    <TwaAnalyticsProviderContext.Provider value={contextValue}>
      {children}
    </TwaAnalyticsProviderContext.Provider>
  );
};

export default memo(TwaAnalyticsProvider);
