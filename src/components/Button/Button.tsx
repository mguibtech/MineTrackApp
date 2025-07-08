import { Text, TouchableOpacityBox, TouchableOpacityBoxProps, ActivityIndicator, Box } from "@components";

import { buttonPresets } from "./buttonPressets";

export type ButtonPreset = 'primary' | 'outline' | 'outlineWhite' | 'mining'


interface ButtonProps extends TouchableOpacityBoxProps {
    title: string;
    loading?: boolean;
    preset?: ButtonPreset;
    disabled?: boolean;
    rightComponent?: React.ReactNode;
}

export function Button({
    title,
    loading,
    preset = 'primary',
    disabled,
    rightComponent,
    ...touchableOpacityBoxProps
}: ButtonProps) {

    const buttonPreset = buttonPresets[preset][disabled ? 'disabled' : 'default'];

    return (
        <TouchableOpacityBox
            disabled={disabled || loading}
            paddingHorizontal="s20"
            height={50}
            alignItems="center"
            justifyContent="center"
            borderRadius="s8"
            {...buttonPreset.container}
            {...touchableOpacityBoxProps}
        >
            {loading ? (
                <ActivityIndicator color={buttonPreset.content} />) :
                (
                    <Box
                        borderColor="errorLight"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Text preset="paragraphMedium" color={buttonPreset.content}>{title}</Text>
                        <Box ml="s10">
                            {rightComponent}
                        </Box>
                    </Box>
                )
            }

        </TouchableOpacityBox >
    )
}