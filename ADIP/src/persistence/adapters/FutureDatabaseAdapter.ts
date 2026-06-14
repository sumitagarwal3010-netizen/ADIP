import type { StorageAdapter } from './StorageAdapter';

/** Stub adapter — production database persistence (not implemented). */
export class FutureDatabaseAdapter implements StorageAdapter {
  readonly kind = 'future-database';

  isAvailable(): boolean {
    return false;
  }

  getItem(key: string): string | null {
    void key;
    console.warn('[FutureDatabaseAdapter] SELECT not available — use LocalStorageAdapter in demo mode');
    return null;
  }

  setItem(key: string, value: string): void {
    void key;
    void value;
    console.warn('[FutureDatabaseAdapter] INSERT/UPDATE not available');
  }

  removeItem(key: string): void {
    void key;
    console.warn('[FutureDatabaseAdapter] DELETE not available');
  }

  keys(prefix?: string): string[] {
    void prefix;
    return [];
  }

  clear(prefix?: string): void {
    void prefix;
    console.warn('[FutureDatabaseAdapter] TRUNCATE not available');
  }
}
