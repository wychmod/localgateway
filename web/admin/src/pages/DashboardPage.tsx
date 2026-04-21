import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { alertFeed, costTrend, distributionStatus, liveRequests, providerHealth, quickActions, statCards } from "../store/mock-data";
import { providerStatusMap } from "../store/labels";

export function DashboardPage() {
  return (
    <div className="page-grid dashboard-grid enhanced-dashboard">
      <section className="hero-panel luxury-panel dashboard-hero">
        <div>
          <span className="eyebrow">系统总览</span>
          <h2>网关配置 · 运行状态 · 分发进度</h2>
          <p>
            直接发起关键操作、查看告警、确认健康状态，
            同时追踪便携分发版本是否已具备下载即用条件。
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
            <span className="eyebrow">费用分析</span>
            <h3>近 7 日费用与用量趋势</h3>
          </div>
          <button type="button" className="ghost-button">导出快照</button>
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
            <span className="eyebrow">风险提醒</span>
            <h3>当前告警与提示</h3>
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
            <span className="eyebrow">厂商健康度</span>
            <h3>线路状态与流量占比</h3>
          </div>
          <button type="button" className="ghost-button">打开实时视图</button>
        </div>
        <div className="provider-list">
          {providerHealth.map((item) => (
            <article key={item.name} className="provider-row">
              <div>
                <strong>{item.name}</strong>
                <span>延迟 {item.latency} 毫秒 · 流量占比 {item.share}%</span>
              </div>
              <span className={`status-pill ${item.status}`}>{providerStatusMap[item.status] ?? item.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-panel dashboard-side-panel distribution-card-panel">
        <div className="panel-heading compact-heading">
          <div>
            <span className="eyebrow">分发状态</span>
            <h3>下载即用准备情况</h3>
          </div>
        </div>
        <div className="distribution-stack">
          <div className="metric-pill">分发包：{distributionStatus.artifact}</div>
          <div className="metric-pill">分发方式：{distributionStatus.mode}</div>
          <div className="metric-pill">打包说明：{distributionStatus.bundle}</div>
          <div className="metric-pill">初始化：{distributionStatus.init}</div>
        </div>
      </section>

      <section className="luxury-panel live-flow-panel">
        <div className="panel-heading compact-heading">
          <div>
            <span className="eyebrow">实时请求</span>
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
