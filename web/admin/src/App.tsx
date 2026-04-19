import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { KeysPage } from "./pages/KeysPage";
import { RoutingPage } from "./pages/RoutingPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { LogsPage } from "./pages/LogsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { QuickSetupPage } from "./pages/QuickSetupPage";
import { BootstrapPage } from "./pages/BootstrapPage";
import { BootstrapSuccessPage } from "./pages/BootstrapSuccessPage";
import { SecurityPage } from "./pages/SecurityPage";
import { ReleaseStatusPage } from "./pages/ReleaseStatusPage";
import { VersionInfoPage } from "./pages/VersionInfoPage";
import { BuildChecksPage } from "./pages/BuildChecksPage";
import { InitializationGuard } from "./components/InitializationGuard";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/bootstrap" element={<BootstrapPage />} />
        <Route path="/bootstrap/success" element={<BootstrapSuccessPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/release-status" element={<ReleaseStatusPage />} />
        <Route path="/version" element={<VersionInfoPage />} />
        <Route path="/build-checks" element={<BuildChecksPage />} />
        <Route path="/dashboard" element={<InitializationGuard><DashboardPage /></InitializationGuard>} />
        <Route path="/providers" element={<InitializationGuard><ProvidersPage /></InitializationGuard>} />
        <Route path="/keys" element={<InitializationGuard><KeysPage /></InitializationGuard>} />
        <Route path="/routing" element={<InitializationGuard><RoutingPage /></InitializationGuard>} />
        <Route path="/analytics" element={<InitializationGuard><AnalyticsPage /></InitializationGuard>} />
        <Route path="/logs" element={<InitializationGuard><LogsPage /></InitializationGuard>} />
        <Route path="/settings" element={<InitializationGuard><SettingsPage /></InitializationGuard>} />
        <Route path="/quick-setup" element={<InitializationGuard><QuickSetupPage /></InitializationGuard>} />
      </Routes>
    </AppShell>
  );
}
