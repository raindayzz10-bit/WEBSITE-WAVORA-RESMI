import { useState, useEffect, useCallback } from 'react';
import { RegistrationRecord, RegistrationStatus } from '../types';
import {
  subscribeToRegistrations,
  fetchRegistrationsOnce,
  updateRegistrationStatus,
  deleteRegistration,
  resetSeedRegistrations,
} from '../services/registrationFirestoreService';

export interface UseRegistrationsReturn {
  data: RegistrationRecord[];
  loading: boolean;
  error: string | null;
  verifyRegistration: (id: string, newStatus?: RegistrationStatus) => Promise<void>;
  removeRegistration: (id: string) => Promise<void>;
  resetToSampleData: () => void;
  refetch: () => void;
}

/**
 * Custom Hook: useRegistrations
 * Listens to Cloud Firestore 'registrations' collection via onSnapshot ordered by 'createdAt' desc.
 * Returns { data, loading, error } and executes cleanup (unsub) on unmount to prevent leaks.
 */
export function useRegistrations(): UseRegistrationsReturn {
  const [data, setData] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState<number>(0);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchRegistrationsOnce()
      .then((records) => {
        setData(records);
        setError(null);
      })
      .catch((err) => {
        console.warn('Manual refetch error:', err);
      })
      .finally(() => {
        setLoading(false);
        setReloadCounter((prev) => prev + 1);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Subscribe via Cloud Firestore service with cleanup
    const unsubscribe = subscribeToRegistrations(
      (records) => {
        if (!isMounted) return;
        setData(records);
        setError(null);
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        setError(err.message || 'Gagal menyinkronkan data pendaftaran Cloud Firestore.');
        setLoading(false);
      }
    );

    // Teardown listener to eliminate memory leaks and unnecessary network reads
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [reloadCounter]);

  const verifyRegistration = useCallback(
    async (id: string, newStatus: RegistrationStatus = 'verified') => {
      try {
        await updateRegistrationStatus(id, newStatus);
      } catch (err) {
        console.error('Error verifying registration:', err);
      }
    },
    []
  );

  const removeRegistration = useCallback(async (id: string) => {
    try {
      await deleteRegistration(id);
    } catch (err) {
      console.error('Error deleting registration:', err);
    }
  }, []);

  const resetToSampleData = useCallback(() => {
    const seeded = resetSeedRegistrations();
    setData(seeded);
  }, []);

  return {
    data,
    loading,
    error,
    verifyRegistration,
    removeRegistration,
    resetToSampleData,
    refetch,
  };
}
