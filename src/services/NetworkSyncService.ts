import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CycleService } from './CycleService';
import { FileService } from './FileService';
import { useCycleStore } from '../store/useCycleStore';
import { SyncData } from '../types/cycle';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  error?: string;
  timestamp: Date;
}

export class NetworkSyncService {
  private cycleService: CycleService;
  private isOnline = false;
  private lastSyncTime: Date | null = null;
  private syncedCycleIds: Set<string> = new Set();

  constructor(cycleService: CycleService) {
    this.cycleService = cycleService;
    this.loadSyncedCycleIds();
  }

  private async loadSyncedCycleIds(): Promise<void> {
    try {
      const store = useCycleStore.getState();
      const syncedIds = store.getSyncedCycleIds();
      this.syncedCycleIds = new Set(syncedIds);
      console.log(
        `Carregados ${this.syncedCycleIds.size} IDs de ciclos sincronizados`,
      );
    } catch (error) {
      console.error('Erro ao carregar IDs sincronizados:', error);
      this.syncedCycleIds = new Set();
    }
  }

  private async saveSyncedCycleIds(): Promise<void> {
    try {
      const store = useCycleStore.getState();
      store.addSyncedCycleIds(Array.from(this.syncedCycleIds));
    } catch (error) {
      console.error('Erro ao salvar IDs sincronizados:', error);
    }
  }

  public setOnlineStatus(isOnline: boolean): void {
    const wasOffline = !this.isOnline;
    this.isOnline = isOnline;

    if (this.isOnline && wasOffline) {
      console.log('🌐 Rede detectada - Iniciando sincronização automática');
      this.syncPendingData();
    } else if (!this.isOnline && wasOffline) {
      console.log(
        '📡 Modo offline - Dados serão sincronizados quando rede estiver disponível',
      );
    }
  }

  public async syncPendingData(): Promise<SyncResult> {
    try {
      const unsynchronizedCycles = this.cycleService.getUnsynchronizedCycles();

      if (unsynchronizedCycles.length === 0) {
        console.log('Nenhum dado pendente para sincronização');
        return {
          success: true,
          syncedCount: 0,
          timestamp: new Date(),
        };
      }

      // Filtrar apenas ciclos que ainda não foram sincronizados
      const newCycles = unsynchronizedCycles.filter(
        cycle => !this.syncedCycleIds.has(cycle.id),
      );

      if (newCycles.length === 0) {
        console.log('Todos os ciclos já foram sincronizados');
        return {
          success: true,
          syncedCount: 0,
          timestamp: new Date(),
        };
      }

      // Sincronizar um por um
      let syncedCount = 0;
      const errors: string[] = [];

      for (const cycle of newCycles) {
        try {
          const success = await this.syncSingleCycle(cycle);
          if (success) {
            syncedCount++;
            this.syncedCycleIds.add(cycle.id);
            this.cycleService.markCycleAsSynchronized(cycle.id);
          }
        } catch (error) {
          const errorMessage = `Erro ao sincronizar ciclo ${cycle.id}: ${error}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      }

      // Salvar IDs sincronizados
      await this.saveSyncedCycleIds();

      this.lastSyncTime = new Date();

      if (syncedCount > 0) {
        console.log(`${syncedCount} ciclos sincronizados com sucesso`);
      }

      return {
        success: syncedCount > 0,
        syncedCount,
        error: errors.length > 0 ? errors.join('; ') : undefined,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return {
        success: false,
        syncedCount: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      };
    }
  }

  private async syncSingleCycle(cycle: any): Promise<boolean> {
    try {
      const syncData: SyncData = {
        cycleId: cycle.id,
        startTime: cycle.startTime,
        endTime: cycle.endTime!,
        loadingEquipment: cycle.loadingEquipment || 'N/A',
        dumpPoint: cycle.dumpPoint || 'N/A',
        totalDuration: cycle.endTime! - cycle.startTime,
        stages: cycle.stages,
      };

      // Simular envio para servidor
      const success = await this.sendToServer([syncData]);

      if (success) {
        // Registrar log de exportação
        await FileService.logExport([cycle.id], 1);
        console.log(`✅ Ciclo ${cycle.id} sincronizado com sucesso`);
      }

      return success;
    } catch (error) {
      console.error(`❌ Erro ao sincronizar ciclo ${cycle.id}:`, error);
      return false;
    }
  }

  private async sendToServer(syncData: SyncData[]): Promise<boolean> {
    try {
      // Simular delay de rede
      await new Promise(resolve =>
        setTimeout(resolve, 500 + Math.random() * 1000),
      );

      // Simular falha ocasional de rede (5% de chance)
      if (Math.random() < 0.05) {
        throw new Error('Falha de rede simulada');
      }

      // Salvar dados no arquivo sync_servidor.jsonl
      const success = await FileService.saveSyncData(syncData);

      if (success) {
        console.log('✅ Dados sincronizados salvos em sync_servidor.jsonl');
      }

      return success;
    } catch (error) {
      console.error('Erro ao enviar dados para servidor:', error);
      return false;
    }
  }

  public getSyncStatus(): {
    isOnline: boolean;
    pendingCycles: number;
    lastSyncTime?: Date;
    syncedCycles: number;
  } {
    const unsynchronizedCycles = this.cycleService.getUnsynchronizedCycles();
    const pendingCycles = unsynchronizedCycles.filter(
      cycle => !this.syncedCycleIds.has(cycle.id),
    ).length;

    return {
      isOnline: this.isOnline,
      pendingCycles,
      lastSyncTime: this.lastSyncTime || undefined,
      syncedCycles: this.syncedCycleIds.size,
    };
  }

  public forceSync(): Promise<SyncResult> {
    return this.syncPendingData();
  }

  public destroy(): void {
    // Cleanup se necessário
  }
}

// Hook para usar o NetworkSyncService com React Query
export const useNetworkSync = (syncService: NetworkSyncService) => {
  const queryClient = useQueryClient();

  // Query para status de sincronização
  const syncStatusQuery = useQuery({
    queryKey: ['syncStatus'],
    queryFn: () => syncService.getSyncStatus(),
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Mutation para sincronização manual
  const syncMutation = useMutation({
    mutationFn: () => syncService.forceSync(),
    onSuccess: result => {
      console.log('Sincronização concluída:', result);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
    },
    onError: error => {
      console.error('Erro na sincronização:', error);
    },
  });

  return {
    syncStatus: syncStatusQuery.data,
    isLoading: syncStatusQuery.isLoading,
    isError: syncStatusQuery.isError,
    syncMutation,
  };
};
