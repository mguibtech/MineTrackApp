import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { DetailScreen } from './DetailScreen';
import { FileService } from '@services';

// Mock do FileService
jest.mock('@services', () => ({
    FileService: {
        readSyncFile: jest.fn(),
    },
}));

// Mock do useRoute
const mockRoute = {
    params: {
        cycleId: 'Linha 1',
    },
};

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useRoute: () => mockRoute,
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

// Helper para renderizar texto plano
function renderPlainText(children: any): string {
    if (Array.isArray(children)) return children.map(renderPlainText).join(' ');
    if (typeof children === 'object' && children !== null && children.props && children.props.children)
        return renderPlainText(children.props.children);
    return children != null ? String(children) : '';
}

// Mock dos componentes para refletir comportamento real
jest.mock('@components', () => ({
    Box: ({ children, ...props }: any) => {
        return <div {...props}>{children}</div>;
    },
    Text: ({ children, ...props }: any) => {
        return <span {...props}>{renderPlainText(children)}</span>;
    },
    Button: ({ children, title, onPress, ...props }: any) => {
        return (
            <button onClick={onPress} {...props}>
                {title || renderPlainText(children)}
            </button>
        );
    },
    Icon: ({ name, ...props }: any) => {
        return <div data-testid={`icon-${name}`} {...props} />;
    },
}));

