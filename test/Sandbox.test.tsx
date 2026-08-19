import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NetworkProvider } from "../src/contexts/NetworkContext";

const mountFilesMock = vi.fn().mockResolvedValue(undefined);
const initWebContainerMock = vi.fn().mockResolvedValue({});
const runCommandMock = vi.fn().mockResolvedValue(0);

vi.mock("../src/services/webcontainer", async () => {
  const actual = await vi.importActual<
    typeof import("../src/services/webcontainer")
  >("../src/services/webcontainer");
  return {
    ...actual,
    initWebContainer: (...args: unknown[]) => initWebContainerMock(...args),
    mountFiles: (...args: unknown[]) => mountFilesMock(...args),
    runCommand: (...args: unknown[]) => runCommandMock(...args),
  };
});

vi.mock("../src/services/sandbox-api", () => ({
  saveSandbox: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/components/Editor", () => ({
  default: () => <div data-testid="mock-editor" />,
}));

const MOCK_RPC_URL = "https://mock-rpc.example.com";
const MOCK_PASSPHRASE = "Mock Passphrase ; For Testing";

vi.mock("../src/config/network", async () => {
  const actual = await vi.importActual<
    typeof import("../src/config/network")
  >("../src/config/network");
  return {
    ...actual,
    getBuiltinNetworks: () => [
      {
        id: "testnet",
        kind: "testnet" as const,
        name: "Testnet",
        rpcUrl: MOCK_RPC_URL,
        horizonUrl: "https://mock-horizon.example.com",
        passphrase: MOCK_PASSPHRASE,
      },
    ],
  };
});

import Sandbox from "../src/pages/Sandbox";

describe("Sandbox", () => {
  beforeEach(() => {
    localStorage.clear();
    mountFilesMock.mockClear();
  });

  it("mounts the sandbox with the resolved network's RPC URL and passphrase", async () => {
    render(
      <NetworkProvider>
        <Sandbox />
      </NetworkProvider>,
    );

    fireEvent.click(await screen.findByText(/Node\.js SDK/i));

    await waitFor(() => expect(mountFilesMock).toHaveBeenCalled());

    const mountedFiles = mountFilesMock.mock.calls[0][1] as Map<
      string,
      { content: string }
    >;
    const envFile = mountedFiles.get(".env");

    expect(envFile?.content).toContain(MOCK_RPC_URL);
    expect(envFile?.content).toContain(MOCK_PASSPHRASE);
  });
});
