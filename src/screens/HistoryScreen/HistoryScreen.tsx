import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, Text, ActivityIndicator, Button, Icon, TouchableOpacityBox } from '@components';
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

interface CollapsibleSectionProps {
    title: string;
    count: number;
    isCollapsed: boolean;
    onToggle: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    children: React.ReactNode;
    color: string;
    iconName: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    count,
    isCollapsed,
    onToggle,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
    children,
    color,
    iconName
}) => {
    return (
        <Box mb="s16">
            {/* Header do collapse */}
            <Box
                bg="grayWhite"
                borderRadius="s12"
                p="s16"
                shadowColor="grayBlack"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.06}
                shadowRadius={4}
                elevation={1}
            >
                {/* Linha superior: ícone, título e botões de reordenação */}
                <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
                    <Box flexDirection="row" alignItems="center" flex={1}>
                        <Box mr="s12">
                            <Icon
                                name={iconName as any}
                                size={24}
                                color={color as any}
                            />
                        </Box>
                        <Text color="grayBlack" fontSize={18} fontWeight="bold" flex={1}>
                            {title}
                        </Text>
                    </Box>
                    <Box flexDirection="row" alignItems="center">
                        <Button
                            onPress={onMoveUp}
                            title=""
                            width={32}
                            height={32}
                            borderRadius="s8"
                            backgroundColor="carrotSecondary"
                            disabled={!canMoveUp}
                            mr="s8"
                        >
                            <Icon
                                name="arrowUp"
                                size={20}
                                color={canMoveUp ? "primary" : "backgroundContrast"}
                            />
                        </Button>
                        <Button
                            onPress={onMoveDown}
                            title=""
                            width={32}
                            height={32}
                            borderRadius="s8"
                            backgroundColor="buttonPrimary"
                            disabled={!canMoveDown}
                        >
                            <Icon
                                name="arrowDown"
                                size={20}
                                color={canMoveDown ? "primary" : "gray3"}
                            />
                        </Button>
                    </Box>
                </Box>


                <TouchableOpacityBox onPress={onToggle} flexDirection="row" alignItems="center">
                    <Icon
                        name={isCollapsed ? "arrowDown" : "arrowUp"}
                        size={20}

                    />
                    <Text ml="s12" color="gray1" fontSize={14}>
                        {isCollapsed ? "Expandir" : "Colapsar"}
                    </Text>
                    <Box
                        ml="s8"
                        bg={color as any}
                        borderRadius="s12"
                        px="s8"
                        py="s4"
                    >
                        <Text color="grayWhite" fontSize={12} fontWeight="bold">
                            {count}
                        </Text>
                    </Box>
                </TouchableOpacityBox>
            </Box>

            {/* Conteúdo do collapse */}
            {!isCollapsed && (
                <Box mt="s8">
                    {children}
                </Box>
            )}
        </Box>
    );
};

export const HistoryScreen = () => {
    const navigation = useNavigation();
    const [lineReadings, setLineReadings] = useState<LineReadingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
        processed: false,
        pending: false,
    });
    const [sectionOrder, setSectionOrder] = useState<string[]>(['processed', 'pending']);
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

    const toggleCollapse = (section: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const moveSectionUp = (section: string) => {
        setSectionOrder(prev => {
            const currentIndex = prev.indexOf(section);
            if (currentIndex > 0) {
                const newOrder = [...prev];
                [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
                return newOrder;
            }
            return prev;
        });
    };

    const moveSectionDown = (section: string) => {
        setSectionOrder(prev => {
            const currentIndex = prev.indexOf(section);
            if (currentIndex < prev.length - 1) {
                const newOrder = [...prev];
                [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
                return newOrder;
            }
            return prev;
        });
    };

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

    // Separar leituras por tipo
    const processedReadings = lineReadings.filter(reading => reading.processed);
    const pendingReadings = lineReadings.filter(reading => !reading.processed);

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
                    <>
                        {/* Seções colapsáveis */}
                        {sectionOrder.map((sectionType) => {
                            const isProcessed = sectionType === 'processed';
                            const readings = isProcessed ? processedReadings : pendingReadings;
                            const title = isProcessed ? 'Processadas' : 'Pendentes';
                            const color = isProcessed ? 'greenSuccess' : 'error';
                            const iconName = isProcessed ? 'checkRound' : 'warning';

                            if (readings.length === 0) return null;

                            return (
                                <CollapsibleSection
                                    key={sectionType}
                                    title={title}
                                    count={readings.length}
                                    isCollapsed={collapsedSections[sectionType]}
                                    onToggle={() => toggleCollapse(sectionType)}
                                    onMoveUp={() => moveSectionUp(sectionType)}
                                    onMoveDown={() => moveSectionDown(sectionType)}
                                    canMoveUp={sectionOrder.indexOf(sectionType) > 0}
                                    canMoveDown={sectionOrder.indexOf(sectionType) < sectionOrder.length - 1}
                                    color={color}
                                    iconName={iconName}
                                >
                                    {readings.map((item, index) => (
                                        <ItemHistory key={index} item={item} />
                                    ))}
                                </CollapsibleSection>
                            );
                        })}
                    </>
                )}
            </ScrollView>
        </Box>
    );
};
