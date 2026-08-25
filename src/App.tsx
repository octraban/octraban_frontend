import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import ErrorBoundary from "./components/ErrorBoundary";
import BackendStatusBanner from "./components/BackendStatusBanner";
import {
  DashboardRouteSkeleton,
  DefaultRouteSkeleton,
  GraphRouteSkeleton,
  TableRouteSkeleton,
} from "./components/RouteSkeletons";

const Landing = lazy(() => import("./pages/Landing"));
const Explorer = lazy(() => import("./pages/Explorer"));
const ContractPage = lazy(() => import("./pages/ContractPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const EventPage = lazy(() => import("./pages/EventPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const XdrInspector = lazy(() => import("./pages/XdrInspector"));
const RpcMetricsDashboard = lazy(() => import("./pages/RpcMetricsDashboard"));
const GraphPage = lazy(() => import("./pages/GraphPage"));
const Sandbox = lazy(() => import("./pages/Sandbox"));
const SharedSandbox = lazy(() => import("./pages/SharedSandbox"));
const DeveloperWorkspace = lazy(() => import("./pages/DeveloperWorkspace"));
const SetupPage = lazy(() => import("./pages/SetupPage"));
const BatchMultiCall = lazy(() => import("./pages/BatchMultiCall"));
const SubInvocationPage = lazy(() => import("./pages/SubInvocationPage"));
const RateLimitDashboard = lazy(() => import("./pages/RateLimitDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Fallback() {
  return <DefaultRouteSkeleton />;
}

function RouteBoundary({
  children,
  fallback = <Fallback />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BackendStatusBanner />
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<RouteBoundary><Landing /></RouteBoundary>} />
            <Route path="/explorer" element={<RouteBoundary fallback={<TableRouteSkeleton />}><Explorer /></RouteBoundary>} />
            <Route path="/contract/:id" element={<RouteBoundary fallback={<DashboardRouteSkeleton />}><ContractPage /></RouteBoundary>} />
            <Route
              path="/contract/:id/workspace"
              element={<RouteBoundary fallback={<DashboardRouteSkeleton />}><DeveloperWorkspace /></RouteBoundary>}
            />
            <Route path="/wallet/:address" element={<RouteBoundary fallback={<TableRouteSkeleton />}><WalletPage /></RouteBoundary>} />
            <Route path="/event/:seq" element={<RouteBoundary fallback={<DashboardRouteSkeleton />}><EventPage /></RouteBoundary>} />
            <Route path="/search" element={<RouteBoundary fallback={<TableRouteSkeleton />}><SearchPage /></RouteBoundary>} />
            <Route path="/xdr" element={<RouteBoundary><XdrInspector /></RouteBoundary>} />
            <Route path="/rpc-metrics" element={<RouteBoundary fallback={<DashboardRouteSkeleton />}><RpcMetricsDashboard /></RouteBoundary>} />
            <Route path="/graph" element={<RouteBoundary fallback={<GraphRouteSkeleton />}><GraphPage /></RouteBoundary>} />
            <Route path="/sandbox" element={<RouteBoundary fallback={<DashboardRouteSkeleton />}><Sandbox /></RouteBoundary>} />
            <Route path="/sandbox/:id" element={<RouteBoundary fallback={<DashboardRouteSkeleton />}><SharedSandbox /></RouteBoundary>} />
            <Route path="/setup" element={<RouteBoundary><SetupPage /></RouteBoundary>} />
            <Route path="/batch" element={<RouteBoundary fallback={<TableRouteSkeleton />}><BatchMultiCall /></RouteBoundary>} />
            <Route path="/sub-invocations" element={<RouteBoundary fallback={<TableRouteSkeleton />}><SubInvocationPage /></RouteBoundary>} />
            <Route path="/admin/rate-limits" element={<RouteBoundary fallback={<DashboardRouteSkeleton />}><RateLimitDashboard /></RouteBoundary>} />
            <Route path="*" element={<RouteBoundary><NotFound /></RouteBoundary>} />
          </Routes>
        </Suspense>
      </main>
    </ErrorBoundary>
  );
}
