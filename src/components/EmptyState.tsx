interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
}

export default function EmptyState({
  title,
  message,
  icon = "📭",
}: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "var(--muted)",
      }}
      data-testid="empty-state"
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
        {title}
      </h3>
      {message && <p style={{ fontSize: 14 }}>{message}</p>}
    </div>
  );
}
