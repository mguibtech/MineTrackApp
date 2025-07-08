import { Box, Text, Button, Icon } from "@components";
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from "@routes";

export const cycles = [
    {
        id: 'CAM-001',
        status: 'synced',
        start: '08:00',
        end: '08:25',
        steps: 6,
    },
    {
        id: 'CAM-002',
        status: 'pending',
        start: '07:30',
        end: '07:55',
        steps: 6,
    },
    {
        id: 'CAM-004',
        status: 'pending',
        start: '06:15',
        end: '06:50',
        steps: 6,
    },
    {
        id: 'CAM-004',
        status: 'synced',
        start: '05:00',
        end: '05:35',
        steps: 6,
    },
];

export function ItemHistory({ item }: { item: typeof cycles[0] }) {
    const navigation = useNavigation<StackNavigationProp<AppStackParamList, 'AppTabNavigation'>>();

    return (
        <Box
            bg="grayWhite"
            borderRadius="s16"
            p="s20"
            mb="s16"
            flexDirection="row"
            alignItems="center"
            shadowColor="grayBlack"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.06}
            shadowRadius={4}
            elevation={1}
        >
            {/* Coluna esquerda: infos */}
            <Box flex={1} justifyContent="center">
                {/* Linha: título + status */}
                <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s8">
                    <Text fontWeight="bold" color="grayBlack" fontSize={26}>
                        {item.id}
                    </Text>
                    <Box flexDirection="row" alignItems="center">
                        <Icon
                            name={item.status === 'synced' ? 'checkRound' : 'errorRound'}
                            size={20}
                            color={item.status === 'synced' ? 'greenSuccess' : 'redError'}
                        />
                        <Text
                            ml="s4"
                            color={item.status === 'synced' ? 'greenSuccess' : 'redError'}
                            fontWeight="bold"
                            fontSize={18}
                        >
                            {item.status === 'synced' ? 'Sincronizado' : 'Pendente'}
                        </Text>
                    </Box>
                </Box>
                {/* Linha: horários */}
                <Text color="grayBlack" fontSize={18} mb="s4">
                    {item.start} → {item.end}
                </Text>
                {/* Linha: etapas */}
                <Text color="grayBlack" fontSize={18} mb="s8">
                    {item.steps} etapas
                </Text>
            </Box>
            {/* Coluna direita: botão */}
            <Button
                title="Ver detalhes"
                onPress={() => navigation.navigate('DetailScreen', { cycleId: item.id })}
                preset="outline"
                borderColor="grayBlack"
                borderRadius="s8"
                height={48}
                width={160}
                style={{ borderWidth: 2 }}
                ml="s12"
            />
        </Box>
    );
}