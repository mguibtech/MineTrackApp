import AsyncStorage from '@react-native-async-storage/async-storage';
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
  private static readonly CYCLE_STATUS_KEY = '@cycle_status';
  private static readonly SIMULATION_PROGRESS_KEY = '@simulation_progress';
  private static readonly SYNCED_CYCLE_IDS_KEY = '@synced_cycle_ids';

  // Salvar status do ciclo
  static async saveCycleStatus(status: CycleStatus): Promise<void> {
    try {
      const existingData = await this.getCycleStatuses();
      existingData.push(status);

      // Manter apenas os últimos 100 registros para não sobrecarregar o storage
      const limitedData = existingData.slice(-100);

      await AsyncStorage.setItem(
        this.CYCLE_STATUS_KEY,
        JSON.stringify(limitedData),
      );
    } catch (error) {
      console.error('Erro ao salvar status do ciclo:', error);
      throw error;
    }
  }

  // Obter todos os status salvos
  static async getCycleStatuses(): Promise<CycleStatus[]> {
    try {
      const data = await AsyncStorage.getItem(this.CYCLE_STATUS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter status dos ciclos:', error);
      return [];
    }
  }

  // Salvar progresso da simulação
  static async saveSimulationProgress(currentLine: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.SIMULATION_PROGRESS_KEY,
        currentLine.toString(),
      );
    } catch (error) {
      console.error('Erro ao salvar progresso da simulação:', error);
      throw error;
    }
  }

  // Obter progresso da simulação
  static async getSimulationProgress(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(this.SIMULATION_PROGRESS_KEY);
      return data ? parseInt(data, 10) : 0;
    } catch (error) {
      console.error('Erro ao obter progresso da simulação:', error);
      return 0;
    }
  }

  // Salvar IDs de ciclos sincronizados
  static async saveSyncedCycleIds(cycleIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.SYNCED_CYCLE_IDS_KEY,
        JSON.stringify(cycleIds),
      );
    } catch (error) {
      console.error('Erro ao salvar IDs de ciclos sincronizados:', error);
      throw error;
    }
  }

  // Obter IDs de ciclos sincronizados
  static async getSyncedCycleIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(this.SYNCED_CYCLE_IDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter IDs de ciclos sincronizados:', error);
      return [];
    }
  }

  // Limpar todos os dados
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.CYCLE_STATUS_KEY,
        this.SIMULATION_PROGRESS_KEY,
        this.SYNCED_CYCLE_IDS_KEY,
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  // Obter último status
  static async getLastCycleStatus(): Promise<CycleStatus | null> {
    try {
      const statuses = await this.getCycleStatuses();
      return statuses.length > 0 ? statuses[statuses.length - 1] : null;
    } catch (error) {
      console.error('Erro ao obter último status:', error);
      return null;
    }
  }
}
