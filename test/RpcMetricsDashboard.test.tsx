import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RpcMetricsDashboard from "../src/pages/RpcMetricsDashboard";

const { mockRpcMetrics } = vi.hoisted(() => ({
  mockRpcMetrics: vi.fn(),
}));

vi.mock("../src/api", () => ({
  api: {
    rpcMetrics: mockRpcMetrics,
  },
}));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderDashboard() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <RpcMetricsDashboard />
    </QueryClientProvider>,
  );
}

describe("RpcMetricsDashboard", () => {
  it("shows loading state initially", () => {
    mockRpcMetrics.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText(/loading…/i)).toBeDefined();
  });

  it("shows error state when API rejects", async () => {
    mockRpcMetrics.mockRejectedValue(new Error("API 503"));
    renderDashboard();
    expect(await screen.findByTestId("error-state")).toBeDefined();
    expect(screen.getByText(/Failed to load metrics/i)).toBeDefined();
  });

  it("shows empty state when no metrics are returned", async () => {
    mockRpcMetrics.mockResolvedValue([]);
    renderDashboard();
    expect(await screen.findByTestId("empty-state")).toBeDefined();
    expect(screen.getByText(/No RPC nodes configured/i)).toBeDefined();
  });

  it("renders metrics when data is provided", async () => {
    const mockData = [
      {
        url: "https://soroban-testnet.stellar.org",
        latencyAvgMs: 120,
        latencyP95Ms: 250,
        errorRate: 0.01,
        uptime: 99.9,
        lastLedger: 123456,
        sampleCount: 100,
        history: [100, 150, 120],
      },
    ];
    mockRpcMetrics.mockResolvedValue(mockData);
    renderDashboard();
    
    expect(await screen.findByText("https://soroban-testnet.stellar.org")).toBeDefined();
    expect(screen.getByText("120 ms")).toBeDefined();
    expect(screen.getByText("250 ms")).toBeDefined();
    expect(screen.getByText("99.9%")).toBeDefined();
  });
});
