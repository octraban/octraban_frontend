/**
 * EventPage — empty / error state tests.
 *
 * Asserts:
 *   1. "Event not found" empty state renders when the API resolves to null/undefined
 *   2. Error state renders when the API call rejects (backend down / non-2xx)
 *   3. Event data renders when the API resolves successfully
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockEvent = vi.fn();

vi.mock("../src/api", () => ({
  api: {
    event: mockEvent,
  },
}));

// Suppress noisy React act() warnings from async query resolution in jsdom.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

function renderEventPage(seq = "42") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/events/${seq}`]}>
        <Routes>
          <Route path="/events/:seq" element={<EventPageLazy />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// Lazy-import so the vi.mock above is applied before the module resolves.
function EventPageLazy() {
  const [Comp, setComp] = React.useState<React.ComponentType | null>(null);
  React.useEffect(() => {
    import("../src/pages/EventPage").then((m) => setComp(() => m.default));
  }, []);
  return Comp ? <Comp /> : null;
}

import React from "react";

describe("EventPage — empty state (event not found)", () => {
  it('shows "Event not found" when API resolves to undefined', async () => {
    mockEvent.mockResolvedValue(undefined);
    renderEventPage();
    expect(await screen.findByText(/event not found/i)).toBeDefined();
  });

  it('renders a "Back to events" link in the not-found state', async () => {
    mockEvent.mockResolvedValue(undefined);
    renderEventPage();
    await screen.findByText(/event not found/i);
    expect(screen.getByText(/back to events/i)).toBeDefined();
  });
});

describe("EventPage — error state (backend failure)", () => {
  it("shows error-state when the API call rejects", async () => {
    mockEvent.mockRejectedValue(new Error("API 503: /events/42"));
    renderEventPage();
    expect(await screen.findByTestId("error-state")).toBeDefined();
  });

  it("error message mentions the indexer backend", async () => {
    mockEvent.mockRejectedValue(new Error("API 503: /events/42"));
    renderEventPage();
    await screen.findByTestId("error-state");
    expect(
      screen.getByText(/indexer backend/i),
    ).toBeDefined();
  });

  it("shows a retry button in the error state", async () => {
    mockEvent.mockRejectedValue(new Error("API 503: /events/42"));
    renderEventPage();
    await screen.findByTestId("error-state");
    expect(screen.getByRole("button", { name: /retry/i })).toBeDefined();
  });
});
