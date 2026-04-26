import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Cog,
  Eye,
  EyeOff,
  FileCheck2,
  Globe,
  Hash,
  KeyRound,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  Network,
  Rocket,
  ScrollText,
  ScanLine,
  Sparkles,
  Sun,
  SunMoon,
  X
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useUIStore } from "../store/ui-store";
import { useAdminStore } from "../store/admin-store";
import { labelFromMap, platformLabelMap } from "../store/labels";
import {
  closeDesktopWindow,
  fetchDesktopStatus,
  fetchDesktopVersion,
  fetchRuntimeSummary,
  fetchWindowState,
  hideDesktopToTray,
  isDesktopMode,
  minimiseDesktopWindow,
  onDesktopDomReady,
  onDesktopNotice,
  onDesktopRestoreRoute,
  onDesktopSelfCheck,
  onDesktopStatus,
  onDesktopWindowHidden,
  onDesktopWindowShown,
  openDesktopAdminInBrowser,
  persistWindowState,
  runDesktopSelfCheck,
  sendDesktopNotice,
  showDesktopWindow,
  toggleDesktopMaximise,
  type DesktopRuntimeSummary,
  type DesktopStatus,
  type DesktopWindowState
} from "../utils/desktop-bridge";

const navItems = [
  { to: "/dashboard", label: "总台", icon: LayoutDashboard, description: "运行状态总览" },
  { to: "/providers", label: "厂商", icon: Network, description: "模型厂商管理" },
  { to: "/keys", label: "密钥", icon: KeyRound, description: "密钥与预算" },
  { to: "/routing", label: "路由", icon: Sparkles, description: "调度策略配置" },
  { to: "/analytics", label: "分析", icon: BarChart3, description: "用量与趋势" },
  { to: "/logs", label: "日志", icon: ScrollText, description: "运行记录检索" },
  { to: "/settings", label: "设置", icon: Cog, description: "系统偏好" },
  { to: "/version", label: "版本", icon: Hash, description: "版本与状态" },
  { to: "/build-checks", label: "检查", icon: FileCheck2, description: "发布前检查" },
  { to: "/quick-setup", label: "接入", icon: Rocket, description: "工具接入配置" }
];

const themeMeta = {
  light: { label: "浅色", icon: Sun },
  dark: { label: "深色", icon: Moon },
  system: { label: "跟随系统", icon: SunMoon }
} as const;

const fallbackWindowState: DesktopWindowState = {
  width: 1360,
  height: 860,
  x: 120,
  y: 80,
  maximised: false,
  lastRoute: "/dashboard",
  hiddenToTray: false
};

const fallbackDesktopStatus: DesktopStatus = {
  version: "browser",
  platform: "web",
  serverAddr: "",
  adminUrl: "",
  windowTitle: "灵枢",
  desktopMode: false,
  notifications: false,
  customChrome: false,
  trayEnabled: false,
  hideToTrayEnabled: false,
  stateRestore: false,
  windowState: fallbackWindowState,
  runtime: { providers: 0, keys: 0, rules: 0, health: "browser" },
  configSummary: { host: "127.0.0.1", port: 0, adminPath: "/admin", theme: "system", bundleMode: "browser", updateChannel: "stable" }
};

