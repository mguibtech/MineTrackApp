import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SensorData, CycleData } from '../types/cycle';

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

interface CycleStore {
  // Estado dos ciclos
  cycles: CycleData[];
  cycleStatuses: CycleStatus[];

  // Estado da simulação
  simulationProgress: number;

  // Estado de sincronização
  syncedCycleIds: string[];

  // Ações para ciclos
  addCycle: (cycle: CycleData) => void;
  updateCycle: (id: string, updates: Partial<CycleData>) => void;
  markCycleSynchronized: (id: string) => void;
  getUnsynchronizedCycles: () => CycleData[];

  // Ações para status dos ciclos
  saveCycleStatus: (status: CycleStatus) => void;
  getCycleStatuses: () => CycleStatus[];

  // Ações para simulação
  setSimulationProgress: (progress: number) => void;
  getSimulationProgress: () => number;

  // Ações para sincronização
  addSyncedCycleIds: (ids: string[]) => void;
  getSyncedCycleIds: () => string[];
  isCycleSynced: (id: string) => boolean;

  // Ações gerais
  clearAllData: () => void;

  // Notificações de exportação
  lastExportTime: number | null;
  notifyExportUpdate: () => void;
  setLastExportTime: (time: number) => void;
}

export const useCycleStore = create<CycleStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      cycles: [],
      cycleStatuses: [],
      simulationProgress: 0,
      syncedCycleIds: [],
      lastExportTime: null,

      // Ações para ciclos
      addCycle: cycle => {
        set(state => ({
          cycles: [...state.cycles, cycle],
        }));
      },

      updateCycle: (id, updates) => {
        set(state => ({
          cycles: state.cycles.map(cycle =>
            cycle.id === id ? { ...cycle, ...updates } : cycle,
          ),
        }));
      },

      markCycleSynchronized: id => {
        set(state => ({
          cycles: state.cycles.map(cycle =>
            cycle.id === id ? { ...cycle, isSynchronized: true } : cycle,
          ),
          syncedCycleIds: [...state.syncedCycleIds, id],
        }));
      },

      getUnsynchronizedCycles: () => {
        const state = get();
        return state.cycles.filter(cycle => !cycle.isSynchronized);
      },

      // Ações para status dos ciclos
      saveCycleStatus: status => {
        set(state => {
          const existingData = [...state.cycleStatuses, status];
          // Manter apenas os últimos 100 registros
          const limitedData = existingData.slice(-100);
          return {
            cycleStatuses: limitedData,
          };
        });
      },

      getCycleStatuses: () => {
        return get().cycleStatuses;
      },

      // Ações para simulação
      setSimulationProgress: progress => {
        set({ simulationProgress: progress });
      },

      getSimulationProgress: () => {
        return get().simulationProgress;
      },

      // Ações para sincronização
      addSyncedCycleIds: ids => {
        set(state => ({
          syncedCycleIds: [...new Set([...state.syncedCycleIds, ...ids])],
        }));
      },

      getSyncedCycleIds: () => {
        return get().syncedCycleIds;
      },

      isCycleSynced: id => {
        return get().syncedCycleIds.includes(id);
      },

      // Ações gerais
      clearAllData: () => {
        set({
          cycles: [],
          cycleStatuses: [],
          simulationProgress: 0,
          syncedCycleIds: [],
          lastExportTime: null,
        });
      },

      // Notificações de exportação
      notifyExportUpdate: () => {
        set({ lastExportTime: Date.now() });
      },

      setLastExportTime: time => {
        set({ lastExportTime: time });
      },
    }),
    {
      name: 'cycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        cycles: state.cycles,
        cycleStatuses: state.cycleStatuses,
        simulationProgress: state.simulationProgress,
        syncedCycleIds: state.syncedCycleIds,
        lastExportTime: state.lastExportTime,
      }),
    },
  ),
);
