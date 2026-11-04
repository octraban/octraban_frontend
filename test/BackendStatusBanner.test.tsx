/**
 * Tests for BackendStatusBanner
 *
 * Verifies that:
 *  - The banner is shown when the health check fails (non-ok or network error)
 *  - The banner is hidden when the health check succeeds
 *  - The banner can be dismissed by the user
 *  - The configured indexer URL is shown in the banner text
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BackendStatusBanner, {
  checkHealth,
  resolveIndexerDisplayUrl,
} from "../src/components/BackendStatusBanner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Make global.fetch resolve with a given status code. */
function mockFetchOk() {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
}

function mockFetchFail() {
  global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BackendStatusBanner", () => {
  it("shows the banner when the health check fails with a non-ok response", async () => {
    mockFetchFail();
    render(<BackendStatusBanner />);

    await waitFor(() => {
      expect(screen.getByTestId("backend-status-banner")).toBeInTheDocument();
    });

    expect(screen.getByText(/indexer unreachable/i)).toBeInTheDocument();
  });

  it("shows the banner when the health check throws a network error", async () => {
    mockFetchNetworkError();
    render(<BackendStatusBanner />);

    await waitFor(() => {
      expect(screen.getByTestId("backend-status-banner")).toBeInTheDocument();
    });
  });

  it("displays the configured indexer URL in the banner", async () => {
    mockFetchFail();
    render(<BackendStatusBanner />);

    await waitFor(() => {
      expect(screen.getByTestId("backend-status-banner")).toBeInTheDocument();
    });

    // The banner must mention the URL so users know where to point their backend.
    expect(screen.getByText(/localhost:3001/i)).toBeInTheDocument();
  });

  it("does NOT show the banner when the health check succeeds", async () => {
    mockFetchOk();
    render(<BackendStatusBanner />);

    // Wait for a short tick to let the promise resolve
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(
      screen.queryByTestId("backend-status-banner"),
    ).not.toBeInTheDocument();
  });

  it("hides the banner after the user dismisses it", async () => {
    mockFetchFail();
    const user = userEvent.setup();
    render(<BackendStatusBanner />);

    await waitFor(() => {
      expect(screen.getByTestId("backend-status-banner")).toBeInTheDocument();
    });

    const dismissBtn = screen.getByRole("button", {
      name: /dismiss backend unreachable warning/i,
    });
    await user.click(dismissBtn);

    expect(
      screen.queryByTestId("backend-status-banner"),
    ).not.toBeInTheDocument();
  });

  it("calls /api/health endpoint", async () => {
    mockFetchFail();
    render(<BackendStatusBanner />);

    await waitFor(() => {
      expect(screen.getByTestId("backend-status-banner")).toBeInTheDocument();
    });

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/health");
  });

  it("has role=alert for assistive technology", async () => {
    mockFetchFail();
    render(<BackendStatusBanner />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("resolves health URL from VITE_API_URL and rejects SPA HTML fallbacks", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
    });
    await expect(
      checkHealth({ VITE_API_URL: "https://indexer.example.com/" }),
    ).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://indexer.example.com/api/health",
      expect.any(Object),
    );

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
    });
    await expect(checkHealth({})).resolves.toBe(false);
  });

  it("prefers VITE_API_URL over VITE_INDEXER_URL for banner display text", () => {
    expect(
      resolveIndexerDisplayUrl({
        VITE_API_URL: "https://indexer.example.com",
        VITE_INDEXER_URL: "http://localhost:3001",
      }),
    ).toBe("https://indexer.example.com");
    expect(
      resolveIndexerDisplayUrl({
        VITE_INDEXER_URL: "http://localhost:4000",
      }),
    ).toBe("http://localhost:4000");
    expect(resolveIndexerDisplayUrl({})).toBe("http://localhost:3001");
  });
});
