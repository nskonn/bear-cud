import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/shared/api/api';

export const useWorkLogs = () => useQuery({ queryKey: ['workLogs'], queryFn: api.getWorkLogs });

export const useAddWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addWorkLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workLogs'] }),
  });
};

export const useUpdateWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, log }: { id: string; log: any }) => api.updateWorkLog(id, log),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workLogs'] }),
  });
};
