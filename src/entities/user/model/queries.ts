import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/shared/api/api';
import { User } from '@/src/shared/types';

export const useUsers = () => useQuery({ queryKey: ['users'], queryFn: api.getUsers });

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: string }) => api.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};
