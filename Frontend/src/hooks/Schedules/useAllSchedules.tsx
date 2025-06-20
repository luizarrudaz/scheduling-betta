import { useState, useEffect, useCallback } from 'react';
import { ScheduledEvent } from '../../components/Types/Schedule/Schedule';
import api from '../../services/api';

export function useAllSchedules() {
  const [schedules, setSchedules] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ScheduledEvent[]>('/schedule-event');
      setSchedules(data);
      console.log(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { schedules, loading, error, refetch: fetchSchedules };
}