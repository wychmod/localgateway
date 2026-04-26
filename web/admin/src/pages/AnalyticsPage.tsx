import { useMemo, useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { SectionHeader } from "../components/SectionHeader";

type BreakdownItem = { name: string; cost: number; requests: number; tokens: number };

type AnalyticsPayload = {
  summary: {
    total_requests: number;
    total_cost_usd: number;
    input_tokens: number;
    output_tokens: number;
    success_rate: number;
  };
  trend: Array<{ day: string; cost: number; requests: number; tokens: number }>;
  provider_breakdown: BreakdownItem[];
  model_breakdown: BreakdownItem[];
  key_breakdown: BreakdownItem[];
  log_stats: { total: number; failures: number; fallbacks: number; avg_latency_ms: number };
};

export function AnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [dimension, setDimension] = useState<"cost" | "requests">("cost");
  const [breakdownMode, setBreakdownMode] = useState<"provider" | "model" | "key">("provider");
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    const days = range === "7d" ? 7 : 30;
    void fetch(`/admin/api/analytics?days=${days}`)
      .then((res) => res.json())
      .then((payload) => setData(payload.data ?? null));
  }, [range]);

  const summary = useMemo(() => {
    if (!data) {
      return { totalCost: 0, totalRequests: 0, totalTokens: 0, successRate: 0 };
    }
    return {
      totalCost: data.summary.total_cost_usd,
      totalRequests: data.summary.total_requests,
      totalTokens: data.summary.input_tokens + data.summary.output_tokens,
      successRate: data.summary.success_rate
    };
  }, [data]);

  const activeBreakdown = useMemo(() => {
    if (!data) return [];
    if (breakdownMode === "model") return data.model_breakdown;
    if (breakdownMode === "key") return data.key_breakdown;
    return data.provider_breakdown;
  }, [data, breakdownMode]);

  const highlight = dimension === "cost"
    ? `近 ${range === "7d" ? "7" : "30"} 日总费用 ${summary.totalCost.toFixed(2)} 美元`
    : `近 ${range === "7d" ? "7" : "30"} 日总请求 ${summary.totalRequests.toLocaleString()} 次`;

  return (
    <section className="page-grid analytics-workbench">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="数据分析"
          title="费用 · 请求 · 令牌与性能分析"
          description="这里已经把 usage 聚合、日志统计、模型拆分和 Key 拆分都接到真实数据。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${range === "7d" ? "active-chip" : ""}`} onClick={() => setRange("7d")}>近 7 天</button>
              <button type="button" className={`ghost-button compact ${range === "30d" ? "active-chip" : ""}`} onClick={() => setRange("30d")}>近 30 天</button>
            </>
          }
        />
        <div className="metric-bar-grid analytics-summary-grid">
          <div className="metric-pill">总费用 {summary.totalCost.toFixed(2)} 美元</div>
          <div className="metric-pill">总请求 {summary.totalRequests.toLocaleString()} 次</div>
          <div className="metric-pill">总令牌 {summary.totalTokens.toLocaleString()} 个</div>
          <div className="metric-pill">成功率 {(summary.successRate * 100).toFixed(1)}%</div>
          <div className="metric-pill">失败请求 {data?.log_stats.failures ?? 0} 次</div>
          <div className="metric-pill">备用切换 {data?.log_stats.fallbacks ?? 0} 次</div>
        </div>
        <article className="luxury-panel nested-panel insight-card">
          <strong>当前焦点</strong>
          <p>{highlight}，日志统计显示平均延迟 {data?.log_stats.avg_latency_ms ?? 0} 毫秒。</p>
        </article>
      </article>

      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="趋势变化"
          title="趋势图切换"
          description="支持费用与请求两个视角切换。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${dimension === "cost" ? "active-chip" : ""}`} onClick={() => setDimension("cost")}>费用</button>
              <button type="button" className={`ghost-button compact ${dimension === "requests" ? "active-chip" : ""}`} onClick={() => setDimension("requests")}>请求数</button>
            </>
          }
        />
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.trend ?? []}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(15,18,32,0.92)" }} />
              <Line type="monotone" dataKey={dimension} stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="维度拆分"
          title="Provider / Model / Key 拆分"
          description="在同一页里切不同维度看成本、请求量和令牌分布。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${breakdownMode === "provider" ? "active-chip" : ""}`} onClick={() => setBreakdownMode("provider")}>厂商</button>
              <button type="button" className={`ghost-button compact ${breakdownMode === "model" ? "active-chip" : ""}`} onClick={() => setBreakdownMode("model")}>模型</button>
              <button type="button" className={`ghost-button compact ${breakdownMode === "key" ? "active-chip" : ""}`} onClick={() => setBreakdownMode("key")}>本地密钥</button>
            </>
          }
        />
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeBreakdown}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(15,18,32,0.92)" }} />
              <Bar dataKey="cost" radius={[10, 10, 0, 0]} fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
