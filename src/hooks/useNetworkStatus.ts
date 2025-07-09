import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
  isEthernet: boolean;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: null,
    type: null,
    isWifi: false,
    isCellular: false,
    isEthernet: false,
  });

  useEffect(() => {
    // Verificar status inicial
    const checkInitialStatus = async () => {
      const state = await NetInfo.fetch();
      updateNetworkStatus(state);
    };

    checkInitialStatus();

    // Escutar mudanças de conectividade
    const unsubscribe = NetInfo.addEventListener(state => {
      updateNetworkStatus(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateNetworkStatus = (state: any) => {
    setNetworkStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? null,
      type: state.type ?? null,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      isEthernet: state.type === 'ethernet',
    });
  };

  return networkStatus;
};
