import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ address: "GA3X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X" }),
}));

const mockWallet = vi.fn();

vi.mock("../src/api", () => ({
  api: {
    wallet: mockWallet,
  },
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("WalletPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with empty-state message when no events", async () => {
    mockWallet.mockResolvedValue([]);
    const WalletPage = (await import("../src/pages/WalletPage")).default;
    render(
      <Wrapper>
        <WalletPage />
      </Wrapper>,
    );
    expect(
      await screen.findByText("No Soroban interactions found for this address"),
    ).toBeDefined();
  });

  it("shows address in page heading even with no events", async () => {
    mockWallet.mockResolvedValue([]);
    const WalletPage = (await import("../src/pages/WalletPage")).default;
    render(
      <Wrapper>
        <WalletPage />
      </Wrapper>,
    );
    expect(
      await screen.findByText("GA3X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X"),
    ).toBeDefined();
  });

  it("shows error state when the API request fails", async () => {
    mockWallet.mockRejectedValue(new Error("API 503: /wallet/GA3X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X"));
    const WalletPage = (await import("../src/pages/WalletPage")).default;
    render(
      <Wrapper>
        <WalletPage />
      </Wrapper>,
    );
    expect(await screen.findByTestId("error-state")).toBeDefined();
    expect(
      screen.getByText(/Could not reach the indexer backend/i),
    ).toBeDefined();
  });
});
