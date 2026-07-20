import { Link, useLocation } from "react-router-dom";

const NAV_LINKS: { label: string; to: string; description: string }[] = [
  { label: "Home", to: "/", description: "Recent contract events" },
  { label: "Search", to: "/search", description: "Find contracts, wallets & events" },
  { label: "Graph", to: "/graph", description: "Contract relationship graph" },
  { label: "XDR Inspector", to: "/xdr", description: "Decode XDR envelopes" },
  { label: "Sandbox", to: "/sandbox", description: "Prototype against live contracts" },
];

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "64px 16px",
        textAlign: "center",
      }}
    >
      {/* Status code */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--accent)",
          letterSpacing: "-4px",
        }}
        aria-hidden="true"
      >
        404
      </div>

      {/* Heading */}
      <h1 style={{ fontSize: 24, margin: 0 }}>Page not found</h1>

      {/* Path that was requested */}
      <p style={{ color: "var(--muted)", margin: 0 }}>
        <code
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "2px 8px",
          }}
        >
          {pathname}
        </code>{" "}
        doesn't match any known route.
      </p>

      {/* Quick-nav back into the app */}
      <nav aria-label="Return to app" style={{ width: "100%", maxWidth: 480 }}>
        <p style={{ color: "var(--muted)", marginBottom: 12 }}>
          Here are some places to get back on track:
        </p>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {NAV_LINKS.map(({ label, to, description }) => (
            <li key={to}>
              <Link
                to={to}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 0.15s",
                }}
              >
                <span style={{ fontWeight: 500 }}>{label}</span>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Go back button */}
      <button
        onClick={() => window.history.back()}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "8px 20px",
          color: "var(--muted)",
          cursor: "pointer",
        }}
      >
        ← Go back
      </button>
    </div>
  );
}
