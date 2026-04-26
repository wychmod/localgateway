import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, Search } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

type LogItem = {
  id: string;
  path: string;
  provider_id: string;
  latency_ms: number;
  status_label: string;
  detail: string;
  trace_id: string;
  fallback_used: boolean;
  fallback_tried: string[];
  created_at: string;
  metadata: Record<string, unknown>;
  status_code: number;
};

type LogStats = {
  total: number;
  failures: number;
  fallbacks: number;
  avg_latency_ms: number;
};

export function LogsPage() {
  const [query, setQuery] = useState("");
  const [traceQuery, setTraceQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [onlyFallback, setOnlyFallback] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("");
  const [apiFormatFilter, setApiFormatFilter] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [stats, setStats] = useState<LogStats>({ total: 0, failures: 0, fallbacks: 0, avg_latency_ms: 0 });
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (traceQuery) params.set("trace", traceQuery);
  if (fromDate) params.set("from", fromDate);
  if (toDate) params.set("to", toDate);
  if (onlyFallback) params.set("only_fallback", "true");
  if (providerFilter) params.set("provider", providerFilter);
  if (apiFormatFilter) params.set("api_format", apiFormatFilter);
  if (statusFilter !== "all") params.set("status", statusFilter);
  params.set("limit", "100");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/admin/api/logs?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        const items = (payload.data ?? []) as LogItem[];
        setLogs(items);
        setStats(payload.stats ?? { total: items.length, failures: 0, fallbacks: 0, avg_latency_ms: 0 });
        setSelectedId((current) => current || items[0]?.id || "");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query, traceQuery, fromDate, toDate, onlyFallback, providerFilter, apiFormatFilter, statusFilter]);

  const active = logs.find((item) => item.id === selectedId) ?? logs[0];

  const handleExport = () => {
    window.open(`/admin/api/logs/export?${params.toString()}`, "_blank");
  };

  return (
    <section className="page-grid split-layout logs-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="运行日志"
          title="日志检索"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${onlyFallback ? "active-chip" : ""}`} onClick={() => setOnlyFallback((value) => !value)}>
                <AlertTriangle size={14} /> 备用切换
              </button>
              <button type="button" className="ghost-button compact" onClick={handleExport}>
                <Download size={14} /> 导出
              </button>
            </>
          }
        />

        <div className="context-strip">
          <div className="metric-pill">匹配结果 {logs.length}</div>
          <div className="metric-pill">备用切换 {stats.fallbacks}</div>
          <div className="metric-pill">失败请求 {stats.failures}</div>
          <div className="metric-pill">平均延迟 {stats.avg_latency_ms} 毫秒</div>
        </div>

        <label className="search-box">
          <span><Search size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="按路径、fallback、错误信息搜索" />
        </label>

        <div className="inline-actions" style={{ marginBottom: 16 }}>
          <input value={traceQuery} onChange={(e) => setTraceQuery(e.target.value)} placeholder="精确搜索 Trace ID" />
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        <div className="inline-actions" style={{ marginBottom: 16 }}>
          <input value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} placeholder="筛选厂商" />
          <input value={apiFormatFilter} onChange={(e) => setApiFormatFilter(e.target.value)} placeholder="筛选接口格式，如 OpenAI / Claude" />
          <button type="button" className={`ghost-button compact ${statusFilter === "failed" ? "active-chip" : ""}`} onClick={() => setStatusFilter((v) => v === "failed" ? "all" : "failed")}>只看失败</button>
        </div>

        {loading ? (
          <article className="luxury-panel nested-panel empty-state-card"><strong>日志加载中</strong><p>正在读取真实请求日志…</p></article>
        ) : logs.length ? (
          <div className="stack-list">
            {logs.map((log) => (
              <button key={log.id} type="button" className={`select-card ${active?.id === log.id ? "active" : ""}`} onClick={() => setSelectedId(log.id)}>
                <div>
                  <strong>{log.path}</strong>
                  <span>{log.provider_id} · {new Date(log.created_at).toLocaleTimeString()}</span>
                  <small>{log.latency_ms} 毫秒 · {log.detail}</small>
                </div>
                <span className={`status-pill ${log.fallback_used ? "warning" : log.status_label === "失败" ? "warning" : "healthy"}`}>{log.status_label}</span>
              </button>
            ))}
          </div>
        ) : (
          <article className="luxury-panel nested-panel empty-state-card"><strong>没有匹配到日志</strong><p>换个筛选条件试试。</p></article>
        )}
      </article>

      <article className="luxury-panel page-panel detail-panel">
        <SectionHeader eyebrow="日志详情" title={active?.path ?? "暂无结果"} />
        {active ? (
          <div className="detail-stack">
            <div className="metric-pill">时间：{new Date(active.created_at).toLocaleString()}</div>
            <div className="metric-pill">厂商：{active.provider_id}</div>
            <div className="metric-pill">耗时：{active.latency_ms} 毫秒</div>
            <div className="metric-pill">状态：{active.status_label}</div>
            <div className="metric-pill">状态码：{active.status_code}</div>
            <div className="metric-pill">Trace：{active.trace_id || "暂无"}</div>
            <article className="luxury-panel nested-panel detail-card"><strong>详细说明</strong><p>{active.detail}</p></article>
            <article className="luxury-panel nested-panel detail-card">
              <strong>调用链路</strong>
              <p>请求格式：{String(active.metadata?.apiFormat ?? "未知")}</p>
              <p>请求模型：{String(active.metadata?.requestedModel ?? "未知")}</p>
              <p>实际模型：{String(active.metadata?.actualModel ?? "未知")}</p>
              <p>主厂商：{String(active.metadata?.provider ?? active.provider_id)}</p>
              <p>备用尝试：{active.fallback_tried?.length ? active.fallback_tried.join(" → ") : "无"}</p>
            </article>
          </div>
        ) : (
          <article className="luxury-panel nested-panel empty-state-card"><strong>暂无详情</strong><p>先在左边选一条日志，或者放宽筛选条件。</p></article>
        )}
      </article>
    </section>
  );
}
