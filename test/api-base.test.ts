import { describe, it, expect, vi, afterEach } from "vitest";
import { buildApiUrl, resolveApiBase, resolveWsUrl } from "../src/api";
import {
  saveSandbox,
  loadSandbox,
  listSandboxes,
  deleteSandbox,
} from "../src/services/sandbox-api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveApiBase", () => {
  it("returns the env value joined with /api when VITE_API_URL is set", () => {
    expect(resolveApiBase({ VITE_API_URL: "http://localhost:3001" })).toBe(
      "http://localhost:3001/api",
    );
  });

  it("strips trailing slashes before appending /api", () => {
    expect(
      resolveApiBase({ VITE_API_URL: "https://indexer.example.com///" }),
    ).toBe("https://indexer.example.com/api");
  });

  it("does not duplicate /api when VITE_API_URL already ends with /api", () => {
    expect(
      resolveApiBase({ VITE_API_URL: "https://indexer.example.com/api/" }),
    ).toBe("https://indexer.example.com/api");
  });

  it("falls back to the relative /api path when unset or blank", () => {
    expect(resolveApiBase({})).toBe("/api");
    expect(resolveApiBase({ VITE_API_URL: "   " })).toBe("/api");
  });
});

describe("buildApiUrl", () => {
  it("builds relative /api paths when VITE_API_URL is unset", () => {
    expect(buildApiUrl("/health", {})).toBe("/api/health");
    expect(buildApiUrl("events?page=1", {})).toBe("/api/events?page=1");
    expect(buildApiUrl("/api/simulate", {})).toBe("/api/simulate");
    expect(buildApiUrl("/api", {})).toBe("/api");
  });

  it("builds absolute indexer URLs when VITE_API_URL is configured", () => {
    const env = { VITE_API_URL: "https://indexer.example.com/" };
    expect(buildApiUrl("/health", env)).toBe(
      "https://indexer.example.com/api/health",
    );
    expect(buildApiUrl("/api/sandbox/abc", env)).toBe(
      "https://indexer.example.com/api/sandbox/abc",
    );
  });
});

describe("resolveWsUrl", () => {
  it("derives wss/ws host from VITE_API_URL when configured", () => {
    expect(
      resolveWsUrl(
        { VITE_API_URL: "https://indexer.example.com/api" },
        { protocol: "https:", host: "app.vercel.app" },
      ),
    ).toBe("wss://indexer.example.com");

    expect(
      resolveWsUrl(
        { VITE_API_URL: "http://localhost:3001" },
        { protocol: "http:", host: "localhost:5173" },
      ),
    ).toBe("ws://localhost:3001");
  });

  it("falls back to window location when VITE_API_URL is unset or relative", () => {
    expect(
      resolveWsUrl({}, { protocol: "https:", host: "explorer.example.com" }),
    ).toBe("wss://explorer.example.com");
    expect(
      resolveWsUrl(
        { VITE_API_URL: "/not-an-origin" },
        { protocol: "http:", host: "localhost:5173" },
      ),
    ).toBe("ws://localhost:5173");
  });
});

describe("sandbox-api routing", () => {
  it("routes save, load, list, and delete calls through /api/sandbox*", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: async () => ({ sandboxes: [], total: 0 }),
    });
    global.fetch = fetchMock;

    await saveSandbox("sb-1", "tpl", new Map([["index.ts", { content: "1" }]]));
    await loadSandbox("sb-1");
    await listSandboxes(10, 5);
    await deleteSandbox("sb-1");

    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      "/api/sandbox",
      "/api/sandbox/sb-1",
      "/api/sandboxes?limit=10&offset=5",
      "/api/sandbox/sb-1",
    ]);
  });
});
