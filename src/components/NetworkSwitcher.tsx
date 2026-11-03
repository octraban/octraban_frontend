import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isValidHttpUrl } from "../config/network";
import {
  NETWORK_COLORS,
  useNetwork,
  type NetworkConfig,
} from "../contexts/NetworkContext";

export { isValidHttpUrl };

export interface CustomNetworkFormValues {
  name: string;
  rpcUrl: string;
  horizonUrl: string;
  passphrase: string;
}

export type CustomNetworkField = keyof CustomNetworkFormValues;

export type CustomNetworkFormErrors = Partial<
  Record<CustomNetworkField, string>
>;

export function validateCustomNetworkForm(
  values: CustomNetworkFormValues,
  existingNetworks: ReadonlyArray<Pick<NetworkConfig, "name">>,
): CustomNetworkFormErrors {
  const errors: CustomNetworkFormErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = "Network name is required.";
  } else {
    const normalized = name.toLowerCase();
    const isDuplicate = existingNetworks.some(
      (n) => n.name.trim().toLowerCase() === normalized,
    );
    if (isDuplicate) {
      errors.name = "A network with this name already exists.";
    }
  }

  const rpcUrl = values.rpcUrl.trim();
  if (!rpcUrl) {
    errors.rpcUrl = "RPC URL is required.";
  } else if (!isValidHttpUrl(rpcUrl)) {
    errors.rpcUrl = "Enter a valid http(s) RPC URL.";
  }

  const horizonUrl = values.horizonUrl.trim();
  if (horizonUrl && !isValidHttpUrl(horizonUrl)) {
    errors.horizonUrl = "Enter a valid http(s) Horizon URL.";
  }

  const passphrase = values.passphrase.trim();
  if (!passphrase) {
    errors.passphrase = "Network passphrase is required.";
  }

  return errors;
}

type HealthState = "checking" | "connected" | "degraded" | "down";

interface Health {
  state: HealthState;
  latencyMs: number | null;
}

type RpcCheckState = "idle" | HealthState;

interface RpcCheck {
  state: RpcCheckState;
  latencyMs: number | null;
}

const PROBE_TIMEOUT_MS = 4000;
const RPC_CHECK_DEBOUNCE_MS = 300;

const INITIAL_FORM: CustomNetworkFormValues = {
  name: "",
  rpcUrl: "",
  horizonUrl: "",
  passphrase: "",
};

async function probeNetwork(
  rpcUrl: string,
  externalSignal?: AbortSignal,
): Promise<Health> {
  if (externalSignal?.aborted) {
    return { state: "down", latencyMs: null };
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onAbort, { once: true });
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  const start = performance.now();
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" }),
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - start);
    if (!res.ok) return { state: "degraded", latencyMs };
    return { state: latencyMs > 1500 ? "degraded" : "connected", latencyMs };
  } catch {
    return { state: "down", latencyMs: null };
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onAbort);
  }
}

const HEALTH_DOT: Record<HealthState, string> = {
  checking: "#6b7280",
  connected: "#22c55e",
  degraded: "#f59e0b",
  down: "#ef4444",
};

function NetworkBadge({ network }: { network: NetworkConfig }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: NETWORK_COLORS[network.kind],
        marginRight: 6,
      }}
    />
  );
}

