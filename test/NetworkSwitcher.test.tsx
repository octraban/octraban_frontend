import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NetworkSwitcher, {
  isValidHttpUrl,
  validateCustomNetworkForm,
} from "../src/components/NetworkSwitcher";
import {
  BUILTIN_NETWORKS,
  NetworkProvider,
  useNetwork,
} from "../src/contexts/NetworkContext";

function ensureLocalStorage(): Storage {
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof globalThis.localStorage?.getItem === "function" &&
    typeof globalThis.localStorage?.clear === "function"
  ) {
    return globalThis.localStorage;
  }
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
  return memoryStorage;
}

const storage = ensureLocalStorage();

function ActiveNetworkReadout() {
  const { active } = useNetwork();
  return (
    <div data-testid="active-network-readout">
      <span data-testid="active-name">{active.name}</span>
      <span data-testid="active-rpc">{active.rpcUrl}</span>
      <span data-testid="active-horizon">{active.horizonUrl}</span>
      <span data-testid="active-passphrase">{active.passphrase}</span>
    </div>
  );
}

function renderSwitcher() {
  return render(
    <NetworkProvider>
      <NetworkSwitcher />
      <ActiveNetworkReadout />
    </NetworkProvider>,
  );
}

describe("isValidHttpUrl", () => {
  it("accepts well-formed http and https URLs", () => {
    expect(isValidHttpUrl("https://soroban-testnet.stellar.org")).toBe(true);
    expect(isValidHttpUrl("http://localhost:8000")).toBe(true);
    expect(isValidHttpUrl("http://127.0.0.1:8000/soroban/rpc")).toBe(true);
    expect(isValidHttpUrl("http://[::1]:8000")).toBe(true);
    expect(isValidHttpUrl("  https://rpc.example.com/v1  ")).toBe(true);
  });

  it("rejects empty, malformed, relative, and non-http(s) URLs", () => {
    expect(isValidHttpUrl("")).toBe(false);
    expect(isValidHttpUrl("   ")).toBe(false);
    expect(isValidHttpUrl("not-a-url")).toBe(false);
    expect(isValidHttpUrl("/relative/rpc")).toBe(false);
    expect(isValidHttpUrl("soroban-testnet.stellar.org")).toBe(false);
    expect(isValidHttpUrl("ftp://rpc.example.com")).toBe(false);
    expect(isValidHttpUrl("ws://localhost:8000")).toBe(false);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("http://")).toBe(false);
    expect(isValidHttpUrl("https://")).toBe(false);
    expect(isValidHttpUrl("https://.com")).toBe(false);
    expect(isValidHttpUrl("https://example..com")).toBe(false);
    expect(isValidHttpUrl("https://rpc.example.com/with space")).toBe(false);
  });
});

describe("validateCustomNetworkForm", () => {
  it("validates required fields, URL formats, optional Horizon URL, and duplicate names", () => {
    const emptyErrors = validateCustomNetworkForm(
      { name: "  ", rpcUrl: "", horizonUrl: "", passphrase: "   " },
      BUILTIN_NETWORKS,
    );
    expect(emptyErrors.name).toMatch(/required/i);
    expect(emptyErrors.rpcUrl).toMatch(/required/i);
    expect(emptyErrors.passphrase).toMatch(/required/i);
    expect(emptyErrors.horizonUrl).toBeUndefined();

    const dupErrors = validateCustomNetworkForm(
      {
        name: "  tEsTnEt ",
        rpcUrl: "http://localhost:8000",
        horizonUrl: "   ",
        passphrase: "Local Passphrase",
      },
      BUILTIN_NETWORKS,
    );
    expect(dupErrors.name).toMatch(/already exists/i);
    expect(dupErrors.rpcUrl).toBeUndefined();
    expect(dupErrors.horizonUrl).toBeUndefined();
    expect(dupErrors.passphrase).toBeUndefined();
  });
});

