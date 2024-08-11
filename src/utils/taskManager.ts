import { Task } from '../types';

const EXPIRATION_TIME = 48; // 48 hours
const QUANTITY = 5;

export class TaskManager {
  private storageKey = 'telemetree_tasks';
  private adsUserId?: string;
  private apiEndpoint: string;

  constructor(adsUserId?: string, apiEndpoint?: string) {
    this.adsUserId = adsUserId;
    this.apiEndpoint = apiEndpoint || 'https://api.telemetree.io';
  }

  async initializeTasks(): Promise<void> {
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
      console.log('adsUserId not set, skipping task fetch');
      return;
    }

    try {
      if (!this.apiEndpoint) {
        throw new Error('API endpoint not set');
      }
      const url = new URL(`${this.apiEndpoint}/public-api/ads-network/fetch`);
      url.searchParams.append('expiration_time_in_hours', '48');
      url.searchParams.append('quantity', QUANTITY.toString());

      const headers: HeadersInit = {
        'ads-user-id': this.adsUserId,
      };

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();

      if (!data.tasks || !Array.isArray(data.tasks) || !data.expiration) {
        console.error('API did not return valid data:', data);
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
      console.error('Error fetching tasks:', error);
    }
  }
}
