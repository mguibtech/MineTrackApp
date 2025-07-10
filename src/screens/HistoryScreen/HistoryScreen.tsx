import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, Text, ActivityIndicator } from '@components';
import { useNavigation } from '@react-navigation/native';
import { ItemHistory } from './components/ItemHistory';
import { FileService, LineReading } from '@services';

export interface LineReadingItem {
    id: string;
    data: string;
    quantidade: number;
    ciclos: string[];
    lineNumber: number;
    timestamp: number;
    processed: boolean;
}

export const HistoryScreen = () => {
    const navigation = useNavigation();
    const [lineReadings, setLineReadings] = useState<LineReadingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        processed: 0,
        unprocessed: 0,
        syncedCycles: 0,
    });

    const loadLineReadings = useCallback(async () => {
        try {
            setLoading(true);
            const readings = await FileService.loadLineReadings();
            const stats = await FileService.getReadingsStats();
            const syncFileInfo = await FileService.getSyncFileInfo();

            // Agrupar leituras por dia para exibição
            const groupedReadings = groupReadingsByDay(readings);
            setLineReadings(groupedReadings);
            setStats({
                ...stats,
                syncedCycles: syncFileInfo.exists ? (syncFileInfo.lineCount || 0) : 0
            });
        } catch (error) {
            console.error('Erro ao carregar leituras de linha:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const readings = await FileService.loadLineReadings();
            const stats = await FileService.getReadingsStats();
            const syncFileInfo = await FileService.getSyncFileInfo();

            // Agrupar leituras por dia para exibição
            const groupedReadings = groupReadingsByDay(readings);
            setLineReadings(groupedReadings);
            setStats({
                ...stats,
                syncedCycles: syncFileInfo.exists ? (syncFileInfo.lineCount || 0) : 0
            });
        } catch (error) {
            console.error('Erro ao atualizar leituras de linha:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const groupReadingsByDay = (readings: LineReading[]): LineReadingItem[] => {
        const grouped: { [key: string]: LineReading[] } = {};

        readings.forEach(reading => {
            const date = new Date(reading.timestamp);
            const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!grouped[dayKey]) {
                grouped[dayKey] = [];
            }
            grouped[dayKey].push(reading);
        });

        return Object.entries(grouped).map(([dayKey, dayReadings]) => {
            const sortedReadings = dayReadings.sort((a, b) => a.timestamp - b.timestamp);
            const firstReading = sortedReadings[0];

            return {
                id: `day_${dayKey}`,
                data: new Date(firstReading.timestamp).toISOString(),
                quantidade: dayReadings.length,
                ciclos: dayReadings.map(r => `Linha ${r.lineNumber}`),
                lineNumber: firstReading.lineNumber,
                timestamp: firstReading.timestamp,
                processed: dayReadings.every(r => r.processed),
            };
        }).sort((a, b) => b.timestamp - a.timestamp); // Mais recente primeiro
    };

    useEffect(() => {
        loadLineReadings();
    }, [loadLineReadings]);

    // Recarregar leituras quando a tela receber foco
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadLineReadings();
        });

        return unsubscribe;
    }, [navigation, loadLineReadings]);

    if (loading) {
        return (
            <Box flex={1} bg="gray5" justifyContent="center" alignItems="center">
                <ActivityIndicator size="large" color="grayBlack" />
                <Text mt="s16" color="grayBlack" fontSize={16}>
                    Carregando histórico de leituras...
                </Text>
            </Box>
        );
    }

    return (
        <Box flex={1} bg="gray5">
            {/* Header */}
            <Box bg="grayWhite" p="s20" borderBottomWidth={1} borderBottomColor="gray4">
                <Text color="grayBlack" fontSize={24} fontWeight="bold">
                    Histórico de Leituras
                </Text>
                <Text color="gray1" fontSize={16} mt="s4">
                    {lineReadings.length} dia{lineReadings.length !== 1 ? 's' : ''} de leituras
                </Text>

                {/* Estatísticas */}
                <Box flexDirection="row" justifyContent="space-between" mt="s16">
                    <Box alignItems="center">
                        <Text color="grayBlack" fontSize={20} fontWeight="bold">
                            {stats.total}
                        </Text>
                        <Text color="gray1" fontSize={12}>
                            Total
                        </Text>
                    </Box>
                    <Box alignItems="center">
                        <Text color="greenSuccess" fontSize={20} fontWeight="bold">
                            {stats.processed}
                        </Text>
                        <Text color="gray1" fontSize={12}>
                            Processadas
                        </Text>
                    </Box>
                    <Box alignItems="center">
                        <Text color="error" fontSize={20} fontWeight="bold">
                            {stats.unprocessed}
                        </Text>
                        <Text color="gray1" fontSize={12}>
                            Pendentes
                        </Text>
                    </Box>
                    <Box alignItems="center">
                        <Text color="primary" fontSize={20} fontWeight="bold">
                            {stats.syncedCycles}
                        </Text>
                        <Text color="gray1" fontSize={12}>
                            Ciclos Sinc.
                        </Text>
                    </Box>
                </Box>

                {/* Explicação sobre leituras vs ciclos */}
                <Box mt="s12" p="s12" bg="gray4" borderRadius="s8">
                    <Text color="gray1" fontSize={12} textAlign="center">
                        💡 <Text fontWeight="bold">Leituras</Text> são simulações executadas. <Text fontWeight="bold">Ciclos</Text> são operações completas sincronizadas com o servidor.
                    </Text>
                </Box>
            </Box>

            {/* Lista de leituras */}
            <ScrollView
                style={{ paddingHorizontal: 16, paddingTop: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                        tintColor="#007AFF"
                        title="Atualizando..."
                        titleColor="#007AFF"
                    />
                }
            >
                {lineReadings.length === 0 ? (
                    <Box flex={1} justifyContent="center" alignItems="center" py="s40">
                        <Text color="gray1" fontSize={18} textAlign="center">
                            Nenhuma leitura encontrada
                        </Text>
                        <Text color="gray1" fontSize={14} textAlign="center" mt="s8">
                            Execute simulações para gerar dados de leitura
                        </Text>
                    </Box>
                ) : (
                    lineReadings.map((reading) => (
                        <ItemHistory key={reading.id} item={reading} />
                    ))
                )}
            </ScrollView>
        </Box>
    );
};
