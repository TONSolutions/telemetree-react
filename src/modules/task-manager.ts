import { Logger } from '../utils/logger';
import { TelegramWebAppData } from '../models';
import { Task } from '../types';

type TaskEvent = CustomEvent<{ task_id: string }>;

const EXPIRATION_TIME = 48; // 48 hours
const QUANTITY = 5;

export class TaskManagerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'TaskManagerError';
  }
}

export class TaskManager {
  private boundHandleDisplayTask: EventListener;
  private boundHandleFetchTasks: EventListener;
  private storageKey = 'telemetree_tasks';

  constructor(
    private adsUserId: string | undefined,
    private tasksHost: string,
    private telegramWebAppData: TelegramWebAppData,
    private onError?: (error: TaskManagerError) => void,
  ) {
    this.boundHandleDisplayTask = this.handleDisplayTask.bind(
      this,
    ) as EventListener;
    this.boundHandleFetchTasks = this.handleFetchTasks.bind(
      this,
    ) as EventListener;
  }

  public async initializeTasks(): Promise<void> {
    this.setupEventListeners();
    const storedTasks = this.getStoredTasks();
    if (storedTasks.length < QUANTITY) {
      await this.fetchAndStoreTasks();
    } else {
      this.removeExpiredTasks();
      if (this.getStoredTasks().length < QUANTITY) {
        await this.fetchAndStoreTasks();
      }
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('display_task', this.boundHandleDisplayTask);
    window.addEventListener('fetch_tasks', this.boundHandleFetchTasks);
  }

  public cleanup(): void {
    window.removeEventListener('display_task', this.boundHandleDisplayTask);
    window.removeEventListener('fetch_tasks', this.boundHandleFetchTasks);
  }

  private handleDisplayTask = (event: Event): void => {
    const taskEvent = event as TaskEvent;
    const taskId = taskEvent.detail?.task_id;
    const userId = this.getUserId();
    if (taskId && userId) {
      this.displayTask(taskId, userId);
    }
  };

  private handleFetchTasks = async (event: Event): Promise<void> => {
    const taskEvent = event as TaskEvent;
    const taskId = taskEvent.detail?.task_id;
    const userId = this.getUserId();
    if (taskId && userId) {
      const isVerified = await this.verifyTask(taskId, userId);
      if (isVerified) {
        // Perform actions for a successfully verified task
        // For example, update UI or trigger a reward
      } else {
        // Handle failed verification
        // For example, show an error message to the user
      }
    }
  };

  private getUserId(): string | undefined {
    return this.telegramWebAppData.user?.id?.toString();
  }

  private async displayTask(taskId: string, userId: string): Promise<void> {
    const url = new URL(`${this.tasksHost}/public-api/ads-network/display`);
    url.searchParams.append('task_id', taskId);
    url.searchParams.append('user_id', userId);

    try {
      const response = await this.sendRequest(url.toString(), 'GET');
      if (!response.ok) {
        throw new TaskManagerError(
          `HTTP error! status: ${response.status}`,
          'DISPLAY_TASK_ERROR',
        );
      }
      Logger.info('Task displayed successfully', { taskId, userId });
    } catch (error) {
      const taskError =
        error instanceof TaskManagerError
          ? error
          : new TaskManagerError('Error displaying task', 'DISPLAY_TASK_ERROR');
      Logger.error(taskError.message, { taskId, userId });
      this.onError?.(taskError);
    }
  }

  private async verifyTask(taskId: string, userId: string): Promise<boolean> {
    const url = `${this.tasksHost}/public-api/ads-network/verify`;
    const body = JSON.stringify({ task_id: taskId, user_id: userId });

    try {
      const response = await this.sendRequest(url, 'POST', body);
      if (!response.ok) {
        throw new TaskManagerError(
          `HTTP error! status: ${response.status}`,
          'VERIFY_TASK_ERROR',
        );
      }
      const data = await response.json();
      if (data.verified === true) {
        Logger.info('Task verified successfully', { taskId, userId });
        return true;
      } else {
        Logger.info('Task verification failed', { taskId, userId });
        return false;
      }
    } catch (error) {
      const taskError =
        error instanceof TaskManagerError
          ? error
          : new TaskManagerError('Error verifying task', 'VERIFY_TASK_ERROR');
      Logger.error(taskError.message, { taskId, userId });
      this.onError?.(taskError);
      return false;
    }
  }

  private async sendRequest(
    url: string,
    method: 'GET' | 'POST',
    body?: string,
  ): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.adsUserId) {
      headers['ads-user-id'] = this.adsUserId;
    }

    return fetch(url, {
      method,
      headers,
      body,
    });
  }

  private getStoredTasks(): Task[] {
    const tasksJson = localStorage.getItem(this.storageKey);
    return tasksJson ? JSON.parse(tasksJson) : [];
  }

  private setStoredTasks(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  private removeExpiredTasks(): void {
    const currentTime = Math.floor(Date.now() / 1000);
    const tasks = this.getStoredTasks().filter(
      (task) => task.expirationTime > currentTime,
    );
    this.setStoredTasks(tasks);
  }

  private async fetchAndStoreTasks(): Promise<void> {
    if (!this.adsUserId) {
      Logger.info('adsUserId not set, skipping task fetch');
      return;
    }

    try {
      const url = new URL(`${this.tasksHost}/public-api/ads-network/fetch`);
      url.searchParams.append(
        'expiration_time_in_hours',
        EXPIRATION_TIME.toString(),
      );
      url.searchParams.append('quantity', QUANTITY.toString());

      const headers: HeadersInit = {
        'ads-user-id': this.adsUserId,
      };

      const response = await this.sendRequest(url.toString(), 'GET');
      const data = await response.json();

      if (!data.tasks || !Array.isArray(data.tasks) || !data.expiration) {
        Logger.error('API did not return valid data:', data);
        return;
      }

      const newTasks: Task[] = data.tasks.map((task: any) => ({
        ...task,
        expirationTime: new Date(data.expiration).getTime() / 1000, // Convert to Unix timestamp
      }));

      const existingTasks = this.getStoredTasks();
      const updatedTasks = [...existingTasks, ...newTasks].slice(0, QUANTITY);
      this.setStoredTasks(updatedTasks);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error('Error fetching tasks:', { message: error.message });
      } else {
        Logger.error('Error fetching tasks:', { message: 'Unknown error' });
      }
      this.onError?.(
        new TaskManagerError('Error fetching tasks', 'FETCH_TASKS_ERROR'),
      );
    }
  }
}
