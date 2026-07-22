/**
 * BackendStatusBanner
 *
 * Performs a lightweight health-check against the indexer backend on mount
 * (and every POLL_INTERVAL ms thereafter). Shows a dismissible, non-blocking
 * warning banner while the backend is unreachable so users get a clear signal
 * instead of silent fetch failures scattered across the app.
 *
 * Health endpoint: GET /api/health
 * The banner is hidden once the backend responds with any 2xx status.
 */

import { useEffect, useRef, useState } from "react";

/** How often to re-check when the backend is unreachable (ms). */
const POLL_INTERVAL = 15_000;

/** Resolved from VITE_INDEXER_URL at build time; falls back to localhost. */
const INDEXER_URL =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_INDEXER_URL ?? "http://localhost:3001";

type Status = "checking" | "ok" | "unreachable";

async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}

export default function BackendStatusBanner() {
  const [status, setStatus] = useState<Status>("checking");
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const reachable = await checkHealth();
      if (cancelled) return;

      setStatus(reachable ? "ok" : "unreachable");

      // Keep polling while unreachable so the banner auto-hides when the
      // backend comes back up.
      if (!reachable) {
        timerRef.current = setTimeout(poll, POLL_INTERVAL);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timerRef.current != null) clearTimeout(timerRef.current);
    };
  }, []);

  // When the backend recovers, un-dismiss so the banner (re-)disappears cleanly.
  useEffect(() => {
    if (status === "ok") setDismissed(false);
  }, [status]);

  if (status !== "unreachable" || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid="backend-status-banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 20px",
        background: "#3a1a0a",
        borderBottom: "1px solid var(--red, #f85149)",
        color: "var(--text, #e6edf3)",
      }}
    >
      {/* Icon */}
      <span
        aria-hidden="true"
        style={{ fontSize: 18, lineHeight: 1, marginTop: 1, flexShrink: 0 }}
      >
        ⚠
      </span>

      {/* Message */}
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6 }}>
        <span
          style={{
            fontWeight: 700,
            color: "var(--red, #f85149)",
            marginRight: 8,
          }}
        >
          Indexer unreachable
        </span>
        The Octraban backend could not be reached at{" "}
        <code
          style={{
            fontSize: 12,
            padding: "1px 5px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          {INDEXER_URL}
        </code>
        . Contract data, events, and search results will not load until the
        backend is running. See the{" "}
        <a
          href="https://github.com/pharuq411/octraban_frontend#-how-it-fits-together"
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: "var(--accent, #58a6ff)" }}
        >
          setup guide
        </a>{" "}
        for instructions.
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss backend unreachable warning"
        style={{
          flexShrink: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted, #8b949e)",
          fontSize: 18,
          lineHeight: 1,
          padding: "0 2px",
        }}
      >
        ✕
      </button>
    </div>
  );
}
