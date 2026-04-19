import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { alertFeed, costTrend, distributionStatus, liveRequests, providerHealth, quickActions, statCards } from "../store/mock-data";

export function DashboardPage() {
  return (
    <div className="page-grid dashboard-grid enhanced-dashboard">
      <section className="hero-panel luxury-panel dashboard-hero">
        <div>
          <span className="eyebrow">Mission Control</span>
          <h2>把网关配置、运行态、分发态都压进一个中控首页</h2>
          <p>
            这里不只是看数字，而是直接发起关键操作、查看告警、确认健康状态，
            同时追踪便携分发版本是否已经具备下载即用条件。
          </p>
          <div className="inline-actions hero-actions">
            {quickActions.map((action) => (
              <button key={action} type="button" className="ghost-button compact">{action}</button>
            ))}
          </div>
        </div>
        <div className="hero-orb">
          <div className="orb-core" />
        </div>
      </section>

      <section className="stats-grid">
        {statCards.map((card) => (
          <article key={card.title} className={`luxury-panel stat-card tone-${card.tone}`}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <em>{card.delta}</em>
          </article>
        ))}
      </section>

      <section className="luxury-panel chart-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Cost Intelligence</span>
            <h3>7 日费用、请求与 Token 走势</h3>
          </div>
          <button type="button" className="ghost-button">Export Snapshot</button>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={costTrend}>
              <defs>
                <linearGradient id="costFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.65} />
                  <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(15,18,32,0.92)" }} />
              <Area type="monotone" dataKey="cost" stroke="#a78bfa" fill="url(#costFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="luxury-panel dashboard-side-panel alert-panel">
        <div className="panel-heading compact-heading">
          <div>
            <span className="eyebrow">Alerts</span>
            <h3>风险与提示</h3>
          </div>
        </div>
        <div className="stack-list">
          {alertFeed.map((alert) => (
            <article key={alert.title} className={`luxury-panel nested-panel alert-card ${alert.level}`}>
              <strong>{alert.title}</strong>
              <p>{alert.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-panel providers-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Provider Health</span>
            <h3>线路状态与流量占比</h3>
          </div>
          <button type="button" className="ghost-button">Open Live View</button>
        </div>
        <div className="provider-list">
          {providerHealth.map((item) => (
            <article key={item.name} className="provider-row">
              <div>
                <strong>{item.name}</strong>
                <span>{item.latency} ms · 流量占比 {item.share}%</span>
              </div>
              <span className={`status-pill ${item.status}`}>{item.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-panel dashboard-side-panel distribution-card-panel">
        <div className="panel-heading compact-heading">
          <div>
            <span className="eyebrow">Distribution</span>
            <h3>下载即用状态</h3>
          </div>
        </div>
        <div className="distribution-stack">
          <div className="metric-pill">Artifact: {distributionStatus.artifact}</div>
          <div className="metric-pill">Mode: {distributionStatus.mode}</div>
          <div className="metric-pill">Bundle: {distributionStatus.bundle}</div>
          <div className="metric-pill">Init: {distributionStatus.init}</div>
        </div>
      </section>

      <section className="luxury-panel live-flow-panel">
        <div className="panel-heading compact-heading">
          <div>
            <span className="eyebrow">Live Flow</span>
            <h3>当前请求流</h3>
          </div>
        </div>
        <div className="log-stream">
          {liveRequests.map((item) => (
            <article key={`${item.tool}-${item.model}`} className="log-row compact-log-row">
              <span>{item.tool}</span>
              <strong>{item.model}</strong>
              <span>{item.provider}</span>
              <span>{item.latency}</span>
              <span>{item.status}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
