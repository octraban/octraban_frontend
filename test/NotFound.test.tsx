/**
 * Issue #19 — Add a catch-all 404 route
 *
 * Tests:
 *   1. Navigating to an unknown path renders the NotFound component.
 *   2. The NotFound page displays the requested path.
 *   3. The NotFound page provides at least one working link back into the app.
 *   4. Known routes (e.g. "/search") are NOT swallowed by the catch-all.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "../src/pages/NotFound";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQC() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

/**
 * Render the full route tree (mirroring App.tsx) at a given initial path.
 * Keeps the test scope narrow: only the routes we need to exercise here.
 */
function renderAt(initialPath: string) {
  const qc = makeQC();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          {/* Known route — a lightweight stub so we can verify it wins */}
          <Route path="/search" element={<div>SearchPage</div>} />
          {/* Catch-all — must come last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NotFound — catch-all 404 route", () => {
  it("renders '404' heading at an unknown path", () => {
    renderAt("/this/does/not/exist");
    expect(screen.getByText("404")).toBeDefined();
  });

  it("displays the unrecognised path in the message", () => {
    renderAt("/totally/unknown");
    // The component renders the pathname in a <code> block
    expect(screen.getByText("/totally/unknown")).toBeDefined();
  });

  it("shows 'Page not found' heading", () => {
    renderAt("/bad-path");
    expect(
      screen.getByRole("heading", { name: /page not found/i }),
    ).toBeDefined();
  });

  it("renders at least one link back to the home page", () => {
    renderAt("/nonexistent");
    // The nav list includes a "Home" link pointing to "/"
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toBeDefined();
    expect((homeLink as HTMLAnchorElement).getAttribute("href")).toBe("/");
  });

  it("renders all five quick-nav links", () => {
    renderAt("/nonexistent");
    const links = ["Home", "Search", "Graph", "XDR Inspector", "Sandbox"];
    links.forEach((label) => {
      expect(
        screen.getByRole("link", { name: new RegExp(label, "i") }),
      ).toBeDefined();
    });
  });

  it("renders the go-back button", () => {
    renderAt("/nonexistent");
    expect(screen.getByRole("button", { name: /go back/i })).toBeDefined();
  });
});

describe("Known routes — unaffected by catch-all", () => {
  it("renders SearchPage at /search, not the NotFound page", () => {
    renderAt("/search");
    // Known route content should appear
    expect(screen.getByText("SearchPage")).toBeDefined();
    // 404 heading must NOT be visible
    expect(screen.queryByText("404")).toBeNull();
  });

  it("does not show NotFound at the root path", () => {
    const qc = makeQC();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<div>HomePage</div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText("HomePage")).toBeDefined();
    expect(screen.queryByText("404")).toBeNull();
  });
});
