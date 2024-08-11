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
import { TonConnectStorageData } from '../models/tonconnect-storage-data';
import { EventType } from '../enum/event-type.enum';
import { getConfig } from '../config';
import { TaskManager } from '../utils/taskManager';

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
  };
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
    if (tasksHost) {
      const taskManager = new TaskManager(adsUserId, tasksHost);
      taskManager.initializeTasks();
    }
  }, [adsUserId, tasksHost]);

  useEffect(() => {
    // ... (existing event handlers)

    // Event handler for 'display_task'
    const handleDisplayTask = (event: CustomEvent) => {
      const taskId = event.detail?.task_id;
      const userId = telegramWebAppData.user?.id;
      if (taskId && userId) {
        const url = new URL(
          'https://analytics-backend-python-co9bzgwn9.vercel.app/public-api/ads-network/display',
        );
        url.searchParams.append('task_id', taskId);
        url.searchParams.append('user_id', userId.toString());

        const headers: HeadersInit = {};
        if (adsUserId) {
          headers['ads-user-id'] = adsUserId;
        }

        fetch(url.toString(), {
          method: 'GET',
          headers,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Handle successful response if needed
          })
          .catch((error) => {
            console.error(
              'Error displaying task:',
              error instanceof Error ? error.message : 'Unknown error',
            );
          });
      }
    };

    // Event handler for 'fetch_tasks'
    const handleFetchTasks = (event: CustomEvent) => {
      const taskId = event.detail?.task_id;
      const userId = telegramWebAppData.user?.id;
      if (taskId && userId) {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (adsUserId) {
          headers['ads-user-id'] = adsUserId;
        }

        fetch(
          'https://analytics-backend-python-co9bzgwn9.vercel.app/public-api/ads-network/verify',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ task_id: taskId, user_id: userId }),
          },
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Handle successful response if needed
          })
          .catch((error) => {
            console.error(
              'Error verifying task:',
              error instanceof Error ? error.message : 'Unknown error',
            );
          });
      }
    };

    window.addEventListener('display_task', handleDisplayTask as EventListener);
    window.addEventListener('fetch_tasks', handleFetchTasks as EventListener);

    return () => {
      window.removeEventListener(
        'display_task',
        handleDisplayTask as EventListener,
      );
      window.removeEventListener(
        'fetch_tasks',
        handleFetchTasks as EventListener,
      );
    };
  }, [telegramWebAppData, adsUserId]);

  return (
    <TwaAnalyticsProviderContext.Provider value={eventBuilder}>
      {children}
    </TwaAnalyticsProviderContext.Provider>
  );
};

export default memo(TwaAnalyticsProvider);
