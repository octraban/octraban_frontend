/**
 * Pluggable error-reporting hook.
 *
 * `ErrorBoundary` (and anything else that catches render/runtime errors)
 * routes what it catches through `reportError` instead of calling
 * `console.error` directly. That keeps a real reporting backend (Sentry,
 * Datadog, a custom endpoint, ...) a `setErrorReporter` call away, without
 * touching the call sites.
 *
 * The default reporter logs a structured entry to the console in
 * development and stays silent in production, so raw error details never
 * reach an end user's console in a production build.
 *
 * Usage:
 *   import { reportError } from "@/services/reporting";
 *   reportError(error, { componentStack, route: window.location.pathname });
 *
 * Tests can swap the reporter out entirely:
 *   import { setErrorReporter } from "../src/services/reporting";
 *   const reporter = vi.fn();
 *   setErrorReporter(reporter);
 *   // ... trigger the error ...
 *   expect(reporter).toHaveBeenCalledWith(error, expect.objectContaining({...}));
 */

export interface ErrorReportContext {
  /** React's component stack trace, when the error came from an ErrorBoundary. */
  componentStack?: string;
  /** The route/path active when the error was caught. */
  route?: string;
  /** Additional caller-supplied context. */
  [key: string]: unknown;
}

export type ErrorReporter = (error: Error, context: ErrorReportContext) => void;

const isDev = import.meta.env.DEV;

const defaultReporter: ErrorReporter = (error, context) => {
  if (isDev) {
    console.error("[ErrorReport]", error, context);
  }
  // Production builds intentionally stay silent here - plug in a real
  // backend via setErrorReporter() to actually deliver these.
};

let activeReporter: ErrorReporter = defaultReporter;

/** Swap in a real reporting backend (or a test spy). */
export function setErrorReporter(reporter: ErrorReporter): void {
  activeReporter = reporter;
}

/** Restore the default (console-in-dev, silent-in-prod) reporter. */
export function resetErrorReporter(): void {
  activeReporter = defaultReporter;
}

/** Report a caught error with context. */
export function reportError(
  error: Error,
  context: ErrorReportContext = {},
): void {
  activeReporter(error, context);
}
