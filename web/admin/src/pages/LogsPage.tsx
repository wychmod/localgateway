import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
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
};

export function LogsPage() {
  const [query, setQuery] = useState("");
  const [onlyFallback, setOnlyFallback] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (onlyFallback) params.set("only_fallback", "true");
    params.set("limit", "100");

    setLoading(true);
    fetch(`/admin/api/logs?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        const items = (payload.data ?? []) as LogItem[];
        setLogs(items);
        setSelectedId((current) => current || items[0]?.id || "");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query, onlyFallback]);

  const filtered = useMemo(() => logs, [logs]);
  const active = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  return (
    <section className="page-grid split-layout logs-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="运行日志"
          title="异常流 · 备用切换 · 请求详情"
          description="现在这里展示的已经是 RequestLog 里的真实请求链路，而不再是演示数据。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${onlyFallback ? "active-chip" : ""}`} onClick={() => setOnlyFallback((value) => !value)}>
                <AlertTriangle size={14} /> 只看备用切换
              </button>
            </>
          }
        />

        <div className="context-strip">
          <div className="metric-pill">匹配结果 {filtered.length}</div>
          <div className="metric-pill">备用切换 {filtered.filter((item) => item.fallback_used).length}</div>
          <div className="metric-pill">搜索状态 {query ? "已筛选" : "全部"}</div>
        </div>

        <label className="search-box">
          <span><Search size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="按路径、trace、fallback、错误信息搜索" />
        </label>

        {loading ? (
          <article className="luxury-panel nested-panel empty-state-card">
            <strong>日志加载中</strong>
            <p>正在读取真实请求日志…</p>
          </article>
        ) : filtered.length ? (
          <div className="stack-list">
            {filtered.map((log) => (
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
          <article className="luxury-panel nested-panel empty-state-card">
            <strong>没有匹配到日志</strong>
            <p>换个关键词，或者取消「只看备用切换」筛选试试。</p>
          </article>
        )}
      </article>

      <article className="luxury-panel page-panel detail-panel">
        <SectionHeader eyebrow="日志详情" title={active?.path ?? "暂无结果"} description="请求详情、trace、fallback 原因与相关链路。" />
        {active ? (
          <div className="detail-stack">
            <div className="metric-pill">时间：{new Date(active.created_at).toLocaleString()}</div>
            <div className="metric-pill">厂商：{active.provider_id}</div>
            <div className="metric-pill">耗时：{active.latency_ms} 毫秒</div>
            <div className="metric-pill">状态：{active.status_label}</div>
            <div className="metric-pill">Trace：{active.trace_id || "暂无"}</div>
            <article className="luxury-panel nested-panel detail-card">
              <strong>详细说明</strong>
              <p>{active.detail}</p>
            </article>
            <article className="luxury-panel nested-panel detail-card">
              <strong>调用链路</strong>
              <p>请求格式：{String(active.metadata?.apiFormat ?? "unknown")}</p>
              <p>请求模型：{String(active.metadata?.requestedModel ?? "unknown")}</p>
              <p>实际模型：{String(active.metadata?.actualModel ?? "unknown")}</p>
              <p>主 Provider：{String(active.metadata?.provider ?? active.provider_id)}</p>
              <p>Fallback 尝试：{active.fallback_tried?.length ? active.fallback_tried.join(" → ") : "无"}</p>
            </article>
          </div>
        ) : (
          <article className="luxury-panel nested-panel empty-state-card">
            <strong>暂无详情</strong>
            <p>先在左边选一条日志，或者放宽筛选条件。</p>
          </article>
        )}
      </article>
    </section>
  );
}
