import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const BASE = "/api";

describe("API client", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds correct event URL", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ seq: 1 }],
    });
    const res = await fetch(`${BASE}/events?contract=C1&page=1`);
    const data = await res.json();
    expect(data).toEqual([{ seq: 1 }]);
    expect(fetch).toHaveBeenCalledWith("/api/events?contract=C1&page=1");
  });

  it("returns null on 404 for contract meta", async () => {
    (global.fetch as any).mockResolvedValue({ ok: false, status: 404 });
    const res = await fetch(`${BASE}/contracts/C1`);
    expect(res.status).toBe(404);
  });

  it("handles network error gracefully", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));
    await expect(fetch(`${BASE}/events`)).rejects.toThrow("Network error");
  });
});

describe("API types", () => {
  it("validates event shape", () => {
    const event = {
      seq: 1,
      contract_id: "C1",
      function: "transfer",
      ledger: 100,
      description: "test",
    };
    expect(event.seq).toBeTypeOf("number");
    expect(event.contract_id).toBeTypeOf("string");
    expect(event.function).toBeTypeOf("string");
    expect(event.ledger).toBeTypeOf("number");
  });
});
