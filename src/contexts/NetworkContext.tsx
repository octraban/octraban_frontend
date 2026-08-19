import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_NETWORK_ID,
  getBuiltinNetworks,
  NETWORK_COLORS,
  type NetworkConfig,
  type NetworkKind,
} from "../config/network";

export type { NetworkConfig, NetworkKind };
export { NETWORK_COLORS };

const ACTIVE_KEY = "sb-network-active";
const CUSTOM_KEY = "sb-network-custom";

function loadCustomNetworks(): NetworkConfig[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface NetworkContextValue {
  networks: NetworkConfig[];
  active: NetworkConfig;
  setActiveId: (id: string) => void;
  addCustomNetwork: (
    network: Omit<NetworkConfig, "id" | "kind" | "custom">,
  ) => NetworkConfig;
  removeCustomNetwork: (id: string) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [customNetworks, setCustomNetworks] =
    useState<NetworkConfig[]>(loadCustomNetworks);
  const [activeId, setActiveIdState] = useState<string>(
    () => localStorage.getItem(ACTIVE_KEY) || DEFAULT_NETWORK_ID,
  );

  const networks = useMemo(
    () => [...getBuiltinNetworks(), ...customNetworks],
    [customNetworks],
  );

  const active = useMemo(
    () => networks.find((n) => n.id === activeId) ?? networks[0],
    [networks, activeId],
  );

  useEffect(() => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customNetworks));
  }, [customNetworks]);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const addCustomNetwork = useCallback(
    (network: Omit<NetworkConfig, "id" | "kind" | "custom">) => {
      const id = `custom-${Date.now()}`;
      const full: NetworkConfig = {
        ...network,
        id,
        kind: "custom",
        custom: true,
      };
      setCustomNetworks((prev) => [...prev, full]);
      return full;
    },
    [],
  );

  const removeCustomNetwork = useCallback(
    (id: string) => {
      setCustomNetworks((prev) => prev.filter((n) => n.id !== id));
      if (activeId === id) setActiveId(DEFAULT_NETWORK_ID);
    },
    [activeId, setActiveId],
  );

  const value = useMemo(
    () => ({
      networks,
      active,
      setActiveId,
      addCustomNetwork,
      removeCustomNetwork,
    }),
    [networks, active, setActiveId, addCustomNetwork, removeCustomNetwork],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used within a NetworkProvider");
  return ctx;
}
