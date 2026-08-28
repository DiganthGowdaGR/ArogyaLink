import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ConnectivityContextValue = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOffline: boolean;
  isReady: boolean;
};

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

function stateValue(state: NetInfoState): ConnectivityContextValue {
  const isConnected = state.isConnected;
  const isInternetReachable = state.isInternetReachable;

  return {
    isConnected,
    isInternetReachable,
    isOffline: isConnected === false || isInternetReachable === false,
    isReady: isConnected !== null || isInternetReachable !== null,
  };
}

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectivityContextValue>({
    isConnected: null,
    isInternetReachable: null,
    isOffline: false,
    isReady: false,
  });

  useEffect(() => {
    let mounted = true;

    const applyState = (nextState: NetInfoState) => {
      if (mounted) {
        setState(stateValue(nextState));
      }
    };

    void NetInfo.fetch().then(applyState);
    const unsubscribe = NetInfo.addEventListener(applyState);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);

  if (!context) {
    throw new Error('useConnectivity must be used inside ConnectivityProvider');
  }

  return context;
}
