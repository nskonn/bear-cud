import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/shared/api/api';

export const usePositions = () => useQuery({ queryKey: ['positions'], queryFn: api.getPositions });

export const useAddPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addPosition,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ oldPosition, newPosition }: { oldPosition: string; newPosition: string }) =>
      api.updatePosition(oldPosition, newPosition),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['positions'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
};
