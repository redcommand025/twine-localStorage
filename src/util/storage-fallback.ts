/**
 * Detects whether window.localStorage is usable. If accessing, writing, or
 * reading it fails (e.g. SecurityError, quota of zero, or writes that silently
 * don't persist), replaces it with an in-memory Storage so Twine can start.
 * Data kept in memory is lost when the tab is closed or reloaded.
 */
export class MemoryStorage implements Storage {
	private data = new Map<string, string>();
	get length() {
		return this.data.size;
	}
	clear() {
		this.data.clear();
	}
	getItem(key: string) {
		return this.data.has(key) ? this.data.get(key)! : null;
	}
	key(index: number) {
		return Array.from(this.data.keys())[index] ?? null;
	}
	removeItem(key: string) {
		this.data.delete(key);
	}
	setItem(key: string, value: string) {
		this.data.set(String(key), String(value));
	}
}

export function isLocalStorageUsable(win: Window = window): boolean {
	try {
		const storage = win.localStorage;
		if (!storage) {
			return false;
		}
		const key = '__twine-storage-probe__';
		const value = String(Date.now());
		storage.setItem(key, value);
		const ok = storage.getItem(key) === value;
		storage.removeItem(key);
		return ok;
	} catch (e) {
		return false;
	}
}

/** Returns true if the in-memory fallback was installed. */
export function installStorageFallback(win: Window = window): boolean {
	if (isLocalStorageUsable(win)) {
		return false;
	}
	Object.defineProperty(win, 'localStorage', {
		configurable: true,
		value: new MemoryStorage()
	});
	return true;
}
