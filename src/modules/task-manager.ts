import { Logger } from '../utils/logger';
import { TelegramWebAppData } from '../models';
import { Task } from '../types';
import { handleError } from '../utils/error-handler';

type TaskEvent = CustomEvent<{ taskId: string }>;

const EXPIRATION_TIME = 48; // 48 hours
const QUANTITY = 5;

export class TaskManagerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    if (!code.trim()) {
      throw new Error('Code must be a non-empty string');
    }
    super(message);
    this.name = 'TaskManagerError';
    Logger.error(`TaskManagerError: ${message} - Code: ${code}`);
  }
}

export class TaskManager {
  private dbName = 'TelemetreeTasksDB';
  private storeName = 'tasks';
  private db: IDBDatabase | null = null;

  private boundHandleDisplayTask: EventListener;
  private boundHandleFetchTasks: EventListener;
  private storageKey = 'telemetree_tasks';
  private isInitialized = false;

  constructor(
    private adsUserId: string | undefined,
    private tasksHost: string,
    private token: string,
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
    await this.openDatabase();
    this.setupEventListeners();
    Logger.info('TaskManager initialized and event listeners set up.');

    const storedTasks = await this.getStoredTasks();
    Logger.info(`Found ${storedTasks.length} tasks in storage.`);

    if (storedTasks.length < QUANTITY) {
      Logger.info('Not enough tasks found, fetching more tasks.');
      await this.fetchAndStoreTasks();
    } else {
      await this.removeExpiredTasks();
      Logger.info('Expired tasks removed.');

      const remainingTasks = await this.getStoredTasks();
      if (remainingTasks.length < QUANTITY) {
        Logger.info(
          'Not enough tasks left after removing expired tasks, fetching more.',
        );
        await this.fetchAndStoreTasks();
      } else {
        this.isInitialized = true;
      }
    }
  }

  public async getInitialized(): Promise<boolean> {
    return this.isInitialized;
  }

  public async getTasks(): Promise<Task[]> {
    return this.getStoredTasks();
  }

  private setupEventListeners(): void {
    window.addEventListener('display_task', this.boundHandleDisplayTask);
    window.addEventListener('fetch_tasks', this.boundHandleFetchTasks);
  }

  public cleanup(): void {
    window.removeEventListener('display_task', this.boundHandleDisplayTask);
    window.removeEventListener('fetch_tasks', this.boundHandleFetchTasks);
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private handleDisplayTask = (event: Event): void => {
    const taskEvent = event as TaskEvent;
    const taskId = taskEvent.detail?.taskId;
    const userId = this.getUserId();
    if (taskId && userId) {
      this.displayTask(taskId, userId);
    }
  };

  private handleFetchTasks = async (event: Event): Promise<void> => {
    const taskEvent = event as TaskEvent;
    const taskId = taskEvent.detail?.taskId;
    const userId = this.getUserId();
    if (taskId && userId) {
      await this.verifyTask(taskId, userId);
    }
  };

  private getUserId(): string | undefined {
    return this.telegramWebAppData.user?.id?.toString();
  }

  public async displayedTaskShown(taskId: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;
    await this.displayTask(taskId, userId);
  }

  private async displayTask(taskId: string, userId: string): Promise<void> {
    const url = new URL(`${this.tasksHost}/display`);
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
      handleError(taskError.message, { taskId, userId });
      this.onError?.(taskError);
    }
  }

  public async verifyingTask(taskId: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) return;
    await this.verifyTask(taskId, userId);
  }

  private async verifyTask(taskId: string, userId: string): Promise<void> {
    const url = new URL(`${this.tasksHost}/verify`);
    url.searchParams.append('task_id', taskId);
    url.searchParams.append('user_id', userId);

    try {
      const response = await this.sendRequest(url.toString(), 'GET');
      if (!response.ok) {
        throw new TaskManagerError(
          `HTTP error! status: ${response.status}`,
          'VERIFY_TASK_ERROR',
        );
      }
      Logger.info('Task verified successfully', { taskId, userId });
    } catch (error) {
      const taskError =
        error instanceof TaskManagerError
          ? error
          : new TaskManagerError('Error verifying task', 'VERIFY_TASK_ERROR');
      handleError(taskError.message, { taskId, userId });
      this.onError?.(taskError);
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

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(url, {
      method,
      headers,
      body,
    });
  }

  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(new Error('Failed to open database'));

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.storeName, { keyPath: 'id' });
      };
    });
  }

  private async getStoredTasks(): Promise<Task[]> {
    if (!this.db) await this.openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(new Error('Failed to get tasks'));
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async setStoredTasks(tasks: Task[]): Promise<void> {
    if (!this.db) await this.openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Clear existing tasks
      store.clear();

      // Add new tasks
      tasks.forEach((task) => store.add(task));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Failed to store tasks'));
    });
  }

  private async removeExpiredTasks(): Promise<void> {
    const currentTime = Math.floor(Date.now() / 1000);
    const tasks = await this.getStoredTasks();
    const validTasks = tasks.filter(
      (task) => task.expirationTime > currentTime,
    );
    await this.setStoredTasks(validTasks);
  }

  private async fetchAndStoreTasks(): Promise<void> {
    if (!this.adsUserId) {
      Logger.info('adsUserId not set, skipping task fetch');
      return;
    }

    try {
      const url = new URL(`${this.tasksHost}/fetch`);
      url.searchParams.append(
        'expiration_time_in_hours',
        EXPIRATION_TIME.toString(),
      );
      url.searchParams.append('quantity', QUANTITY.toString());

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

      const existingTasks = await this.getStoredTasks();
      const updatedTasks = [...existingTasks, ...newTasks].slice(0, QUANTITY);
      await this.setStoredTasks(updatedTasks)
        .then(() => {
          this.isInitialized = true;
        });
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

