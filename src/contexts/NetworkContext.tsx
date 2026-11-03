import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isValidHttpUrl, resolveActiveNetwork } from "../config/network";

export type NetworkKind = "testnet" | "mainnet" | "futurenet" | "custom";

export interface NetworkConfig {
  id: string;
  kind: NetworkKind;
  name: string;
  rpcUrl: string;
  horizonUrl: string;
  passphrase: string;
  /** Custom networks only — removable, persisted to localStorage. */
  custom?: boolean;
}

const defaultNetwork = resolveActiveNetwork();

export const BUILTIN_NETWORKS: NetworkConfig[] = [
  {
    id: defaultNetwork.id,
    kind: "testnet",
    name: defaultNetwork.name,
    rpcUrl: defaultNetwork.rpcUrl,
    horizonUrl: defaultNetwork.horizonUrl,
    passphrase: defaultNetwork.passphrase,
  },
  {
    id: "mainnet",
    kind: "mainnet",
    name: "Mainnet",
    rpcUrl: "https://mainnet.sorobanrpc.com",
    horizonUrl: "https://horizon.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
  },
  {
    id: "futurenet",
    kind: "futurenet",
    name: "Futurenet",
    rpcUrl: "https://rpc-futurenet.stellar.org",
    horizonUrl: "https://horizon-futurenet.stellar.org",
    passphrase: "Test SDF Future Network ; October 2022",
  },
];

export const NETWORK_COLORS: Record<NetworkKind, string> = {
  testnet: "#f59e0b",
  mainnet: "#3b82f6",
  futurenet: "#a855f7",
  custom: "#22c55e",
};

const ACTIVE_KEY = "sb-network-active";
const CUSTOM_KEY = "sb-network-custom";

let lastCustomId = 0;

function readStorage(key: string): string | null {
  try {
    return typeof localStorage !== "undefined" &&
      typeof localStorage?.getItem === "function"
      ? localStorage.getItem(key)
      : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    if (
      typeof localStorage !== "undefined" &&
      typeof localStorage?.setItem === "function"
    ) {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage quota or privacy-mode errors.
  }
}

function isStoredCustomNetwork(entry: unknown): entry is NetworkConfig {
  if (!entry || typeof entry !== "object") return false;
  const candidate = entry as Record<string, unknown>;
  if (
    typeof candidate.id !== "string" ||
    !candidate.id.trim() ||
    typeof candidate.name !== "string" ||
    !candidate.name.trim() ||
    typeof candidate.rpcUrl !== "string" ||
    !isValidHttpUrl(candidate.rpcUrl) ||
    typeof candidate.passphrase !== "string" ||
    !candidate.passphrase.trim()
  ) {
    return false;
  }
  if (
    typeof candidate.horizonUrl === "string" &&
    candidate.horizonUrl.trim() !== "" &&
    !isValidHttpUrl(candidate.horizonUrl)
  ) {
    return false;
  }
  return true;
}

function loadCustomNetworks(): NetworkConfig[] {
  try {
    const raw = readStorage(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredCustomNetwork).map((n) => ({
      ...n,
      name: n.name.trim(),
      rpcUrl: n.rpcUrl.trim(),
      horizonUrl: typeof n.horizonUrl === "string" ? n.horizonUrl.trim() : "",
      passphrase: n.passphrase.trim(),
      kind: "custom",
      custom: true,
    }));
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
    () => readStorage(ACTIVE_KEY) || defaultNetwork.id,
  );

  const networks = useMemo(
    () => [...BUILTIN_NETWORKS, ...customNetworks],
    [customNetworks],
  );

  const active = useMemo(
    () => networks.find((n) => n.id === activeId) ?? networks[0],
    [networks, activeId],
  );

  useEffect(() => {
    writeStorage(CUSTOM_KEY, JSON.stringify(customNetworks));
  }, [customNetworks]);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    writeStorage(ACTIVE_KEY, id);
  }, []);

  const addCustomNetwork = useCallback(
    (network: Omit<NetworkConfig, "id" | "kind" | "custom">) => {
      const name = network.name.trim();
      const rpcUrl = network.rpcUrl.trim();
      const horizonUrl = network.horizonUrl.trim();
      const passphrase = network.passphrase.trim();

      if (!name) {
        throw new Error("Network name is required.");
      }
      if (!isValidHttpUrl(rpcUrl)) {
        throw new Error("Enter a valid http(s) RPC URL.");
      }
      if (horizonUrl && !isValidHttpUrl(horizonUrl)) {
        throw new Error("Enter a valid http(s) Horizon URL.");
      }
      if (!passphrase) {
        throw new Error("Network passphrase is required.");
      }

      const nextId = Math.max(Date.now(), lastCustomId + 1);
      lastCustomId = nextId;
      const id = `custom-${nextId}`;
      const full: NetworkConfig = {
        name,
        rpcUrl,
        horizonUrl,
        passphrase,
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
      if (activeId === id) setActiveId(defaultNetwork.id);
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
