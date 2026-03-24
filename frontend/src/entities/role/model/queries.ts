import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/shared/api/api';

export const useRoles = () => useQuery({ queryKey: ['roles'], queryFn: api.getRoles });

export const useAddRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ oldRole, newRole }: { oldRole: string; newRole: string }) => api.updateRole(oldRole, newRole),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
};
