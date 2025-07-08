import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCycleStore } from '../store/useCycleStore';
import { exportCiclosParaJsonl } from '../utils/exportJsonl';

export const useSyncCiclos = () => {
  const { ciclos, marcarSincronizado } = useCycleStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const path = await exportCiclosParaJsonl(ciclos);
      ciclos
        .filter(c => !c.sincronizado)
        .forEach(c => marcarSincronizado(c.id));
      return path;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
    },
  });
};
