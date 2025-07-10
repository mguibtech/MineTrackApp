import React from 'react';
import { Box, Text, Icon } from '@components';
import { useNetworkStatus } from '@hooks';

interface SyncStatusIndicatorProps {
    pendingCycles: number;
    lastSyncTime?: Date;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
    pendingCycles,
    lastSyncTime,
}) => {
    const networkStatus = useNetworkStatus();

    const getStatusColor = () => {
        if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
            return 'error';
        }
        if (pendingCycles > 0) {
            return 'error';
        }
        return 'greenSuccess';
    };

    const getStatusText = () => {
        if (!networkStatus.isConnected) {
            return 'Offline';
        }
        if (!networkStatus.isInternetReachable) {
            return 'Sem Internet';
        }
        if (pendingCycles > 0) {
            return `${pendingCycles} pendente${pendingCycles > 1 ? 's' : ''}`;
        }
        return 'Sincronizado';
    };

    const getStatusIcon = (): "errorRound" | "warning" | "checkRound" => {
        if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
            return 'errorRound';
        }
        if (pendingCycles > 0) {
            return 'warning';
        }
        return 'checkRound';
    };

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            bg="grayWhite"
            borderRadius="s12"
            p="s12"
            mb="s16"
        >
            <Box flexDirection="row" alignItems="center">
                <Icon
                    name={getStatusIcon()}
                    size={20}
                    color={getStatusColor()}
                />
                <Text
                    ml="s8"
                    color={getStatusColor()}
                    fontWeight="bold"
                    fontSize={16}
                >
                    {getStatusText()}
                </Text>
            </Box>

            {lastSyncTime && (
                <Text color="gray1" fontSize={12}>
                    {lastSyncTime.toLocaleTimeString()}
                </Text>
            )}
        </Box>
    );
}; 