describe("NetworkSwitcher custom network validation", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    storage.clear();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    consoleErrorSpy = vi.spyOn(console, "error");
  });

  afterEach(() => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
    storage.clear();
  });

  async function openCustomForm(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /testnet/i }));
    await user.click(
      screen.getByRole("button", { name: /\+ add custom network/i }),
    );
  }

  it("disables save initially without showing premature error alerts", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    const saveBtn = screen.getByRole("button", { name: /save & switch/i });
    expect(saveBtn).toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows field-level error on blur and all required errors when submitting an untouched form", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    const nameInput = screen.getByPlaceholderText(/name/i);
    await user.click(nameInput);
    await user.tab();

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByText(/network name is required/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: /save & switch/i });
    fireEvent.submit(saveBtn.closest("form")!);

    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(screen.getByText(/network name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/rpc url is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/network passphrase is required/i),
    ).toBeInTheDocument();
  });

  it("submitting a malformed RPC URL shows an inline error and does not save", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const rpcInput = screen.getByPlaceholderText(/rpc url/i);
    const passphraseInput = screen.getByPlaceholderText(/network passphrase/i);
    const saveBtn = screen.getByRole("button", { name: /save & switch/i });

    await user.type(nameInput, "Broken RPC");
    await user.type(rpcInput, "not-a-url");
    await user.type(passphraseInput, "Standalone Network ; February 2017");

    expect(saveBtn).toBeDisabled();
    expect(rpcInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      /valid http\(s\) rpc url/i,
    );

    const form = saveBtn.closest("form")!;
    fireEvent.submit(form);

    expect(screen.getByTestId("active-name")).toHaveTextContent("Testnet");
    expect(JSON.parse(storage.getItem("sb-network-custom") || "[]")).toEqual(
      [],
    );

    await user.clear(rpcInput);
    await user.type(rpcInput, "ftp://rpc.example.com");
    expect(saveBtn).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /valid http\(s\) rpc url/i,
    );
  });

  it("rejects missing or whitespace-only name and passphrase with inline field errors", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const rpcInput = screen.getByPlaceholderText(/rpc url/i);
    const passphraseInput = screen.getByPlaceholderText(/network passphrase/i);
    const saveBtn = screen.getByRole("button", { name: /save & switch/i });

    await user.type(nameInput, "   ");
    await user.type(rpcInput, "http://localhost:8000");
    await user.type(passphraseInput, "   ");

    expect(saveBtn).toBeDisabled();
    expect(screen.getByText(/network name is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/network passphrase is required/i),
    ).toBeInTheDocument();

    fireEvent.submit(saveBtn.closest("form")!);
    expect(screen.getByTestId("active-name")).toHaveTextContent("Testnet");
  });

  it("validates optional Horizon URL when provided and allows leaving it blank", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const rpcInput = screen.getByPlaceholderText(/rpc url/i);
    const horizonInput = screen.getByPlaceholderText(/horizon url/i);
    const passphraseInput = screen.getByPlaceholderText(/network passphrase/i);
    const saveBtn = screen.getByRole("button", { name: /save & switch/i });

    await user.type(nameInput, "Local Dev");
    await user.type(rpcInput, "http://localhost:8000");
    await user.type(passphraseInput, "Standalone Network ; February 2017");
    expect(saveBtn).toBeEnabled();

    await user.type(horizonInput, "bad-horizon-url");
    expect(saveBtn).toBeDisabled();
    expect(horizonInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      /valid http\(s\) horizon url/i,
    );

    await user.clear(horizonInput);
    await user.type(horizonInput, "   ");
    expect(horizonInput).toHaveAttribute("aria-invalid", "false");
    expect(saveBtn).toBeEnabled();

    await user.click(saveBtn);
    expect(screen.getByTestId("active-name")).toHaveTextContent("Local Dev");
    expect(screen.getByTestId("active-horizon")).toHaveTextContent(/^$/);
  });

  it("prevents duplicate names against built-in and saved custom networks case-insensitively", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const rpcInput = screen.getByPlaceholderText(/rpc url/i);
    const passphraseInput = screen.getByPlaceholderText(/network passphrase/i);
    const saveBtn = screen.getByRole("button", { name: /save & switch/i });

    await user.type(nameInput, "  mAiNnEt  ");
    await user.type(rpcInput, "http://localhost:8000");
    await user.type(passphraseInput, "Standalone Network ; February 2017");

    expect(saveBtn).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(/already exists/i);

    await user.clear(nameInput);
    await user.type(nameInput, "My Staging RPC");
    expect(saveBtn).toBeEnabled();
    await user.click(saveBtn);

    await user.click(
      screen.getByRole("button", { name: /\+ add custom network/i }),
    );
    await user.type(screen.getByPlaceholderText(/name/i), "  my staging rpc  ");
    await user.type(
      screen.getByPlaceholderText(/rpc url/i),
      "http://localhost:8001",
    );
    await user.type(
      screen.getByPlaceholderText(/network passphrase/i),
      "Staging Passphrase",
    );

    expect(
      screen.getByRole("button", { name: /save & switch/i }),
    ).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(/already exists/i);

    // Removing the custom network frees up the name again
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await user.click(screen.getByTitle("Remove custom network"));
    await user.click(
      screen.getByRole("button", { name: /\+ add custom network/i }),
    );
    await user.type(screen.getByPlaceholderText(/name/i), "My Staging RPC");
    await user.type(
      screen.getByPlaceholderText(/rpc url/i),
      "http://localhost:8001",
    );
    await user.type(
      screen.getByPlaceholderText(/network passphrase/i),
      "Staging Passphrase",
    );
    expect(
      screen.getByRole("button", { name: /save & switch/i }),
    ).toBeEnabled();
  });

  it("saves a valid custom network with trimmed fields and makes it selectable", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    await user.type(screen.getByPlaceholderText(/name/i), "  Local Sandbox  ");
    await user.type(
      screen.getByPlaceholderText(/rpc url/i),
      "  http://localhost:8000/soroban/rpc  ",
    );
    await user.type(
      screen.getByPlaceholderText(/horizon url/i),
      "  http://localhost:8000  ",
    );
    await user.type(
      screen.getByPlaceholderText(/network passphrase/i),
      "  Standalone Network ; February 2017  ",
    );

    const saveBtn = screen.getByRole("button", { name: /save & switch/i });
    expect(saveBtn).toBeEnabled();
    await user.click(saveBtn);

    expect(screen.getByTestId("active-name")).toHaveTextContent(
      /^Local Sandbox$/,
    );
    expect(screen.getByTestId("active-rpc")).toHaveTextContent(
      /^http:\/\/localhost:8000\/soroban\/rpc$/,
    );
    expect(screen.getByTestId("active-horizon")).toHaveTextContent(
      /^http:\/\/localhost:8000$/,
    );
    expect(screen.getByTestId("active-passphrase")).toHaveTextContent(
      /^Standalone Network ; February 2017$/,
    );

    const stored = JSON.parse(storage.getItem("sb-network-custom") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      name: "Local Sandbox",
      rpcUrl: "http://localhost:8000/soroban/rpc",
      horizonUrl: "http://localhost:8000",
      passphrase: "Standalone Network ; February 2017",
    });

    await user.click(screen.getByText("Testnet"));
    expect(screen.getByTestId("active-name")).toHaveTextContent("Testnet");

    await user.click(screen.getByRole("button", { name: /testnet/i }));
    await user.click(screen.getByText("Local Sandbox"));
    expect(screen.getByTestId("active-name")).toHaveTextContent(
      "Local Sandbox",
    );
  });

  it("surfaces RPC reachability check results without blocking save when unreachable or degraded", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    await user.type(screen.getByPlaceholderText(/name/i), "Offline Local");
    await user.type(
      screen.getByPlaceholderText(/rpc url/i),
      "http://localhost:8000",
    );
    await user.type(
      screen.getByPlaceholderText(/network passphrase/i),
      "Standalone Network ; February 2017",
    );

    await user.click(screen.getByRole("button", { name: /check rpc/i }));

    const status = await screen.findByTestId("rpc-reachability-status");
    expect(status).toHaveTextContent(/could not reach rpc endpoint/i);

    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    await user.click(screen.getByRole("button", { name: /check rpc/i }));
    await waitFor(() => {
      expect(screen.getByTestId("rpc-reachability-status")).toHaveTextContent(
        /non-ok status/i,
      );
    });

    const saveBtn = screen.getByRole("button", { name: /save & switch/i });
    expect(saveBtn).toBeEnabled();
    await user.click(saveBtn);

    expect(screen.getByTestId("active-name")).toHaveTextContent(
      "Offline Local",
    );
  });

  it("surfaces reachable status when RPC health check succeeds", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    await user.type(
      screen.getByPlaceholderText(/rpc url/i),
      "https://rpc.example.com",
    );

    await waitFor(() => {
      expect(screen.getByTestId("rpc-reachability-status")).toHaveTextContent(
        /rpc reachable/i,
      );
    });
  });

  it("resets form inputs and validation errors when cancelled", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await openCustomForm(user);

    await user.type(screen.getByPlaceholderText(/rpc url/i), "invalid-url");
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await user.click(
      screen.getByRole("button", { name: /\+ add custom network/i }),
    );

    expect(screen.getByPlaceholderText(/rpc url/i)).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("ignores malformed custom networks previously stored in localStorage", async () => {
    storage.setItem(
      "sb-network-custom",
      JSON.stringify([
        {
          id: "custom-bad-1",
          kind: "custom",
          custom: true,
          name: "",
          rpcUrl: "not-a-url",
          horizonUrl: "",
          passphrase: "",
        },
        {
          id: "custom-good-1",
          kind: "custom",
          custom: true,
          name: "  Valid Stored  ",
          rpcUrl: "https://valid-rpc.example.com",
          horizonUrl: "",
          passphrase: "Stored Passphrase",
        },
      ]),
    );

    const user = userEvent.setup({ delay: null });
    renderSwitcher();
    await user.click(screen.getByRole("button", { name: /testnet/i }));

    expect(screen.getByText("Valid Stored")).toBeInTheDocument();
    expect(screen.queryByText("not-a-url")).not.toBeInTheDocument();
  });
});
