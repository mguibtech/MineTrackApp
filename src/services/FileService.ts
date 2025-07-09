import { SensorData, SyncData } from '../types/cycle';
import RNFS from 'react-native-fs';

export interface LineReading {
  id: string;
  timestamp: number;
  lineNumber: number;
  data: SensorData;
  processed: boolean;
}

export class FileService {
  private static readonly SIMULATION_FILE = 'simulacao.jsonl';
  private static readonly SYNC_FILE = 'sync_servidor.jsonl';
  private static readonly OUTPUT_FILE = 'dados_sincronizados.jsonl';
  private static readonly LINE_READINGS_FILE = 'line_readings.jsonl';

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
      if (syncData.length === 0) {
        console.log('Nenhum dado para sincronizar');
        return true;
      }

      // Mapear para o formato solicitado
      const formatCycle = (cycle: SyncData) => {
        // Extrair etapas simplificadas
        const etapas = cycle.stages.map(etapa => ({
          etapa: etapa.stage,
          timestamp: new Date(etapa.timestamp).toISOString(),
        }));

        // Extrair ponto de basculamento (X, Y)
        let ponto_basculamento: { X: number | null; Y: number | null } = {
          X: null,
          Y: null,
        };
        if (cycle.dumpPoint && cycle.dumpPoint.startsWith('GPS:')) {
          // Exemplo: 'GPS: -19.923, -43.927'
          const match = cycle.dumpPoint.match(
            /GPS:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
          );
          if (match) {
            ponto_basculamento = {
              X: parseFloat(match[1]),
              Y: parseFloat(match[2]),
            };
          }
        }

        return {
          ciclo_id: cycle.cycleId,
          data_inicio: new Date(cycle.startTime).toISOString(),
          data_fim: new Date(cycle.endTime).toISOString(),
          etapas,
          equipamento_id: cycle.cycleId.split('_')[1] || '', // ou outro campo se disponível
          equipamento_carga: cycle.loadingEquipment,
          ponto_basculamento,
          status_sincronizacao: 'SINCRONIZADO',
        };
      };

      // Criar conteúdo do arquivo JSONL
      const syncFileContent = syncData
        .map(formatCycle)
        .map(data => JSON.stringify(data))
        .join('\n');

      // Salvar no arquivo sync_servidor.jsonl
      const outputPath = `${RNFS.DocumentDirectoryPath}/${this.SYNC_FILE}`;

      // Verificar se o arquivo já existe para evitar duplicação
      let existingContent = '';
      try {
        existingContent = await RNFS.readFile(outputPath, 'utf8');
      } catch (error) {
        // Arquivo não existe, criar novo
      }

      // Adicionar novos dados ao final do arquivo
      const newContent = existingContent
        ? existingContent + '\n' + syncFileContent
        : syncFileContent;

      await RNFS.writeFile(outputPath, newContent, 'utf8');

      console.log(`✅ Dados sincronizados salvos em: ${outputPath}`);
      console.log(
        `📊 Total de ${syncData.length} ciclos completos adicionados ao arquivo sync_servidor.jsonl`,
      );
      console.log(`📋 Formato: 1 linha JSON por ciclo completo`);

