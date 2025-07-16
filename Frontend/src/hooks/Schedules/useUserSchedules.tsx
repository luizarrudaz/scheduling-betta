import { useState, useEffect, useCallback } from 'react';
import { ScheduledEvent } from '../../types/Schedule/Schedule';
import api from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

export function useUserSchedules() {
  const [schedules, setSchedules] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sid } = useAuthContext();

  const fetchSchedules = useCallback(async () => {
    if (!sid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ScheduledEvent[]>(`/schedule-event/${sid}`);
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { schedules, loading, error, refetch: fetchSchedules };
}