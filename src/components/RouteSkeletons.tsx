import type { ReactNode } from "react";

const blockStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  opacity: 0.7,
} as const;

function SkeletonBlock({ width = "100%", height = 16 }: { width?: string; height?: number }) {
  return <div aria-hidden="true" style={{ ...blockStyle, width, height }} />;
}

function SkeletonShell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div aria-label={label} role="status" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {children}
    </div>
  );
}

export function DefaultRouteSkeleton() {
  return (
    <SkeletonShell label="Loading page">
      <SkeletonBlock width="42%" height={24} />
      <SkeletonBlock width="70%" />
    </SkeletonShell>
  );
}

export function TableRouteSkeleton() {
  return (
    <SkeletonShell label="Loading table">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonBlock width="32%" height={24} />
        <SkeletonBlock width="58%" />
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 360 }}>
        <SkeletonBlock height={34} />
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonBlock key={index} height={38} />
        ))}
      </div>
    </SkeletonShell>
  );
}

export function DashboardRouteSkeleton() {
  return (
    <SkeletonShell label="Loading dashboard">
      <SkeletonBlock width="38%" height={26} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {Array.from({ length: 4 }, (_, index) => (
          <div className="card" key={index} style={{ minHeight: 92 }}>
            <SkeletonBlock width="55%" />
            <div style={{ height: 12 }} />
            <SkeletonBlock width="34%" height={26} />
          </div>
        ))}
      </div>
      <div className="card" style={{ minHeight: 280 }}>
        <SkeletonBlock width="28%" height={20} />
      </div>
    </SkeletonShell>
  );
}

export function GraphRouteSkeleton() {
  return (
    <SkeletonShell label="Loading graph">
      <SkeletonBlock width="52%" height={26} />
      <div className="card" style={{ minHeight: 520, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SkeletonBlock width="42%" height={42} />
      </div>
    </SkeletonShell>
  );
}
