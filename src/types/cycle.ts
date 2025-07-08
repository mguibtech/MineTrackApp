export interface SensorData {
  timestamp: number;
  beacons: Beacon[];
  gps: GPSData;
}

export interface Beacon {
  id: string;
  type: 'escavadeira' | 'caminhao' | 'sensor_bascula';
  distance: number;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  velocity: number; // m/s
}

export type CycleStage =
  | 'EM FILA CARREGAMENTO'
  | 'EM CARREGAMENTO'
  | 'TRÂNSITO CHEIO'
  | 'EM FILA BASCULAMENTO'
  | 'EM BASCULAMENTO'
  | 'TRÂNSITO VAZIO';

export interface CycleData {
  id: string;
  startTime: number;
  endTime?: number;
  stages: CycleStageData[];
  loadingEquipment?: string;
  dumpPoint?: string;
  isComplete: boolean;
  isSynchronized: boolean;
}

export interface CycleStageData {
  stage: CycleStage;
  timestamp: number;
  sensorData: SensorData;
}

export interface SyncData {
  cycleId: string;
  startTime: number;
  endTime: number;
  loadingEquipment: string;
  dumpPoint: string;
  totalDuration: number;
  stages: CycleStageData[];
}
