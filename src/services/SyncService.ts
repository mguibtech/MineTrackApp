import { SyncData } from '../types/cycle';
import { CycleService } from './CycleService';
import { FileService } from './FileService';
import { useCycleStore } from '../store/useCycleStore';

export class SyncService {
  private cycleService: CycleService;
  private isOnline = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: Date | null = null;
  private syncedCycleIds: Set<string> = new Set();

  constructor(cycleService: CycleService) {
    this.cycleService = cycleService;
    this.loadSyncedCycleIds();
    this.startSyncCheck();
  }

  private async loadSyncedCycleIds(): Promise<void> {
    try {
      // Carregar IDs de ciclos já sincronizados do store
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

  private startSyncCheck(): void {
    // Verificar conectividade a cada 30 segundos
    this.syncInterval = setInterval(() => {
      this.checkConnectivity();
    }, 30000);
  }

  private checkConnectivity(): void {
    // Simular verificação de conectividade
    // Em um app real, isso seria uma verificação real de rede
    const wasOffline = !this.isOnline;
    this.isOnline = Math.random() > 0.3; // 70% de chance de estar online

    if (this.isOnline) {
      console.log('🌐 Rede detectada - Iniciando sincronização automática');
      this.syncPendingData();
    } else if (wasOffline) {
      console.log(
        '📡 Modo offline - Dados serão sincronizados quando rede estiver disponível',
      );
    }
  }

  public async syncPendingData(): Promise<boolean> {
    try {
      const unsynchronizedCycles = this.cycleService.getUnsynchronizedCycles();

      if (unsynchronizedCycles.length === 0) {
        console.log('Nenhum dado pendente para sincronização');
        return true;
      }

      // Filtrar apenas ciclos que ainda não foram sincronizados
      const newCycles = unsynchronizedCycles.filter(
        cycle => !this.syncedCycleIds.has(cycle.id),
      );

      if (newCycles.length === 0) {
        console.log('Todos os ciclos já foram sincronizados');
        return true;
      }

      const syncData = newCycles.map(cycle => ({
        cycleId: cycle.id,
        startTime: cycle.startTime,
        endTime: cycle.endTime!,
        loadingEquipment: cycle.loadingEquipment || 'N/A',
        dumpPoint: cycle.dumpPoint || 'N/A',
        totalDuration: cycle.endTime! - cycle.startTime,
        stages: cycle.stages,
      }));

      // Simular envio para servidor
      const success = await this.sendToServer(syncData);

      if (success) {
        // Marcar ciclos como sincronizados
        newCycles.forEach(cycle => {
          this.cycleService.markCycleAsSynchronized(cycle.id);
          this.syncedCycleIds.add(cycle.id);
        });

        // Salvar IDs sincronizados
        await this.saveSyncedCycleIds();

        // Registrar log de exportação
        const exportedIds = newCycles.map(c => c.id);
        await FileService.logExport(exportedIds, exportedIds.length);

        this.lastSyncTime = new Date();
        console.log(`${newCycles.length} ciclos sincronizados com sucesso`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    }
  }

  private async sendToServer(syncData: SyncData[]): Promise<boolean> {
    try {
      // Simular delay de rede
      await new Promise(resolve =>
        setTimeout(resolve, 1000 + Math.random() * 2000),
      );

      // Simular falha ocasional de rede
      if (Math.random() < 0.1) {
        // 10% de chance de falha
        throw new Error('Falha de rede simulada');
      }

      // Salvar dados no arquivo sync_servidor.jsonl
      const success = await FileService.saveSyncData(syncData);

      if (success) {
        console.log('✅ Dados sincronizados salvos em sync_servidor.jsonl');
        console.log(`📊 ${syncData.length} ciclos completos exportados`);
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

  public forceSync(): Promise<boolean> {
    return this.syncPendingData();
  }

  public setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;

    if (isOnline) {
      this.syncPendingData();
    }
  }

  public async getSyncFileInfo(): Promise<{
    exists: boolean;
    path: string;
    size?: number;
    lineCount?: number;
  }> {
    return await FileService.getSyncFileInfo();
  }

  public async clearSyncData(): Promise<boolean> {
    try {
      // Limpar arquivo de sincronização
      await FileService.clearSyncFile();

      // Limpar IDs sincronizados
      this.syncedCycleIds.clear();
      await this.saveSyncedCycleIds();

      console.log('Dados de sincronização limpos');
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados de sincronização:', error);
      return false;
    }
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}
