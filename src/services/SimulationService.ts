import { SensorData, Beacon } from '../types/cycle';
import { StorageService } from './StorageService';

export class SimulationService {
  private currentLine = 0;
  private simulationLines: string[] = [];
  private isFileLoaded = false;

  constructor() {
    this.loadSimulationFile();
  }

  private async loadSimulationFile(): Promise<void> {
    try {
      // Carregar progresso salvo
      this.currentLine = await StorageService.getSimulationProgress();

      // Usar dados embutidos do arquivo simulacao.jsonl
      // Simulando um ciclo completo com todas as etapas
      this.simulationLines = [
        // EM FILA CARREGAMENTO - Velocidade 0, escavadeira próxima, outros caminhões
        '{"timestamp": 1703123456789, "beacons": [{"id": "ESC-002", "type": "escavadeira", "distance": 1.5}, {"id": "CAM-002", "type": "caminhao", "distance": 3.0}, {"id": "CAM-003", "type": "caminhao", "distance": 5.0}], "gps": {"latitude": -23.5500, "longitude": -46.6300, "velocity": 0}}',
        '{"timestamp": 1703123462789, "beacons": [{"id": "ESC-002", "type": "escavadeira", "distance": 1.5}, {"id": "CAM-002", "type": "caminhao", "distance": 3.0}, {"id": "CAM-003", "type": "caminhao", "distance": 5.0}], "gps": {"latitude": -23.5500, "longitude": -46.6300, "velocity": 0}}',
        '{"timestamp": 1703123468789, "beacons": [{"id": "ESC-002", "type": "escavadeira", "distance": 1.5}, {"id": "CAM-002", "type": "caminhao", "distance": 3.0}, {"id": "CAM-003", "type": "caminhao", "distance": 5.0}], "gps": {"latitude": -23.5500, "longitude": -46.6300, "velocity": 0}}',

        // EM CARREGAMENTO - Velocidade 0, escavadeira próxima, sem outros caminhões
        '{"timestamp": 1703123474789, "beacons": [{"id": "ESC-002", "type": "escavadeira", "distance": 1.0}], "gps": {"latitude": -23.5500, "longitude": -46.6300, "velocity": 0}}',
        '{"timestamp": 1703123480789, "beacons": [{"id": "ESC-002", "type": "escavadeira", "distance": 1.0}], "gps": {"latitude": -23.5500, "longitude": -46.6300, "velocity": 0}}',
        '{"timestamp": 1703123486789, "beacons": [{"id": "ESC-002", "type": "escavadeira", "distance": 1.0}], "gps": {"latitude": -23.5500, "longitude": -46.6300, "velocity": 0}}',

        // TRÂNSITO CHEIO - Velocidade > 0, escavadeira distante, vindo de EM CARREGAMENTO
        '{"timestamp": 1703123492789, "beacons": [], "gps": {"latitude": -23.5502, "longitude": -46.6310, "velocity": 8.33}}',
        '{"timestamp": 1703123498789, "beacons": [], "gps": {"latitude": -23.5505, "longitude": -46.6320, "velocity": 11.11}}',
        '{"timestamp": 1703123504789, "beacons": [], "gps": {"latitude": -23.5508, "longitude": -46.6330, "velocity": 13.89}}',

        // EM FILA BASCULAMENTO - Velocidade 0, próximo ao ponto de basculamento, sensor desativado, outros caminhões
        '{"timestamp": 1703123510789, "beacons": [{"id": "CAM-004", "type": "caminhao", "distance": 2.0}], "gps": {"latitude": -23.5505, "longitude": -46.6333, "velocity": 0}}',
        '{"timestamp": 1703123516789, "beacons": [{"id": "CAM-004", "type": "caminhao", "distance": 2.0}], "gps": {"latitude": -23.5505, "longitude": -46.6333, "velocity": 0}}',
        '{"timestamp": 1703123522789, "beacons": [{"id": "CAM-004", "type": "caminhao", "distance": 2.0}], "gps": {"latitude": -23.5505, "longitude": -46.6333, "velocity": 0}}',

        // EM BASCULAMENTO - Velocidade 0, no ponto de basculamento, sensor ativado
        '{"timestamp": 1703123528789, "beacons": [{"id": "BAS-001", "type": "sensor_bascula", "distance": 0.5}], "gps": {"latitude": -23.5505, "longitude": -46.6333, "velocity": 0}}',
        '{"timestamp": 1703123534789, "beacons": [{"id": "BAS-001", "type": "sensor_bascula", "distance": 0.5}], "gps": {"latitude": -23.5505, "longitude": -46.6333, "velocity": 0}}',
        '{"timestamp": 1703123540789, "beacons": [{"id": "BAS-001", "type": "sensor_bascula", "distance": 0.5}], "gps": {"latitude": -23.5505, "longitude": -46.6333, "velocity": 0}}',

        // TRÂNSITO VAZIO - Velocidade > 0, distante do ponto de basculamento, vindo de EM BASCULAMENTO
        '{"timestamp": 1703123546789, "beacons": [], "gps": {"latitude": -23.5508, "longitude": -46.6340, "velocity": 13.89}}',
        '{"timestamp": 1703123552789, "beacons": [], "gps": {"latitude": -23.5510, "longitude": -46.6350, "velocity": 16.67}}',
        '{"timestamp": 1703123558789, "beacons": [], "gps": {"latitude": -23.5512, "longitude": -46.6360, "velocity": 19.44}}',
      ];

      this.isFileLoaded = true;
      console.log(
        `Arquivo de simulação carregado com ${this.simulationLines.length} linhas`,
      );
    } catch (error) {
      console.error('Erro ao carregar arquivo de simulação:', error);
      // Fallback para dados hardcoded se houver erro
      this.loadFallbackData();
    }
  }

