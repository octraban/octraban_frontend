import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchPage from "../src/pages/SearchPage";

describe("SearchPage", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders no results empty state with echoed query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: "nonexistent",
        contracts: [],
        events: [],
        wallets: [],
        suggestions: [],
      }),
    });

    (global as any).fetch = fetchMock;
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/search?q=nonexistent"]}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const resultMessage = await screen.findByText((_, element) => {
      const matchesText = /No results for.*nonexistent/i.test(
        element?.textContent ?? "",
      );
      const childrenMatch = Array.from(element?.children ?? []).some((child) =>
        /No results for.*nonexistent/i.test(child.textContent ?? ""),
      );
      return matchesText && !childrenMatch;
    });
    expect(resultMessage).toBeDefined();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/search?q=nonexistent&limit=50",
    );
  });

  it("debounces rapid typing into a single lookup", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: "swap",
        contracts: [],
        events: [],
        wallets: [],
        suggestions: [],
      }),
    });
    global.fetch = fetchMock;

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/search"]}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const input = screen.getByPlaceholderText(/search by contract/i);
    fireEvent.change(input, { target: { value: "s" } });
    fireEvent.change(input, { target: { value: "sw" } });
    fireEvent.change(input, { target: { value: "swap" } });

    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(299);
    expect(fetchMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await vi.runOnlyPendingTimersAsync();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/search?q=swap&limit=50");
  });
});
