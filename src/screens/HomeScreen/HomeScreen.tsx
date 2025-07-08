import { Box, Button, Icon, Screen, Text } from "@components";
import { useHomeScreen } from './useHomeScreen';

export const HomeScreen = () => {
    const {
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
    } = useHomeScreen();

    return (
        <Screen>
            <Text color="grayWhite" fontSize={32} fontWeight="bold" mb="s32" textAlign="center">
                Simulador de Ciclo
            </Text>

            <Box bg="gray5" borderRadius="s20" p="s24" shadowColor="grayBlack" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.08} shadowRadius={8} elevation={2}>
                {/* Etapa Atual */}
                <Box mb="s4">
                    <Text color="grayBlack" fontWeight="bold" fontSize={16} textTransform="uppercase">
                        ETAPA ATUAL
                    </Text>
                </Box>
                <Box flexDirection="row" alignItems="center" mb="s12">
                    <Icon name={getStageIcon()} size={32} color="grayBlack" />
                    <Text color="grayBlack" fontSize={22} fontWeight="bold" ml="s12" textTransform="uppercase">
                        {currentStage.replace('EM ', '')}
                    </Text>
                </Box>
                <Box height={1} bg="gray4" my="s8" borderRadius="s8" />
                {/* Velocidade */}
                <Box mb="s4">
                    <Text color="grayBlack" fontWeight="bold" fontSize={16} textTransform="uppercase">
                        VELOCIDADE ATUAL
                    </Text>
                </Box>
                <Box flexDirection="row" alignItems="center" mb="s12">
                    <Icon name={getSpeedIcon()} size={32} color="grayBlack" />
                    <Text color="grayBlack" fontSize={22} fontWeight="bold" ml="s12" textTransform="uppercase">
                        {currentSpeed} km/h
                    </Text>
                </Box>
                <Box height={1} bg="gray4" my="s8" borderRadius="s8" />
                {/* Equipamento */}
                <Box mb="s4">
                    <Text color="grayBlack" fontWeight="bold" fontSize={16} textTransform="uppercase">
                        EQUIPAMENTO DE CARGA
                    </Text>
                </Box>
                <Box flexDirection="row" alignItems="center" mb="s12">
                    <Icon name={getEquipmentIcon()} size={32} color="grayBlack" />
                    <Text color="grayBlack" fontSize={22} fontWeight="bold" ml="s12" textTransform="uppercase">
                        {loadingEquipment}
                    </Text>
                </Box>
                <Box height={1} bg="gray4" my="s8" borderRadius="s8" />
                {/* Ponto de Basculamento */}
                <Box mb="s4">
                    <Text color="grayBlack" fontWeight="bold" fontSize={16} textTransform="uppercase">
                        PONTO DE BASCULAMENTO
                    </Text>
                </Box>
                <Box flexDirection="row" alignItems="center" mb="s12">
                    <Icon name={getDumpIcon()} size={32} color="grayBlack" />
                    <Text color="grayBlack" fontSize={22} fontWeight="bold" ml="s12" textTransform="uppercase">
                        {dumpPoint}
                    </Text>
                </Box>
                <Box height={1} bg="gray4" my="s8" borderRadius="s8" />
                {/* Sincronização */}
                <Box mb="s4">
                    <Text color="grayBlack" fontWeight="bold" fontSize={16} textTransform="uppercase">
                        SINCRONIZADO
                    </Text>
                </Box>
                <Box flexDirection="row" alignItems="center">
                    <Icon name={getSyncIcon()} size={32} color={isSynchronized ? 'greenSuccess' : 'redError'} />
                    <Text fontSize={22} fontWeight="bold" ml="s12" textTransform="uppercase" color={isSynchronized ? 'greenSuccess' : 'redError'}>
                        {isSynchronized ? 'SINCRONIZADO' : `${pendingCycles} PENDENTES`}
                    </Text>
                </Box>
            </Box>

            <Button
                title={isSimulating ? "SIMULANDO..." : "SIMULAR LEITURA"}
                preset="mining"
                loading={isSimulating}
                disabled={isSimulating}
                onPress={handleSimulateReading}
                mt="s32"
            />
        </Screen >
    );
};