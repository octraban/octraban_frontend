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

/**
 * Rewrite a template's `.env` content to target the given network: swap the
 * default testnet RPC URL for the network's RPC URL, and set (or append) the
 * network passphrase. Used when scaffolding sandbox templates so generated
 * projects point at the active network.
 */
export function applyNetworkToEnvContent(
  content: string,
  network: { rpcUrl: string; passphrase: string },
): string {
  let updated = content.split(DEFAULT_NETWORK.rpcUrl).join(network.rpcUrl);
  if (/^.*PASSPHRASE=.*$/m.test(updated)) {
    updated = updated.replace(/^(.*PASSPHRASE=).*$/m, `$1${network.passphrase}`);
  } else {
    updated = `${updated.trimEnd()}\nNETWORK_PASSPHRASE=${network.passphrase}\n`;
  }
  return updated;
}
