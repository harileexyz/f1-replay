import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { StandingItem, ConstructorStandingItem } from '@/data/standings';

export interface StandingsData {
    driver_standings: StandingItem[];
    constructor_standings: ConstructorStandingItem[];
    season: number;
    updated_at?: any;
}

export function useStandings(year: number) {
    const [data, setData] = useState<StandingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Subscribe to real-time updates for the standings document
        const docRef = doc(db, 'standings', year.toString());

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setData(docSnap.data() as StandingsData);
            } else {
                // If specific year data doesn't exist, we might want to fail gracefully
                // or just define it as empty.
                console.warn(`No standings data found for year ${year}`);
                setData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching standings:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [year]);

    return { data, loading, error };
}
