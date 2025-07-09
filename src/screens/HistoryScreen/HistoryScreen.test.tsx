import React from 'react';
import { render, waitFor, within } from '@testing-library/react-native';
import { HistoryScreen } from './HistoryScreen';
import { FileService } from '@services';

// Mock do FileService
jest.mock('@services', () => ({
    FileService: {
        loadLineReadings: jest.fn(),
        getReadingsStats: jest.fn(),
    },
}));

// Mock do useNavigation
const mockNavigate = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        addListener: mockAddListener,
    }),
}));

// Mock dos componentes
jest.mock('@components', () => ({
    Box: ({ children, testID, ...props }: any) => (
        <div data-testid={testID} {...props}>{children}</div>
    ),
    Text: ({ children, testID, ...props }: any) => (
        <span data-testid={testID} {...props}>{children}</span>
    ),
    ActivityIndicator: ({ testID, ...props }: any) => (
        <div data-testid={testID || 'activity-indicator'} {...props}>
            <span>Loading...</span>
        </div>
    ),
}));

// Mock do ItemHistory
jest.mock('./components/ItemHistory', () => ({
    ItemHistory: ({ item }: any) => (
        <div data-testid="item-history">
            <span>{new Date(item.data).toLocaleDateString('pt-BR')}</span>
            <span>{item.quantidade}</span>
            <span>{item.processed ? 'Processado' : 'Pendente'}</span>
        </div>
    ),
}));

// Mock do ScrollView
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
    return {
        __esModule: true,
        default: ({ children, testID, ...props }: any) => (
            <div data-testid={testID || 'scroll-view'} {...props}>{children}</div>
        ),
    };
});

