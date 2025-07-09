import { useEffect, useRef, useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { CycleService } from '../../services/CycleService';
import { NetworkSyncService } from '../../services/NetworkSyncService';
import { FileService } from '../../services/FileService';
import { Alert } from 'react-native';
import { useCycleStore } from '@store';

export const useSettingsScreen = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [syncFileInfo, setSyncFileInfo] = useState<{
    exists: boolean;
    path: string;
    size?: number;
    lineCount?: number;
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    pendingCycles: number;
    lastSyncTime?: Date;
    syncedCycles: number;
  } | null>(null);

  const { clearAllData } = useCycleStore();
  const networkStatus = useNetworkStatus();
  const simulationFile = 'simulacao.jsonl';

  // Referências para serviços
  const cycleServiceRef = useRef<CycleService | null>(null);
  const networkSyncServiceRef = useRef<NetworkSyncService | null>(null);

  useEffect(() => {
    // Inicializar serviços
    cycleServiceRef.current = new CycleService();
    networkSyncServiceRef.current = new NetworkSyncService(
      cycleServiceRef.current,
    );

    loadSyncInfo();
    const interval = setInterval(loadSyncInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  // Monitorar mudanças de conectividade
  useEffect(() => {
    if (networkSyncServiceRef.current) {
      const isOnline =
        networkStatus.isConnected &&
        (networkStatus.isInternetReachable ?? false);
      networkSyncServiceRef.current.setOnlineStatus(isOnline);

      // Atualizar status de sincronização
      const status = networkSyncServiceRef.current.getSyncStatus();
      setSyncStatus(status);
    }
  }, [networkStatus.isConnected, networkStatus.isInternetReachable]);

  const loadSyncInfo = async () => {
    try {
      const fileInfo = await FileService.getSyncFileInfo();
      setSyncFileInfo(fileInfo);

      if (networkSyncServiceRef.current) {
        const status = networkSyncServiceRef.current.getSyncStatus();
        setSyncStatus(status);
      }
    } catch (error) {
      console.error('Erro ao carregar informações do arquivo:', error);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              clearAllData();
              await FileService.clearSyncFile();
              await loadSyncInfo();
              Alert.alert(
                'Sucesso',
                'Todos os dados foram limpos com sucesso!',
              );
            } catch (error) {
              Alert.alert(
                'Erro',
                'Erro ao limpar dados: ' + (error as Error).message,
              );
            } finally {
              setIsClearing(false);
            }
          },
        },
      ],
    );
  };

  const handleForceSync = async () => {
    try {
      if (networkSyncServiceRef.current) {
        const result = await networkSyncServiceRef.current.forceSync();
        if (result.success) {
          Alert.alert(
            'Sincronização',
            `${result.syncedCount} ciclos sincronizados com sucesso!`,
          );
        } else {
          Alert.alert('Erro', `Erro na sincronização: ${result.error}`);
        }
        await loadSyncInfo();
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao forçar sincronização: ' + (error as Error).message,
      );
    }
  };

  const getNetworkStatusText = () => {
    if (!networkStatus.isConnected) return 'Offline';
    if (!networkStatus.isInternetReachable) return 'Sem Internet';
    if (networkStatus.isWifi) return 'WiFi';
    if (networkStatus.isCellular) return 'Dados Móveis';
    if (networkStatus.isEthernet) return 'Ethernet';
    return 'Online';
  };

  const getNetworkStatusColor = () => {
    if (!networkStatus.isConnected || !networkStatus.isInternetReachable)
      return 'redError';
    return 'greenSuccess';
  };
  return {
    isClearing,
    syncFileInfo,
    syncStatus,
    handleClearData,
    handleForceSync,
    getNetworkStatusText,
    getNetworkStatusColor,
    networkStatus,
    simulationFile,
  };
};