      return true;
    } catch (error) {
      console.error('Erro ao salvar dados de sincronização:', error);
      return false;
    }
  }

  public static async readSyncFile(): Promise<SyncData[]> {
    try {
      const outputPath = `${RNFS.DocumentDirectoryPath}/${this.SYNC_FILE}`;

      // Verificar se o arquivo existe
      const exists = await RNFS.exists(outputPath);
      if (!exists) {
        console.log('Arquivo sync_servidor.jsonl não encontrado');
        return [];
      }

      const fileContent = await RNFS.readFile(outputPath, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');

      const syncData: SyncData[] = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            console.error('Erro ao parsear linha:', line, error);
            return null;
          }
        })
        .filter(Boolean) as SyncData[];

      console.log(
        `Lidos ${syncData.length} registros do arquivo sync_servidor.jsonl`,
      );
      return syncData;
    } catch (error) {
      console.error('Erro ao ler arquivo de sincronização:', error);
      return [];
    }
  }

  public static async getSyncFileInfo(): Promise<{
    exists: boolean;
    path: string;
    size?: number;
    lineCount?: number;
  }> {
    try {
      const outputPath = `${RNFS.DocumentDirectoryPath}/${this.SYNC_FILE}`;
      const exists = await RNFS.exists(outputPath);

      if (!exists) {
        return { exists: false, path: outputPath };
      }

      const stats = await RNFS.stat(outputPath);
      const fileContent = await RNFS.readFile(outputPath, 'utf8');
      const lineCount = fileContent
        .split('\n')
        .filter(line => line.trim() !== '').length;

      return {
        exists: true,
        path: outputPath,
        size: stats.size,
        lineCount,
      };
    } catch (error) {
      console.error('Erro ao obter informações do arquivo:', error);
      return {
        exists: false,
        path: `${RNFS.DocumentDirectoryPath}/${this.SYNC_FILE}`,
      };
    }
  }

  public static async clearSyncFile(): Promise<boolean> {
    try {
      const outputPath = `${RNFS.DocumentDirectoryPath}/${this.SYNC_FILE}`;
      const exists = await RNFS.exists(outputPath);

      if (exists) {
        await RNFS.unlink(outputPath);
        console.log('Arquivo sync_servidor.jsonl removido');
      }

      return true;
    } catch (error) {
      console.error('Erro ao limpar arquivo de sincronização:', error);
      return false;
    }
  }

  public static getSimulationFilePath(): string {
    return this.SIMULATION_FILE;
  }

  public static getSyncFilePath(): string {
    return this.SYNC_FILE;
  }

  public static getOutputFilePath(): string {
    return `${RNFS.DocumentDirectoryPath}/${this.OUTPUT_FILE}`;
  }

  // Adiciona um registro de log de exportação
  public static async logExport(
    cycleIds: string[],
    count: number,
  ): Promise<void> {
    try {
      const logEntry = {
        data: new Date().toISOString(),
        quantidade: count,
        ciclos: cycleIds,
      };
      const logLine = JSON.stringify(logEntry);
      const logPath = `${RNFS.DocumentDirectoryPath}/export_log.jsonl`;
      let existingContent = '';
      try {
        existingContent = await RNFS.readFile(logPath, 'utf8');
      } catch (e) {}
      const newContent = existingContent
        ? existingContent + '\n' + logLine
        : logLine;
      await RNFS.writeFile(logPath, newContent, 'utf8');
    } catch (error) {
      console.error('Erro ao registrar log de exportação:', error);
    }
  }

  // Lê o histórico de exportações
  public static async readExportLog(): Promise<
    Array<{ data: string; quantidade: number; ciclos: string[] }>
  > {
    try {
      const logPath = `${RNFS.DocumentDirectoryPath}/export_log.jsonl`;
      const exists = await RNFS.exists(logPath);
      if (!exists) return [];
      const content = await RNFS.readFile(logPath, 'utf8');
      return content
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Erro ao ler log de exportação:', error);
      return [];
    }
  }

  // Salva uma leitura de linha de forma assíncrona
  public static async saveLineReading(
    lineNumber: number,
    data: SensorData,
  ): Promise<void> {
    try {
      const reading: LineReading = {
        id: `reading_${Date.now()}_${lineNumber}`,
        timestamp: Date.now(),
        lineNumber,
        data,
        processed: false,
      };

      const readingLine = JSON.stringify(reading);
      const readingsPath = `${RNFS.DocumentDirectoryPath}/${this.LINE_READINGS_FILE}`;

      // Verificar se o arquivo já existe
      let existingContent = '';
      try {
        existingContent = await RNFS.readFile(readingsPath, 'utf8');
      } catch (error) {
        // Arquivo não existe, criar novo
      }

      // Adicionar nova leitura ao final do arquivo
      const newContent = existingContent
        ? existingContent + '\n' + readingLine
        : readingLine;

      await RNFS.writeFile(readingsPath, newContent, 'utf8');

      console.log(`✅ Leitura da linha ${lineNumber} salva assincronamente`);
    } catch (error) {
      console.error('Erro ao salvar leitura de linha:', error);
    }
  }

  // Carrega todas as leituras de linha salvas
  public static async loadLineReadings(): Promise<LineReading[]> {
    try {
      const readingsPath = `${RNFS.DocumentDirectoryPath}/${this.LINE_READINGS_FILE}`;

      // Verificar se o arquivo existe
      const exists = await RNFS.exists(readingsPath);
      if (!exists) {
        console.log('Arquivo de leituras não encontrado');
        return [];
      }

      const fileContent = await RNFS.readFile(readingsPath, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');

      const readings: LineReading[] = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            console.error('Erro ao parsear linha de leitura:', line, error);
            return null;
          }
        })
        .filter(Boolean) as LineReading[];

      console.log(`Lidas ${readings.length} leituras de linha`);
      return readings;
    } catch (error) {
      console.error('Erro ao carregar leituras de linha:', error);
      return [];
    }
  }

  // Marca uma leitura como processada
  public static async markReadingAsProcessed(readingId: string): Promise<void> {
    try {
      const readingsPath = `${RNFS.DocumentDirectoryPath}/${this.LINE_READINGS_FILE}`;

      // Verificar se o arquivo existe
      const exists = await RNFS.exists(readingsPath);
      if (!exists) {
        return;
      }

      const fileContent = await RNFS.readFile(readingsPath, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');

      const updatedLines = lines.map(line => {
        try {
          const reading: LineReading = JSON.parse(line);
          if (reading.id === readingId) {
            reading.processed = true;
          }
          return JSON.stringify(reading);
        } catch (error) {
          return line;
        }
      });

      const newContent = updatedLines.join('\n');
      await RNFS.writeFile(readingsPath, newContent, 'utf8');

      console.log(`✅ Leitura ${readingId} marcada como processada`);
    } catch (error) {
      console.error('Erro ao marcar leitura como processada:', error);
    }
  }

  // Limpa leituras antigas (mais de 30 dias)
  public static async cleanOldReadings(): Promise<void> {
    try {
      const readings = await this.loadLineReadings();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const recentReadings = readings.filter(
        reading => reading.timestamp > thirtyDaysAgo,
      );

      const readingsPath = `${RNFS.DocumentDirectoryPath}/${this.LINE_READINGS_FILE}`;
      const newContent = recentReadings
        .map(reading => JSON.stringify(reading))
        .join('\n');

      await RNFS.writeFile(readingsPath, newContent, 'utf8');

      console.log(
        `🧹 Limpeza: ${
          readings.length - recentReadings.length
        } leituras antigas removidas`,
      );
    } catch (error) {
      console.error('Erro ao limpar leituras antigas:', error);
    }
  }

  // Obtém estatísticas das leituras
  public static async getReadingsStats(): Promise<{
    total: number;
    processed: number;
    unprocessed: number;
    lastReading?: LineReading;
  }> {
    try {
      const readings = await this.loadLineReadings();
      const processed = readings.filter(r => r.processed).length;
      const unprocessed = readings.length - processed;
      const lastReading =
        readings.length > 0 ? readings[readings.length - 1] : undefined;

      return {
        total: readings.length,
        processed,
        unprocessed,
        lastReading,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas das leituras:', error);
      return {
        total: 0,
        processed: 0,
        unprocessed: 0,
      };
    }
  }
}