  private loadFallbackData(): void {
    // Dados de fallback caso o arquivo não seja encontrado
    this.simulationLines = [
      JSON.stringify({
        timestamp: Date.now(),
        beacons: [
          { id: 'ESC-002', type: 'escavadeira', distance: 1.5 },
          { id: 'CAM-002', type: 'caminhao', distance: 3.0 },
          { id: 'CAM-003', type: 'caminhao', distance: 5.0 },
        ],
        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
      }),
      JSON.stringify({
        timestamp: Date.now() + 6000,
        beacons: [{ id: 'ESC-002', type: 'escavadeira', distance: 1.0 }],
        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
      }),
      JSON.stringify({
        timestamp: Date.now() + 12000,
        beacons: [],
        gps: { latitude: -23.5502, longitude: -46.631, velocity: 8.33 },
      }),
      JSON.stringify({
        timestamp: Date.now() + 18000,
        beacons: [{ id: 'CAM-004', type: 'caminhao', distance: 2.0 }],
        gps: { latitude: -23.5505, longitude: -46.6333, velocity: 0 },
      }),
      JSON.stringify({
        timestamp: Date.now() + 24000,
        beacons: [{ id: 'BAS-001', type: 'sensor_bascula', distance: 0.5 }],
        gps: { latitude: -23.5505, longitude: -46.6333, velocity: 0 },
      }),
      JSON.stringify({
        timestamp: Date.now() + 30000,
        beacons: [],
        gps: { latitude: -23.5508, longitude: -46.634, velocity: 13.89 },
      }),
    ];
    this.isFileLoaded = true;
  }

  public async getNextSimulationData(): Promise<SensorData | null> {
    if (!this.isFileLoaded) {
      await this.loadSimulationFile();
    }

    if (this.currentLine >= this.simulationLines.length) {
      // Reiniciar simulação quando chegar ao final
      this.currentLine = 0;
      await StorageService.saveSimulationProgress(this.currentLine);
    }

    if (this.simulationLines.length === 0) {
      return null;
    }

    try {
      const lineData = this.simulationLines[this.currentLine];
      const parsedData: SensorData = JSON.parse(lineData);

      // Atualizar timestamp para ser relativo ao momento atual
      const now = Date.now();
      const timeOffset =
        parsedData.timestamp -
        (this.simulationLines.length > 0
          ? JSON.parse(this.simulationLines[0]).timestamp
          : now);

      const updatedData: SensorData = {
        ...parsedData,
        timestamp: now + timeOffset,
      };

      // Salvar progresso
      this.currentLine++;
      await StorageService.saveSimulationProgress(this.currentLine);

      return updatedData;
    } catch (error) {
      console.error('Erro ao processar linha de simulação:', error);
      this.currentLine++;
      return this.generateRandomData();
    }
  }

  public resetSimulation(): void {
    this.currentLine = 0;
    StorageService.saveSimulationProgress(this.currentLine);
  }

  public getCurrentStep(): number {
    return this.currentLine;
  }

  public getTotalSteps(): number {
    return this.simulationLines.length;
  }

  public generateRandomData(): SensorData {
    const now = Date.now();
    const randomLat = -23.55 + (Math.random() - 0.5) * 0.01;
    const randomLon = -46.63 + (Math.random() - 0.5) * 0.01;
    const randomVelocity = Math.random() * 20; // 0-20 m/s

    const beacons: Beacon[] = [];

    // Adicionar escavadeira aleatoriamente
    if (Math.random() > 0.7) {
      beacons.push({
        id: `ESC-${Math.floor(Math.random() * 100)
          .toString()
          .padStart(3, '0')}`,
        type: 'escavadeira',
        distance: Math.random() * 5,
      });
    }

    // Adicionar outros caminhões aleatoriamente
    if (Math.random() > 0.6) {
      beacons.push({
        id: `CAM-${Math.floor(Math.random() * 100)
          .toString()
          .padStart(3, '0')}`,
        type: 'caminhao',
        distance: Math.random() * 10,
      });
    }

    // Adicionar sensor de báscula aleatoriamente
    if (Math.random() > 0.8) {
      beacons.push({
        id: `BAS-${Math.floor(Math.random() * 100)
          .toString()
          .padStart(3, '0')}`,
        type: 'sensor_bascula',
        distance: Math.random() * 2,
      });
    }

    return {
      timestamp: now,
      beacons,
      gps: {
        latitude: randomLat,
        longitude: randomLon,
        velocity: randomVelocity,
      },
    };
  }
}
