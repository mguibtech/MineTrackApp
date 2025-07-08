import React from 'react';
import { FlatList } from 'react-native';
import { Box, Text, Button, Icon } from '@components';
import { cycles, ItemHistory } from './components/ItemHistory';


export const HistoryScreen = () => {

    return (
        <Box flex={1}>
            {/* Título fixo */}
            <Box
                bg="background"
                pt="s40"
                pb="s16"
                px="s20"
                borderBottomWidth={1}
                borderBottomColor="gray4"
                zIndex={2}
            >
                <Text
                    color="grayWhite"
                    fontSize={24}
                    fontWeight="bold"
                    textAlign="center"
                    textTransform="uppercase"
                    letterSpacing={1}
                >
                    Histórico de Ciclos
                </Text>
            </Box>
            {/* Lista de ciclos */}
            <Box flex={1} px="s20" pt="s16" pb="s32">
                <FlatList
                    data={cycles}
                    renderItem={({ item }) => <ItemHistory item={item} />}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 96 }}
                />
            </Box>
            {/* Botão fixo exportar */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                alignItems="center"
                py="s20"
                px="s20"
                zIndex={3}
            >
                <Button
                    title="EXPORTAR DADOS"
                    preset="mining"
                    width="100%"
                    height={56}
                    borderRadius="s16"
                    onPress={() => { }}
                    accessibilityLabel="Exportar dados"
                >
                    <Box flexDirection="row" alignItems="center" justifyContent="center">
                        <Icon name="arrowUp" size={22} color="grayBlack" />
                        <Text ml="s8" color="grayBlack" fontWeight="bold" fontSize={16} textTransform="uppercase">
                            EXPORTAR DADOS
                        </Text>
                    </Box>
                </Button>
            </Box>
        </Box>
    );
};