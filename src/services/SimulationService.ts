import { SensorData, Beacon } from '../types/cycle';

export class SimulationService {
  private currentStep = 0;
  private readonly simulationData: SensorData[] = [
    // EM FILA CARREGAMENTO
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
    // EM CARREGAMENTO
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
    // TRÂNSITO CHEIO
    {
      timestamp: Date.now() + 24000,
      beacons: [],
      gps: { latitude: -23.5502, longitude: -46.631, velocity: 8.33 }, // 30 km/h
    },
    {
      timestamp: Date.now() + 30000,
      beacons: [],
      gps: { latitude: -23.5505, longitude: -46.632, velocity: 11.11 }, // 40 km/h
    },
    // EM FILA BASCULAMENTO
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
    // EM BASCULAMENTO
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
    // TRÂNSITO VAZIO
    {
      timestamp: Date.now() + 60000,
      beacons: [],
      gps: { latitude: -23.5508, longitude: -46.634, velocity: 13.89 }, // 50 km/h
    },
    {
      timestamp: Date.now() + 66000,
      beacons: [],
      gps: { latitude: -23.551, longitude: -46.635, velocity: 16.67 }, // 60 km/h
    },
  ];

  public getNextSimulationData(): SensorData | null {
    if (this.currentStep >= this.simulationData.length) {
      this.currentStep = 0; // Reiniciar simulação
    }

    const data = this.simulationData[this.currentStep];
    this.currentStep++;

    // Atualizar timestamp para ser relativo ao momento atual
    const now = Date.now();
    const timeOffset = data.timestamp - this.simulationData[0].timestamp;

    return {
      ...data,
      timestamp: now + timeOffset,
    };
  }

  public resetSimulation(): void {
    this.currentStep = 0;
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public getTotalSteps(): number {
    return this.simulationData.length;
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
