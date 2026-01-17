import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RaceData, Frame, PlaybackState, TrackBounds } from '@/types/race';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { getRaceFromCache, setRaceInCache, removeRaceFromCache } from '@/lib/raceCache';

export function useRaceReplay(year: number, round: number) {
    const [data, setData] = useState<RaceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStage, setLoadingStage] = useState<'init' | 'cache' | 'fetching' | 'downloading' | 'parsing' | 'ready'>('init');
    const [error, setError] = useState<string | null>(null);
    const [isFromCache, setIsFromCache] = useState(false);
    const [reloadToken, setReloadToken] = useState(0);
    const [playback, setPlayback] = useState<PlaybackState>({
        isPlaying: false,
        currentFrameIndex: 0,
        currentTime: 0,
        playbackSpeed: 1,
        selectedDriver: null,
        comparisonDriver: null,
    });

    const lastUpdateTimeRef = useRef<number | null>(null);
    const requestRef = useRef<number>();
    const maxProgressRef = useRef<number>(0);

    // Fetch with progress tracking
    const fetchWithProgress = useCallback((url: string): Promise<string> => {
        // Reset max progress for new fetch
        maxProgressRef.current = 0;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.onprogress = (event) => {
                let percent: number;
                if (event.lengthComputable) {
                    percent = Math.round((event.loaded / event.total) * 100);
                } else {
                    // If length not computable, show indeterminate progress based on loaded bytes
                    // Assume ~15MB for telemetry data
                    const estimatedTotal = 15 * 1024 * 1024;
                    percent = Math.min(95, Math.round((event.loaded / estimatedTotal) * 100));
                }

                // Only update if progress increased (prevents flickering)
                if (percent > maxProgressRef.current) {
                    maxProgressRef.current = percent;
                    setLoadingProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    maxProgressRef.current = 100;
                    setLoadingProgress(100);
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send();
        });
    }, []);

    // Fetch race data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setLoadingProgress(0);
                setLoadingStage('cache');

                const cached = await getRaceFromCache(year, round);
                if (cached) {
                    setData(cached);
                    setIsFromCache(true);
                    setLoadingProgress(100);
                    setLoadingStage('ready');
                    if (cached.frames.length > 0) {
                        setPlayback(prev => ({
                            ...prev,
                            currentTime: cached.frames[0].t,
                            currentFrameIndex: 0
                        }));
                    }
                    setLoading(false);
                    return;
                }

                setIsFromCache(false);
                setLoadingStage('fetching');
                setLoadingProgress(5);

                // Try to fetch from Firebase Storage
                // Path matches scripts/upload_race.py: races/{year}/{round}.json
                const storageRef = ref(storage, `races/${year}/${round}.json`);
                let jsonData: RaceData;

                try {
                    const url = await getDownloadURL(storageRef);
                    console.log(`[RaceReplay] Fetching from Firebase Storage: ${url.substring(0, 100)}...`);

                    setLoadingStage('downloading');
                    setLoadingProgress(10);

                    const text = await fetchWithProgress(url);

                    setLoadingStage('parsing');
                    console.log(`[RaceReplay] Response OK, parsing JSON...`);

                    try {
                        jsonData = JSON.parse(text);
                    } catch (parseErr) {
                        // Some older uploads may contain NaN; sanitize and retry
                        const sanitized = text.replace(/\bNaN\b/g, 'null');
                        jsonData = JSON.parse(sanitized);
                        console.warn('[RaceReplay] Sanitized NaN values in Firebase JSON');
                    }
                    console.log(`[RaceReplay] Loaded ${jsonData.frames?.length || 0} frames from Firebase`);
                } catch (storageErr) {
                    console.error('[RaceReplay] Firebase Storage fetch failed:', storageErr);
                    console.warn('[RaceReplay] Falling back to mock API...');
                    setLoadingStage('downloading');
                    // Fallback to mock API during setup
                    const response = await fetch(`/api/race?year=${year}&round=${round}`);
                    if (!response.ok) throw new Error('Failed to fetch fallback race data');
                    jsonData = await response.json();
                    console.log(`[RaceReplay] Loaded ${jsonData.frames?.length || 0} frames from mock API`);
                }

                setLoadingStage('ready');
                await setRaceInCache(year, round, jsonData);
                setData(jsonData);

                // Initialize playback to first frame
                if (jsonData.frames.length > 0) {
                    setPlayback(prev => ({
                        ...prev,
                        currentTime: jsonData.frames[0].t,
                        currentFrameIndex: 0
                    }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [year, round, reloadToken, fetchWithProgress]);

    // Track bounds calculation
    const bounds = useMemo<TrackBounds | null>(() => {
        if (!data || data.frames.length === 0) return null;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        // Sample frames to find bounds (don't need every frame if it's too large)
        for (let i = 0; i < data.frames.length; i += 10) {
            const frame = data.frames[i];
            Object.values(frame.drivers).forEach(d => {
                if (d.x < minX) minX = d.x;
                if (d.x > maxX) maxX = d.x;
                if (d.y < minY) minY = d.y;
                if (d.y > maxY) maxY = d.y;
            });
        }

        const width = maxX - minX;
        const height = maxY - minY;

        // Add 20% padding to prevent cropping
        const padding = Math.max(width, height) * 0.2;

        return {
            minX: minX - padding,
            maxX: maxX + padding,
            minY: minY - padding,
            maxY: maxY + padding,
            width: width + 2 * padding,
            height: height + 2 * padding
        };
    }, [data]);

    // Animation frame handler
    const animate = useCallback((time: number) => {
        if (!lastUpdateTimeRef.current) {
            lastUpdateTimeRef.current = time;
        }

        const deltaTime = (time - lastUpdateTimeRef.current) / 1000;
        lastUpdateTimeRef.current = time;

        setPlayback(prev => {
            if (!prev.isPlaying || !data) return prev;

            const nextTime = prev.currentTime + deltaTime * prev.playbackSpeed;

            // Find the frame that corresponds to nextTime
            // We can optimize this by searching forward from the current frame
            let nextFrameIndex = prev.currentFrameIndex;

            // Search forward
            while (
                nextFrameIndex < data.frames.length - 1 &&
                data.frames[nextFrameIndex + 1].t <= nextTime
            ) {
                nextFrameIndex++;
            }

            // If we hit the end, stop
            if (nextFrameIndex >= data.frames.length - 1) {
                return { ...prev, isPlaying: false, currentFrameIndex: data.frames.length - 1 };
            }

            return {
                ...prev,
                currentTime: nextTime,
                currentFrameIndex: nextFrameIndex
            };
        });

        requestRef.current = requestAnimationFrame(animate);
    }, [data]);

    useEffect(() => {
        if (playback.isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            lastUpdateTimeRef.current = null;
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [playback.isPlaying, animate]);

    // Control functions
    const togglePlay = () => setPlayback(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    const setSpeed = (speed: number) => setPlayback(prev => ({ ...prev, playbackSpeed: speed }));
    const seekTo = (index: number) => {
        if (!data) return;
        setPlayback(prev => ({
            ...prev,
            currentFrameIndex: index,
            currentTime: data.frames[index].t
        }));
    };
    const selectDriver = (code: string | null) => setPlayback(prev => ({ ...prev, selectedDriver: code }));
    const selectComparisonDriver = (code: string | null) => setPlayback(prev => ({ ...prev, comparisonDriver: code }));

    const seekToLap = (lap: number) => {
        if (!data) return;
        const index = data.frames.findIndex(f => f.lap >= lap);
        if (index !== -1) seekTo(index);
    };

    const availableLaps = useMemo(() => {
        if (!data) return [];
        const lapsSet = new Set<number>();
        data.frames.forEach(f => lapsSet.add(f.lap));
        return Array.from(lapsSet).sort((a, b) => a - b);
    }, [data]);

    // Ghost Calculation: Fastest Lap
    const fastestLapInfo = useMemo(() => {
        if (!data || !playback.selectedDriver) return null;
        const driver = playback.selectedDriver;

        // Group frames by lap for this driver
        const lapFrames: Record<number, number[]> = {};
        data.frames.forEach((f, idx) => {
            const lap = f.drivers[driver]?.lap;
            if (lap !== undefined) {
                if (!lapFrames[lap]) lapFrames[lap] = [];
                lapFrames[lap].push(idx);
            }
        });

        // Find lap with fewest frames (fastest)
        let minFrames = Infinity;
        let bestLap = -1;
        Object.entries(lapFrames).forEach(([lap, frames]) => {
            if (frames.length < minFrames && frames.length > 10) { // filter out partial laps
                minFrames = frames.length;
                bestLap = parseInt(lap);
            }
        });

        if (bestLap === -1) return null;

        return {
            lap: bestLap,
            frames: lapFrames[bestLap]
        };
    }, [data, playback.selectedDriver]);

    const currentFrame = data?.frames[playback.currentFrameIndex] || null;

    const ghostFrame = useMemo(() => {
        if (!fastestLapInfo || !currentFrame || !playback.selectedDriver || !data) return null;

        const driver = playback.selectedDriver;
        const currentLap = currentFrame.drivers[driver]?.lap;
        if (currentLap === undefined) return null;

        // Find progress in current lap
        const currentLapFrames = data.frames.filter(f => f.drivers[driver]?.lap === currentLap);
        const currentIndex = currentLapFrames.findIndex(f => f.t === currentFrame.t);
        if (currentIndex === -1) return null;

        const progressPercent = currentIndex / currentLapFrames.length;

        // Map progress to fastest lap frames
        const ghostFrameIndexInLap = Math.floor(progressPercent * fastestLapInfo.frames.length);
        const ghostGlobalIndex = fastestLapInfo.frames[ghostFrameIndexInLap];

        return data.frames[ghostGlobalIndex] || null;
    }, [fastestLapInfo, currentFrame, data, playback.selectedDriver]);

    const refresh = async () => {
        await removeRaceFromCache(year, round);
        setReloadToken(prev => prev + 1);
    };

    return {
        data,
        loading,
        loadingProgress,
        loadingStage,
        error,
        isFromCache,
        playback,
        bounds,
        currentFrame,
        ghostFrame,
        actions: {
            togglePlay,
            setSpeed,
            seekTo,
            selectDriver,
            selectComparisonDriver,
            seekToLap,
            refresh
        },
        availableLaps
    };
}
