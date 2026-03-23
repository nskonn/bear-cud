import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/shared/api/api';

export const usePayouts = () => useQuery({ queryKey: ['payouts'], queryFn: api.getPayouts });

export const useAddPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addPayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payouts'] }),
  });
};
