/**
 * Single source of truth for network configuration (RPC URL + passphrase).
 *
 * Resolves the built-in networks — testnet's RPC/passphrase come from
 * VITE_SOROBAN_RPC_URL / VITE_NETWORK_PASSPHRASE, falling back to the public
 * testnet defaults when unset. NetworkContext layers custom (user-added)
 * networks on top of these; anywhere a transaction is built, simulated, or
 * signed should read the passphrase from here (via NetworkContext) rather
 * than hardcoding it.
 */

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

export const DEFAULT_TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
export const DEFAULT_TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
const DEFAULT_TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";

export const DEFAULT_NETWORK_ID = "testnet";

export const NETWORK_COLORS: Record<NetworkKind, string> = {
  testnet: "#f59e0b",
  mainnet: "#3b82f6",
  futurenet: "#a855f7",
  custom: "#22c55e",
};

function resolveTestnetNetwork(): NetworkConfig {
  return {
    id: "testnet",
    kind: "testnet",
    name: "Testnet",
    rpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL || DEFAULT_TESTNET_RPC_URL,
    horizonUrl: DEFAULT_TESTNET_HORIZON_URL,
    passphrase:
      import.meta.env.VITE_NETWORK_PASSPHRASE || DEFAULT_TESTNET_PASSPHRASE,
  };
}

const MAINNET_NETWORK: NetworkConfig = {
  id: "mainnet",
  kind: "mainnet",
  name: "Mainnet",
  rpcUrl: "https://mainnet.sorobanrpc.com",
  horizonUrl: "https://horizon.stellar.org",
  passphrase: "Public Global Stellar Network ; September 2015",
};

const FUTURENET_NETWORK: NetworkConfig = {
  id: "futurenet",
  kind: "futurenet",
  name: "Futurenet",
  rpcUrl: "https://rpc-futurenet.stellar.org",
  horizonUrl: "https://horizon-futurenet.stellar.org",
  passphrase: "Test SDF Future Network ; October 2022",
};

/** Built-in networks, testnet resolved from env (with fallback). */
export function getBuiltinNetworks(): NetworkConfig[] {
  return [resolveTestnetNetwork(), MAINNET_NETWORK, FUTURENET_NETWORK];
}

/**
 * Resolves the active network: built-ins (testnet from env) layered with
 * any custom networks, matched by id and falling back to testnet.
 */
export function resolveActiveNetwork(
  customNetworks: NetworkConfig[] = [],
  activeId: string = DEFAULT_NETWORK_ID,
): NetworkConfig {
  const networks = [...getBuiltinNetworks(), ...customNetworks];
  return networks.find((n) => n.id === activeId) ?? networks[0];
}

/**
 * Rewrites an RPC URL / passphrase into a sandbox template's env file text,
 * so generated code targets whatever network is currently active instead of
 * a hardcoded testnet endpoint.
 */
export function applyNetworkToEnvContent(
  content: string,
  network: NetworkConfig,
): string {
  let updated = content.split(DEFAULT_TESTNET_RPC_URL).join(network.rpcUrl);
  if (/^.*PASSPHRASE=.*$/m.test(updated)) {
    updated = updated.replace(
      /^(.*PASSPHRASE=).*$/m,
      `$1${network.passphrase}`,
    );
  } else {
    updated = `${updated.trimEnd()}\nNETWORK_PASSPHRASE=${network.passphrase}\n`;
  }
  return updated;
}
