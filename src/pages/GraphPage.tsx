import ContractDependencyGraph3D from "../components/ContractDependencyGraph3D";
import ErrorBoundary from "../components/ErrorBoundary";

export default function GraphPage() {
  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>
        Live Contract Dependency Graph
      </h1>
      <ErrorBoundary
        fallback={
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#fef2f2",
              borderRadius: 8,
              border: "1px solid #fecaca",
            }}
            data-testid="error-state"
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: "#991b1b", marginBottom: 8 }}>
              Graph failed to render
            </h3>
            <p style={{ color: "#7f1d1d", fontSize: 14, marginBottom: 16 }}>
              The 3D graph engine encountered an error. Try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        }
      >
        <ContractDependencyGraph3D />
      </ErrorBoundary>
    </div>
  );
}
