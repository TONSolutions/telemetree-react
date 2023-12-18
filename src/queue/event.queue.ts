import { BaseEvent } from '../types';

export class EventQueue {
  constructor(protected queue: BaseEvent[] = []) {}

  add(event: BaseEvent): void {
    this.queue.push(event);
  }

  get(): BaseEvent[] {
    return this.queue;
  }

  clear(): void {
    this.queue = [];
  }
}
