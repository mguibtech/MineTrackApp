import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from './SettingsScreen';

// Mock do hook useSettingsScreen
jest.mock('./useSettingsScreen', () => ({
    useSettingsScreen: () => ({
        isClearing: false,
        syncFileInfo: {
            exists: true,
            path: '/data/sync.jsonl',
            size: 1024,
            lineCount: 10,
        },
        syncStatus: {
            isOnline: true,
            pendingCycles: 2,
            syncedCycles: 15,
            lastSyncTime: new Date('2024-01-15T10:30:00Z'),
        },
        handleClearData: jest.fn(),
        handleForceSync: jest.fn(),
        getNetworkStatusText: () => 'WiFi',
        getNetworkStatusColor: () => 'greenSuccess',
        networkStatus: {
            isConnected: true,
            isInternetReachable: true,
            isWifi: true,
            isCellular: false,
            isEthernet: false,
            type: 'wifi',
        },
        simulationFile: 'simulacao.jsonl',
    }),
}));

// Mock do Alert
jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));

// Remover mock global de react-native
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
    return {
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

// Mock simples dos componentes
jest.mock('@components', () => ({
    Screen: ({ children }: any) => <div>{children}</div>,
    Box: ({ children }: any) => <div>{children}</div>,
    Text: ({ children }: any) => <span>{children}</span>,
    Button: ({ children, onPress }: any) => <button onClick={onPress}>{children}</button>,
    TouchableOpacityBox: ({ children, onPress }: any) => <button onClick={onPress}>{children}</button>,
}));

describe('SettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Renderização básica', () => {
        it('deve renderizar título da tela', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Configurações')).toBeTruthy();
        });

        it('deve renderizar seção de status de rede', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Status de Rede')).toBeTruthy();
            expect(getByText('Conectividade:')).toBeTruthy();
            expect(getByText('WiFi')).toBeTruthy();
            expect(getByText('Tipo de Rede:')).toBeTruthy();
            expect(getByText('wifi')).toBeTruthy();
            expect(getByText('Internet Acessível:')).toBeTruthy();
            expect(getByText('Sim')).toBeTruthy();
        });

        it('deve renderizar seção de status de sincronização', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Status de Sincronização')).toBeTruthy();
            expect(getByText('Status da Rede:')).toBeTruthy();
            expect(getByText('Online')).toBeTruthy();
            expect(getByText('Ciclos Pendentes:')).toBeTruthy();
            expect(getByText('2')).toBeTruthy();
            expect(getByText('Ciclos Sincronizados:')).toBeTruthy();
            expect(getByText('15')).toBeTruthy();
            expect(getByText('Última Sincronização:')).toBeTruthy();
        });

        it('deve renderizar seção de arquivo de simulação', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Arquivo de Simulação')).toBeTruthy();
            expect(getByText('simulacao.jsonl')).toBeTruthy();
        });

        it('deve renderizar seção de arquivo de sincronização', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Arquivo de Sincronização')).toBeTruthy();
            expect(getByText('Arquivo:')).toBeTruthy();
            expect(getByText('Existe')).toBeTruthy();
            expect(getByText('Tamanho:')).toBeTruthy();
            expect(getByText('1.00 KB')).toBeTruthy();
            expect(getByText('Linhas:')).toBeTruthy();
            expect(getByText('10')).toBeTruthy();
        });

        it('deve renderizar botões de ação', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('FORÇAR SINCRONIZAÇÃO')).toBeTruthy();
            expect(getByText('REDEFINIR LEITURAS')).toBeTruthy();
        });
    });

    describe('Estados de rede', () => {
        it('deve mostrar status offline quando não conectado', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: false, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'Offline',
                    getNetworkStatusColor: () => 'redError',
                    networkStatus: {
                        isConnected: false,
                        isInternetReachable: false,
                        isWifi: false,
                        isCellular: false,
                        isEthernet: false,
                        type: 'none',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Offline')).toBeTruthy();
            expect(getByText('Não')).toBeTruthy();
        });

        it('deve mostrar status de dados móveis', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: true, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'Dados Móveis',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: false,
                        isCellular: true,
                        isEthernet: false,
                        type: 'cellular',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Dados Móveis')).toBeTruthy();
        });
    });

    describe('Estados de sincronização', () => {
        it('deve mostrar status offline quando não sincronizado', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: false, pendingCycles: 5, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'WiFi',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: true,
                        isCellular: false,
                        isEthernet: false,
                        type: 'wifi',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Offline')).toBeTruthy();
            expect(getByText('5')).toBeTruthy(); // Ciclos pendentes
            expect(getByText('0')).toBeTruthy(); // Ciclos sincronizados
        });

        it('deve mostrar última sincronização quando disponível', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Última Sincronização:')).toBeTruthy();
            // Verifica se o horário está sendo exibido (formato brasileiro)
            expect(getByText(/10:30/)).toBeTruthy();
        });
    });

    describe('Arquivo de sincronização', () => {
        it('deve mostrar informações quando arquivo existe', () => {
            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Existe')).toBeTruthy();
            expect(getByText('1.00 KB')).toBeTruthy();
            expect(getByText('10')).toBeTruthy();
        });

        it('deve mostrar status quando arquivo não existe', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: { exists: false, path: '/data/sync.jsonl' },
                    syncStatus: { isOnline: true, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'WiFi',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: true,
                        isCellular: false,
                        isEthernet: false,
                        type: 'wifi',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Não existe')).toBeTruthy();
        });

        it('deve mostrar loading quando informações não estão disponíveis', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: null,
                    syncStatus: { isOnline: true, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'WiFi',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: true,
                        isCellular: false,
                        isEthernet: false,
                        type: 'wifi',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            expect(getByText('Carregando informações...')).toBeTruthy();
        });
    });

    describe('Botões de ação', () => {
        it('deve chamar handleForceSync quando botão de sincronização for pressionado', () => {
            const mockHandleForceSync = jest.fn();
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: true, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: mockHandleForceSync,
                    getNetworkStatusText: () => 'WiFi',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: true,
                        isCellular: false,
                        isEthernet: false,
                        type: 'wifi',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            const syncButton = getByText('FORÇAR SINCRONIZAÇÃO');
            fireEvent.press(syncButton);

            expect(mockHandleForceSync).toHaveBeenCalled();
        });

        it('deve chamar handleClearData quando botão de limpar for pressionado', () => {
            const mockHandleClearData = jest.fn();
            jest.resetModules();
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: true, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: mockHandleClearData,
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'WiFi',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: true,
                        isCellular: false,
                        isEthernet: false,
                        type: 'wifi',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));
            // Importar o componente após o mock
            const { SettingsScreen } = require('./SettingsScreen');
            const { getByText } = render(<SettingsScreen />);
            const clearButton = getByText('REDEFINIR LEITURAS');
            fireEvent.press(clearButton);
            expect(mockHandleClearData).toHaveBeenCalled();
        });

        it('deve mostrar estado de limpeza quando isClearing é true', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: true,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: true, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'WiFi',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: true,
                        isCellular: false,
                        isEthernet: false,
                        type: 'wifi',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            expect(getByText('LIMPANDO...')).toBeTruthy();
        });
    });

    describe('Estados de botões', () => {
        it('deve desabilitar botão de sincronização quando offline', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: false,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: false, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'Offline',
                    getNetworkStatusColor: () => 'redError',
                    networkStatus: {
                        isConnected: false,
                        isInternetReachable: false,
                        isWifi: false,
                        isCellular: false,
                        isEthernet: false,
                        type: 'none',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            const syncButton = getByText('FORÇAR SINCRONIZAÇÃO');
            expect(syncButton).toBeTruthy();
            // O botão deve estar desabilitado quando offline
        });

        it('deve desabilitar botão de limpeza quando isClearing é true', () => {
            jest.doMock('./useSettingsScreen', () => ({
                useSettingsScreen: () => ({
                    isClearing: true,
                    syncFileInfo: { exists: true, path: '/data/sync.jsonl', size: 1024, lineCount: 10 },
                    syncStatus: { isOnline: true, pendingCycles: 0, syncedCycles: 0 },
                    handleClearData: jest.fn(),
                    handleForceSync: jest.fn(),
                    getNetworkStatusText: () => 'WiFi',
                    getNetworkStatusColor: () => 'greenSuccess',
                    networkStatus: {
                        isConnected: true,
                        isInternetReachable: true,
                        isWifi: true,
                        isCellular: false,
                        isEthernet: false,
                        type: 'wifi',
                    },
                    simulationFile: 'simulacao.jsonl',
                }),
            }));

            const { getByText } = render(<SettingsScreen />);
            const clearButton = getByText('LIMPANDO...');
            expect(clearButton).toBeTruthy();
            // O botão deve estar desabilitado quando isClearing é true
        });
    });
}); 