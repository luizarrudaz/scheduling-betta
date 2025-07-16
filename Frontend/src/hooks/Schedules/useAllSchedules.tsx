import { useState, useEffect, useCallback } from 'react';
import { ScheduledEvent } from '../../types/Schedule/Schedule';
import api from '../../services/api';

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'displayName' | 'email' | 'createdAt';

interface UseAllSchedulesProps {
  searchTerm?: string;
  sortConfig?: { key: SortKey; direction: 'ascending' | 'descending' } | null;
  timeFilter?: 'past' | 'future';
  dateRangeFilter?: string;
}

export function useAllSchedules({ searchTerm, sortConfig, timeFilter, dateRangeFilter }: UseAllSchedulesProps) {
  const [schedules, setSchedules] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }
      if (sortConfig) {
        params.append('sortKey', sortConfig.key);
        params.append('sortDirection', sortConfig.direction);
      }
      if (timeFilter) {
        params.append('timeFilter', timeFilter);
      }
      if (dateRangeFilter) {
        params.append('dateRangeFilter', dateRangeFilter);
      }

      const { data } = await api.get<ScheduledEvent[]>('/schedule-event', { params });
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortConfig, timeFilter, dateRangeFilter]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { schedules, loading, error, refetch: fetchSchedules };
}