import { IconProps } from '@components';
import { CycleService, SimulationService } from '@services';
import { SyncService } from '@services';
import { CycleStage } from '@types';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

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

  const cycleServiceRef = useRef<CycleService | null>(null);
  const simulationServiceRef = useRef<SimulationService | null>(null);
  const syncServiceRef = useRef<SyncService | null>(null);

  useEffect(() => {
    cycleServiceRef.current = new CycleService();
    simulationServiceRef.current = new SimulationService();
    syncServiceRef.current = new SyncService(cycleServiceRef.current);

    const syncCheckInterval = setInterval(() => {
      if (syncServiceRef.current) {
        const syncStatus = syncServiceRef.current.getSyncStatus();
        setIsSynchronized(syncStatus.pendingCycles === 0);
        setPendingCycles(syncStatus.pendingCycles);
      }
    }, 5000);

    return () => {
      clearInterval(syncCheckInterval);
      if (syncServiceRef.current) {
        syncServiceRef.current.destroy();
      }
    };
  }, []);

  const handleSimulateReading = async () => {
    if (!cycleServiceRef.current || !simulationServiceRef.current) return;
    setIsSimulating(true);
    try {
      const sensorData = simulationServiceRef.current.getNextSimulationData();
      if (!sensorData) {
        Alert.alert('Erro', 'Não foi possível obter dados de simulação');
        return;
      }
      const result = cycleServiceRef.current.processSensorData(sensorData);
      setCurrentStage(result.currentStage);
      setCurrentSpeed(result.velocityKmh.toString());
      setLoadingEquipment(result.loadingEquipment || 'N/A');
      setDumpPoint(result.dumpPoint);
      if (result.isNewCycle) {
        Alert.alert('Novo Ciclo', 'Iniciado novo ciclo de transporte');
      }
      if (result.isCycleComplete) {
        Alert.alert(
          'Ciclo Completo',
          'Ciclo de transporte finalizado com sucesso!',
        );
      }
      if (syncServiceRef.current) {
        const syncStatus = syncServiceRef.current.getSyncStatus();
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
  ('');

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
    handleSimulateReading,
    getStageIcon,
    getSpeedIcon,
    getEquipmentIcon,
    getDumpIcon,
    getSyncIcon,
  };
};
