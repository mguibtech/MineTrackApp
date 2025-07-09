import { IconProps } from '@components';
import {
  CycleService,
  SimulationService,
  FileService,
  NetworkSyncService,
} from '@services';
import { CycleStage } from '@types';
import { useCycleStore } from '../../store/useCycleStore';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNetworkStatus } from '@hooks';

export const useHomeScreen = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStage, setCurrentStage] = useState<CycleStage>(
    'EM FILA CARREGAMENTO',
  );
  const [currentSpeed, setCurrentSpeed] = useState('0');
  const [loadingEquipment, setLoadingEquipment] = useState('ESC-002');
  const [dumpPoint, setDumpPoint] = useState('-19,92, -43,94');
  const [isSynchronized, setIsSynchronized] = useState(true);
  const [pendingCycles, setPendingCycles] = useState(0);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [totalLines, setTotalLines] = useState(0);

  const cycleServiceRef = useRef<CycleService | null>(null);
  const simulationServiceRef = useRef<SimulationService | null>(null);
  const networkSyncServiceRef = useRef<NetworkSyncService | null>(null);
  const networkStatus = useNetworkStatus();

  const { saveCycleStatus, getCycleStatuses, getSimulationProgress } =
    useCycleStore();

  const loadLastStatus = useCallback(async () => {
    try {
      const cycleStatuses = getCycleStatuses();
      const lastStatus =
        cycleStatuses.length > 0
          ? cycleStatuses[cycleStatuses.length - 1]
          : null;
      if (lastStatus) {
        setCurrentStage(lastStatus.stage as CycleStage);
        setCurrentSpeed(lastStatus.speed);
        setLoadingEquipment(lastStatus.loadingEquipment);
        setDumpPoint(lastStatus.dumpPoint);
        setIsSynchronized(lastStatus.isSynchronized);
        setPendingCycles(lastStatus.pendingCycles);
      }
    } catch (error) {
      console.error('Erro ao carregar último status:', error);
    }
  }, [getCycleStatuses]);

  const loadSimulationProgress = useCallback(async () => {
    try {
      const progress = getSimulationProgress();
      setSimulationProgress(progress);

      if (simulationServiceRef.current) {
        setTotalLines(simulationServiceRef.current.getTotalSteps());
      }
    } catch (error) {
      console.error('Erro ao carregar progresso da simulação:', error);
    }
  }, [getSimulationProgress]);

  useEffect(() => {
    cycleServiceRef.current = new CycleService();
    simulationServiceRef.current = new SimulationService();
    networkSyncServiceRef.current = new NetworkSyncService(
      cycleServiceRef.current,
    );

    // Carregar último status salvo
    loadLastStatus();
    loadSimulationProgress();

    // Limpar leituras antigas periodicamente (a cada 24 horas)
    const cleanupInterval = setInterval(async () => {
      try {
        await FileService.cleanOldReadings();
      } catch (error) {
        console.error('Erro ao limpar leituras antigas:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 horas

    const syncCheckInterval = setInterval(() => {
      if (networkSyncServiceRef.current) {
        const syncStatus = networkSyncServiceRef.current.getSyncStatus();
        setIsSynchronized(syncStatus.pendingCycles === 0);
        setPendingCycles(syncStatus.pendingCycles);
      }
    }, 5000);

    return () => {
      clearInterval(syncCheckInterval);
      clearInterval(cleanupInterval);
      if (networkSyncServiceRef.current) {
        networkSyncServiceRef.current.destroy();
      }
    };
  }, [loadLastStatus, loadSimulationProgress]);

  // Monitorar mudanças de conectividade
  useEffect(() => {
    if (networkSyncServiceRef.current) {
      const isOnline =
        networkStatus.isConnected &&
        (networkStatus.isInternetReachable ?? false);
      networkSyncServiceRef.current.setOnlineStatus(isOnline);
    }
  }, [networkStatus.isConnected, networkStatus.isInternetReachable]);

  const saveCurrentStatus = async (sensorData: any) => {
    try {
      const status = {
        id: `cycle_${Date.now()}`,
        timestamp: Date.now(),
        stage: currentStage,
        speed: currentSpeed,
        loadingEquipment,
        dumpPoint,
        isSynchronized,
        pendingCycles,
        sensorData,
      };

      saveCycleStatus(status);
    } catch (error) {
      console.error('Erro ao salvar status:', error);
    }
  };

  const handleSimulateReading = async () => {
    if (!cycleServiceRef.current || !simulationServiceRef.current) return;
    setIsSimulating(true);
    try {
      const sensorData =
        await simulationServiceRef.current.getNextSimulationData();
      if (!sensorData) {
        Alert.alert('Erro', 'Não foi possível obter dados de simulação');
        return;
      }

      const result = cycleServiceRef.current.processSensorData(sensorData);

      // Atualizar estado
      setCurrentStage(result.currentStage);
      setCurrentSpeed(result.velocityKmh.toString());
      setLoadingEquipment(result.loadingEquipment || 'N/A');
      setDumpPoint(result.dumpPoint);

      // Atualizar progresso
      const newProgress = simulationServiceRef.current.getCurrentStep();
      setSimulationProgress(newProgress);
      setTotalLines(simulationServiceRef.current.getTotalSteps());

      // Salvar status no AsyncStorage
      await saveCurrentStatus(sensorData);

      if (result.isNewCycle) {
        Alert.alert('Novo Ciclo', 'Iniciado novo ciclo de transporte');
      }
      if (result.isCycleComplete) {
        Alert.alert(
          'Ciclo Completo',
          'Ciclo de transporte finalizado com sucesso!',
        );
      }
      if (networkSyncServiceRef.current) {
        const syncStatus = networkSyncServiceRef.current.getSyncStatus();
        setIsSynchronized(syncStatus.pendingCycles === 0);
        setPendingCycles(syncStatus.pendingCycles);
      }
    } catch (error) {
      console.error('Erro na simulação:', error);
      Alert.alert('Erro', 'Erro ao processar dados de simulação');
    } finally {
      setIsSimulating(false);
    }
  };

  // Ícones para cada campo
  const getStageIcon = (): IconProps['name'] => 'home';
  const getSpeedIcon = (): IconProps['name'] => 'arrowRight';
  const getEquipmentIcon = (): IconProps['name'] => 'checkList';
  const getDumpIcon = (): IconProps['name'] => 'search';
  const getSyncIcon = (): IconProps['name'] =>
    isSynchronized ? 'checkRound' : 'errorRound';

  return {
    isSimulating,
    currentStage,
    currentSpeed,
    loadingEquipment,
    dumpPoint,
    isSynchronized,
    pendingCycles,
    simulationProgress,
    totalLines,
    handleSimulateReading,
    getStageIcon,
    getSpeedIcon,
    getEquipmentIcon,
    getDumpIcon,
    getSyncIcon,
  };
};
