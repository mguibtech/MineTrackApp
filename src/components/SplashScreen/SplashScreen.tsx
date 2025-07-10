import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated, Text } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

interface SplashScreenProviderProps {
    children: React.ReactNode;
}

export const SplashScreenProvider: React.FC<SplashScreenProviderProps> = ({ children }) => {
    useEffect(() => {
        // Esconder a splash screen nativa apenas no Android
        if (Platform.OS === 'android') {
            const hideSplash = () => {
                try {
                    SplashScreen.hide();
                } catch (error) {
                    console.log('Erro ao esconder splash screen:', error);
                }
            };

            // Aguardar um pouco para garantir que o app carregou completamente
            const timer = setTimeout(hideSplash, 2000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, []);

    return <>{children}</>;
};

export const SplashScreenComponent: React.FC = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animação simples de fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.logoContainer}>
                <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>MT</Text>
                </View>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.appName}>Minetrack</Text>
                <Text style={styles.appSubtitle}>Sistema de Rastreamento</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#014955',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logoPlaceholder: {
        width: 120,
        height: 67,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    textContainer: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    appSubtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
        fontWeight: '300',
    },
}); 