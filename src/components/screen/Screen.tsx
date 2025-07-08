import React, { forwardRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { Box, TouchableOpacityBox } from "@components";
import { Icon, Text } from "@components";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAppSafeArea, useAppTheme } from "@hooks";

import { ScrollViewContainer, ViewContainer } from "./components/ScreenContainer";

interface ScreenProps {
    children: React.ReactNode;
    canGoBack?: boolean;
    scrollable?: boolean;
    photo?: boolean;
}

export const Screen = forwardRef<ScrollView, ScreenProps>(({ children, canGoBack = false, scrollable = false }, ref) => {
    const { top, bottom } = useAppSafeArea();
    const { colors } = useAppTheme();
    const navigation = useNavigation();

    const Container = scrollable ? ScrollViewContainer : ViewContainer;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Container ref={ref} backgroundColor={colors.background}>
                <Box
                    paddingBottom="s24"
                    paddingHorizontal="s24"
                    style={{ paddingTop: top, paddingBottom: bottom }}
                    bg="background">
                    {canGoBack && (
                        <TouchableOpacityBox onPress={navigation.goBack} mb="s24" flexDirection="row" alignItems="center">
                            <Icon name="arrowLeft" color="primary" />
                            <Text preset="paragraphMedium" semibold ml="s8">Voltar</Text>
                        </TouchableOpacityBox>
                    )}
                    {children}
                </Box>
            </Container>
        </KeyboardAvoidingView>
    )
});
