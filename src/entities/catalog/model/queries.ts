import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/shared/api/api';

export const useCatalog = () => useQuery({ queryKey: ['catalog'], queryFn: api.getCatalog });

export const useAddCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addCatalogItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  });
};

export const useUpdateCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, item }: { id: string; item: any }) => api.updateCatalogItem(id, item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  });
};
