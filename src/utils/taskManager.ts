import { Task } from '../types';

const API_ENDPOINT =
  'https://analytics-backend-python-co9bzgwn9.vercel.app/public-api/ads-network/fetch';
const ADS_USER_ID = '7c77f83b-6c77-4123-bdc3-d202d45a98b8';
const EXPIRATION_TIME = 48; // 48 hours
const QUANTITY = 5;

export class TaskManager {
  private storageKey = 'twa_analytics_tasks';

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
    try {
      const response = await fetch(
        `${API_ENDPOINT}?expiration_time=${EXPIRATION_TIME}&quantity=${QUANTITY}`,
        {
          headers: {
            'ads-user-id': ADS_USER_ID,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();

      if (!data.tasks || !Array.isArray(data.tasks)) {
        console.error('API did not return a valid tasks array:', data);
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const newTasks: Task[] = data.tasks.map((task: any) => ({
        ...task,
        expirationTime: currentTime + EXPIRATION_TIME * 3600, // Add expiration time in seconds
      }));

      const existingTasks = this.getStoredTasks();
      const updatedTasks = [...existingTasks, ...newTasks].slice(0, QUANTITY);
      this.setStoredTasks(updatedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }
}

