import { useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

const logs = [
  { id: "log-1", time: "12:01:08", path: "/v1/chat/completions", provider: "OpenAI Primary", latency: "184ms", status: "200 OK", detail: "Codex 正常流式返回" },
  { id: "log-2", time: "12:02:14", path: "/v1/messages", provider: "Claude Premium", latency: "246ms", status: "200 OK", detail: "Claude Desktop 正常完成" },
  { id: "log-3", time: "12:03:50", path: "/v1/chat/completions", provider: "Azure Backup", latency: "528ms", status: "Fallback", detail: "OpenAI Primary 超时，已自动切到 Azure Backup" },
  { id: "log-4", time: "12:05:19", path: "/v1/models", provider: "Gateway", latency: "32ms", status: "200 OK", detail: "模型列表刷新" }
];

export function LogsPage() {
  const [query, setQuery] = useState("");
  const [onlyFallback, setOnlyFallback] = useState(false);
  const [selectedId, setSelectedId] = useState(logs[0].id);

  const filtered = useMemo(() => {
    return logs.filter((item) => {
      const matchedText = [item.path, item.provider, item.status, item.detail].join(" ").toLowerCase();
      const byQuery = matchedText.includes(query.toLowerCase());
      const byFallback = onlyFallback ? item.status === "Fallback" : true;
      return byQuery && byFallback;
    });
  }, [query, onlyFallback]);

  const active = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  return (
    <section className="page-grid split-layout logs-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Logs"
          title="异常流、Fallback 和请求详情都能一把抓"
          description="这页不只是看流水，还要帮你定位问题。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${onlyFallback ? "active-chip" : ""}`} onClick={() => setOnlyFallback((value) => !value)}>
                <AlertTriangle size={14} /> Fallback Only
              </button>
              <button type="button" className="ghost-button compact">Export Logs</button>
            </>
          }
        />
        <label className="search-box">
          <span><Search size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="按路径、Provider、状态、详情搜索" />
        </label>
        <div className="stack-list">
          {filtered.map((log) => (
            <button key={log.id} type="button" className={`select-card ${active?.id === log.id ? "active" : ""}`} onClick={() => setSelectedId(log.id)}>
              <div>
                <strong>{log.path}</strong>
                <span>{log.provider} · {log.time}</span>
              </div>
              <span className={`status-pill ${log.status === "Fallback" ? "warning" : "healthy"}`}>{log.status}</span>
            </button>
          ))}
        </div>
      </article>

      <article className="luxury-panel page-panel detail-panel">
        <SectionHeader eyebrow="Detail" title={active?.path ?? "No Result"} description="请求详情、问题原因与相关链路都在右侧展开。" />
        {active ? (
          <div className="detail-stack">
            <div className="metric-pill">Time: {active.time}</div>
            <div className="metric-pill">Provider: {active.provider}</div>
            <div className="metric-pill">Latency: {active.latency}</div>
            <div className="metric-pill">Status: {active.status}</div>
            <article className="luxury-panel nested-panel detail-card">
              <strong>Detail</strong>
              <p>{active.detail}</p>
            </article>
            <article className="luxury-panel nested-panel detail-card">
              <strong>Trace</strong>
              <p>Primary → Retry → Fallback 路径已在这里预留，后续联调后会展示真实调用栈。</p>
            </article>
          </div>
        ) : (
          <p className="section-description">没有匹配到日志。</p>
        )}
      </article>
    </section>
  );
}
