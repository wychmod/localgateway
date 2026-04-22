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
  LockKeyhole,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  Network,
  PackageCheck,
  Rocket,
  ScrollText,
  ScanLine,
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
import {
  closeDesktopWindow,
  fetchConfigSummary,
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
  type DesktopConfigSummary,
  type DesktopRuntimeSummary,
  type DesktopStatus,
  type DesktopWindowState
} from "../utils/desktop-bridge";

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
  const { notices, dismissNotice, keys, providers, pushNotice } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopStatus, setDesktopStatus] = useState<DesktopStatus>(fallbackDesktopStatus);
  const [desktopVersion, setDesktopVersion] = useState("browser");
  const [desktopMaximised, setDesktopMaximised] = useState(false);
  const [runtimeSummary, setRuntimeSummary] = useState<DesktopRuntimeSummary>(fallbackDesktopStatus.runtime);
  const [configSummary, setConfigSummary] = useState<DesktopConfigSummary>(fallbackDesktopStatus.configSummary);
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
    void fetchDesktopStatus().then((status) => {
      setDesktopStatus(status);
      setRuntimeSummary(status.runtime);
      setConfigSummary(status.configSummary);
      setWindowState(status.windowState);
      setDesktopMaximised(status.windowState.maximised);
    });
    void fetchDesktopVersion().then(setDesktopVersion);
    void fetchRuntimeSummary().then(setRuntimeSummary);
    void fetchConfigSummary().then(setConfigSummary);
    void fetchWindowState().then((state) => {
      setWindowState(state);
      setDesktopMaximised(state.maximised);
    });

    const offReady = onDesktopStatus((payload) => {
      setDesktopStatus(payload);
      setRuntimeSummary(payload.runtime);
      setConfigSummary(payload.configSummary);
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
  const activeKey = keys.find((item) => item.status === "active") ?? keys[0];
  const resolvedTheme = themeMeta[theme];
  const ThemeIcon = resolvedTheme.icon;
  const desktopLabel = desktopStatus.desktopMode ? `桌面版 ${desktopVersion}` : "浏览器版";

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
            <small>{desktopLabel}</small>
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
          <div>
            <div className="brand-mark"><Activity size={18} /><span>LocalGateway</span></div>
            <p className="brand-subtitle">本地 AI 网关控制台</p>
          </div>
          <button type="button" className="ghost-button compact sidebar-close" onClick={() => setSidebarOpen(false)}><X size={16} />关闭</button>
        </div>

        <div className="workspace-card luxury-panel nested-panel">
          <div>
            <span className="eyebrow">当前工作区状态</span>
            <strong>系统状态整体稳定</strong>
          </div>
          <div className="workspace-metrics">
            <div><span>可用厂商</span><strong>{healthyProviders}/{providers.length}</strong></div>
            <div><span>主用密钥</span><strong>{activeKey?.name ?? "尚未配置"}</strong></div>
            <div><span>运行模式</span><strong>{desktopLabel}</strong></div>
            <div><span>恢复页面</span><strong>{windowState.lastRoute || "/dashboard"}</strong></div>
          </div>
        </div>

        <div className="workspace-card luxury-panel nested-panel">
          <div>
            <span className="eyebrow">桌面控制面板</span>
            <strong>窗口 / 托盘 / 自检 / 配置摘要</strong>
          </div>
          <div className="workspace-metrics">
            <div><span>健康状态</span><strong>{runtimeSummary.health}</strong></div>
            <div><span>厂商数量</span><strong>{runtimeSummary.providers}</strong></div>
            <div><span>密钥数量</span><strong>{runtimeSummary.keys}</strong></div>
            <div><span>路由规则</span><strong>{runtimeSummary.rules}</strong></div>
            <div><span>服务地址</span><strong>{configSummary.host}:{configSummary.port}</strong></div>
            <div><span>分发模式</span><strong>{configSummary.bundleMode}</strong></div>
          </div>
          {desktopStatus.desktopMode ? (
            <div className="inline-actions">
              <button type="button" className="ghost-button compact" onClick={() => showDesktopWindow()}><Eye size={14} />恢复窗口</button>
              <button type="button" className="ghost-button compact" onClick={() => hideDesktopToTray()}><EyeOff size={14} />隐藏托盘</button>
              <button type="button" className="ghost-button compact" onClick={handleSelfCheck}><ScanLine size={14} />运行自检</button>
            </div>
          ) : null}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx("nav-link", isActive && "active")}>
                <div className="nav-link-main"><Icon size={18} /><div><span>{item.label}</span><small>{item.description}</small></div></div>
                <ArrowRight size={14} className="nav-link-arrow" />
              </NavLink>
            );
          })}
        </nav>

        <div className="theme-switcher luxury-panel nested-panel">
          <div><div className="theme-title">界面主题</div><div className="theme-subtitle">切换浅色、深色或跟随系统</div></div>
          <div className="theme-buttons">
            {(["light", "dark", "system"] as const).map((item) => {
              const MetaIcon = themeMeta[item].icon;
              return <button key={item} type="button" className={clsx("theme-button", theme === item && "active")} onClick={() => setTheme(item)}><MetaIcon size={16} />{themeMeta[item].label}</button>;
            })}
          </div>
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
            <div className="status-badge neutral-pill"><ThemeIcon size={14} />{resolvedTheme.label}</div>
            <div className="status-badge neutral-pill"><Activity size={14} />{desktopStatus.platform || "web"}</div>
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
