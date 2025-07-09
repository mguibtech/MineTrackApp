
import { Screen, Box, Text, TouchableOpacityBox, Button } from "@components";

import { useSettingsScreen } from "./useSettingsScreen";

export const SettingsScreen = () => {
    const {
        isClearing,
        syncFileInfo,
        syncStatus,
        handleClearData,
        handleForceSync,
        getNetworkStatusColor,
        getNetworkStatusText,
        networkStatus,
        simulationFile,
    } = useSettingsScreen();

    return (
        <Screen scrollable>
            <Text preset="headingLarge" color="grayBlack" mb="s32">
                Configurações
            </Text>

            {/* Status de Rede */}
            <Text preset="paragraphLarge" color="grayBlack" mb="s8" semibold>
                Status de Rede
            </Text>
            <Box bg="gray5" borderRadius="s12" p="s16" mb="s24">
                <Box flexDirection="row" justifyContent="space-between" mb="s8">
                    <Text preset="paragraphMedium" color="grayBlack">
                        Conectividade:
                    </Text>
                    <Text preset="paragraphMedium" color={getNetworkStatusColor()}>
                        {getNetworkStatusText()}
                    </Text>
                </Box>
                <Box flexDirection="row" justifyContent="space-between" mb="s8">
                    <Text preset="paragraphMedium" color="grayBlack">
                        Tipo de Rede:
                    </Text>
                    <Text preset="paragraphMedium" color="grayBlack">
                        {networkStatus.type || "Desconhecido"}
                    </Text>
                </Box>
                <Box flexDirection="row" justifyContent="space-between">
                    <Text preset="paragraphMedium" color="grayBlack">
                        Internet Acessível:
                    </Text>
                    <Text preset="paragraphMedium" color={networkStatus.isInternetReachable ? "greenSuccess" : "redError"}>
                        {networkStatus.isInternetReachable ? "Sim" : "Não"}
                    </Text>
                </Box>
            </Box>

            {/* Status de Sincronização */}
            <Text preset="paragraphLarge" color="grayBlack" mb="s8" semibold>
                Status de Sincronização
            </Text>
            <Box bg="gray5" borderRadius="s12" p="s16" mb="s24">
                <Box flexDirection="row" justifyContent="space-between" mb="s8">
                    <Text preset="paragraphMedium" color="grayBlack">
                        Status da Rede:
                    </Text>
                    <Text preset="paragraphMedium" color={syncStatus?.isOnline ? "greenSuccess" : "redError"}>
                        {syncStatus?.isOnline ? "Online" : "Offline"}
                    </Text>
                </Box>
                <Box flexDirection="row" justifyContent="space-between" mb="s8">
                    <Text preset="paragraphMedium" color="grayBlack">
                        Ciclos Pendentes:
                    </Text>
                    <Text preset="paragraphMedium" color="grayBlack">
                        {syncStatus?.pendingCycles || 0}
                    </Text>
                </Box>
                <Box flexDirection="row" justifyContent="space-between" mb="s8">
                    <Text preset="paragraphMedium" color="grayBlack">
                        Ciclos Sincronizados:
                    </Text>
                    <Text preset="paragraphMedium" color="grayBlack">
                        {syncStatus?.syncedCycles || 0}
                    </Text>
                </Box>
                {syncStatus?.lastSyncTime && (
                    <Box flexDirection="row" justifyContent="space-between">
                        <Text preset="paragraphMedium" color="grayBlack">
                            Última Sincronização:
                        </Text>
                        <Text preset="paragraphMedium" color="grayBlack">
                            {syncStatus.lastSyncTime.toLocaleTimeString()}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Arquivo de Simulação */}
            <Text preset="paragraphLarge" color="grayBlack" mb="s8" semibold>
                Arquivo de Simulação
            </Text>
            <Box flexDirection="row" alignItems="center" mb="s32">
                <Box
                    flex={1}
                    borderWidth={1}
                    borderColor="gray3"
                    borderRadius="s12"
                    p="s14"
                    bg="grayWhite"
                    mr="s8"
                >
                    <Text preset="paragraphMedium" color="grayBlack">
                        {simulationFile}
                    </Text>
                </Box>
                <TouchableOpacityBox p="s8">
                    <Text fontSize={20}>✏️</Text>
                </TouchableOpacityBox>
            </Box>

            {/* Arquivo de Sincronização */}
            <Text preset="paragraphLarge" color="grayBlack" mb="s8" semibold>
                Arquivo de Sincronização
            </Text>
            <Box bg="gray5" borderRadius="s12" p="s16" mb="s24">
                {syncFileInfo ? (
                    <>
                        <Box flexDirection="row" justifyContent="space-between" mb="s8">
                            <Text preset="paragraphMedium" color="grayBlack">
                                Arquivo:
                            </Text>
                            <Text preset="paragraphMedium" color={syncFileInfo.exists ? "greenSuccess" : "redError"}>
                                {syncFileInfo.exists ? "Existe" : "Não existe"}
                            </Text>
                        </Box>
                        {syncFileInfo.exists && (
                            <>
                                <Box flexDirection="row" justifyContent="space-between" mb="s8">
                                    <Text preset="paragraphMedium" color="grayBlack">
                                        Tamanho:
                                    </Text>
                                    <Text preset="paragraphMedium" color="grayBlack">
                                        {syncFileInfo.size ? `${(syncFileInfo.size / 1024).toFixed(2)} KB` : "N/A"}
                                    </Text>
                                </Box>
                                <Box flexDirection="row" justifyContent="space-between">
                                    <Text preset="paragraphMedium" color="grayBlack">
                                        Linhas:
                                    </Text>
                                    <Text preset="paragraphMedium" color="grayBlack">
                                        {syncFileInfo.lineCount || 0}
                                    </Text>
                                </Box>
                            </>
                        )}
                    </>
                ) : (
                    <Text preset="paragraphMedium" color="grayBlack">
                        Carregando informações...
                    </Text>
                )}
            </Box>

            {/* Botões de ação */}
            <Box mb="s16">
                <Button
                    title="FORÇAR SINCRONIZAÇÃO"
                    preset="primary"
                    backgroundColor="primary"
                    borderRadius="s12"
                    height={56}
                    alignItems="center"
                    justifyContent="center"
                    onPress={handleForceSync}
                    disabled={!networkStatus.isConnected || !networkStatus.isInternetReachable}
                />
            </Box>

            <Button
                title={isClearing ? "LIMPANDO..." : "REDEFINIR LEITURAS"}
                preset="primary"
                backgroundColor="grayBlack"
                borderRadius="s12"
                height={56}
                alignItems="center"
                justifyContent="center"
                loading={isClearing}
                disabled={isClearing}
                onPress={handleClearData}
            />
        </Screen>
    );
};