import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '@services/api';

// Query keys
export const REPORTS_KEYS = {
  all: ['reports'],
  detail: (id) => ['reports', id],
};

// Get all reports
export const useReports = () => {
  return useQuery({
    queryKey: REPORTS_KEYS.all,
    queryFn: reportsAPI.getAll,
  });
};

// Get single report
export const useReport = (id) => {
  return useQuery({
    queryKey: REPORTS_KEYS.detail(id),
    queryFn: () => reportsAPI.getById(id),
    enabled: !!id,
  });
};

// Create report mutation
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsAPI.create,
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
    },
  });
};

// Update report mutation
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => reportsAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific report and all reports list
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
    },
  });
};

// Update report status
export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => reportsAPI.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
    },
  });
};

// Assign report
export const useAssignReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedTo, assignedBy }) =>
      reportsAPI.assignReport(id, assignedTo, assignedBy),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
    },
  });
};

// Delete report
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
    },
  });
};

// Delete all reports
export const useDeleteAllReports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsAPI.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_KEYS.all });
    },
  });
};
