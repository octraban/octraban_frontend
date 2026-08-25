// Single source of truth for the app's default active Stellar network.
// RPC URL and passphrase come from env, falling back to Stellar testnet.
// NetworkContext layers custom/mainnet/futurenet entries on top of this;
// anywhere that builds, simulates, or signs a transaction should read the
// passphrase and RPC URL from here (or from useNetwork()'s `active` entry,
// which is seeded from this module) rather than hardcoding either value.
export interface ResolvedNetworkConfig {
  id: string;
  name: string;
  rpcUrl: string;
  horizonUrl: string;
  passphrase: string;
}

interface NetworkEnv {
  VITE_SOROBAN_RPC_URL?: string;
  VITE_NETWORK_PASSPHRASE?: string;
}

export const DEFAULT_NETWORK: ResolvedNetworkConfig = {
  id: "testnet",
  name: "Testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  horizonUrl: "https://horizon-testnet.stellar.org",
  passphrase: "Test SDF Network ; September 2015",
};

export function resolveActiveNetwork(
  env: NetworkEnv = import.meta.env,
): ResolvedNetworkConfig {
  return {
    ...DEFAULT_NETWORK,
    rpcUrl: env.VITE_SOROBAN_RPC_URL || DEFAULT_NETWORK.rpcUrl,
    passphrase: env.VITE_NETWORK_PASSPHRASE || DEFAULT_NETWORK.passphrase,
  };
}
