interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Unable to load data",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
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
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#991b1b",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "#7f1d1d", marginBottom: 16 }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
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
          Retry
        </button>
      )}
    </div>
  );
}
