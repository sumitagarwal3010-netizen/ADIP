import type { StorageAdapter } from './StorageAdapter';

/** Stub adapter — production REST API persistence (not implemented). */
export class FutureApiAdapter implements StorageAdapter {
  readonly kind = 'future-api';

  isAvailable(): boolean {
    return false;
  }

  getItem(key: string): string | null {
    void key;
    console.warn('[FutureApiAdapter] GET not available — use LocalStorageAdapter in demo mode');
    return null;
  }

  setItem(key: string, value: string): void {
    void key;
    void value;
    console.warn('[FutureApiAdapter] PUT not available — use LocalStorageAdapter in demo mode');
  }

  removeItem(key: string): void {
    void key;
    console.warn('[FutureApiAdapter] DELETE not available');
  }

  keys(prefix?: string): string[] {
    void prefix;
    return [];
  }

  clear(prefix?: string): void {
    void prefix;
    console.warn('[FutureApiAdapter] CLEAR not available');
  }
}