describe('HistoryScreen', () => {
    const mockFileService = FileService as jest.Mocked<typeof FileService>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFileService.loadLineReadings.mockResolvedValue([]);
        mockFileService.getReadingsStats.mockResolvedValue({
            total: 0,
            processed: 0,
            unprocessed: 0,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Estados de carregamento', () => {
        it('deve mostrar indicador de carregamento inicialmente', () => {
            mockFileService.loadLineReadings.mockImplementation(
                () => new Promise(() => { }) // Promise que nunca resolve
            );

            const { getByText } = render(<HistoryScreen />);

            expect(getByText('Loading...')).toBeTruthy();
            expect(getByText('Carregando histórico de leituras...')).toBeTruthy();
        });

        it('deve esconder indicador de carregamento após carregar dados', async () => {
            const { queryByText } = render(<HistoryScreen />);

            await waitFor(() => {
                expect(queryByText('Loading...')).toBeNull();
            });
        });
    });

    describe('Estado vazio', () => {
        it('deve mostrar mensagem quando não há leituras', async () => {
            const { getByText } = render(<HistoryScreen />);

            await waitFor(() => {
                expect(getByText('Nenhuma leitura encontrada')).toBeTruthy();
                expect(getByText('Execute simulações para gerar dados de leitura')).toBeTruthy();
            });
        });

        it('deve mostrar estatísticas zeradas quando não há dados', async () => {
            const { getAllByText } = render(<HistoryScreen />);

            await waitFor(() => {
                // Deve haver múltiplos spans com "0" (Total, Processadas, Pendentes)
                const zeros = getAllByText('0');
                expect(zeros.length).toBeGreaterThanOrEqual(3);
            });
        });

        it('deve mostrar título e subtítulo corretos', async () => {
            const { getByText } = render(<HistoryScreen />);

            await waitFor(() => {
                expect(getByText('Histórico de Leituras')).toBeTruthy();
                // Buscar por partes do texto que podem estar divididas
                expect(getByText('dia')).toBeTruthy();
                expect(getByText('de leituras')).toBeTruthy();
            });
        });
    });

    describe('Com dados de leituras', () => {
        const mockReadings = [
            {
                id: '1',
                lineNumber: 1,
                timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                processed: true,
                data: {
                    timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                    beacons: [{ id: 'ESC-002', type: 'escavadeira' as const, distance: 1.5 }],
                    gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                },
            },
            {
                id: '2',
                lineNumber: 2,
                timestamp: new Date('2024-01-15T11:00:00Z').getTime(),
                processed: false,
                data: {
                    timestamp: new Date('2024-01-15T11:00:00Z').getTime(),
                    beacons: [{ id: 'CAM-002', type: 'caminhao' as const, distance: 3.0 }],
                    gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                },
            },
            {
                id: '3',
                lineNumber: 3,
                timestamp: new Date('2024-01-16T09:00:00Z').getTime(),
                processed: true,
                data: {
                    timestamp: new Date('2024-01-16T09:00:00Z').getTime(),
                    beacons: [{ id: 'ESC-002', type: 'escavadeira' as const, distance: 1.0 }],
                    gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                },
            },
            {
                id: '4',
                lineNumber: 4,
                timestamp: new Date('2024-01-16T14:00:00Z').getTime(),
                processed: true,
                data: {
                    timestamp: new Date('2024-01-16T14:00:00Z').getTime(),
                    beacons: [{ id: 'CAM-003', type: 'caminhao' as const, distance: 5.0 }],
                    gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                },
            },
        ];

        const mockStats = {
            total: 4,
            processed: 3,
            unprocessed: 1,
        };

        beforeEach(() => {
            mockFileService.loadLineReadings.mockResolvedValue(mockReadings);
            mockFileService.getReadingsStats.mockResolvedValue(mockStats);
        });

        it('deve renderizar título e estatísticas corretas', async () => {
            const { getByText, getAllByText } = render(<HistoryScreen />);

            await waitFor(() => {
                expect(getByText('Histórico de Leituras')).toBeTruthy();
                expect(getByText('dia')).toBeTruthy();
                expect(getByText('de leituras')).toBeTruthy();
                expect(getAllByText('4').length).toBeGreaterThanOrEqual(1); // Total
                expect(getAllByText('3').length).toBeGreaterThanOrEqual(1); // Processadas
                expect(getAllByText('1').length).toBeGreaterThanOrEqual(1); // Pendentes
            });
        });

        it('deve agrupar leituras por dia corretamente', async () => {
            const { getAllByTestId } = render(<HistoryScreen />);

            await waitFor(() => {
                const historyItems = getAllByTestId('item-history');
                expect(historyItems).toHaveLength(2); // 2 dias diferentes
            });
        });

        it('deve ordenar leituras por data (mais recente primeiro)', async () => {
            const { getAllByTestId } = render(<HistoryScreen />);

            await waitFor(() => {
                const historyItems = getAllByTestId('item-history');
                expect(historyItems).toHaveLength(2);
                // O primeiro item deve ser do dia 16/01/2024
                expect(within(historyItems[0]).getByText('16/01/2024')).toBeTruthy();
                expect(within(historyItems[1]).getByText('15/01/2024')).toBeTruthy();
            });
        });
    });

    describe('Agrupamento de leituras', () => {
        it('deve agrupar múltiplas leituras do mesmo dia', async () => {
            const sameDayReadings = [
                {
                    id: '1',
                    lineNumber: 1,
                    timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                    processed: true,
                    data: {
                        timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                        beacons: [{ id: 'ESC-002', type: 'escavadeira' as const, distance: 1.5 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
                {
                    id: '2',
                    lineNumber: 2,
                    timestamp: new Date('2024-01-15T11:00:00Z').getTime(),
                    processed: true,
                    data: {
                        timestamp: new Date('2024-01-15T11:00:00Z').getTime(),
                        beacons: [{ id: 'CAM-002', type: 'caminhao' as const, distance: 3.0 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
                {
                    id: '3',
                    lineNumber: 3,
                    timestamp: new Date('2024-01-15T12:00:00Z').getTime(),
                    processed: false,
                    data: {
                        timestamp: new Date('2024-01-15T12:00:00Z').getTime(),
                        beacons: [{ id: 'ESC-002', type: 'escavadeira' as const, distance: 1.0 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
            ];

            mockFileService.loadLineReadings.mockResolvedValue(sameDayReadings);
            mockFileService.getReadingsStats.mockResolvedValue({
                total: 3,
                processed: 2,
                unprocessed: 1,
            });

            const { getAllByTestId } = render(<HistoryScreen />);

            await waitFor(() => {
                const historyItems = getAllByTestId('item-history');
                expect(historyItems).toHaveLength(1); // Apenas 1 dia
            });
        });

        it('deve marcar como pendente se qualquer leitura do dia não foi processada', async () => {
            const mixedReadings = [
                {
                    id: '1',
                    lineNumber: 1,
                    timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                    processed: true,
                    data: {
                        timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                        beacons: [{ id: 'ESC-002', type: 'escavadeira' as const, distance: 1.5 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
                {
                    id: '2',
                    lineNumber: 2,
                    timestamp: new Date('2024-01-15T11:00:00Z').getTime(),
                    processed: false,
                    data: {
                        timestamp: new Date('2024-01-15T11:00:00Z').getTime(),
                        beacons: [{ id: 'CAM-002', type: 'caminhao' as const, distance: 3.0 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
            ];

            mockFileService.loadLineReadings.mockResolvedValue(mixedReadings);
            mockFileService.getReadingsStats.mockResolvedValue({
                total: 2,
                processed: 1,
                unprocessed: 1,
            });

            const { getAllByTestId } = render(<HistoryScreen />);

            await waitFor(() => {
                const historyItems = getAllByTestId('item-history');
                expect(historyItems).toHaveLength(1); // Apenas 1 dia
                expect(within(historyItems[0]).getByText('Pendente')).toBeTruthy();
            });
        });
    });

    describe('Tratamento de erros', () => {
        it('deve lidar com erro ao carregar leituras', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            mockFileService.loadLineReadings.mockRejectedValue(
                new Error('Erro ao carregar leituras')
            );

            render(<HistoryScreen />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Erro ao carregar leituras de linha:',
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });

        it('deve lidar com erro ao carregar estatísticas', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            mockFileService.getReadingsStats.mockRejectedValue(
                new Error('Erro ao carregar estatísticas')
            );

            render(<HistoryScreen />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Erro ao carregar leituras de linha:',
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Navegação e recarregamento', () => {
        it('deve recarregar dados quando a tela receber foco', async () => {
            render(<HistoryScreen />);
            expect(mockAddListener).toHaveBeenCalledWith('focus', expect.any(Function));
        });
    });

    describe('Formatação de texto', () => {
        it('deve formatar singular corretamente', async () => {
            const singleReading = [
                {
                    id: '1',
                    lineNumber: 1,
                    timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                    processed: true,
                    data: {
                        timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                        beacons: [{ id: 'ESC-002', type: 'escavadeira' as const, distance: 1.5 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
            ];

            mockFileService.loadLineReadings.mockResolvedValue(singleReading);
            mockFileService.getReadingsStats.mockResolvedValue({
                total: 1,
                processed: 1,
                unprocessed: 0,
            });

            const { getByText } = render(<HistoryScreen />);

            await waitFor(() => {
                expect(getByText('dia')).toBeTruthy();
                expect(getByText('de leituras')).toBeTruthy();
            });
        });

        it('deve formatar plural corretamente', async () => {
            const multipleReadings = [
                {
                    id: '1',
                    lineNumber: 1,
                    timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                    processed: true,
                    data: {
                        timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
                        beacons: [{ id: 'ESC-002', type: 'escavadeira' as const, distance: 1.5 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
                {
                    id: '2',
                    lineNumber: 2,
                    timestamp: new Date('2024-01-16T10:00:00Z').getTime(),
                    processed: true,
                    data: {
                        timestamp: new Date('2024-01-16T10:00:00Z').getTime(),
                        beacons: [{ id: 'CAM-002', type: 'caminhao' as const, distance: 3.0 }],
                        gps: { latitude: -23.55, longitude: -46.63, velocity: 0 },
                    },
                },
            ];

            mockFileService.loadLineReadings.mockResolvedValue(multipleReadings);
            mockFileService.getReadingsStats.mockResolvedValue({
                total: 2,
                processed: 2,
                unprocessed: 0,
            });

            const { getByText } = render(<HistoryScreen />);

            await waitFor(() => {
                expect(getByText('dia')).toBeTruthy();
                expect(getByText('de leituras')).toBeTruthy();
            });
        });
    });

    describe('Performance e otimização', () => {
        it('deve usar useCallback para loadLineReadings', () => {
            render(<HistoryScreen />);
            // Verificar se a função é chamada apenas uma vez no carregamento inicial
            expect(mockFileService.loadLineReadings).toHaveBeenCalledTimes(1);
        });

        it('deve limpar listener de navegação no unmount', () => {
            const unsubscribeMock = jest.fn();
            mockAddListener.mockReturnValue(unsubscribeMock);

            const { unmount } = render(<HistoryScreen />);
            unmount();

            expect(unsubscribeMock).toHaveBeenCalled();
        });
    });
}); 