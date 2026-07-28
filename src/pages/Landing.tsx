import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 64,
        padding: "32px 0",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          maxWidth: 800,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Octraban
        </h1>
        <p style={{ fontSize: 24, fontWeight: 500, color: "var(--text)" }}>
          A human-readable block explorer & developer workspace for Soroban
          smart contracts on Stellar.
        </p>
        <p
          style={{
            fontSize: 16,
            color: "var(--muted)",
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          Decode raw contract calls into plain English, visualise contract
          relationships, replay transactions, and prototype against live
          contracts — all in the browser.
        </p>
        <Link
          to="/explorer"
          style={{
            marginTop: 16,
            padding: "12px 32px",
            fontSize: 18,
            borderRadius: 8,
            background: "var(--accent)",
            color: "#0d1117",
            fontWeight: 600,
            display: "inline-block",
            textDecoration: "none",
          }}
        >
          Launch Explorer
        </Link>
      </section>

      {/* Features Section */}
      <section style={{ width: "100%", maxWidth: 1000 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
          Features
        </h2>
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div
            className="card"
            style={{ flex: "1 1 300px", textAlign: "left" }}
          >
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>
              🔍 Decode Soroban XDR
            </h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
              Raw Soroban activity is opaque. Octraban turns that noise into
              signal. Decode XDR into human-readable activity and plain-English
              event rows.
            </p>
          </div>
          <div
            className="card"
            style={{ flex: "1 1 300px", textAlign: "left" }}
          >
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>
              🕸️ Visualise Relationships
            </h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
              See interactive 3D dependency graphs, factory deployment trees,
              and tracing of value flow between accounts and contracts.
            </p>
          </div>
          <div
            className="card"
            style={{ flex: "1 1 300px", textAlign: "left" }}
          >
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>
              🛠️ Prototype & Sandbox
            </h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
              Use the in-browser developer workspace and sandbox to prototype
              and experiment with live contracts without leaving the tab.
            </p>
          </div>
        </div>
      </section>

      {/* Live on Testnet Section */}
      <section style={{ width: "100%", maxWidth: 1000, textAlign: "left" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Live on Testnet
        </h2>
        <div
          className="card"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>
              Explorer / registry
            </h3>
            <p
              style={{
                fontFamily: "monospace",
                color: "var(--muted)",
                wordBreak: "break-all",
                marginBottom: 8,
              }}
            >
              CBKPNRQ4D3KTAAE7MMJ4HL6JNF2J2EBG2PSSRW4YHOMHTRHUU734CFWJ
            </p>
            <a
              href="https://stellar.expert/explorer/testnet/contract/CBKPNRQ4D3KTAAE7MMJ4HL6JNF2J2EBG2PSSRW4YHOMHTRHUU734CFWJ"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              View on stellar.expert ↗
            </a>
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border)",
              margin: "8px 0",
            }}
          />
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>Ticket</h3>
            <p
              style={{
                fontFamily: "monospace",
                color: "var(--muted)",
                wordBreak: "break-all",
                marginBottom: 8,
              }}
            >
              CDX3V6OE72KUIEEJTBLFCQZFXZCAKOYWYXK2KPRM57M6FLZFAVUSVL42
            </p>
            <a
              href="https://stellar.expert/explorer/testnet/contract/CDX3V6OE72KUIEEJTBLFCQZFXZCAKOYWYXK2KPRM57M6FLZFAVUSVL42"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              View on stellar.expert ↗
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          marginTop: 64,
          paddingTop: 32,
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 24,
          justifyContent: "center",
          flexWrap: "wrap",
          color: "var(--muted)",
        }}
      >
        <a
          href="https://github.com/octraban/octraban_frontend"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--muted)" }}
        >
          Frontend Repository
        </a>
        <span>&middot;</span>
        <a
          href="https://github.com/pharuq411/octraban_backend"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--muted)" }}
        >
          Backend Repository
        </a>
        <span>&middot;</span>
        <a
          href="https://github.com/octraban/octraban_contract"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--muted)" }}
        >
          Contract Repository
        </a>
      </footer>
    </div>
  );
}
