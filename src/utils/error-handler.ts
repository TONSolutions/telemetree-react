import { Logger } from './logger';

export function handleError(message: string, error: unknown): void {
  Logger.error(message, {
    error: error instanceof Error ? error.message : String(error),
  });
}
