import { SyncData } from '../types/cycle';
import { CycleService } from './CycleService';
import { FileService } from './FileService';

export class SyncService {
  private cycleService: CycleService;
  private isOnline = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(cycleService: CycleService) {
    this.cycleService = cycleService;
    this.startSyncCheck();
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
    this.isOnline = Math.random() > 0.3; // 70% de chance de estar online

    if (this.isOnline) {
      this.syncPendingData();
    }
  }

  public async syncPendingData(): Promise<boolean> {
    try {
      const unsynchronizedCycles = this.cycleService.getUnsynchronizedCycles();

      if (unsynchronizedCycles.length === 0) {
        console.log('Nenhum dado pendente para sincronização');
        return true;
      }

      const syncData = this.cycleService.getSyncData();

      // Simular envio para servidor
      const success = await this.sendToServer(syncData);

      if (success) {
        // Marcar ciclos como sincronizados
        unsynchronizedCycles.forEach(cycle => {
          this.cycleService.markCycleAsSynchronized(cycle.id);
        });

        console.log(
          `${unsynchronizedCycles.length} ciclos sincronizados com sucesso`,
        );
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
        console.log('Dados salvos em sync_servidor.jsonl:', syncData);
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
  } {
    const pendingCycles = this.cycleService.getUnsynchronizedCycles().length;

    return {
      isOnline: this.isOnline,
      pendingCycles,
      lastSyncTime: pendingCycles === 0 ? new Date() : undefined,
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

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}
