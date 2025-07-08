import { create } from 'zustand';

export type CicloEtapa =
  | 'EM_CARREGAMENTO'
  | 'TRANSITO_CHEIO'
  | 'EM_FILA_BASCULAMENTO'
  | 'EM_BASCULAMENTO'
  | 'TRANSITO_VAZIO';

export interface EtapaCiclo {
  etapa: CicloEtapa;
  velocidade: number;
  lat: number;
  lon: number;
  timestamp: string;
  infoExtra?: string;
}

export interface CicloCompleto {
  id: string;
  inicio: string;
  fim: string;
  etapas: EtapaCiclo[];
  sincronizado: boolean;
}

interface CycleStore {
  ciclos: CicloCompleto[];
  adicionarCiclo: (ciclo: CicloCompleto) => void;
  marcarSincronizado: (id: string) => void;
  limpar: () => void;
  adicionarCicloMock: () => void;
}

// Dados mock para demonstração
const mockCiclos: CicloCompleto[] = [
  {
    id: 'CAM-001',
    inicio: '2024-01-15T08:00:00.000Z',
    fim: '2024-01-15T08:25:00.000Z',
    sincronizado: true,
    etapas: [
      {
        etapa: 'EM_CARREGAMENTO',
        velocidade: 0,
        lat: 36.12,
        lon: -115.17,
        timestamp: '2024-01-15T08:02:00.000Z',
        infoExtra: 'Equipamentos próximos',
      },
      {
        etapa: 'TRANSITO_CHEIO',
        velocidade: 32,
        lat: 36.1,
        lon: -115.2,
        timestamp: '2024-01-15T08:10:00.000Z',
      },
      {
        etapa: 'EM_FILA_BASCULAMENTO',
        velocidade: 2,
        lat: 36.1,
        lon: -115.2,
        timestamp: '2024-01-15T08:15:00.000Z',
      },
      {
        etapa: 'EM_BASCULAMENTO',
        velocidade: 0,
        lat: 36.1,
        lon: -115.2,
        timestamp: '2024-01-15T08:18:00.000Z',
      },
      {
        etapa: 'TRANSITO_VAZIO',
        velocidade: 28,
        lat: 36.11,
        lon: -115.21,
        timestamp: '2024-01-15T08:23:00.000Z',
      },
    ],
  },
  // Você pode adicionar outros ciclos mockados aqui, se quiser mais de um exemplo
];

export const useCycleStore = create<CycleStore>(set => ({
  ciclos: mockCiclos,
  adicionarCiclo: ciclo => set(state => ({ ciclos: [...state.ciclos, ciclo] })),
  marcarSincronizado: id =>
    set(state => ({
      ciclos: state.ciclos.map(c =>
        c.id === id ? { ...c, sincronizado: true } : c,
      ),
    })),
  limpar: () => set({ ciclos: [] }),
  adicionarCicloMock: () => {
    const novoCiclo: CicloCompleto = {
      id: `CAM-${String(mockCiclos.length + 1).padStart(3, '0')}`,
      inicio: new Date().toISOString(),
      fim: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutos depois
      sincronizado: Math.random() > 0.5,
      etapas: [
        {
          etapa: 'EM_CARREGAMENTO',
          velocidade: 0,
          lat: -23.5505,
          lon: -46.6333,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    set(state => ({ ciclos: [novoCiclo, ...state.ciclos] }));
  },
}));
