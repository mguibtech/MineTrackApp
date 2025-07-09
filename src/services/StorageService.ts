import { useCycleStore } from '../store/useCycleStore';
import { SensorData } from '../types/cycle';

export interface CycleStatus {
  id: string;
  timestamp: number;
  stage: string;
  speed: string;
  loadingEquipment: string;
  dumpPoint: string;
  isSynchronized: boolean;
  pendingCycles: number;
  sensorData: SensorData;
}

export class StorageService {
  // Salvar status do ciclo
  static async saveCycleStatus(status: CycleStatus): Promise<void> {
    try {
      const store = useCycleStore.getState();
      store.saveCycleStatus(status);
    } catch (error) {
      console.error('Erro ao salvar status do ciclo:', error);
      throw error;
    }
  }

  // Obter todos os status salvos
  static async getCycleStatuses(): Promise<CycleStatus[]> {
    try {
      const store = useCycleStore.getState();
      return store.getCycleStatuses();
    } catch (error) {
      console.error('Erro ao obter status dos ciclos:', error);
      return [];
    }
  }

  // Salvar progresso da simulação
  static async saveSimulationProgress(currentLine: number): Promise<void> {
    try {
      const store = useCycleStore.getState();
      store.setSimulationProgress(currentLine);
    } catch (error) {
      console.error('Erro ao salvar progresso da simulação:', error);
      throw error;
    }
  }

  // Obter progresso da simulação
  static async getSimulationProgress(): Promise<number> {
    try {
      const store = useCycleStore.getState();
      return store.getSimulationProgress();
    } catch (error) {
      console.error('Erro ao obter progresso da simulação:', error);
      return 0;
    }
  }

  // Salvar IDs de ciclos sincronizados
  static async saveSyncedCycleIds(cycleIds: string[]): Promise<void> {
    try {
      const store = useCycleStore.getState();
      store.addSyncedCycleIds(cycleIds);
    } catch (error) {
      console.error('Erro ao salvar IDs de ciclos sincronizados:', error);
      throw error;
    }
  }

  // Obter IDs de ciclos sincronizados
  static async getSyncedCycleIds(): Promise<string[]> {
    try {
      const store = useCycleStore.getState();
      return store.getSyncedCycleIds();
    } catch (error) {
      console.error('Erro ao obter IDs de ciclos sincronizados:', error);
      return [];
    }
  }

  // Limpar todos os dados
  static async clearAllData(): Promise<void> {
    try {
      const store = useCycleStore.getState();
      store.clearAllData();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }
}
