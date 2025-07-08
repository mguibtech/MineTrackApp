import React, { forwardRef } from "react";
import { ScrollView, View, Platform } from "react-native";

interface ScrollViewContainerProps {
    children: React.ReactNode;
    backgroundColor: string;
}

export const ScrollViewContainer = forwardRef<ScrollView, ScrollViewContainerProps>(({ children, backgroundColor }, ref) => {
    return (
        <ScrollView
            ref={ref}
            keyboardShouldPersistTaps="handled"
            style={{ backgroundColor, flex: 1 }}
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: Platform.OS === 'ios' ? 20 : 30 // Padding aumentado para garantir espaço para o botão
            }}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            keyboardDismissMode="interactive"
        >
            {children}
        </ScrollView>
    )
});

export function ViewContainer({ children, backgroundColor }: ScrollViewContainerProps) {
    return (
        <View style={{ backgroundColor, flex: 1 }}>
            {children}
        </View>
    )
}

