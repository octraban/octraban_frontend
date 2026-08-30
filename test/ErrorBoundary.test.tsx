import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../src/components/ErrorBoundary";

const reportError = vi.fn();
vi.mock("../src/services/reporting", () => ({
  reportError: (...args: unknown[]) => reportError(...args),
}));

function Bomb() {
  throw new Error("💥");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    reportError.mockClear();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <p>Hello</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Hello")).toBeDefined();
    expect(reportError).not.toHaveBeenCalled();
  });

  it("catches errors and shows fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("💥")).toBeDefined();
    expect(screen.getByText("Reload page")).toBeDefined();
    vi.restoreAllMocks();
  });

  it("accepts custom fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>Custom error</p>}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom error")).toBeDefined();
    vi.restoreAllMocks();
  });

  it("invokes the reporting hook with the error and component stack", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(reportError).toHaveBeenCalledTimes(1);
    const [error, context] = reportError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("💥");
    expect(typeof context.componentStack).toBe("string");
    expect(context.componentStack).toContain("Bomb");
    vi.restoreAllMocks();
  });
});
