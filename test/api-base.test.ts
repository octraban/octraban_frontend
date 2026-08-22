import { describe, it, expect } from "vitest";
import { resolveApiBase } from "../src/api";

describe("resolveApiBase", () => {
  it("returns the env value joined with /api when VITE_API_URL is set", () => {
    expect(resolveApiBase({ VITE_API_URL: "http://localhost:3001" })).toBe(
      "http://localhost:3001/api",
    );
  });

  it("falls back to the relative /api path (dev proxy) when unset", () => {
    expect(resolveApiBase({})).toBe("/api");
  });
});
