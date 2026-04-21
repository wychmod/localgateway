import { useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

const logs = [
  { id: "log-1", time: "12:01:08", path: "/v1/chat/completions", provider: "OpenAI 主线路", latency: "184 毫秒", status: "成功", detail: "Codex 正常流式返回" },
  { id: "log-2", time: "12:02:14", path: "/v1/messages", provider: "Claude 高级线路", latency: "246 毫秒", status: "成功", detail: "Claude Desktop 正常完成" },
  { id: "log-3", time: "12:03:50", path: "/v1/chat/completions", provider: "Azure 备用线路", latency: "528 毫秒", status: "已切换备用", detail: "OpenAI 主线路超时，已自动切到 Azure 备用线路" },
  { id: "log-4", time: "12:05:19", path: "/v1/models", provider: "网关服务", latency: "32 毫秒", status: "成功", detail: "模型列表刷新" }
];

export function LogsPage() {
  const [query, setQuery] = useState("");
  const [onlyFallback, setOnlyFallback] = useState(false);
  const [selectedId, setSelectedId] = useState(logs[0].id);

  const filtered = useMemo(() => {
    return logs.filter((item) => {
      const matchedText = [item.path, item.provider, item.status, item.detail].join(" ").toLowerCase();
      const byQuery = matchedText.includes(query.toLowerCase());
      const byFallback = onlyFallback ? item.status === "已切换备用" : true;
      return byQuery && byFallback;
    });
  }, [query, onlyFallback]);

  const active = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  return (
    <section className="page-grid split-layout logs-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="运行日志"
          title="异常流 · 备用切换 · 请求详情"
          description="不只是看流水，还要帮你定位问题。"
          actions={
            <>
              <button type="button" className={`ghost-button compact ${onlyFallback ? "active-chip" : ""}`} onClick={() => setOnlyFallback((value) => !value)}>
                <AlertTriangle size={14} /> 只看备用切换
              </button>
              <button type="button" className="ghost-button compact">导出日志</button>
            </>
          }
        />

        <div className="context-strip">
          <div className="metric-pill">匹配结果 {filtered.length}</div>
          <div className="metric-pill">备用切换 {logs.filter((item) => item.status === "已切换备用").length}</div>
          <div className="metric-pill">搜索状态 {query ? "已筛选" : "全部"}</div>
        </div>

        <label className="search-box">
          <span><Search size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="按路径、厂商、状态、详情搜索" />
        </label>

        {filtered.length ? (
          <div className="stack-list">
            {filtered.map((log) => (
              <button key={log.id} type="button" className={`select-card ${active?.id === log.id ? "active" : ""}`} onClick={() => setSelectedId(log.id)}>
                <div>
                  <strong>{log.path}</strong>
                  <span>{log.provider} · {log.time}</span>
                  <small>{log.latency} · {log.detail}</small>
                </div>
                <span className={`status-pill ${log.status === "已切换备用" ? "warning" : "healthy"}`}>{log.status}</span>
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
        <SectionHeader eyebrow="日志详情" title={active?.path ?? "暂无结果"} description="请求详情、问题原因与相关链路。" />
        {active ? (
          <div className="detail-stack">
            <div className="metric-pill">时间：{active.time}</div>
            <div className="metric-pill">厂商：{active.provider}</div>
            <div className="metric-pill">耗时：{active.latency}</div>
            <div className="metric-pill">状态：{active.status}</div>
            <article className="luxury-panel nested-panel detail-card">
              <strong>详细说明</strong>
              <p>{active.detail}</p>
            </article>
            <article className="luxury-panel nested-panel detail-card">
              <strong>调用链路</strong>
              <p>主链路 → 重试 → 备用切换路径已预留，后续联调后会展示真实调用栈。</p>
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
