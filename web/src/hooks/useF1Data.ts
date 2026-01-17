'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Driver, Team, Car } from '@/types/f1';

// Hook to fetch all drivers
export function useDrivers(season?: number) {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDrivers() {
            try {
                setLoading(true);
                const driversRef = collection(db, 'drivers');
                // Fetch all and filter/sort in memory to avoid indexing requirements
                const snapshot = await getDocs(driversRef);
                let driversList: Driver[] = [];

                snapshot.forEach(doc => {
                    driversList.push(doc.data() as Driver);
                });

                // Memory filtering
                if (season) {
                    driversList = driversList.filter(d => d.season === season);
                }

                // Memory sorting
                driversList.sort((a, b) => a.driver_number - b.driver_number);

                setDrivers(driversList);
                setError(null);
            } catch (err) {
                console.error('Error fetching drivers:', err);
                setError('Failed to load drivers');
            } finally {
                setLoading(false);
            }
        }

        fetchDrivers();
    }, [season]);

    return { drivers, loading, error };
}

// Hook to fetch a single driver by ID
export function useDriver(driverId: string) {
    const [driver, setDriver] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDriver() {
            if (!driverId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const driverRef = doc(db, 'drivers', driverId);
                const snapshot = await getDoc(driverRef);

                if (snapshot.exists()) {
                    setDriver(snapshot.data() as Driver);
                    setError(null);
                } else {
                    setError('Driver not found');
                }
            } catch (err) {
                console.error('Error fetching driver:', err);
                setError('Failed to load driver');
            } finally {
                setLoading(false);
            }
        }

        fetchDriver();
    }, [driverId]);

    return { driver, loading, error };
}

// Hook to fetch all teams
export function useTeams(season?: number) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTeams() {
            try {
                setLoading(true);
                const teamsRef = collection(db, 'teams');
                // Fetch all and filter/sort in memory to avoid indexing requirements
                const snapshot = await getDocs(teamsRef);
                let teamsList: Team[] = [];

                snapshot.forEach(doc => {
                    teamsList.push(doc.data() as Team);
                });

                // Memory filtering
                if (season) {
                    teamsList = teamsList.filter(t => t.season === season);
                }

                // Memory sorting
                teamsList.sort((a, b) => a.name.localeCompare(b.name));

                setTeams(teamsList);
                setError(null);
            } catch (err) {
                console.error('Error fetching teams:', err);
                setError('Failed to load teams');
            } finally {
                setLoading(false);
            }
        }

        fetchTeams();
    }, [season]);

    return { teams, loading, error };
}

// Hook to fetch a single team by ID
export function useTeam(teamId: string) {
    const [team, setTeam] = useState<Team | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTeam() {
            if (!teamId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch team
                const teamRef = doc(db, 'teams', teamId);
                const teamSnapshot = await getDoc(teamRef);

                if (!teamSnapshot.exists()) {
                    setError('Team not found');
                    return;
                }

                setTeam(teamSnapshot.data() as Team);

                // Fetch team's drivers
                const driversRef = collection(db, 'drivers');
                const driversQuery = query(driversRef, where('team_id', '==', teamId));
                const driversSnapshot = await getDocs(driversQuery);

                const driversList: Driver[] = [];
                driversSnapshot.forEach(doc => {
                    driversList.push(doc.data() as Driver);
                });
                setDrivers(driversList);

                // Fetch team's car
                const carsRef = collection(db, 'cars');
                const carsQuery = query(carsRef, where('team_id', '==', teamId));
                const carsSnapshot = await getDocs(carsQuery);

                if (!carsSnapshot.empty) {
                    setCar(carsSnapshot.docs[0].data() as Car);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching team:', err);
                setError('Failed to load team');
            } finally {
                setLoading(false);
            }
        }

        fetchTeam();
    }, [teamId]);

    return { team, drivers, car, loading, error };
}

// Hook to fetch all cars
export function useCars(season?: number) {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCars() {
            try {
                setLoading(true);
                const carsRef = collection(db, 'cars');
                // Fetch all and filter/sort in memory to avoid indexing requirements
                const snapshot = await getDocs(carsRef);
                let carsList: Car[] = [];

                snapshot.forEach(doc => {
                    carsList.push(doc.data() as Car);
                });

                // Memory filtering
                if (season) {
                    carsList = carsList.filter(c => c.season === season);
                }

                // Memory sorting
                carsList.sort((a, b) => a.team_name.localeCompare(b.team_name));

                setCars(carsList);
                setError(null);
            } catch (err) {
                console.error('Error fetching cars:', err);
                setError('Failed to load cars');
            } finally {
                setLoading(false);
            }
        }

        fetchCars();
    }, [season]);

    return { cars, loading, error };
}
