import type { StorageAdapter } from './StorageAdapter';

export class MemoryAdapter implements StorageAdapter {
  readonly kind = 'memory';
  private store = new Map<string, string>();

  isAvailable(): boolean {
    return true;
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  keys(prefix?: string): string[] {
    return [...this.store.keys()].filter((k) => !prefix || k.startsWith(prefix));
  }

  clear(prefix?: string): void {
    if (!prefix) {
      this.store.clear();
      return;
    }
    this.keys(prefix).forEach((k) => this.store.delete(k));
  }
}
