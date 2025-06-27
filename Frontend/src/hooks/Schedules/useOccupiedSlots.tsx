import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export interface OccupiedSlot {
    scheduleId: number;
    eventId: number;
    scheduleTime: string;
    userId: string;
}

export function useOccupiedSlots() {
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOccupiedSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<OccupiedSlot[]>('/schedule-event/occupied-slots');
      setOccupiedSlots(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch occupied slots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOccupiedSlots();
  }, [fetchOccupiedSlots]);

  return { occupiedSlots, loading, error, refetch: fetchOccupiedSlots };
}