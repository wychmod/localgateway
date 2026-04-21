import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Cog,
  FileCheck2,
  Hash,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Moon,
  Network,
  PackageCheck,
  Rocket,
  ScrollText,
  Sparkles,
  Sun,
  SunMoon,
  WandSparkles,
  X
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useUIStore } from "../store/ui-store";
import { useAdminStore } from "../store/admin-store";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "总览运行态、成本和告警" },
  { to: "/bootstrap", label: "Bootstrap", icon: WandSparkles, description: "首次初始化与引导流程" },
  { to: "/bootstrap/success", label: "Bootstrap Done", icon: Activity, description: "初始化完成后的确认页面" },
  { to: "/security", label: "Security", icon: LockKeyhole, description: "安全基线与检查项" },
  { to: "/providers", label: "Providers", icon: Network, description: "管理厂商接入与模型发现" },
  { to: "/keys", label: "Local Keys", icon: KeyRound, description: "本地 Key、预算和权限" },
  { to: "/routing", label: "Routing", icon: Sparkles, description: "规则链路、Fallback 与模拟" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, description: "成本、请求与 Token 分析" },
  { to: "/logs", label: "Logs", icon: ScrollText, description: "日志检索、异常与调用细节" },
  { to: "/settings", label: "Settings", icon: Cog, description: "系统设置与分发参数" },
  { to: "/release-status", label: "Release", icon: PackageCheck, description: "发布态与打包检查" },
  { to: "/version", label: "Version", icon: Hash, description: "版本信息与依赖状态" },
  { to: "/build-checks", label: "Build Checks", icon: FileCheck2, description: "构建前检查项总览" },
  { to: "/quick-setup", label: "Quick Setup", icon: Rocket, description: "为工具生成接入配置" }
];

const themeMeta = {
  light: { label: "亮色", icon: Sun },
  dark: { label: "暗色", icon: Moon },
  system: { label: "跟随系统", icon: SunMoon }
} as const;

export function AppShell({ children }: PropsWithChildren) {
  const { theme, setTheme } = useUIStore();
  const { notices, dismissNotice, keys, providers } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = isDark ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentPage = useMemo(
    () => navItems.find((item) => location.pathname.startsWith(item.to)) ?? navItems[0],
    [location.pathname]
  );

  const healthyProviders = providers.filter((provider) => provider.status === "healthy").length;
  const activeKey = keys.find((item) => item.status === "active") ?? keys[0];
  const resolvedTheme = themeMeta[theme];
  const ThemeIcon = resolvedTheme.icon;

  return (
    <div className="app-shell">
      <button
        type="button"
        className={clsx("sidebar-backdrop", sidebarOpen && "visible")}
        aria-label="关闭侧边栏"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={clsx("sidebar luxury-panel", sidebarOpen && "open")}>
        <div className="sidebar-top">
          <div>
            <div className="brand-mark">
              <Activity size={18} />
              <span>LocalGateway</span>
            </div>
            <p className="brand-subtitle">Premium AI Gateway Control</p>
          </div>

          <button type="button" className="ghost-button compact sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
            关闭
          </button>
        </div>

        <div className="workspace-card luxury-panel nested-panel">
          <div>
            <span className="eyebrow">Workspace Signal</span>
            <strong>当前工作区状态稳定</strong>
          </div>
          <div className="workspace-metrics">
            <div>
              <span>Healthy Providers</span>
              <strong>{healthyProviders}/{providers.length}</strong>
            </div>
            <div>
              <span>Primary Key</span>
              <strong>{activeKey?.name ?? "未配置"}</strong>
            </div>
          </div>
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
                <div className="nav-link-main">
                  <Icon size={18} />
                  <div>
                    <span>{item.label}</span>
                    <small>{item.description}</small>
                  </div>
                </div>
                <ArrowRight size={14} className="nav-link-arrow" />
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
            {(["light", "dark", "system"] as const).map((item) => {
              const MetaIcon = themeMeta[item].icon;
              return (
                <button
                  key={item}
                  type="button"
                  className={clsx("theme-button", theme === item && "active")}
                  onClick={() => setTheme(item)}
                >
                  <MetaIcon size={16} />
                  {themeMeta[item].label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar luxury-panel">
          <div className="topbar-leading">
            <button type="button" className="ghost-button compact nav-toggle" onClick={() => setSidebarOpen(true)}>
              <Sparkles size={16} />
              导航
            </button>
            <div>
              <span className="eyebrow">{currentPage?.label ?? "Mission Control"}</span>
              <h1>{currentPage?.description ?? "高端本地 AI 网关管理后台"}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="status-badge neutral-pill">
              <ThemeIcon size={14} />
              {resolvedTheme.label}
            </div>
            <button type="button" className="ghost-button compact" onClick={() => navigate("/logs")}>
              <Bell size={16} />
              通知 {notices.length}
            </button>
            <button type="button" className="ghost-button" onClick={() => navigate("/quick-setup")}>Quick Setup</button>
            <button type="button" className="primary-button" onClick={() => navigate("/keys")}>Create Local Key</button>
          </div>
        </header>

        {notices.length ? (
          <section className="notice-stack">
            {notices.map((notice) => (
              <article key={notice.id} className={clsx("notice-card luxury-panel", notice.tone)}>
                <div className="notice-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div className="notice-body">
                  <strong>{notice.title}</strong>
                  <p>{notice.message}</p>
                </div>
                <button type="button" className="ghost-button compact" onClick={() => dismissNotice(notice.id)}>
                  <X size={14} />
                </button>
              </article>
            ))}
          </section>
        ) : null}

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
