import { useState, useEffect, useCallback } from 'react';
import { WOSAthleteRecord } from '../types';
import { subscribeAthleteProgress, Unsubscribe } from '../services/wosFirestoreService';

export interface UseWOSAthleteReturn {
  athlete: WOSAthleteRecord | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  athleteId: string;
  setAthleteId: (id: string) => void;
  reload: () => void;
  simulateState: (type: 'active' | 'junior' | 'empty' | 'error') => void;
}

/**
 * Custom Hook: useWOSAthlete
 * Decouples Firestore listener logic from UI presentation.
 * Enforces clean unsubscription on unmount/athleteId change to avoid memory leaks and billing spikes.
 */
export function useWOSAthlete(initialAthleteId = 'WVR-2026-RAYYAN'): UseWOSAthleteReturn {
  const [athleteId, setAthleteId] = useState<string>(initialAthleteId);
  const [athlete, setAthlete] = useState<WOSAthleteRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const reload = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  const simulateState = useCallback((type: 'active' | 'junior' | 'empty' | 'error') => {
    switch (type) {
      case 'active':
        setAthleteId('WVR-2026-RAYYAN');
        break;
      case 'junior':
        setAthleteId('WVR-2026-AISYAH');
        break;
      case 'empty':
        setAthleteId('WVR-EMPTY');
        break;
      case 'error':
        setAthleteId('WVR-ERROR');
        break;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Call service to attach listener. Guaranteed Unsubscribe returned.
    const unsubscribe: Unsubscribe = subscribeAthleteProgress(
      athleteId,
      (data) => {
        if (!isMounted) return;
        setAthlete(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        setAthlete(null);
        setError(err.message || 'Gagal memuat rekam jejak atlet WOS.');
        setLoading(false);
      }
    );

    // Mandatory cleanup: detach listener to prevent leaks & unintended cloud reads
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [athleteId, refreshIndex]);

  const isEmpty = !loading && !error && athlete === null;

  return {
    athlete,
    loading,
    error,
    isEmpty,
    athleteId,
    setAthleteId,
    reload,
    simulateState,
  };
}
