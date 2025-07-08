import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Box, Text, Screen } from '@components';
import { useCycleStore } from '../../store/useCycleStore';
import { ExportButton } from '../../components/ExportButton';

export default function HistoryScreen() {
    const { ciclos } = useCycleStore();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const formatTime = (timestamp: string | number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const renderEtapa = (etapa: any, idx: number) => (
        <Box
            key={idx}
            mt="s8"
            mb="s4"
            p="s12"
            borderRadius="s12"
            borderWidth={1}
            borderColor="gray3"
            bg="grayWhite"
        >
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text fontWeight="bold" fontSize={16} color="grayBlack">
                    {etapa.etapa.replace(/_/g, ' ')}
                </Text>
                <Text fontSize={16} color="grayBlack">
                    {formatTime(etapa.timestamp)}
                </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" mt="s4">
                <Text fontSize={15} color="grayBlack" mr="s8">🚚 {etapa.velocidade} km/h</Text>
                <Text fontSize={15} color="grayBlack" mr="s8">📍 {etapa.lat}, {etapa.lon}</Text>
            </Box>
            {etapa.infoExtra && (
                <Box flexDirection="row" alignItems="center" mt="s4">
                    <Text fontSize={15} color="grayBlack">⚠️ {etapa.infoExtra}</Text>
                </Box>
            )}
        </Box>
    );

    const renderItem = ({ item }: { item: any }) => (
        <Box mb="s20" p="s16" borderRadius="s16" bg="grayWhite" shadowColor="grayBlack" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.06} shadowRadius={4} elevation={1}>
            {/* Header do ciclo */}
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s12">
                <Box flexDirection="row" alignItems="center">
                    <Text fontWeight="bold" fontSize={18} color="grayBlack" mr="s16">Início</Text>
                    <Text fontWeight="bold" fontSize={18} color="grayBlack" mr="s16">Fim</Text>
                    <Text fontWeight="bold" fontSize={18} color="grayBlack">Etapas</Text>
                </Box>
                <Box borderWidth={2} borderColor={item.sincronizado ? 'greenSuccess' : 'gray3'} borderRadius="s8" p="s4" alignItems="center" justifyContent="center">
                    <Text fontSize={18} color={item.sincronizado ? 'greenSuccess' : 'gray3'}>{item.sincronizado ? '✓' : ''}</Text>
                </Box>
            </Box>
            <Box flexDirection="row" alignItems="center" mb="s8">
                <Text fontSize={18} color="grayBlack" mr="s32">{formatTime(item.inicio)}</Text>
                <Text fontSize={18} color="grayBlack" mr="s32">{formatTime(item.fim)}</Text>
                <Text fontSize={18} color="grayBlack">{item.etapas.length}</Text>
            </Box>
            {/* Etapas */}
            {item.etapas.map(renderEtapa)}
        </Box>
    );

    const renderEmpty = () => (
        <Box flex={1} justifyContent="center" alignItems="center" p="s20">
            <Text color="grayBlack" fontSize={18} textAlign="center">
                Nenhum ciclo encontrado
            </Text>
            <Text color="grayBlack" fontSize={16} textAlign="center" mt="s8">
                Os ciclos aparecerão aqui após serem registrados
            </Text>
        </Box>
    );

    return (
        <Screen>
            <Box flex={1} bg="background">
                {/* Header */}
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    p="s20"
                    pb="s16"
                >
                    <Text fontWeight="bold" color="grayBlack" fontSize={24}>
                        Histórico
                    </Text>
                    <ExportButton />
                </Box>

                {/* Lista de ciclos customizada */}
                <FlatList
                    data={ciclos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: 20,
                        flexGrow: 1
                    }}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            </Box>
        </Screen>
    );
}
