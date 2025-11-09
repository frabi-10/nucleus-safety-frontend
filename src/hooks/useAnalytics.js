import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '@services/api';

// Query keys
export const ANALYTICS_KEYS = {
  stats: ['analytics', 'stats'],
};

// Get analytics statistics
export const useAnalytics = () => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.stats,
    queryFn: statsAPI.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes - analytics can be slightly stale
  });
};
