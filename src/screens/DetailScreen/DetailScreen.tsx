import React from 'react';
import { Box, Text, Icon } from '@components';
import { useRoute } from '@react-navigation/native';
import type { IconProps } from '../../components/Icons/Icon';
import type { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '@routes';
import { ScrollView } from 'react-native';

// Mock de dados do ciclo
const cycles = [
    {
        id: 'CAM-001',
        start: '08:00',
        end: '08:25',
        steps: 6,
        synced: true,
        stages: [
            {
                name: 'EM CARREGAMENTO',
                icon: 'home' as IconProps['name'],
                speed: 0,
                gps: { lat: 36.12, lon: -115.17 },
                equipments: 'Equipamentos próximos',
                timestamp: '08:02',
            },
            {
                name: 'TRANSITO CHEIO',
                icon: 'home' as IconProps['name'],
                speed: 32,
                gps: { lat: 36.10, lon: -115.20 },
                timestamp: '—',
            },
            {
                name: 'EM FILA BASCULAMENTO',
                icon: 'arrowRight' as IconProps['name'],
                speed: 2,
                gps: null,
                timestamp: '08:15',
            },
            {
                name: 'EM BASCULAMENTO',
                icon: 'violation' as IconProps['name'],
                speed: 0,
                gps: null,
                timestamp: '08:18',
            },
            {
                name: 'TRANSITO VAZIO',
                icon: 'home' as IconProps['name'],
                speed: 28,
                gps: { lat: 36.11, lon: -115.21 },
                timestamp: '28:23',
            },
        ],
    },
    // ...adicione outros ciclos se quiser
];

export const DetailScreen = () => {
    const route = useRoute<RouteProp<AppStackParamList, 'DetailScreen'>>();
    const { cycleId } = route.params;
    const cycle = cycles.find(c => c.id === cycleId) ?? cycles[0];

    return (
        <ScrollView>
            <Box flex={1} bg="gray5">
                {/* Card superior */}
                <Box bg="grayWhite" borderRadius="s16" mt="s20" mx="s16" mb="s16" p="s20" flexDirection="row" alignItems="center" justifyContent="space-between">
                    {/* 3 colunas: Início, Fim, Etapas */}
                    <Box flexDirection="row" flex={1} justifyContent="space-between">
                        <Box alignItems="center" flex={1}>
                            <Text color="gray1" fontSize={15} mb="s4">Início</Text>
                            <Text color="grayBlack" fontWeight="bold" fontSize={22}>{cycle.start}</Text>
                        </Box>
                        <Box alignItems="center" flex={1}>
                            <Text color="gray1" fontSize={15} mb="s4">Fim</Text>
                            <Text color="grayBlack" fontWeight="bold" fontSize={22}>{cycle.end}</Text>
                        </Box>
                        <Box alignItems="center" flex={1}>
                            <Text color="gray1" fontSize={15} mb="s4">Etapas</Text>
                            <Text color="grayBlack" fontWeight="bold" fontSize={22}>{cycle.steps}</Text>
                        </Box>
                    </Box>
                    {/* Status à direita */}
                    <Box ml="s16" bg="gray5" borderRadius="s12" width={48} height={48} alignItems="center" justifyContent="center" borderWidth={1} borderColor="gray4">
                        <Icon name={cycle.synced ? 'checkRound' : 'errorRound'} size={28} color={cycle.synced ? 'greenSuccess' : 'redError'} />
                    </Box>
                </Box>

                {/* Lista de etapas */}
                <Box flex={1} px="s16">
                    {cycle.stages.map((stage, idx) => (
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
                                        <Text ml="s8" color="gray1" fontSize={15}>{stage.gps.lat}, {stage.gps.lon}</Text>
                                    </>
                                )}
                            </Box>
                            {/* Linha de equipamentos e timestamp */}
                            <Box flexDirection="row" alignItems="center" mt="s8" justifyContent="space-between">
                                <Box flexDirection="row" alignItems="center">
                                    <Icon name="violation" size={16} color="gray1" />
                                    <Text ml="s8" color="gray1" fontSize={15}>{stage.equipments || 'Equipamentos próximos'}</Text>
                                </Box>
                                <Text color="gray1" fontSize={15}>{stage.timestamp}</Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </ScrollView>
    );
};