import { SensorData, SyncData } from '../types/cycle';

export class FileService {
  private static readonly SIMULATION_FILE = 'simulacao.jsonl';
  private static readonly SYNC_FILE = 'sync_servidor.jsonl';

  public static async loadSimulationData(): Promise<SensorData[]> {
    try {
      // Em um app real, isso seria uma leitura real do arquivo
      // Por enquanto, vamos retornar dados simulados
      const mockData: SensorData[] = [
        {
          timestamp: Date.now(),
          beacons: [
            { id: 'ESC-002', type: 'escavadeira', distance: 1.5 },
            { id: 'CAM-002', type: 'caminhao', distance: 3.0 },
            { id: 'CAM-003', type: 'caminhao', distance: 5.0 },
          ],
          gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
        },
        {
          timestamp: Date.now() + 6000,
          beacons: [
            { id: 'ESC-002', type: 'escavadeira', distance: 1.5 },
            { id: 'CAM-002', type: 'caminhao', distance: 3.0 },
            { id: 'CAM-003', type: 'caminhao', distance: 5.0 },
          ],
          gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
        },
        {
          timestamp: Date.now() + 12000,
          beacons: [{ id: 'ESC-002', type: 'escavadeira', distance: 1.0 }],
          gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
        },
        {
          timestamp: Date.now() + 18000,
          beacons: [{ id: 'ESC-002', type: 'escavadeira', distance: 1.0 }],
          gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
        },
        {
          timestamp: Date.now() + 24000,
          beacons: [],
          gps: { latitude: -23.5502, longitude: -46.631, velocity: 8.33 },
        },
        {
          timestamp: Date.now() + 30000,
          beacons: [],
          gps: { latitude: -23.5505, longitude: -46.632, velocity: 11.11 },
        },
        {
          timestamp: Date.now() + 36000,
          beacons: [{ id: 'CAM-004', type: 'caminhao', distance: 2.0 }],
          gps: { latitude: -23.5505, longitude: -46.6333, velocity: 0 },
        },
        {
          timestamp: Date.now() + 42000,
          beacons: [{ id: 'CAM-004', type: 'caminhao', distance: 2.0 }],
          gps: { latitude: -23.5505, longitude: -46.6333, velocity: 0 },
        },
        {
          timestamp: Date.now() + 48000,
          beacons: [{ id: 'BAS-001', type: 'sensor_bascula', distance: 0.5 }],
          gps: { latitude: -23.5505, longitude: -46.6333, velocity: 0 },
        },
        {
          timestamp: Date.now() + 54000,
          beacons: [{ id: 'BAS-001', type: 'sensor_bascula', distance: 0.5 }],
          gps: { latitude: -23.5505, longitude: -46.6333, velocity: 0 },
        },
        {
          timestamp: Date.now() + 60000,
          beacons: [],
          gps: { latitude: -23.5508, longitude: -46.634, velocity: 13.89 },
        },
        {
          timestamp: Date.now() + 66000,
          beacons: [],
          gps: { latitude: -23.551, longitude: -46.635, velocity: 16.67 },
        },
      ];

      console.log(`Carregados ${mockData.length} registros de simulação`);
      return mockData;
    } catch (error) {
      console.error('Erro ao carregar dados de simulação:', error);
      throw error;
    }
  }

  public static async saveSyncData(syncData: SyncData[]): Promise<boolean> {
    try {
      // Em um app real, isso seria uma escrita real no arquivo
      // Por enquanto, vamos apenas simular o sucesso

      const syncFileContent = syncData
        .map(data => JSON.stringify(data))
        .join('\n');

      console.log('Dados salvos em sync_servidor.jsonl:');
      console.log(syncFileContent);

      // Simular delay de escrita
      await new Promise(resolve => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error('Erro ao salvar dados de sincronização:', error);
      return false;
    }
  }

  public static async readSyncFile(): Promise<SyncData[]> {
    try {
      // Em um app real, isso seria uma leitura real do arquivo
      // Por enquanto, vamos retornar dados vazios
      console.log('Lendo arquivo sync_servidor.jsonl');
      return [];
    } catch (error) {
      console.error('Erro ao ler arquivo de sincronização:', error);
      return [];
    }
  }

  public static getSimulationFilePath(): string {
    return this.SIMULATION_FILE;
  }

  public static getSyncFilePath(): string {
    return this.SYNC_FILE;
  }
}
