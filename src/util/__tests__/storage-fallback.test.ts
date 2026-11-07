import {installStorageFallback, isLocalStorageUsable, MemoryStorage} from '../storage-fallback';

describe('storage fallback', () => {
	it('leaves working localStorage alone', () => {
		expect(isLocalStorageUsable()).toBe(true);
		expect(installStorageFallback()).toBe(false);
	});

	it('installs memory storage when access throws', () => {
		const win: any = {};
		Object.defineProperty(win, 'localStorage', {
			configurable: true,
			get() {
				throw new Error('SecurityError');
			}
		});
		expect(installStorageFallback(win)).toBe(true);
		win.localStorage.setItem('a', 'b');
		expect(win.localStorage.getItem('a')).toBe('b');
		expect(win.localStorage.getItem('missing')).toBeNull();
	});

	it('installs memory storage when writes do not persist', () => {
		const win: any = {localStorage: {setItem() {}, getItem: () => null, removeItem() {}}};
		expect(installStorageFallback(win)).toBe(true);
		expect(win.localStorage).toBeInstanceOf(MemoryStorage);
	});
});