export function AppShell({ children }: PropsWithChildren) {
  const { theme, setTheme } = useUIStore();
  const { notices, dismissNotice, keys, providers, pushNotice, hydrate } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopStatus, setDesktopStatus] = useState<DesktopStatus>(fallbackDesktopStatus);
  const [desktopVersion, setDesktopVersion] = useState("browser");
  const [desktopMaximised, setDesktopMaximised] = useState(false);
  const [runtimeSummary, setRuntimeSummary] = useState<DesktopRuntimeSummary>(fallbackDesktopStatus.runtime);
  const [windowState, setWindowState] = useState<DesktopWindowState>(fallbackWindowState);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = isDark ? "dark" : "light";
    root.dataset.desktop = isDesktopMode ? "true" : "false";
  }, [theme]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDesktopMode) {
      persistWindowState({ ...windowState, lastRoute: location.pathname || "/dashboard" });
    }
  }, [location.pathname, windowState]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    void fetchDesktopStatus().then((status) => {
      setDesktopStatus(status);
      setRuntimeSummary(status.runtime);
      setWindowState(status.windowState);
      setDesktopMaximised(status.windowState.maximised);
    });
    void fetchDesktopVersion().then(setDesktopVersion);
    void fetchRuntimeSummary().then(setRuntimeSummary);
    void fetchWindowState().then((state) => {
      setWindowState(state);
      setDesktopMaximised(state.maximised);
    });

    const offReady = onDesktopStatus((payload) => {
      setDesktopStatus(payload);
      setRuntimeSummary(payload.runtime);
      setWindowState(payload.windowState);
      pushNotice({ tone: "success", title: "桌面服务已就绪", message: `桌面后端已启动，监听地址 ${payload.serverAddr || "本地内嵌"}。` });
    });
    const offDom = onDesktopDomReady((payload) => setDesktopStatus(payload));
    const offNotice = onDesktopNotice((payload) => {
      pushNotice({ tone: "info", title: payload.title, message: payload.message });
    });
    const offCheck = onDesktopSelfCheck((payload) => {
      pushNotice({ tone: payload.health === "healthy" ? "success" : "warning", title: "桌面自检完成", message: payload.warnings[0] ?? "所有桌面能力检查通过。" });
    });
    const offRoute = onDesktopRestoreRoute((route) => {
      if (route && route !== location.pathname) navigate(route);
    });
    const offHidden = onDesktopWindowHidden((state) => {
      setWindowState(state);
      pushNotice({ tone: "info", title: "已隐藏到托盘", message: "主窗口已隐藏，可从托盘菜单恢复。" });
    });
    const offShown = onDesktopWindowShown((state) => {
      setWindowState(state);
      pushNotice({ tone: "success", title: "窗口已恢复", message: "主窗口已从托盘恢复显示。" });
    });

    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        navigate("/logs");
        pushNotice({ tone: "info", title: "快捷键已触发", message: "已通过 Ctrl/⌘ + Shift + L 打开运行日志页面。" });
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      offReady(); offDom(); offNotice(); offCheck(); offRoute(); offHidden(); offShown();
      window.removeEventListener("keydown", handler);
    };
  }, [location.pathname, navigate, pushNotice]);

  const currentPage = useMemo(() => navItems.find((item) => location.pathname.startsWith(item.to)) ?? navItems[0], [location.pathname]);
  const healthyProviders = providers.filter((provider) => provider.status === "healthy").length;
  const resolvedTheme = themeMeta[theme];
  const ThemeIcon = resolvedTheme.icon;

  const handleToggleMaximise = () => {
    const next = !desktopMaximised;
    setDesktopMaximised(next);
    const nextState = { ...windowState, maximised: next };
    setWindowState(nextState);
    persistWindowState(nextState);
    toggleDesktopMaximise();
  };

  const handleSelfCheck = async () => {
    const result = await runDesktopSelfCheck();
    pushNotice({ tone: result.health === "healthy" ? "success" : "warning", title: "桌面自检已执行", message: result.warnings[0] ?? `共完成 ${result.checks.length} 项检查。` });
  };

  return (
    <div className="app-shell">
      {desktopStatus.desktopMode ? (
        <header className="desktop-titlebar" style={{ ["--wails-draggable" as string]: "drag" }}>
          <div className="desktop-titlebar__brand">
            <Activity size={16} />
            <span>{desktopStatus.windowTitle}</span>
            <small>{desktopStatus.desktopMode ? `桌面版 ${desktopVersion}` : "浏览器版"}</small>
          </div>
          <div className="desktop-titlebar__actions" style={{ ["--wails-draggable" as string]: "no-drag" }}>
            <button type="button" className="ghost-button compact titlebar-button" onClick={() => openDesktopAdminInBrowser()}><Globe size={14} />外部打开</button>
            <button type="button" className="ghost-button compact titlebar-button" onClick={() => hideDesktopToTray()}><EyeOff size={14} />隐藏到托盘</button>
            <button type="button" className="ghost-button compact titlebar-button" onClick={() => minimiseDesktopWindow()}><Minus size={14} /></button>
            <button type="button" className="ghost-button compact titlebar-button" onClick={handleToggleMaximise}>{desktopMaximised ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
            <button type="button" className="ghost-button compact titlebar-button danger" onClick={() => closeDesktopWindow()}><X size={14} /></button>
          </div>
        </header>
      ) : null}

      <button type="button" className={clsx("sidebar-backdrop", sidebarOpen && "visible")} aria-label="关闭侧边栏" onClick={() => setSidebarOpen(false)} />

      <aside className={clsx("sidebar luxury-panel", sidebarOpen && "open")}>
        <div className="sidebar-top">
          <div className="brand-mark"><Activity size={18} /><span>灵枢</span></div>
          <button type="button" className="ghost-button compact sidebar-close" onClick={() => setSidebarOpen(false)}><X size={16} /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx("nav-link", isActive && "active")} title={item.description}>
                <div className="nav-link-main"><Icon size={18} /><span>{item.label}</span></div>
                <ArrowRight size={14} className="nav-link-arrow" />
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <span className="eyebrow">运行状态</span>
            <span className={`status-dot ${runtimeSummary.health === "healthy" ? "healthy" : ""}`} />
          </div>
          <div className="sidebar-footer-metrics">
            <span>厂商 {healthyProviders}/{providers.length}</span>
            <span>密钥 {runtimeSummary.keys}</span>
            <span>规则 {runtimeSummary.rules}</span>
          </div>
          {desktopStatus.desktopMode ? (
            <div className="sidebar-footer-actions">
              <button type="button" className="ghost-button compact" onClick={() => showDesktopWindow()} title="恢复窗口"><Eye size={14} /></button>
              <button type="button" className="ghost-button compact" onClick={() => hideDesktopToTray()} title="隐藏到托盘"><EyeOff size={14} /></button>
              <button type="button" className="ghost-button compact" onClick={handleSelfCheck} title="运行自检"><ScanLine size={14} /></button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar luxury-panel">
          <div className="topbar-leading">
            <button type="button" className="ghost-button compact nav-toggle" onClick={() => setSidebarOpen(true)}><Sparkles size={16} />导航</button>
            <div>
              <span className="eyebrow">{currentPage?.label ?? "系统总览"}</span>
              <h1>{currentPage?.description ?? "灵枢控制台"}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button
            type="button"
            className="ghost-button compact theme-toggle"
            title={`当前主题：${resolvedTheme.label}，点击切换`}
            onClick={() => {
              const order = ["light", "dark", "system"] as const;
              const next = order[(order.indexOf(theme) + 1) % order.length];
              setTheme(next);
            }}
          >
            <ThemeIcon size={16} />
            <span className="theme-label">{resolvedTheme.label}</span>
          </button>
            <button type="button" className="ghost-button compact" onClick={() => navigate("/logs")}><Bell size={16} />通知 {notices.length}</button>
            {desktopStatus.desktopMode ? <button type="button" className="ghost-button compact" onClick={() => sendDesktopNotice("灵枢", "桌面通知发送成功，通知链路可用。")}><Bell size={16} />原生通知</button> : null}
            <button type="button" className="ghost-button" onClick={() => navigate("/quick-setup")}>快速接入</button>
            <button type="button" className="primary-button" onClick={() => navigate("/keys")}>新建本地密钥</button>
          </div>
        </header>

        {notices.length ? (
          <section className="notice-stack">
            {notices.map((notice) => (
              <article key={notice.id} className={clsx("notice-card luxury-panel", notice.tone)}>
                <div className="notice-icon"><CheckCircle2 size={16} /></div>
                <div className="notice-body"><strong>{notice.title}</strong><p>{notice.message}</p></div>
                <button type="button" className="ghost-button compact" onClick={() => dismissNotice(notice.id)}><X size={14} /></button>
              </article>
            ))}
          </section>
        ) : null}

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
