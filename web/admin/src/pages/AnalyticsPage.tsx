import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { SectionHeader } from "../components/SectionHeader";
import { costTrend } from "../store/mock-data";

const providerBreakdown = [
  { name: "OpenAI", cost: 482, tokens: 1420000 },
  { name: "Claude", cost: 391, tokens: 1080000 },
  { name: "DeepSeek", cost: 146, tokens: 1640000 }
];

export function AnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [dimension, setDimension] = useState("cost");

  const summary = useMemo(() => {
    const totalCost = costTrend.reduce((sum, item) => sum + item.cost, 0);
    const totalRequests = costTrend.reduce((sum, item) => sum + item.requests, 0);
    const totalTokens = costTrend.reduce((sum, item) => sum + item.tokens, 0);
    return { totalCost, totalRequests, totalTokens };
  }, []);

  return (
    <section className="page-grid analytics-workbench">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Analytics"
          title="费用、请求、Token 与性能统一分析台"
          description="支持按时间范围与维度切换查看，并预留导出入口。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${range === "7d" ? "active-chip" : ""}`} onClick={() => setRange("7d")}>7D</button>
              <button type="button" className={`ghost-button compact ${range === "30d" ? "active-chip" : ""}`} onClick={() => setRange("30d")}>30D</button>
              <button type="button" className="ghost-button compact">Export CSV</button>
              <button type="button" className="ghost-button compact">Export JSON</button>
            </>
          }
        />
        <div className="metric-bar-grid analytics-summary-grid">
          <div className="metric-pill">Total Cost ${summary.totalCost}</div>
          <div className="metric-pill">Requests {summary.totalRequests.toLocaleString()}</div>
          <div className="metric-pill">Tokens {summary.totalTokens.toLocaleString()}</div>
          <div className="metric-pill">Mode {range}</div>
        </div>
      </article>

      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Trend"
          title="趋势图切换"
          description="同一块图形区域支持费用与请求视角切换。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${dimension === "cost" ? "active-chip" : ""}`} onClick={() => setDimension("cost")}>Cost</button>
              <button type="button" className={`ghost-button compact ${dimension === "requests" ? "active-chip" : ""}`} onClick={() => setDimension("requests")}>Requests</button>
            </>
          }
        />
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(15,18,32,0.92)" }} />
              <Line type="monotone" dataKey={dimension} stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="luxury-panel page-panel">
        <SectionHeader eyebrow="Breakdown" title="Provider 成本分布" description="可以继续扩展到 Key / Model / Error Rate 等更多维度。" />
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={providerBreakdown}>
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
