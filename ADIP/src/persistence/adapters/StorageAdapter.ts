export interface StorageAdapter {
  readonly kind: string;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(prefix?: string): string[];
  clear(prefix?: string): void;
  isAvailable(): boolean;
}
