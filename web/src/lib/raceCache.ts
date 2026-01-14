import { RaceData } from '@/types/race';

const DB_NAME = 'f1-race-replay';
const DB_VERSION = 1;
const STORE_NAME = 'races';

const CACHE_VERSION = 'v2'; // Bumped version to invalidate NaN-buggy caches

type StoredRace = {
    data: RaceData;
    savedAt: number;
    year: number;
    round: number;
    version: string;
};

function openDb(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function cacheKey(year: number, round: number) {
    return `${year}-${round}`;
}

export async function getRaceFromCache(year: number, round: number): Promise<RaceData | null> {
    const db = await openDb();
    if (!db) return null;

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(cacheKey(year, round));

        request.onsuccess = () => {
            const value = request.result as StoredRace | undefined;
            // Invalidate if version mismatch (useful for the NaN fix)
            if (value && value.version !== CACHE_VERSION) {
                console.log(`[RaceCache] Invalidating old cache version for ${year}-${round}`);
                removeRaceFromCache(year, round);
                resolve(null);
                return;
            }
            if (value) {
                console.log(`[RaceCache] Hit for ${year}-${round}`);
            } else {
                console.log(`[RaceCache] Miss for ${year}-${round}`);
            }
            resolve(value?.data ?? null);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function setRaceInCache(year: number, round: number, data: RaceData): Promise<void> {
    const db = await openDb();
    if (!db) return;

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const value: StoredRace = {
            data,
            savedAt: Date.now(),
            year,
            round,
            version: CACHE_VERSION
        };
        const request = store.put(value, cacheKey(year, round));

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function removeRaceFromCache(year: number, round: number): Promise<void> {
    const db = await openDb();
    if (!db) return;

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(cacheKey(year, round));

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
