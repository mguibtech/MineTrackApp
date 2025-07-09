import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';

// Mock do hook useHomeScreen
jest.mock('./useHomeScreen', () => ({
    useHomeScreen: () => ({
        isSimulating: false,
        currentStage: 'EM FILA CARREGAMENTO',
        currentSpeed: '0',
        loadingEquipment: 'ESC-002',
        dumpPoint: '-19,92, -43,94',
        isSynchronized: true,
        pendingCycles: 0,
        simulationProgress: 0,
        totalLines: 0,
        handleSimulateReading: jest.fn(),
        getStageIcon: () => 'home',
        getSpeedIcon: () => 'arrowRight',
        getEquipmentIcon: () => 'checkList',
        getDumpIcon: () => 'search',
        getSyncIcon: () => 'checkRound',
    })
}));

// Mock do componente SyncStatusIndicator
jest.mock('@components', () => {
    const original = jest.requireActual('@components');
    return {
        ...original,
        SyncStatusIndicator: (props: any) => <>{JSON.stringify(props)}</>,
    };
});

describe('HomeScreen', () => {
    it('renderiza corretamente', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Simulador de Ciclo')).toBeTruthy();
        expect(getByText('ETAPA ATUAL')).toBeTruthy();
        expect(getByText('VELOCIDADE ATUAL')).toBeTruthy();
        expect(getByText('EQUIPAMENTO DE CARGA')).toBeTruthy();
        expect(getByText('PONTO DE BASCULAMENTO')).toBeTruthy();
        expect(getByText('DADOS SINCRONIZADOS')).toBeTruthy();
        expect(getByText('SIMULAR LEITURA')).toBeTruthy();
    });
}); 