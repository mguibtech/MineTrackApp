import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCycleStore } from '../store/useCycleStore';
import { exportCiclosParaJsonl } from '../utils/exportJsonl';

export const useSyncCiclos = () => {
  const { cycles, markCycleSynchronized, notifyExportUpdate } = useCycleStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const path = await exportCiclosParaJsonl(cycles);
      cycles
        .filter(c => !c.isSynchronized)
        .forEach(c => markCycleSynchronized(c.id));
      notifyExportUpdate();
      return path;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
    },
  });
};