export default function NetworkSwitcher() {
  const {
    networks,
    active,
    setActiveId,
    addCustomNetwork,
    removeCustomNetwork,
  } = useNetwork();
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [health, setHealth] = useState<Health>({
    state: "checking",
    latencyMs: null,
  });
  const [form, setForm] = useState<CustomNetworkFormValues>(INITIAL_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<CustomNetworkField, boolean>>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [rpcCheck, setRpcCheck] = useState<RpcCheck>({
    state: "idle",
    latencyMs: null,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const rpcCheckAbortRef = useRef<AbortController | null>(null);
  const rpcCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingRpcCheck = useCallback(() => {
    if (rpcCheckTimerRef.current != null) {
      clearTimeout(rpcCheckTimerRef.current);
      rpcCheckTimerRef.current = null;
    }
    if (rpcCheckAbortRef.current != null) {
      rpcCheckAbortRef.current.abort();
      rpcCheckAbortRef.current = null;
    }
  }, []);

  const resetAddForm = useCallback(() => {
    cancelPendingRpcCheck();
    setForm(INITIAL_FORM);
    setTouched({});
    setSubmitAttempted(false);
    setRpcCheck({ state: "idle", latencyMs: null });
  }, [cancelPendingRpcCheck]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setHealth({ state: "checking", latencyMs: null });
    void probeNetwork(active.rpcUrl, controller.signal).then((h) => {
      if (!cancelled && !controller.signal.aborted) setHealth(h);
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [active.id, active.rpcUrl]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setShowAddForm(false);
        resetAddForm();
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAddForm(false);
        resetAddForm();
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [resetAddForm]);

  const errors = useMemo(
    () => validateCustomNetworkForm(form, networks),
    [form, networks],
  );
  const isFormValid = Object.keys(errors).length === 0;
  const trimmedRpcUrl = form.rpcUrl.trim();
  const canProbeRpc = showAddForm && Boolean(trimmedRpcUrl) && !errors.rpcUrl;

  const runRpcCheck = useCallback(
    (url: string) => {
      cancelPendingRpcCheck();
      const controller = new AbortController();
      rpcCheckAbortRef.current = controller;
      setRpcCheck({ state: "checking", latencyMs: null });
      void probeNetwork(url, controller.signal).then((result) => {
        if (!controller.signal.aborted) {
          setRpcCheck(result);
        }
      });
    },
    [cancelPendingRpcCheck],
  );

  useEffect(() => {
    if (!canProbeRpc) {
      cancelPendingRpcCheck();
      setRpcCheck({ state: "idle", latencyMs: null });
      return;
    }

    rpcCheckTimerRef.current = setTimeout(() => {
      rpcCheckTimerRef.current = null;
      runRpcCheck(trimmedRpcUrl);
    }, RPC_CHECK_DEBOUNCE_MS);

    return () => {
      cancelPendingRpcCheck();
    };
  }, [canProbeRpc, trimmedRpcUrl, runRpcCheck, cancelPendingRpcCheck]);

  function updateField(field: CustomNetworkField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  function markTouched(field: CustomNetworkField) {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  function fieldError(field: CustomNetworkField): string | undefined {
    if (!touched[field] && !submitAttempted) return undefined;
    return errors[field];
  }

  function handleAddNetwork(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);

    const currentErrors = validateCustomNetworkForm(form, networks);
    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    const network = addCustomNetwork({
      name: form.name.trim(),
      rpcUrl: form.rpcUrl.trim(),
      horizonUrl: form.horizonUrl.trim(),
      passphrase: form.passphrase.trim(),
    });
    setActiveId(network.id);
    resetAddForm();
    setShowAddForm(false);
  }

  const nameError = fieldError("name");
  const rpcUrlError = fieldError("rpcUrl");
  const horizonUrlError = fieldError("horizonUrl");
  const passphraseError = fieldError("passphrase");

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Switch network (Ctrl+Shift+N)"
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--text)",
          borderRadius: 6,
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
        }}
      >
        <NetworkBadge network={active} />
        {active.name}
        <span style={{ marginLeft: 6, color: HEALTH_DOT[health.state] }}>
          ●
        </span>
        {health.latencyMs != null && (
          <span style={{ marginLeft: 4, color: "var(--muted)", fontSize: 11 }}>
            {health.latencyMs}ms
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 280,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            zIndex: 50,
            padding: 8,
          }}
        >
          {networks.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: 6,
                cursor: "pointer",
                background:
                  n.id === active.id
                    ? "var(--bg2, rgba(124,58,237,0.1))"
                    : "transparent",
              }}
              onClick={() => {
                setActiveId(n.id);
                setOpen(false);
              }}
            >
              <span
                style={{ fontSize: 13, display: "flex", alignItems: "center" }}
              >
                <NetworkBadge network={n} />
                {n.name}
              </span>
              {n.custom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomNetwork(n.id);
                  }}
                  title="Remove custom network"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <div
            style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }}
          />

          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px dashed var(--border)",
                color: "var(--text)",
                borderRadius: 6,
                padding: "6px 8px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              + Add custom network
            </button>
          ) : (
            <form
              noValidate
              onSubmit={handleAddNetwork}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <div>
                <input
                  aria-label="Network name"
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={
                    nameError ? "custom-network-name-error" : undefined
                  }
                  placeholder="Name (e.g. Local RPC)"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  onBlur={() => markTouched("name")}
                  style={{
                    fontSize: 12,
                    width: "100%",
                    borderColor: nameError ? "#f85149" : undefined,
                  }}
                />
                {nameError && (
                  <p
                    id="custom-network-name-error"
                    role="alert"
                    style={{
                      color: "#f85149",
                      fontSize: 11,
                      margin: "2px 0 0",
                    }}
                  >
                    {nameError}
                  </p>
                )}
              </div>

              <div>
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    aria-label="RPC URL"
                    aria-invalid={Boolean(rpcUrlError)}
                    aria-describedby={
                      rpcUrlError ? "custom-network-rpc-error" : undefined
                    }
                    placeholder="RPC URL"
                    value={form.rpcUrl}
                    onChange={(e) => updateField("rpcUrl", e.target.value)}
                    onBlur={() => markTouched("rpcUrl")}
                    style={{
                      fontSize: 12,
                      flex: 1,
                      minWidth: 0,
                      borderColor: rpcUrlError ? "#f85149" : undefined,
                    }}
                  />
                  <button
                    type="button"
                    disabled={!canProbeRpc || rpcCheck.state === "checking"}
                    onClick={() => runRpcCheck(trimmedRpcUrl)}
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      opacity:
                        !canProbeRpc || rpcCheck.state === "checking" ? 0.5 : 1,
                      cursor:
                        !canProbeRpc || rpcCheck.state === "checking"
                          ? "not-allowed"
                          : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Check RPC
                  </button>
                </div>
                {rpcUrlError && (
                  <p
                    id="custom-network-rpc-error"
                    role="alert"
                    style={{
                      color: "#f85149",
                      fontSize: 11,
                      margin: "2px 0 0",
                    }}
                  >
                    {rpcUrlError}
                  </p>
                )}
                {!rpcUrlError && rpcCheck.state !== "idle" && (
                  <p
                    role="status"
                    aria-live="polite"
                    data-testid="rpc-reachability-status"
                    style={{
                      fontSize: 11,
                      margin: "2px 0 0",
                      color:
                        rpcCheck.state === "connected"
                          ? "#22c55e"
                          : rpcCheck.state === "checking"
                            ? "var(--muted)"
                            : "#f59e0b",
                    }}
                  >
                    {rpcCheck.state === "checking" && "Checking RPC endpoint…"}
                    {rpcCheck.state === "connected" &&
                      `RPC reachable${rpcCheck.latencyMs != null ? ` (${rpcCheck.latencyMs}ms)` : ""}`}
                    {rpcCheck.state === "degraded" &&
                      "RPC responded with a non-OK status — you can still save."}
                    {rpcCheck.state === "down" &&
                      "Could not reach RPC endpoint — you can still save."}
                  </p>
                )}
              </div>

              <div>
                <input
                  aria-label="Horizon URL (optional)"
                  aria-invalid={Boolean(horizonUrlError)}
                  aria-describedby={
                    horizonUrlError ? "custom-network-horizon-error" : undefined
                  }
                  placeholder="Horizon URL (optional)"
                  value={form.horizonUrl}
                  onChange={(e) => updateField("horizonUrl", e.target.value)}
                  onBlur={() => markTouched("horizonUrl")}
                  style={{
                    fontSize: 12,
                    width: "100%",
                    borderColor: horizonUrlError ? "#f85149" : undefined,
                  }}
                />
                {horizonUrlError && (
                  <p
                    id="custom-network-horizon-error"
                    role="alert"
                    style={{
                      color: "#f85149",
                      fontSize: 11,
                      margin: "2px 0 0",
                    }}
                  >
                    {horizonUrlError}
                  </p>
                )}
              </div>

              <div>
                <input
                  aria-label="Network passphrase"
                  aria-invalid={Boolean(passphraseError)}
                  aria-describedby={
                    passphraseError
                      ? "custom-network-passphrase-error"
                      : undefined
                  }
                  placeholder="Network passphrase"
                  value={form.passphrase}
                  onChange={(e) => updateField("passphrase", e.target.value)}
                  onBlur={() => markTouched("passphrase")}
                  style={{
                    fontSize: 12,
                    width: "100%",
                    borderColor: passphraseError ? "#f85149" : undefined,
                  }}
                />
                {passphraseError && (
                  <p
                    id="custom-network-passphrase-error"
                    role="alert"
                    style={{
                      color: "#f85149",
                      fontSize: 11,
                      margin: "2px 0 0",
                    }}
                  >
                    {passphraseError}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    opacity: isFormValid ? 1 : 0.5,
                    cursor: isFormValid ? "pointer" : "not-allowed",
                  }}
                >
                  Save & switch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAddForm();
                    setShowAddForm(false);
                  }}
                  style={{ fontSize: 12 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
