import React, { useState, useEffect } from "react";
import { Switch, Alert } from "react-native";
import { Screen, Box, Text, TouchableOpacityBox, Button } from "@components";
import { StorageService } from "@services";
import { FileService } from "@services";

export const SettingsScreen = () => {
    const [networkAvailable, setNetworkAvailable] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [syncFileInfo, setSyncFileInfo] = useState<{
        exists: boolean;
        path: string;
        size?: number;
        lineCount?: number;
    } | null>(null);
    const [syncStatus, _setSyncStatus] = useState<{
        isOnline: boolean;
        pendingCycles: number;
        lastSyncTime?: Date;
        syncedCycles: number;
    } | null>(null);

    const simulationFile = "simulacao.jsonl";

    useEffect(() => {
        loadSyncInfo();
        const interval = setInterval(loadSyncInfo, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadSyncInfo = async () => {
        try {
            const fileInfo = await FileService.getSyncFileInfo();
            setSyncFileInfo(fileInfo);
        } catch (error) {
            console.error('Erro ao carregar informações do arquivo:', error);
        }
    };

    const handleClearData = async () => {
        Alert.alert(
            "Limpar Dados",
            "Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Limpar",
                    style: "destructive",
                    onPress: async () => {
                        setIsClearing(true);
                        try {
                            await StorageService.clearAllData();
                            await FileService.clearSyncFile();
                            await loadSyncInfo();
                            Alert.alert("Sucesso", "Todos os dados foram limpos com sucesso!");
                        } catch (error) {
                            Alert.alert("Erro", "Erro ao limpar dados: " + (error as Error).message);
                        } finally {
                            setIsClearing(false);
                        }
                    },
                },
            ]
        );
    };

    const handleForceSync = async () => {
        try {
            // Aqui você poderia chamar o SyncService para forçar sincronização
            Alert.alert("Sincronização", "Sincronização forçada iniciada");
        } catch (error) {
            Alert.alert("Erro", "Erro ao forçar sincronização: " + (error as Error).message);
        }
    };

    return (
        <Screen>
            <Text preset="headingLarge" color="grayBlack" mb="s32">
                Configurações
            </Text>

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

            {/* Status de Sincronização */}
            <Text preset="paragraphLarge" color="grayBlack" mb="s8" semibold>
                Status de Sincronização
            </Text>
            <Box bg="gray5" borderRadius="s12" p="s16" mb="s24">
                <Box flexDirection="row" justifyContent="space-between" mb="s8">
                    <Text preset="paragraphMedium" color="grayBlack">
                        Status da Rede:
                    </Text>
                    <Text preset="paragraphMedium" color={networkAvailable ? "greenSuccess" : "redError"}>
                        {networkAvailable ? "Online" : "Offline"}
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

            {/* Rede Disponível */}
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s24">
                <Text preset="paragraphLarge" color="grayBlack" semibold>
                    Rede Disponível
                </Text>
                <Switch
                    value={networkAvailable}
                    onValueChange={setNetworkAvailable}
                    trackColor={{ false: "#E1E1E1", true: "#636363" }}
                    thumbColor={networkAvailable ? "#fff" : "#fff"}
                />
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