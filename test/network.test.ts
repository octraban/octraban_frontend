import { describe, it, expect, afterEach, vi } from "vitest";
import {
  DEFAULT_TESTNET_PASSPHRASE,
  DEFAULT_TESTNET_RPC_URL,
  applyNetworkToEnvContent,
  getBuiltinNetworks,
  resolveActiveNetwork,
} from "../src/config/network";

describe("network config resolver", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns testnet defaults when env is unset", () => {
    vi.stubEnv("VITE_SOROBAN_RPC_URL", "");
    vi.stubEnv("VITE_NETWORK_PASSPHRASE", "");

    const [testnet] = getBuiltinNetworks();

    expect(testnet.id).toBe("testnet");
    expect(testnet.rpcUrl).toBe(DEFAULT_TESTNET_RPC_URL);
    expect(testnet.passphrase).toBe(DEFAULT_TESTNET_PASSPHRASE);
  });

  it("returns overridden values when env is set", () => {
    vi.stubEnv("VITE_SOROBAN_RPC_URL", "https://custom-rpc.example.com");
    vi.stubEnv("VITE_NETWORK_PASSPHRASE", "Custom Network ; Test 2026");

    const [testnet] = getBuiltinNetworks();

    expect(testnet.rpcUrl).toBe("https://custom-rpc.example.com");
    expect(testnet.passphrase).toBe("Custom Network ; Test 2026");
  });

  it("does not affect the built-in mainnet/futurenet entries", () => {
    vi.stubEnv("VITE_SOROBAN_RPC_URL", "https://custom-rpc.example.com");
    vi.stubEnv("VITE_NETWORK_PASSPHRASE", "Custom Network ; Test 2026");

    const [, mainnet, futurenet] = getBuiltinNetworks();

    expect(mainnet.passphrase).toBe(
      "Public Global Stellar Network ; September 2015",
    );
    expect(futurenet.passphrase).toBe(
      "Test SDF Future Network ; October 2022",
    );
  });

  it("resolves the active network by id, falling back to testnet", () => {
    const custom = {
      id: "custom-1",
      kind: "custom" as const,
      name: "Local RPC",
      rpcUrl: "http://localhost:8000",
      horizonUrl: "",
      passphrase: "Local Network",
      custom: true,
    };

    expect(resolveActiveNetwork([custom], "custom-1")).toEqual(custom);
    expect(resolveActiveNetwork([custom], "unknown-id").id).toBe("testnet");
    expect(resolveActiveNetwork().id).toBe("testnet");
  });

  it("rewrites the RPC URL and appends the passphrase in template env files", () => {
    const content = `SOROBAN_RPC_URL=${DEFAULT_TESTNET_RPC_URL}\nEXPLORER_CONTRACT_ID=CABCD\n`;
    const network = {
      id: "custom-1",
      kind: "custom" as const,
      name: "Local RPC",
      rpcUrl: "http://localhost:8000",
      horizonUrl: "",
      passphrase: "Local Network",
      custom: true,
    };

    const updated = applyNetworkToEnvContent(content, network);

    expect(updated).toContain("SOROBAN_RPC_URL=http://localhost:8000");
    expect(updated).toContain("NETWORK_PASSPHRASE=Local Network");
    expect(updated).not.toContain(DEFAULT_TESTNET_RPC_URL);
  });

  it("updates an existing passphrase entry in place instead of duplicating it", () => {
    const content = `SOROBAN_RPC_URL=${DEFAULT_TESTNET_RPC_URL}\nNETWORK_PASSPHRASE=Old\n`;
    const network = {
      id: "custom-1",
      kind: "custom" as const,
      name: "Local RPC",
      rpcUrl: "http://localhost:8000",
      horizonUrl: "",
      passphrase: "New",
      custom: true,
    };

    const updated = applyNetworkToEnvContent(content, network);

    expect(updated.match(/NETWORK_PASSPHRASE=/g)).toHaveLength(1);
    expect(updated).toContain("NETWORK_PASSPHRASE=New");
    expect(updated).not.toContain("Old");
  });
});
