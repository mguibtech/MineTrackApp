import React from 'react';
import { Alert } from 'react-native';
import { Box, Button, Icon, Text } from '@components';
import { useSyncCiclos } from '../hooks/useSyncCiclos';

export const ExportButton = () => {
    const { mutateAsync } = useSyncCiclos();

    const handleExport = async () => {
        try {
            const path = await mutateAsync();
            if (path) {
                Alert.alert('Exportado com sucesso', `Arquivo salvo em:\n${path}`);
            } else {
                Alert.alert('Nada a exportar', 'Todos os ciclos já estão sincronizados.');
            }
        } catch (error) {
            Alert.alert('Erro ao exportar', (error as Error).message);
        }
    };

    return (
        <Button
            onPress={handleExport}
            width="100%"
            height={56}
            borderRadius="s16"
            preset="mining"
            accessibilityLabel="Exportar dados"
            title="Exportar Dados"
        >
            <Box flexDirection="row" alignItems="center" justifyContent="center">
                <Icon name="arrowUp" size={22} color="grayBlack" />
                <Text ml="s8" color="grayBlack" fontWeight="bold" fontSize={16} textTransform="uppercase">
                    Exportar Dados
                </Text>
            </Box>
        </Button>
    );
}; 