import { useEffect, useRef, useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { CycleService } from '../../services/CycleService';
import { NetworkSyncService } from '../../services/NetworkSyncService';
import { FileService } from '../../services/FileService';
import { Alert } from 'react-native';
import { useCycleStore } from '@store';
import { SyncData } from '../../types/cycle';
import RNFS from 'react-native-fs';

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

        // Verificar ciclos disponíveis para sincronização
        if (cycleServiceRef.current) {
          const unsynchronizedCycles =
            cycleServiceRef.current.getUnsynchronizedCycles();
          const allCycles = cycleServiceRef.current.getAllCycles();

          console.log(`📊 Status dos ciclos:`);
          console.log(`• Total de ciclos: ${allCycles.length}`);
          console.log(
            `• Ciclos completos: ${allCycles.filter(c => c.isComplete).length}`,
          );
          console.log(
            `• Ciclos não sincronizados: ${unsynchronizedCycles.length}`,
          );
          console.log(`• Arquivo sync existe: ${fileInfo.exists}`);

          if (unsynchronizedCycles.length === 0 && !fileInfo.exists) {
            console.log(
              `⚠️ Nenhum ciclo completo disponível para sincronização`,
            );
            console.log(`💡 Execute simulações completas para gerar ciclos`);
          }
        }
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
        console.log('🔄 Iniciando sincronização forçada...');

        // Verificar status antes da sincronização
        const beforeSyncInfo = await FileService.getSyncFileInfo();
        console.log(
          '📁 Status do arquivo ANTES da sincronização:',
          beforeSyncInfo,
        );

        if (cycleServiceRef.current) {
          const unsynchronizedCycles =
            cycleServiceRef.current.getUnsynchronizedCycles();
          console.log(
            '📊 Ciclos não sincronizados ANTES:',
            unsynchronizedCycles.length,
          );
          console.log(
            '📋 IDs dos ciclos:',
            unsynchronizedCycles.map(c => c.id),
          );
        }

        const result = await networkSyncServiceRef.current.forceSync();

        console.log('✅ Resultado da sincronização:', result);

        // Verificar status após a sincronização
        const afterSyncInfo = await FileService.getSyncFileInfo();
        console.log(
          '📁 Status do arquivo DEPOIS da sincronização:',
          afterSyncInfo,
        );

        // Carregar informações atualizadas após sincronização
        await loadSyncInfo();

        if (result.success) {
          // Obter estatísticas detalhadas
          const syncFileInfo = await FileService.getSyncFileInfo();
          const readingsStats = await FileService.getReadingsStats();

          let message = '';
          if (result.syncedCount > 0) {
            message = `${result.syncedCount} ciclo${
              result.syncedCount > 1 ? 's' : ''
            } sincronizado${
              result.syncedCount > 1 ? 's' : ''
            } com sucesso!\n\n`;
            message += `📊 Estatísticas:\n`;
            message += `• Total de leituras: ${readingsStats.total}\n`;
            message += `• Leituras processadas: ${readingsStats.processed}\n`;
            message += `• Leituras pendentes: ${readingsStats.unprocessed}\n`;
            if (syncFileInfo.exists) {
              message += `• Ciclos no servidor: ${
                syncFileInfo.lineCount || 0
              }\n`;
              message += `• Arquivo criado em: ${syncFileInfo.path}`;
            }
          } else {
            message = 'Nenhum ciclo novo para sincronizar.\n\n';
            message += `📊 Status atual:\n`;
            message += `• Total de leituras: ${readingsStats.total}\n`;
            message += `• Leituras processadas: ${readingsStats.processed}\n`;
            message += `• Leituras pendentes: ${readingsStats.unprocessed}\n`;

            // Verificar se há ciclos disponíveis
            if (cycleServiceRef.current) {
              const unsynchronizedCycles =
                cycleServiceRef.current.getUnsynchronizedCycles();
              const allCycles = cycleServiceRef.current.getAllCycles();
              const completeCycles = allCycles.filter(c => c.isComplete);

              message += `• Total de ciclos: ${allCycles.length}\n`;
              message += `• Ciclos completos: ${completeCycles.length}\n`;
              message += `• Ciclos não sincronizados: ${unsynchronizedCycles.length}\n\n`;

              if (
                unsynchronizedCycles.length === 0 &&
                completeCycles.length === 0
              ) {
                message += `💡 Para gerar ciclos:\n`;
                message += `1. Execute simulações na tela inicial\n`;
                message += `2. Complete o ciclo até "TRÂNSITO VAZIO"\n`;
                message += `3. Tente sincronizar novamente`;
              } else if (
                unsynchronizedCycles.length === 0 &&
                completeCycles.length > 0
              ) {
                message += `✅ Todos os ciclos já foram sincronizados!`;
              }
            }
          }

          Alert.alert('Sincronização', message);
        } else {
          Alert.alert(
            'Erro',
            `Erro na sincronização: ${result.error || 'Erro desconhecido'}`,
          );
        }
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      Alert.alert(
        'Erro',
        'Erro ao forçar sincronização: ' + (error as Error).message,
      );
    }
  };

  const handleTestFileCreation = async () => {
    try {
      console.log('🧪 Testando criação de arquivo de sincronização...');

      // Criar dados de teste
      const testSyncData: SyncData[] = [
        {
          cycleId: 'TEST_CYCLE_001',
          startTime: Date.now() - 60000, // 1 minuto atrás
          endTime: Date.now(),
          loadingEquipment: 'ESC-002',
          dumpPoint: 'GPS: -23.5505, -46.6333',
          totalDuration: 60000,
          stages: [
            {
              stage: 'EM CARREGAMENTO' as const,
              timestamp: Date.now() - 60000,
              sensorData: {
                timestamp: Date.now() - 60000,
                beacons: [
                  { id: 'ESC-002', type: 'escavadeira', distance: 1.0 },
                ],
                gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
              },
            },
            {
              stage: 'TRÂNSITO CHEIO' as const,
              timestamp: Date.now() - 30000,
              sensorData: {
                timestamp: Date.now() - 30000,
                beacons: [],
                gps: { latitude: -23.5502, longitude: -46.631, velocity: 8.33 },
              },
            },
            {
              stage: 'EM BASCULAMENTO' as const,
              timestamp: Date.now() - 10000,
              sensorData: {
                timestamp: Date.now() - 10000,
                beacons: [
                  { id: 'BAS-001', type: 'sensor_bascula', distance: 0.5 },
                ],
                gps: { latitude: -23.5505, longitude: -46.6333, velocity: 0 },
              },
            },
            {
              stage: 'TRÂNSITO VAZIO' as const,
              timestamp: Date.now(),
              sensorData: {
                timestamp: Date.now(),
                beacons: [],
                gps: {
                  latitude: -23.5508,
                  longitude: -46.634,
                  velocity: 13.89,
                },
              },
            },
          ],
        },
      ];

      // Tentar salvar dados de teste
      const success = await FileService.saveSyncData(testSyncData);

      if (success) {
        const fileInfo = await FileService.getSyncFileInfo();
        console.log('✅ Arquivo de teste criado com sucesso:', fileInfo);

        Alert.alert(
          'Teste de Arquivo',
          `Arquivo criado com sucesso!\n\n📁 Caminho: ${fileInfo.path}\n📊 Linhas: ${fileInfo.lineCount}\n📏 Tamanho: ${fileInfo.size} bytes`,
        );
      } else {
        console.error('❌ Falha ao criar arquivo de teste');
        Alert.alert('Erro', 'Falha ao criar arquivo de teste');
      }

      // Recarregar informações
      await loadSyncInfo();
    } catch (error) {
      console.error('❌ Erro no teste de criação:', error);
      Alert.alert(
        'Erro',
        'Erro no teste de criação: ' + (error as Error).message,
      );
    }
  };

  const handleValidateJsonlFile = async () => {
    try {
      console.log('🔍 Validando arquivo JSONL...');

      const fileInfo = await FileService.getSyncFileInfo();

      if (!fileInfo.exists) {
        Alert.alert(
          'Arquivo não encontrado',
          'O arquivo sync_servidor.jsonl não existe ainda.',
        );
        return;
      }

      // Ler o conteúdo do arquivo
      const syncData = await FileService.readSyncFile();

      let message = `📁 Arquivo: ${fileInfo.path}\n`;
      message += `📏 Tamanho: ${fileInfo.size} bytes\n`;
      message += `📊 Linhas: ${fileInfo.lineCount}\n\n`;

      // Verificar se syncData é válido
      if (!syncData || !Array.isArray(syncData) || syncData.length === 0) {
        message += '⚠️ Arquivo vazio ou com formato inválido\n';
        message += '📋 Possíveis causas:\n';
        message += '• Arquivo não contém dados válidos\n';
        message += '• Formato JSONL incorreto\n';
        message += '• Erro na leitura do arquivo';

        Alert.alert('Validação JSONL', message);
        return;
      }

      message += `✅ Arquivo JSONL válido com ${syncData.length} registros\n\n`;
      message += '📋 Primeiros registros:\n';

      // Mostrar os primeiros 3 registros
      syncData.slice(0, 3).forEach((record, index) => {
        if (record && record.cycleId) {
          message += `\n${index + 1}. Ciclo ID: ${record.cycleId}\n`;
          message += `   Início: ${new Date(record.startTime).toLocaleString(
            'pt-BR',
          )}\n`;
          message += `   Fim: ${new Date(record.endTime).toLocaleString(
            'pt-BR',
          )}\n`;
          message += `   Etapas: ${record.stages?.length || 0}\n`;
        } else {
          message += `\n${index + 1}. ⚠️ Registro inválido\n`;
        }
      });

      if (syncData.length > 3) {
        message += `\n... e mais ${syncData.length - 3} registros`;
      }

      Alert.alert('Validação JSONL', message);
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      Alert.alert('Erro', 'Erro na validação: ' + (error as Error).message);
    }
  };

  const handleDebugFile = async () => {
    try {
      console.log('🐛 Debug do arquivo JSONL...');

      const fileInfo = await FileService.getSyncFileInfo();
      console.log('📁 Informações do arquivo:', fileInfo);

      if (!fileInfo.exists) {
        console.log('❌ Arquivo não existe');
        Alert.alert('Debug', 'Arquivo não existe');
        return;
      }

      // Tentar ler o arquivo diretamente
      const outputPath = `${RNFS.DocumentDirectoryPath}/sync_servidor.jsonl`;
      const fileContent = await RNFS.readFile(outputPath, 'utf8');

      console.log('📄 Conteúdo bruto do arquivo:');
      console.log('Tamanho:', fileContent.length);
      console.log('Primeiros 500 chars:', fileContent.substring(0, 500));

      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      console.log('📊 Linhas encontradas:', lines.length);

      let message = `🐛 Debug do Arquivo\n\n`;
      message += `📁 Caminho: ${fileInfo.path}\n`;
      message += `📏 Tamanho: ${fileInfo.size} bytes\n`;
      message += `📊 Linhas: ${lines.length}\n`;
      message += `📄 Conteúdo bruto: ${fileContent.length} chars\n\n`;

      if (lines.length > 0) {
        message += '📋 Primeiras 3 linhas:\n';
        lines.slice(0, 3).forEach((line, index) => {
          message += `\n${index + 1}. ${line.substring(0, 100)}...\n`;
        });
      } else {
        message += '⚠️ Nenhuma linha encontrada';
      }

      Alert.alert('Debug do Arquivo', message);
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      Alert.alert('Erro', 'Erro no debug: ' + (error as Error).message);
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
    handleTestFileCreation,
    handleValidateJsonlFile,
    handleDebugFile,
    getNetworkStatusText,
    getNetworkStatusColor,
    networkStatus,
    simulationFile,
  };
};
