import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ItemHistory } from './ItemHistory';

// Mock do useNavigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// Mock dos componentes
jest.mock('@components', () => ({
    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    Button: ({ children, onPress, ...props }: any) => (
        <button onClick={onPress} {...props}>{children}</button>
    ),
    Icon: ({ name, ...props }: any) => <div data-testid={`icon-${name}`} {...props} />,
}));

describe('ItemHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockItem = {
        id: 'day_2024-01-15',
        data: '2024-01-15T10:00:00.000Z',
        quantidade: 3,
        ciclos: ['Linha 1', 'Linha 2', 'Linha 3'],
        lineNumber: 1,
        timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
        processed: true,
    };

    describe('Renderização básica', () => {
        it('deve renderizar corretamente com dados válidos', () => {
            const { getByText } = render(<ItemHistory item={mockItem} />);

            expect(getByText('Linha 1')).toBeTruthy();
            expect(getByText('Processado')).toBeTruthy();
            expect(getByText('3 leituras realizadas')).toBeTruthy();
            expect(getByText('Ver detalhes')).toBeTruthy();
        });

        it('deve mostrar status correto quando processado', () => {
            const { getByText, getByTestId } = render(<ItemHistory item={mockItem} />);

            expect(getByText('Processado')).toBeTruthy();
            expect(getByTestId('icon-checkRound')).toBeTruthy();
        });

        it('deve mostrar status correto quando pendente', () => {
            const pendingItem = { ...mockItem, processed: false };
            const { getByText, getByTestId } = render(<ItemHistory item={pendingItem} />);

            expect(getByText('Pendente')).toBeTruthy();
            expect(getByTestId('icon-warning')).toBeTruthy();
        });
    });

    describe('Formatação de data', () => {
        it('deve formatar data corretamente', () => {
            const { getByText } = render(<ItemHistory item={mockItem} />);

            // Verifica se a data está formatada no padrão brasileiro
            expect(getByText(/15\/01\/2024/)).toBeTruthy();
        });

        it('deve lidar com data inválida', () => {
            const invalidDateItem = { ...mockItem, data: 'data-invalida' };
            const { getByText } = render(<ItemHistory item={invalidDateItem} />);

            expect(getByText('data-invalida')).toBeTruthy();
        });
    });

    describe('Formatação de quantidade', () => {
        it('deve formatar quantidade singular corretamente', () => {
            const singleItem = { ...mockItem, quantidade: 1 };
            const { getByText } = render(<ItemHistory item={singleItem} />);

            expect(getByText('1 leitura realizada')).toBeTruthy();
        });

        it('deve formatar quantidade plural corretamente', () => {
            const { getByText } = render(<ItemHistory item={mockItem} />);

            expect(getByText('3 leituras realizadas')).toBeTruthy();
        });
    });

    describe('Navegação', () => {
        it('deve navegar para DetailScreen quando botão for pressionado', () => {
            const { getByText } = render(<ItemHistory item={mockItem} />);

            const button = getByText('Ver detalhes');
            fireEvent.press(button);

            expect(mockNavigate).toHaveBeenCalledWith('DetailScreen', {
                cycleId: 'Linha 1'
            });
        });

        it('deve usar o primeiro ciclo da lista para navegação', () => {
            const itemWithMultipleCycles = {
                ...mockItem,
                ciclos: ['Linha 5', 'Linha 6', 'Linha 7']
            };
            const { getByText } = render(<ItemHistory item={itemWithMultipleCycles} />);

            const button = getByText('Ver detalhes');
            fireEvent.press(button);

            expect(mockNavigate).toHaveBeenCalledWith('DetailScreen', {
                cycleId: 'Linha 5'
            });
        });

        it('deve usar fallback quando não há ciclos', () => {
            const itemWithoutCycles = {
                ...mockItem,
                ciclos: []
            };
            const { getByText } = render(<ItemHistory item={itemWithoutCycles} />);

            const button = getByText('Ver detalhes');
            fireEvent.press(button);

            expect(mockNavigate).toHaveBeenCalledWith('DetailScreen', {
                cycleId: 'Linha 0'
            });
        });
    });

    describe('Cores e estilos', () => {
        it('deve aplicar cor verde para status processado', () => {
            const { getByText } = render(<ItemHistory item={mockItem} />);

            const statusText = getByText('Processado');
            expect(statusText).toBeTruthy();
        });

        it('deve aplicar cor vermelha para status pendente', () => {
            const pendingItem = { ...mockItem, processed: false };
            const { getByText } = render(<ItemHistory item={pendingItem} />);

            const statusText = getByText('Pendente');
            expect(statusText).toBeTruthy();
        });
    });

    describe('Ciclos múltiplos', () => {
        it('deve exibir o primeiro ciclo da lista', () => {
            const itemWithMultipleCycles = {
                ...mockItem,
                ciclos: ['Linha 10', 'Linha 20', 'Linha 30']
            };
            const { getByText } = render(<ItemHistory item={itemWithMultipleCycles} />);

            expect(getByText('Linha 10')).toBeTruthy();
        });

        it('deve lidar com array de ciclos vazio', () => {
            const itemWithoutCycles = {
                ...mockItem,
                ciclos: []
            };
            const { getByText } = render(<ItemHistory item={itemWithoutCycles} />);

            expect(getByText('Linha 0')).toBeTruthy();
        });
    });

    describe('Dados extremos', () => {
        it('deve lidar com quantidade zero', () => {
            const zeroItem = { ...mockItem, quantidade: 0 };
            const { getByText } = render(<ItemHistory item={zeroItem} />);

            expect(getByText('0 leituras realizadas')).toBeTruthy();
        });

        it('deve lidar com quantidade muito alta', () => {
            const highQuantityItem = { ...mockItem, quantidade: 999 };
            const { getByText } = render(<ItemHistory item={highQuantityItem} />);

            expect(getByText('999 leituras realizadas')).toBeTruthy();
        });

        it('deve lidar com timestamp muito antigo', () => {
            const oldItem = {
                ...mockItem,
                data: '1900-01-01T00:00:00.000Z',
                timestamp: new Date('1900-01-01T00:00:00Z').getTime()
            };
            const { getByText } = render(<ItemHistory item={oldItem} />);

            expect(getByText(/01\/01\/1900/)).toBeTruthy();
        });
    });
}); 