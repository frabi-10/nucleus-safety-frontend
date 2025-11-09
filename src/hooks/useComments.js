import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsAPI } from '@services/api';
import { REPORTS_KEYS } from './useReports';

// Query keys
export const COMMENTS_KEYS = {
  byReport: (reportId) => ['comments', 'report', reportId],
};

// Get comments for a report
export const useComments = (reportId) => {
  return useQuery({
    queryKey: COMMENTS_KEYS.byReport(reportId),
    queryFn: () => commentsAPI.getByReportId(reportId),
    enabled: !!reportId,
  });
};

// Add comment mutation
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, commentData }) => commentsAPI.create(reportId, commentData),
    onSuccess: (data, variables) => {
      // Invalidate comments for this report
      queryClient.invalidateQueries({
        queryKey: COMMENTS_KEYS.byReport(variables.reportId),
      });
      // Also invalidate the report to update comment count
      queryClient.invalidateQueries({
        queryKey: REPORTS_KEYS.detail(variables.reportId),
      });
      queryClient.invalidateQueries({
        queryKey: REPORTS_KEYS.all,
      });
    },
  });
};
