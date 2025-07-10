import React, { useEffect, useState, useCallback } from 'react';
import { Box, Text, Icon, Button } from '@components';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { IconProps } from '../../components/Icons/Icon';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '@routes';
import { ScrollView } from 'react-native';
import { FileService } from '@services';

interface CycleDetail {
    id: string;
    start: string;
    end: string;
    steps: number;
    synced: boolean;
    stages: Array<{
        name: string;
        icon: IconProps['name'];
        speed: number;
        gps: { lat: number; lon: number } | null;
        equipments: string;
        timestamp: string;
    }>;
}

export const DetailScreen = () => {
    const route = useRoute<RouteProp<AppStackParamList, 'DetailScreen'>>();
    const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
    const { cycleId } = route.params;

    const [cycleDetail, setCycleDetail] = useState<CycleDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const loadCycleDetail = useCallback(async () => {
        try {
            setLoading(true);

            console.log('🔍 Buscando ciclo:', cycleId);

            // Buscar dados do arquivo de sincronização
            const syncData = await FileService.readSyncFile();
            console.log('📄 Dados do arquivo de sincronização:', syncData);

            // Se o cycleId começa com "Linha", é uma leitura de linha
            // Precisamos buscar um ciclo sincronizado que corresponda
            let cycleData: any = null;

            if (cycleId.startsWith('Linha')) {
                // Extrair número da linha
                const lineNumber = parseInt(cycleId.replace('Linha ', ''));
                console.log('📊 Buscando ciclo para linha:', lineNumber);

                // Buscar um ciclo que tenha dados da linha correspondente
                // Por enquanto, vamos pegar o primeiro ciclo disponível e simular dados baseados na linha
                cycleData = syncData.find((cycle: any) => {
                    // Verificar se o ciclo tem estágios que correspondem à linha
                    const stages = cycle.etapas || cycle.stages || [];
                    return stages.length > 0; // Por enquanto, pegar qualquer ciclo com estágios
                });

                if (cycleData) {
                    console.log('✅ Ciclo encontrado para linha:', lineNumber);
                    // Modificar o ID para refletir a linha
                    cycleData = {
                        ...cycleData,
                        ciclo_id: `Linha_${lineNumber}_Ciclo`,
                        lineNumber: lineNumber
                    };
                }
            } else {
                // Busca direta por ID do ciclo
                cycleData = syncData.find((cycle: any) => {
                    const cycleIdFromFile = cycle.ciclo_id || cycle.cycleId || cycle.id;
                    console.log('🔍 Comparando:', cycleIdFromFile, 'com', cycleId);
                    return cycleIdFromFile === cycleId;
                });
            }

            console.log('✅ Ciclo encontrado:', cycleData);

            if (cycleData) {
                // Converter dados do formato do arquivo para CycleDetail
                const detail: CycleDetail = {
                    id: (cycleData as any).ciclo_id || (cycleData as any).cycleId || (cycleData as any).id,
                    start: new Date((cycleData as any).data_inicio || (cycleData as any).startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    end: new Date((cycleData as any).data_fim || (cycleData as any).endTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    steps: ((cycleData as any).etapas || (cycleData as any).stages || []).length,
                    synced: true, // Se está no arquivo de sync, está sincronizado
                    stages: ((cycleData as any).etapas || (cycleData as any).stages || []).map((stage: any, _index: number) => {
                        // Mapear estágios para ícones
                        const getStageIcon = (stageName: string): IconProps['name'] => {
                            switch (stageName) {
                                case 'EM FILA CARREGAMENTO':
                                case 'EM CARREGAMENTO':
                                    return 'home';
                                case 'TRANSITO CHEIO':
                                case 'TRÂNSITO CHEIO':
                                    return 'arrowUp';
                                case 'EM FILA BASCULAMENTO':
                                    return 'arrowRight';
                                case 'EM BASCULAMENTO':
                                    return 'violation';
                                case 'TRANSITO VAZIO':
                                case 'TRÂNSITO VAZIO':
                                    return 'arrowDown';
                                default:
                                    return 'home';
                            }
                        };

                        // Simular dados de GPS e velocidade baseados no estágio
                        const getStageData = (stageName: string) => {
                            switch (stageName) {
                                case 'EM CARREGAMENTO':
                                    return {
                                        speed: 0,
                                        gps: { lat: -23.55, lon: -46.63 },
                                        equipments: 'ESC-002 (Escavadeira)'
                                    };
                                case 'TRANSITO CHEIO':
                                case 'TRÂNSITO CHEIO':
                                    return {
                                        speed: Math.floor(Math.random() * 30) + 15,
                                        gps: { lat: -23.5502, lon: -46.631 },
                                        equipments: 'Em trânsito'
                                    };
                                case 'EM FILA BASCULAMENTO':
                                    return {
                                        speed: Math.floor(Math.random() * 5) + 1,
                                        gps: null,
                                        equipments: 'Aguardando basculamento'
                                    };
                                case 'EM BASCULAMENTO':
                                    return {
                                        speed: 0,
                                        gps: null,
                                        equipments: 'BAS-001 (Basculante)'
                                    };
                                case 'TRANSITO VAZIO':
                                case 'TRÂNSITO VAZIO':
                                    return {
                                        speed: Math.floor(Math.random() * 25) + 20,
                                        gps: { lat: -23.5508, lon: -46.634 },
                                        equipments: 'Retornando'
                                    };
                                default:
                                    return {
                                        speed: 0,
                                        gps: null,
                                        equipments: 'Equipamentos próximos'
                                    };
                            }
                        };

                        const stageName = stage.etapa || stage.stage;
                        const stageData = getStageData(stageName);

                        return {
                            name: stageName,
                            icon: getStageIcon(stageName),
                            speed: stageData.speed,
                            gps: stageData.gps,
                            equipments: stageData.equipments,
                            timestamp: new Date(stage.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        };
                    })
                };

                setCycleDetail(detail);
            } else {
                // Se não encontrar, deixar cycleDetail como null
                setCycleDetail(null);
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do ciclo:', error);
        } finally {
            setLoading(false);
        }
    }, [cycleId]);

    useEffect(() => {
        loadCycleDetail();
    }, [loadCycleDetail]);

    if (loading) {
        return (
            <Box flex={1} bg="gray5" justifyContent="center" alignItems="center">
                <Text color="grayBlack" fontSize={18}>Carregando detalhes...</Text>
            </Box>
        );
    }

    if (!cycleDetail) {
        return (
            <Box flex={1} bg="gray5" justifyContent="center" alignItems="center" p="s20">
                <Box mb="s16">
                    <Icon name="warning" size={64} color="error" />
                </Box>
                <Text color="grayBlack" fontSize={18} textAlign="center" mb="s8">
                    Ciclo não encontrado
                </Text>
                <Text color="gray1" fontSize={14} textAlign="center" mb="s16">
                    {cycleId.startsWith('Linha')
                        ? 'Esta leitura ainda não foi processada em um ciclo completo. Execute simulações e force a sincronização para gerar ciclos.'
                        : 'O ciclo especificado não foi encontrado no arquivo de sincronização.'
                    }
                </Text>
                <Button
                    title="Voltar"
                    onPress={() => navigation.goBack()}
                    mt="s16"
                />
            </Box>
        );
    }

    return (
        <Box flex={1} bg="gray5">
            {/* Header */}
            <Box
                bg="grayWhite"
                flexDirection="row"
                alignItems="center"
                p="s16"
                borderBottomWidth={1}
                borderBottomColor="gray4"
            >
                <Icon name="arrowLeft" size={24} color="grayBlack" onPress={() => navigation.goBack()} />

                <Text ml="s12" color="grayBlack" fontSize={20} fontWeight="bold">
                    Detalhes do Ciclo
                </Text>
            </Box>

            <ScrollView>
                {/* Card superior */}
                <Box bg="grayWhite" borderRadius="s16" mt="s20" mx="s16" mb="s16" p="s20" flexDirection="row" alignItems="center" justifyContent="space-between">
                    {/* 3 colunas: Início, Fim, Etapas */}
                    <Box flexDirection="row" flex={1} justifyContent="space-between">
                        <Box alignItems="center" flex={1}>
                            <Text color="gray1" fontSize={15} mb="s4">Início</Text>
                            <Text color="grayBlack" fontWeight="bold" fontSize={22}>{cycleDetail.start}</Text>
                        </Box>
                        <Box alignItems="center" flex={1}>
                            <Text color="gray1" fontSize={15} mb="s4">Fim</Text>
                            <Text color="grayBlack" fontWeight="bold" fontSize={22}>{cycleDetail.end}</Text>
                        </Box>
                        <Box alignItems="center" flex={1}>
                            <Text color="gray1" fontSize={15} mb="s4">Etapas</Text>
                            <Text color="grayBlack" fontWeight="bold" fontSize={22}>{cycleDetail.steps}</Text>
                        </Box>
                    </Box>
                    {/* Status à direita */}
                    <Box ml="s16" bg="gray5" borderRadius="s12" width={48} height={48} alignItems="center" justifyContent="center" borderWidth={1} borderColor="gray4">
                        <Icon name={cycleDetail.synced ? 'checkRound' : 'errorRound'} size={28} color={cycleDetail.synced ? 'greenSuccess' : 'redError'} />
                    </Box>
                </Box>

                {/* Lista de etapas */}
                <Box flex={1} px="s16">
                    {cycleDetail.stages.map((stage, idx) => (
                        <Box
                            key={idx}
                            bg="grayWhite"
                            borderRadius="s12"
                            borderWidth={1}
                            borderColor="gray4"
                            mb="s16"
                            p="s16"
                        >
                            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                                <Box flexDirection="row" alignItems="center">
                                    <Icon name={stage.icon} size={28} color="gray1" />
                                    <Text ml="s12" fontWeight="bold" color="grayBlack" fontSize={19} textTransform="uppercase">
                                        {stage.name}
                                    </Text>
                                </Box>
                                {/* Valor à direita: velocidade ou horário */}
                                {typeof stage.speed === 'number' && stage.speed > 0 ? (
                                    <Text color="grayBlack" fontWeight="bold" fontSize={18}>{stage.speed} km/h</Text>
                                ) : (
                                    <Text color="gray1" fontWeight="bold" fontSize={18}>{stage.timestamp}</Text>
                                )}
                            </Box>
                            {/* Linha de detalhes técnicos */}
                            <Box flexDirection="row" alignItems="center" mt="s12">
                                <Icon name="arrowRight" size={16} color="gray1" />
                                <Text ml="s8" color="gray1" fontSize={15}>Velocidade</Text>
                                {stage.gps && (
                                    <>
                                        <Text mx="s8" color="gray3">|</Text>
                                        <Icon name="search" size={16} color="gray1" />
                                        <Text ml="s8" color="gray1" fontSize={15}>{stage.gps.lat.toFixed(4)}, {stage.gps.lon.toFixed(4)}</Text>
                                    </>
                                )}
                            </Box>
                            {/* Linha de equipamentos e timestamp */}
                            <Box flexDirection="row" alignItems="center" mt="s8" justifyContent="space-between">
                                <Box flexDirection="row" alignItems="center">
                                    <Icon name="violation" size={16} color="gray1" />
                                    <Text ml="s8" color="gray1" fontSize={15}>{stage.equipments}</Text>
                                </Box>
                                <Text color="gray1" fontSize={15}>{stage.timestamp}</Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </ScrollView>
        </Box>
    );
};