import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { distributionStatus, quickActions } from "../store/mock-data";
import { providerStatusMap } from "../store/labels";
import { fetchDesktopStatus, isDesktopMode, type DesktopStatus } from "../utils/desktop-bridge";

type DashboardPayload = {
  overview: {
    providers: number;
    keys: number;
    rules: number;
    usage: {
      total_requests: number;
      total_cost_usd: number;
      input_tokens: number;
      output_tokens: number;
      success_rate: number;
    };
  };
  trend: Array<{ day: string; cost: number; requests: number; tokens: number }>;
  provider_breakdown: Array<{ name: string; cost: number; requests: number; tokens: number }>;
  provider_health: Array<{ status: string; latency_ms: number; message: string }>;
  recent_logs: Array<{ id: string; path: string; provider_id: string; latency_ms: number; status_label: string }>;
  log_stats: { total: number; failures: number; fallbacks: number; avg_latency_ms: number };
  alerts: Array<{ level: string; title: string; description: string }>;
};

const fallbackStatus: DesktopStatus = {
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
  windowState: { width: 1360, height: 860, x: 120, y: 80, maximised: false, lastRoute: "/dashboard", hiddenToTray: false },
  runtime: { providers: 0, keys: 0, rules: 0, health: "browser" },
  configSummary: { host: "127.0.0.1", port: 0, adminPath: "/admin", theme: "system", bundleMode: "browser", updateChannel: "stable" }
};

export function DashboardPage() {
  const [desktopStatus, setDesktopStatus] = useState<DesktopStatus>(fallbackStatus);
  const [data, setData] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    void fetchDesktopStatus().then(setDesktopStatus);
    void fetch("/admin/api/dashboard")
      .then((res) => res.json())
      .then((payload) => setData(payload.data ?? null));
  }, []);

  const statCards = useMemo(() => {
    if (!data) return [];
    return [
      { title: "总请求", value: `${data.overview.usage.total_requests} 次`, delta: `成功率 ${(data.overview.usage.success_rate * 100).toFixed(1)}%`, tone: "violet" },
      { title: "累计费用", value: `${data.overview.usage.total_cost_usd.toFixed(2)} 美元`, delta: `输入 ${data.overview.usage.input_tokens} tokens`, tone: "emerald" },
      { title: "失败请求", value: `${data.log_stats.failures} 次`, delta: `备用切换 ${data.log_stats.fallbacks} 次`, tone: "sky" },
      { title: "可用厂商", value: `${data.overview.providers} 家`, delta: `平均延迟 ${data.log_stats.avg_latency_ms} 毫秒`, tone: "amber" }
    ];
  }, [data]);

  return (
    <div className="page-grid dashboard-grid enhanced-dashboard">
      <section className="hero-panel luxury-panel dashboard-hero">
        <div>
          <span className="eyebrow">系统总览</span>
          <h2>网关配置 · 运行状态 · 分发进度</h2>
          <p>首页现在不仅接了真实聚合数据，还把失败请求和备用切换统计拉上来了。</p>
          <div className="inline-actions hero-actions">
            {quickActions.map((action) => (
              <button key={action} type="button" className="ghost-button compact">{action}</button>
            ))}
          </div>
          {isDesktopMode ? (
            <div className="context-strip">
              <span className="metric-pill">桌面版本：{desktopStatus.version}</span>
              <span className="metric-pill">当前平台：{desktopStatus.platform}</span>
              <span className="metric-pill">服务地址：{desktopStatus.serverAddr || "内嵌模式"}</span>
            </div>
          ) : null}
        </div>
        <div className="hero-orb"><div className="orb-core" /></div>
      </section>

      <section className="stats-grid">
        {statCards.length ? statCards.map((card) => (
          <article key={card.title} className={`luxury-panel stat-card tone-${card.tone}`}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <em>{card.delta}</em>
          </article>
        )) : <article className="luxury-panel stat-card"><strong>暂无真实统计</strong><em>先发起一些真实请求，这里就会长出数据。</em></article>}
      </section>

      <section className="luxury-panel chart-panel">
        <div className="panel-heading"><div><span className="eyebrow">费用分析</span><h3>近 7 日费用与用量趋势</h3></div></div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.trend ?? []}>
              <defs><linearGradient id="costFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7c5cff" stopOpacity={0.65} /><stop offset="100%" stopColor="#7c5cff" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(15,18,32,0.92)" }} />
              <Area type="monotone" dataKey="cost" stroke="#a78bfa" fill="url(#costFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="luxury-panel dashboard-side-panel alert-panel">
        <div className="panel-heading compact-heading"><div><span className="eyebrow">风险提醒</span><h3>当前告警与提示</h3></div></div>
        <div className="stack-list">
          {(data?.alerts?.length ? data.alerts : [{ level: "info", title: "暂无告警", description: "当前真实链路还没有产生异常或备用切换。" }]).map((alert) => (
            <article key={alert.title + alert.description} className={`luxury-panel nested-panel alert-card ${alert.level}`}><strong>{alert.title}</strong><p>{alert.description}</p></article>
          ))}
        </div>
      </section>

      <section className="luxury-panel providers-panel">
        <div className="panel-heading"><div><span className="eyebrow">厂商健康度</span><h3>线路状态与流量占比</h3></div></div>
        <div className="provider-list">
          {(data?.provider_health ?? []).map((item, index) => (
            <article key={`${item.message}-${index}`} className="provider-row">
              <div><strong>{item.message}</strong><span>延迟 {item.latency_ms} 毫秒</span></div>
              <span className={`status-pill ${item.status}`}>{providerStatusMap[item.status] ?? item.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-panel dashboard-side-panel distribution-card-panel">
        <div className="panel-heading compact-heading"><div><span className="eyebrow">分发状态</span><h3>下载即用准备情况</h3></div></div>
        <div className="distribution-stack">
          <div className="metric-pill">分发包：{distributionStatus.artifact}</div>
          <div className="metric-pill">分发方式：{distributionStatus.mode}</div>
          <div className="metric-pill">打包说明：{distributionStatus.bundle}</div>
          <div className="metric-pill">初始化：{distributionStatus.init}</div>
        </div>
      </section>

      <section className="luxury-panel live-flow-panel">
        <div className="panel-heading compact-heading"><div><span className="eyebrow">最近请求</span><h3>最新请求链路</h3></div></div>
        <div className="log-stream">
          {(data?.recent_logs ?? []).map((item) => (
            <article key={item.id} className="log-row compact-log-row">
              <span>{item.path}</span>
              <strong>{item.provider_id}</strong>
              <span>{item.latency_ms} 毫秒</span>
              <span>{item.status_label}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
