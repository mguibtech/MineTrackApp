import { Box, Text, Button, Icon } from "@components";
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from "@routes";

export interface ExportLogItem {
    data: string;
    quantidade: number;
    ciclos: string[];
}

export interface LineReadingItem {
    id: string;
    data: string;
    quantidade: number;
    ciclos: string[];
    lineNumber: number;
    timestamp: number;
    processed: boolean;
}

export function ItemHistory({ item }: { item: LineReadingItem }) {
    const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

    // Pegar o primeiro ciclo da lista para exibir como exemplo
    const firstCycleId = item.ciclos[0] || 'Linha 0';

    // Formatar a data
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) + ' ' + date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

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
                        {firstCycleId}
                    </Text>
                    <Box flexDirection="row" alignItems="center">
                        <Icon
                            name={item.processed ? "checkRound" : "warning"}
                            size={20}
                            color={item.processed ? "greenSuccess" : "error"}
                        />
                        <Text
                            ml="s4"
                            color={item.processed ? "greenSuccess" : "error"}
                            fontWeight="bold"
                            fontSize={18}
                        >
                            {item.processed ? "Processado" : "Pendente"}
                        </Text>
                    </Box>
                </Box>
                {/* Linha: data de leitura */}
                <Text color="grayBlack" fontSize={18} mb="s4">
                    {formatDate(item.data)}
                </Text>
                {/* Linha: quantidade de leituras */}
                <Text color="grayBlack" fontSize={18} mb="s8">
                    {item.quantidade} leitura{item.quantidade > 1 ? 's' : ''} realizada{item.quantidade > 1 ? 's' : ''}
                </Text>
            </Box>
            {/* Coluna direita: botão */}
            <Button
                title="Ver detalhes"
                onPress={() => navigation.navigate('DetailScreen', { cycleId: firstCycleId })}
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