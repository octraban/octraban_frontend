import { describe, it, expect } from "vitest";
import {
  DEFAULT_NETWORK,
  applyNetworkToEnvContent,
  resolveActiveNetwork,
} from "../src/config/network";
import { BUILTIN_NETWORKS } from "../src/contexts/NetworkContext";

describe("network config resolver", () => {
  it("returns testnet defaults when env is unset", () => {
    const active = resolveActiveNetwork({});

    expect(active.id).toBe("testnet");
    expect(active.rpcUrl).toBe(DEFAULT_NETWORK.rpcUrl);
    expect(active.passphrase).toBe(DEFAULT_NETWORK.passphrase);
  });

  it("returns overridden values when env is set", () => {
    const active = resolveActiveNetwork({
      VITE_SOROBAN_RPC_URL: "https://custom-rpc.example.com",
      VITE_NETWORK_PASSPHRASE: "Custom Network ; Test 2026",
    });

    expect(active.rpcUrl).toBe("https://custom-rpc.example.com");
    expect(active.passphrase).toBe("Custom Network ; Test 2026");
  });

  it("exposes built-in testnet/mainnet/futurenet entries with stable passphrases", () => {
    const [testnet, mainnet, futurenet] = BUILTIN_NETWORKS;

    expect(testnet.id).toBe("testnet");
    expect(mainnet.passphrase).toBe(
      "Public Global Stellar Network ; September 2015",
    );
    expect(futurenet.passphrase).toBe("Test SDF Future Network ; October 2022");
  });

  it("rewrites the RPC URL and appends the passphrase in template env files", () => {
    const content = `SOROBAN_RPC_URL=${DEFAULT_NETWORK.rpcUrl}\nEXPLORER_CONTRACT_ID=CABCD\n`;
    const network = {
      rpcUrl: "http://localhost:8000",
      passphrase: "Local Network",
    };

    const updated = applyNetworkToEnvContent(content, network);

    expect(updated).toContain("SOROBAN_RPC_URL=http://localhost:8000");
    expect(updated).toContain("NETWORK_PASSPHRASE=Local Network");
    expect(updated).not.toContain(DEFAULT_NETWORK.rpcUrl);
  });

  it("updates an existing passphrase entry in place instead of duplicating it", () => {
    const content = `SOROBAN_RPC_URL=${DEFAULT_NETWORK.rpcUrl}\nNETWORK_PASSPHRASE=Old\n`;
    const network = {
      rpcUrl: "http://localhost:8000",
      passphrase: "New",
    };

    const updated = applyNetworkToEnvContent(content, network);

    expect(updated.match(/NETWORK_PASSPHRASE=/g)).toHaveLength(1);
    expect(updated).toContain("NETWORK_PASSPHRASE=New");
    expect(updated).not.toContain("Old");
  });
});