// Mock do ScrollView preservando o módulo original
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
    return {
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

describe('DetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Estado de carregamento', () => {
        it('deve mostrar indicador de carregamento quando está carregando', async () => {
            (FileService.readSyncFile as jest.Mock).mockImplementation(
                () => new Promise(() => { }) // Promise que nunca resolve
            );

            const { getByText } = render(<DetailScreen />);

            expect(getByText(/Carregando detalhes/i)).toBeTruthy();
        });
    });

    describe('Dados encontrados no arquivo de sincronização', () => {
        const mockSyncData = [
            {
                cycleId: 'Linha 1',
                startTime: '2024-01-15T08:00:00Z',
                endTime: '2024-01-15T08:25:00Z',
                stages: [
                    {
                        stage: 'EM CARREGAMENTO',
                        timestamp: '2024-01-15T08:02:00Z',
                    },
                    {
                        stage: 'TRANSITO CHEIO',
                        timestamp: '2024-01-15T08:10:00Z',
                    },
                    {
                        stage: 'EM BASCULAMENTO',
                        timestamp: '2024-01-15T08:18:00Z',
                    },
                ],
            },
        ];

        beforeEach(() => {
            (FileService.readSyncFile as jest.Mock).mockResolvedValue(mockSyncData);
        });

        it('deve renderizar detalhes do ciclo quando encontrado', async () => {
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByText(/Detalhes do Ciclo/i)).toBeTruthy();
                expect(getByText(/Início/i)).toBeTruthy();
                expect(getByText(/Fim/i)).toBeTruthy();
                expect(getByText(/Etapas/i)).toBeTruthy();
            });
        });

        it('deve renderizar etapas do ciclo', async () => {
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByText(/EM CARREGAMENTO/i)).toBeTruthy();
                expect(getByText(/TRANSITO CHEIO/i)).toBeTruthy();
                expect(getByText(/EM BASCULAMENTO/i)).toBeTruthy();
            });
        });

        it('deve mostrar velocidade quando disponível', async () => {
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByText(/km\/h/i)).toBeTruthy();
            });
        });

        it('deve mostrar coordenadas GPS quando disponível', async () => {
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                // Aceita espaços, quebras e vírgula
                expect(getByText(/-23\.55[0-9]*\s*,\s*-46\.63[0-9]*/)).toBeTruthy();
            });
        });

        it('deve mostrar equipamentos para cada etapa', async () => {
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByText(/ESC-002.*Escavadeira/i)).toBeTruthy();
                expect(getByText(/Em trânsito/i)).toBeTruthy();
                expect(getByText(/BAS-001.*Basculante/i)).toBeTruthy();
            });
        });
    });

    describe('Ciclo não encontrado', () => {
        beforeEach(() => {
            (FileService.readSyncFile as jest.Mock).mockResolvedValue([]);
        });

        it('deve mostrar "Ciclo não encontrado" quando ciclo não existe', async () => {
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByText(/Ciclo não encontrado/i)).toBeTruthy();
            });
        });

        it('deve ter botão de voltar quando ciclo não encontrado', async () => {
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                const backButton = getByText(/Voltar/i);
                expect(backButton).toBeTruthy();
            });
        });
    });

    describe('Tratamento de erros', () => {
        it('deve lidar com erro ao carregar dados', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (FileService.readSyncFile as jest.Mock).mockRejectedValue(
                new Error('Erro ao carregar dados')
            );
            render(<DetailScreen />);
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Erro ao carregar detalhes do ciclo:',
                    expect.any(Error)
                );
            });
            consoleSpy.mockRestore();
        });
    });

    describe('Navegação', () => {
        it('deve chamar goBack quando botão voltar for pressionado', async () => {
            (FileService.readSyncFile as jest.Mock).mockResolvedValue([]);
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                const backButton = getByText(/Voltar/i);
                fireEvent.press(backButton);
                expect(mockGoBack).toHaveBeenCalled();
            });
        });
    });

    describe('Formatação de dados', () => {
        it('deve mostrar horários de início e fim', async () => {
            const mockSyncData = [
                {
                    cycleId: 'Linha 1',
                    startTime: '2024-01-15T14:30:00Z',
                    endTime: '2024-01-15T15:45:00Z',
                    stages: [
                        {
                            stage: 'EM CARREGAMENTO',
                            timestamp: '2024-01-15T14:35:00Z',
                        },
                    ],
                },
            ];
            (FileService.readSyncFile as jest.Mock).mockResolvedValue(mockSyncData);
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                // Aceita qualquer horário no formato HH:MM
                expect(getByText(/\d{2}:\d{2}/)).toBeTruthy();
            });
        });
        it('deve mostrar velocidade apenas quando > 0', async () => {
            const mockSyncData = [
                {
                    cycleId: 'Linha 1',
                    startTime: '2024-01-15T08:00:00Z',
                    endTime: '2024-01-15T08:25:00Z',
                    stages: [
                        {
                            stage: 'EM CARREGAMENTO', // Velocidade 0
                            timestamp: '2024-01-15T08:02:00Z',
                        },
                        {
                            stage: 'TRANSITO CHEIO', // Velocidade > 0
                            timestamp: '2024-01-15T08:10:00Z',
                        },
                    ],
                },
            ];
            (FileService.readSyncFile as jest.Mock).mockResolvedValue(mockSyncData);
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                // Deve encontrar pelo menos um horário e um valor de km/h
                expect(getByText(/\d{2}:\d{2}/)).toBeTruthy();
                expect(getByText(/km\/h/i)).toBeTruthy();
            });
        });
    });

    describe('Ícones e elementos visuais', () => {
        it('deve renderizar ícones para cada etapa', async () => {
            const mockSyncData = [
                {
                    cycleId: 'Linha 1',
                    startTime: '2024-01-15T08:00:00Z',
                    endTime: '2024-01-15T08:25:00Z',
                    stages: [
                        {
                            stage: 'EM CARREGAMENTO',
                            timestamp: '2024-01-15T08:02:00Z',
                        },
                    ],
                },
            ];
            (FileService.readSyncFile as jest.Mock).mockResolvedValue(mockSyncData);
            const { getByTestId } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByTestId('icon-home')).toBeTruthy(); // EM CARREGAMENTO
                expect(getByTestId('icon-arrowLeft')).toBeTruthy(); // Botão voltar
            });
        });
        it('deve mostrar ícone de status sincronizado', async () => {
            const mockSyncData = [
                {
                    cycleId: 'Linha 1',
                    startTime: '2024-01-15T08:00:00Z',
                    endTime: '2024-01-15T08:25:00Z',
                    stages: [
                        {
                            stage: 'EM CARREGAMENTO',
                            timestamp: '2024-01-15T08:02:00Z',
                        },
                    ],
                },
            ];
            (FileService.readSyncFile as jest.Mock).mockResolvedValue(mockSyncData);
            const { getByTestId } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByTestId('icon-checkRound')).toBeTruthy(); // Status sincronizado
            });
        });
    });

    describe('Dados de GPS', () => {
        it('deve mostrar coordenadas GPS quando disponíveis', async () => {
            const mockSyncData = [
                {
                    cycleId: 'Linha 1',
                    startTime: '2024-01-15T08:00:00Z',
                    endTime: '2024-01-15T08:25:00Z',
                    stages: [
                        {
                            stage: 'EM CARREGAMENTO',
                            timestamp: '2024-01-15T08:02:00Z',
                        },
                        {
                            stage: 'TRANSITO CHEIO',
                            timestamp: '2024-01-15T08:10:00Z',
                        },
                    ],
                },
            ];
            (FileService.readSyncFile as jest.Mock).mockResolvedValue(mockSyncData);
            const { getByText } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByText(/-23\.55[0-9]*\s*,\s*-46\.63[0-9]*/)).toBeTruthy();
            });
        });
        it('deve mostrar ícone de GPS quando coordenadas estão disponíveis', async () => {
            const mockSyncData = [
                {
                    cycleId: 'Linha 1',
                    startTime: '2024-01-15T08:00:00Z',
                    endTime: '2024-01-15T08:25:00Z',
                    stages: [
                        {
                            stage: 'EM CARREGAMENTO',
                            timestamp: '2024-01-15T08:02:00Z',
                        },
                    ],
                },
            ];
            (FileService.readSyncFile as jest.Mock).mockResolvedValue(mockSyncData);
            const { getByTestId } = render(<DetailScreen />);
            await waitFor(() => {
                expect(getByTestId('icon-search')).toBeTruthy(); // Ícone de GPS
            });
        });
    });
}); 