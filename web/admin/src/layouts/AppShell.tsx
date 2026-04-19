import { PropsWithChildren, useEffect } from "react";
import { Activity, BarChart3, Cog, KeyRound, LayoutDashboard, Network, Rocket, ScrollText, Sparkles, SunMoon } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useUIStore } from "../store/ui-store";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/providers", label: "Providers", icon: Network },
  { to: "/keys", label: "Local Keys", icon: KeyRound },
  { to: "/routing", label: "Routing", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Cog },
  { to: "/quick-setup", label: "Quick Setup", icon: Rocket }
];

export function AppShell({ children }: PropsWithChildren) {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = isDark ? "dark" : "light";
  }, [theme]);

  return (
    <div className="app-shell">
      <aside className="sidebar luxury-panel">
        <div>
          <div className="brand-mark">
            <Activity size={18} />
            <span>LocalGateway</span>
          </div>
          <p className="brand-subtitle">Premium AI Gateway Control</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => clsx("nav-link", isActive && "active")}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="theme-switcher luxury-panel nested-panel">
          <div>
            <div className="theme-title">Theme</div>
            <div className="theme-subtitle">亮 / 暗 / 跟随系统</div>
          </div>
          <div className="theme-buttons">
            {(["light", "dark", "system"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={clsx("theme-button", theme === item && "active")}
                onClick={() => setTheme(item)}
              >
                <SunMoon size={16} />
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar luxury-panel">
          <div>
            <span className="eyebrow">Mission Control</span>
            <h1>高端本地 AI 网关管理后台</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" className="ghost-button">Sync Pricing</button>
            <button type="button" className="primary-button">Create Local Key</button>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
