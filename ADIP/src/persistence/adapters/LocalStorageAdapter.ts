import type { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter implements StorageAdapter {
  readonly kind = 'localStorage';

  isAvailable(): boolean {
    try {
      const k = '__adip_test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch { /* quota */ }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
  }

  keys(prefix?: string): string[] {
    try {
      const result: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (!prefix || k.startsWith(prefix))) result.push(k);
      }
      return result;
    } catch {
      return [];
    }
  }

  clear(prefix?: string): void {
    if (!prefix) {
      try { localStorage.clear(); } catch { /* ignore */ }
      return;
    }
    this.keys(prefix).forEach((k) => this.removeItem(k));
  }
}
