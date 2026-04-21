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
  { to: "/dashboard", label: "总览首页", icon: LayoutDashboard, description: "查看系统运行、费用和告警" },
  { to: "/bootstrap", label: "首次配置", icon: WandSparkles, description: "完成首次启动与初始化引导" },
  { to: "/bootstrap/success", label: "初始化完成", icon: Activity, description: "查看初始化完成后的状态" },
  { to: "/security", label: "安全设置", icon: LockKeyhole, description: "设置登录与安全基线" },
  { to: "/providers", label: "厂商接入", icon: Network, description: "管理模型厂商与接入地址" },
  { to: "/keys", label: "本地密钥", icon: KeyRound, description: "管理密钥、预算和权限" },
  { to: "/routing", label: "路由策略", icon: Sparkles, description: "配置分发规则与备用链路" },
  { to: "/analytics", label: "数据分析", icon: BarChart3, description: "查看费用、请求和用量趋势" },
  { to: "/logs", label: "运行日志", icon: ScrollText, description: "检索日志与异常详情" },
  { to: "/settings", label: "系统设置", icon: Cog, description: "调整系统参数与分发方式" },
  { to: "/release-status", label: "发布状态", icon: PackageCheck, description: "查看打包与发布准备情况" },
  { to: "/version", label: "版本信息", icon: Hash, description: "查看当前版本与状态说明" },
  { to: "/build-checks", label: "构建检查", icon: FileCheck2, description: "核对发布前的关键检查项" },
  { to: "/quick-setup", label: "快速接入", icon: Rocket, description: "为常用工具生成接入配置" }
];

const themeMeta = {
  light: { label: "浅色模式", icon: Sun },
  dark: { label: "深色模式", icon: Moon },
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
            <p className="brand-subtitle">本地 AI 网关控制台</p>
          </div>

          <button type="button" className="ghost-button compact sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
            关闭
          </button>
        </div>

        <div className="workspace-card luxury-panel nested-panel">
          <div>
            <span className="eyebrow">当前工作区状态</span>
            <strong>系统状态整体稳定</strong>
          </div>
          <div className="workspace-metrics">
            <div>
              <span>可用厂商</span>
              <strong>{healthyProviders}/{providers.length}</strong>
            </div>
            <div>
              <span>主用密钥</span>
              <strong>{activeKey?.name ?? "尚未配置"}</strong>
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
            <div className="theme-title">界面主题</div>
            <div className="theme-subtitle">浅色 / 深色 / 跟随系统</div>
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
              <span className="eyebrow">{currentPage?.label ?? "系统总览"}</span>
              <h1>{currentPage?.description ?? "本地 AI 网关管理后台"}</h1>
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
            <button type="button" className="ghost-button" onClick={() => navigate("/quick-setup")}>快速接入</button>
            <button type="button" className="primary-button" onClick={() => navigate("/keys")}>新建本地密钥</button>
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
