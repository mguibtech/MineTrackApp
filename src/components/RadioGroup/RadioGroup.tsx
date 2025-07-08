import React from 'react';
import { Pressable } from 'react-native';

import { createBox, createText } from '@shopify/restyle';

import { Theme } from '@theme'; // ajuste para o caminho correto

const Box = createBox<Theme>();
const Text = createText<Theme>();

type Option = 'Apreensão' | 'Retenção' | 'Outros';

interface Props {
    value: Option;
    onChange: (value: Option) => void;
}

const options: Option[] = ['Apreensão', 'Retenção', 'Outros'];

export function RadioGroup({
    value,
    onChange,
}: Props) {

    return (
        <Box mt='s12'>
            <Text fontSize={16} fontWeight="bold" color="gray1" mb='s8'>
                Medida Administrativa:
            </Text>

            <Box flexDirection="row" alignItems="center" justifyContent="space-between" gap="s12">
                {options.map((option) => {
                    const isSelected = value === option;

                    return (
                        <Pressable
                            key={option}
                            onPress={() => onChange(option)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                        >
                            <Box
                                width={20}
                                height={20}
                                borderRadius='s20'
                                borderWidth={2}
                                borderColor="primary"
                                alignItems="center"
                                justifyContent="center"
                            >
                                {isSelected && (
                                    <Box
                                        width={10}
                                        height={10}
                                        borderRadius='s8'
                                        backgroundColor="primary"
                                    />
                                )}
                            </Box>
                            <Text color="primary" fontSize={16}>
                                {option}
                            </Text>
                        </Pressable>
                    );
                })}
            </Box>
        </Box>
    );
};
