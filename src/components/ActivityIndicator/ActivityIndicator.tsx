import React from "react";
import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps as RNActivityIndicatorProps } from "react-native";

import { useAppTheme } from "@hooks";
import { ThemeColors } from "@theme";


interface Props extends Omit<RNActivityIndicatorProps, 'color'> {
    color: ThemeColors;
}

export function ActivityIndicator({ color }: Props) {
    const { colors } = useAppTheme();
    return <RNActivityIndicator color={colors[color]} />
}