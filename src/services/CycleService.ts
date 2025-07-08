import { SensorData, CycleStage, CycleData, SyncData } from '../types/cycle';

export class CycleService {
  private currentCycle: CycleData | null = null;
  private cycles: CycleData[] = [];
  private velocityZeroStartTime: number | null = null;
  private readonly VELOCITY_ZERO_THRESHOLD = 5000; // 5 segundos
  private readonly EXCAVATOR_DISTANCE_THRESHOLD = 2; // 2 metros
  private readonly DUMP_DISTANCE_THRESHOLD = 5; // 5 metros
  private readonly DUMP_POINT = { latitude: -23.5505, longitude: -46.6333 };

  constructor() {
    this.loadCycles();
  }

  private loadCycles() {
    // TODO: Implementar carregamento de ciclos salvos localmente
    this.cycles = [];
  }

  private saveCycles() {
    // TODO: Implementar salvamento local de ciclos
    console.log('Ciclos salvos:', this.cycles);
  }

  private generateCycleId(): string {
    return `CYCLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isVelocityZeroForThreshold(
    velocity: number,
    timestamp: number,
  ): boolean {
    if (velocity === 0) {
      if (this.velocityZeroStartTime === null) {
        this.velocityZeroStartTime = timestamp;
      }
      return (
        timestamp - this.velocityZeroStartTime >= this.VELOCITY_ZERO_THRESHOLD
      );
    } else {
      this.velocityZeroStartTime = null;
      return false;
    }
  }

  private findNearestExcavator(beacons: any[]): any | null {
    const excavators = beacons.filter(b => b.type === 'escavadeira');
    if (excavators.length === 0) return null;

    return excavators.reduce((nearest, current) =>
      current.distance < nearest.distance ? current : nearest,
    );
  }

  private isNearDumpPoint(gps: any): boolean {
    const distance = this.calculateDistance(
      gps.latitude,
      gps.longitude,
      this.DUMP_POINT.latitude,
      this.DUMP_POINT.longitude,
    );
    return distance <= this.DUMP_DISTANCE_THRESHOLD;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private hasBasculatorSensor(beacons: any[]): boolean {
    return beacons.some(b => b.type === 'sensor_bascula');
  }

  private isBasculatorActive(beacons: any[]): boolean {
    const basculator = beacons.find(b => b.type === 'sensor_bascula');
    return basculator !== undefined;
  }

  private hasOtherTrucksInQueue(
    beacons: any[],
    _currentStage: CycleStage,
  ): boolean {
    const trucks = beacons.filter(b => b.type === 'caminhao');
    return trucks.length > 1; // Mais de um caminhão (incluindo o atual)
  }

  private determineStage(sensorData: SensorData): CycleStage {
    const { beacons, gps } = sensorData;
    const velocity = gps.velocity;
    const velocityZeroForThreshold = this.isVelocityZeroForThreshold(
      velocity,
      sensorData.timestamp,
    );
    const nearestExcavator = this.findNearestExcavator(beacons);
    const isNearDump = this.isNearDumpPoint(gps);
    const basculatorActive = this.isBasculatorActive(beacons);
    const currentStage =
      this.currentCycle?.stages[this.currentCycle.stages.length - 1]?.stage;

    // 1. EM FILA CARREGAMENTO
    if (
      velocityZeroForThreshold &&
      nearestExcavator &&
      nearestExcavator.distance <= this.EXCAVATOR_DISTANCE_THRESHOLD &&
      this.hasOtherTrucksInQueue(
        beacons,
        currentStage || 'EM FILA CARREGAMENTO',
      )
    ) {
      return 'EM FILA CARREGAMENTO';
    }

    // 2. EM CARREGAMENTO
    if (
      velocityZeroForThreshold &&
      nearestExcavator &&
      nearestExcavator.distance <= this.EXCAVATOR_DISTANCE_THRESHOLD &&
      !this.hasOtherTrucksInQueue(beacons, currentStage || 'EM CARREGAMENTO')
    ) {
      return 'EM CARREGAMENTO';
    }

    // 3. TRÂNSITO CHEIO
    if (
      velocity > 0 &&
      (!nearestExcavator ||
        nearestExcavator.distance > this.EXCAVATOR_DISTANCE_THRESHOLD) &&
      currentStage === 'EM CARREGAMENTO'
    ) {
      return 'TRÂNSITO CHEIO';
    }

    // 4. EM FILA BASCULAMENTO
    if (
      velocityZeroForThreshold &&
      isNearDump &&
      !basculatorActive &&
      (this.hasOtherTrucksInQueue(
        beacons,
        currentStage || 'EM FILA BASCULAMENTO',
      ) ||
        currentStage === 'TRÂNSITO CHEIO')
    ) {
      return 'EM FILA BASCULAMENTO';
    }

    // 5. EM BASCULAMENTO
    if (velocity === 0 && isNearDump && basculatorActive) {
      return 'EM BASCULAMENTO';
    }

    // 6. TRÂNSITO VAZIO
    if (velocity > 0 && !isNearDump && currentStage === 'EM BASCULAMENTO') {
      return 'TRÂNSITO VAZIO';
    }

    // Manter estágio atual se não houver mudança
    return currentStage || 'EM FILA CARREGAMENTO';
  }

  public processSensorData(sensorData: SensorData): {
    currentStage: CycleStage;
    loadingEquipment?: string;
    dumpPoint: string;
    velocityKmh: number;
    isNewCycle: boolean;
    isCycleComplete: boolean;
  } {
    const currentStage = this.determineStage(sensorData);
    const nearestExcavator = this.findNearestExcavator(sensorData.beacons);
    const velocityKmh = Math.round(sensorData.gps.velocity * 3.6); // Converter m/s para km/h
    const dumpPoint = `GPS: ${this.DUMP_POINT.latitude}, ${this.DUMP_POINT.longitude}`;

    let isNewCycle = false;
    let isCycleComplete = false;

    // Iniciar novo ciclo se não houver um ativo
    if (!this.currentCycle) {
      this.currentCycle = {
        id: this.generateCycleId(),
        startTime: sensorData.timestamp,
        stages: [],
        isComplete: false,
        isSynchronized: false,
      };
      isNewCycle = true;
    }

    // Adicionar estágio se for diferente do anterior
    const lastStage =
      this.currentCycle.stages[this.currentCycle.stages.length - 1]?.stage;
    if (currentStage !== lastStage) {
      this.currentCycle.stages.push({
        stage: currentStage,
        timestamp: sensorData.timestamp,
        sensorData,
      });

      // Atualizar equipamento de carga se encontrado
      if (nearestExcavator && !this.currentCycle.loadingEquipment) {
        this.currentCycle.loadingEquipment = nearestExcavator.id;
      }

      // Verificar se o ciclo está completo
      if (currentStage === 'TRÂNSITO VAZIO') {
        this.currentCycle.endTime = sensorData.timestamp;
        this.currentCycle.isComplete = true;
        this.currentCycle.dumpPoint = dumpPoint;
        isCycleComplete = true;

        // Salvar ciclo completo
        this.cycles.push(this.currentCycle);
        this.saveCycles();

        // Resetar para próximo ciclo
        this.currentCycle = null;
      }
    }

    return {
      currentStage,
      loadingEquipment:
        this.currentCycle?.loadingEquipment || nearestExcavator?.id,
      dumpPoint,
      velocityKmh,
      isNewCycle,
      isCycleComplete,
    };
  }

  public getUnsynchronizedCycles(): CycleData[] {
    return this.cycles.filter(
      cycle => cycle.isComplete && !cycle.isSynchronized,
    );
  }

  public markCycleAsSynchronized(cycleId: string): void {
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (cycle) {
      cycle.isSynchronized = true;
      this.saveCycles();
    }
  }

  public getSyncData(): SyncData[] {
    return this.getUnsynchronizedCycles().map(cycle => ({
      cycleId: cycle.id,
      startTime: cycle.startTime,
      endTime: cycle.endTime!,
      loadingEquipment: cycle.loadingEquipment || 'N/A',
      dumpPoint: cycle.dumpPoint || 'N/A',
      totalDuration: cycle.endTime! - cycle.startTime,
      stages: cycle.stages,
    }));
  }

  public getCurrentCycle(): CycleData | null {
    return this.currentCycle;
  }

  public getAllCycles(): CycleData[] {
    return this.cycles;
  }
}
