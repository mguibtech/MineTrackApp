import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text, ActivityIndicator } from '@components';
import { useNavigation } from '@react-navigation/native';
import { ItemHistory, ExportLogItem } from './components/ItemHistory';
import { FileService } from '@services';

export const HistoryScreen = () => {
    const navigation = useNavigation();
    const [exportLogs, setExportLogs] = useState<ExportLogItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadExportLogs = async () => {
        try {
            setLoading(true);
            const logs = await FileService.readExportLog();
            setExportLogs(logs);
        } catch (error) {
            console.error('Erro ao carregar logs de exportação:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExportLogs();
    }, []);

    // Recarregar logs quando a tela receber foco
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadExportLogs();
        });

        return unsubscribe;
    }, [navigation]);

    if (loading) {
        return (
            <Box flex={1} bg="gray5" justifyContent="center" alignItems="center">
                <ActivityIndicator size="large" color="grayBlack" />
                <Text mt="s16" color="grayBlack" fontSize={16}>
                    Carregando histórico...
                </Text>
            </Box>
        );
    }

    return (
        <Box flex={1} bg="gray5">
            {/* Header */}
            <Box bg="grayWhite" p="s20" borderBottomWidth={1} borderBottomColor="gray4">
                <Text color="grayBlack" fontSize={24} fontWeight="bold">
                    Histórico de Exportações
                </Text>
                <Text color="gray1" fontSize={16} mt="s4">
                    {exportLogs.length} exportação{exportLogs.length !== 1 ? 'ões' : ''} realizada{exportLogs.length !== 1 ? 's' : ''}
                </Text>
            </Box>

            {/* Lista de logs */}
            <ScrollView style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                {exportLogs.length === 0 ? (
                    <Box flex={1} justifyContent="center" alignItems="center" py="s40">
                        <Text color="gray1" fontSize={18} textAlign="center">
                            Nenhuma exportação encontrada
                        </Text>
                        <Text color="gray1" fontSize={14} textAlign="center" mt="s8">
                            Execute simulações para gerar dados de exportação
                        </Text>
                    </Box>
                ) : (
                    exportLogs.map((log, index) => (
                        <ItemHistory key={index} item={log} />
                    ))
                )}
            </ScrollView>
        </Box>
    );
};
