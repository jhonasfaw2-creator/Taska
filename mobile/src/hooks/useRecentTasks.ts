import { useState, useEffect, useCallback } from 'react';
import { fetchRecentTasks } from '@/services/task.service';
import type { RecentTask } from '@/types/task';
import { ApiError } from '@/services';

interface UseRecentTasksResult {
  tasks: RecentTask[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecentTasks(): UseRecentTasksResult {
  const [tasks, setTasks] = useState<RecentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentTasks();
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tasks, loading, error, refetch: fetch };
}
