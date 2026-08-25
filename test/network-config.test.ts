import { describe, it, expect } from "vitest";
import { resolveActiveNetwork, DEFAULT_NETWORK } from "../src/config/network";

describe("resolveActiveNetwork", () => {
  it("returns testnet defaults when env is unset", () => {
    expect(resolveActiveNetwork({})).toEqual(DEFAULT_NETWORK);
  });

  it("returns the overridden RPC URL and passphrase when env is set", () => {
    const resolved = resolveActiveNetwork({
      VITE_SOROBAN_RPC_URL: "https://custom-rpc.example.com",
      VITE_NETWORK_PASSPHRASE: "Custom Test Network ; 2026",
    });

    expect(resolved.rpcUrl).toBe("https://custom-rpc.example.com");
    expect(resolved.passphrase).toBe("Custom Test Network ; 2026");
    // Unrelated fields keep their defaults.
    expect(resolved.id).toBe(DEFAULT_NETWORK.id);
    expect(resolved.horizonUrl).toBe(DEFAULT_NETWORK.horizonUrl);
  });

  it("falls back to defaults for values left unset individually", () => {
    const resolved = resolveActiveNetwork({
      VITE_SOROBAN_RPC_URL: "https://custom-rpc.example.com",
    });

    expect(resolved.rpcUrl).toBe("https://custom-rpc.example.com");
    expect(resolved.passphrase).toBe(DEFAULT_NETWORK.passphrase);
  });
});
