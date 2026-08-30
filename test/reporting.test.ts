import { describe, it, expect, vi, afterEach } from "vitest";
import {
  reportError,
  setErrorReporter,
  resetErrorReporter,
} from "../src/services/reporting";

describe("reporting", () => {
  afterEach(() => {
    resetErrorReporter();
  });

  it("delegates to a reporter installed via setErrorReporter", () => {
    const reporter = vi.fn();
    setErrorReporter(reporter);

    const error = new Error("boom");
    reportError(error, { componentStack: "at Bomb", route: "/sandbox" });

    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter).toHaveBeenCalledWith(error, {
      componentStack: "at Bomb",
      route: "/sandbox",
    });
  });

  it("defaults to a no-arg context", () => {
    const reporter = vi.fn();
    setErrorReporter(reporter);

    const error = new Error("boom");
    reportError(error);

    expect(reporter).toHaveBeenCalledWith(error, {});
  });

  it("resetErrorReporter restores the default reporter", () => {
    const reporter = vi.fn();
    setErrorReporter(reporter);
    resetErrorReporter();

    reportError(new Error("boom"));

    expect(reporter).not.toHaveBeenCalled();
  });
});
