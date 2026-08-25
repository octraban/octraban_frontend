/**
 * Verifies the Sandbox page scaffolds template files using the passphrase
 * and RPC URL resolved by src/config/network.ts, rather than a hardcoded
 * value, so the WebContainer templates always match the app's configured
 * network.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sandbox from "../src/pages/Sandbox";
import type { SandboxFile } from "../src/services/webcontainer";

const { mockNetwork, mountFiles } = vi.hoisted(() => ({
  mockNetwork: {
    id: "testnet",
    name: "Testnet",
    rpcUrl: "https://mock-rpc.example.com",
    horizonUrl: "https://mock-horizon.example.com",
    passphrase: "Mock Network Passphrase ; 2026",
  },
  mountFiles: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/config/network", () => ({
  resolveActiveNetwork: vi.fn(() => mockNetwork),
  DEFAULT_NETWORK: mockNetwork,
}));

vi.mock("../src/services/webcontainer", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/services/webcontainer")>();
  return {
    ...actual,
    initWebContainer: vi.fn().mockResolvedValue({}),
    mountFiles,
    runCommand: vi.fn().mockResolvedValue(0),
  };
});

vi.mock("../src/services/sandbox-api", () => ({
  saveSandbox: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/services/session", () => ({
  createAutoSaver: vi.fn(() => vi.fn()),
}));

vi.mock("../src/components/Editor", () => ({ default: () => null }));
vi.mock("../src/components/FileExplorer", () => ({ default: () => null }));
vi.mock("../src/components/Terminal", () => ({ default: () => null }));
vi.mock("../src/components/Preview", () => ({ default: () => null }));
vi.mock("../src/components/ActionBar", () => ({ default: () => null }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("Sandbox", () => {
  it("scaffolds the selected template with the resolved network's passphrase and RPC URL", async () => {
    const user = userEvent.setup();
    render(<Sandbox />);

    const templateButton = await screen.findByText("Node.js SDK");
    await user.click(templateButton);

    await waitFor(() => {
      expect(mountFiles).toHaveBeenCalled();
    });

    const filesMap = mountFiles.mock.calls[0][1] as Map<string, SandboxFile>;
    const envFile = filesMap.get(".env");

    expect(envFile?.content).toContain(mockNetwork.rpcUrl);
    expect(envFile?.content).toContain(mockNetwork.passphrase);
  });
});
