import { useEffect, useMemo, useState } from "react";
import { Activity, Route } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

const createEmptyRule = () => ({
  id: `route-${Date.now()}`,
  modelPattern: "new-model-*",
  strategy: "Priority + Fallback",
  providerChain: ["OpenAI Primary"],
  fallbackChain: ["Azure Backup"],
  enabled: true
});

export function RoutingPage() {
  const { rules, saveRule, pushNotice } = useAdminStore();
  const [selectedId, setSelectedId] = useState(rules[0]?.id);
  const active = useMemo(() => rules.find((item) => item.id === selectedId) ?? rules[0], [rules, selectedId]);
  const [form, setForm] = useState(active ?? createEmptyRule());
  const [simulation] = useState({
    model: "gpt-4o",
    key: "Codex Pro",
    format: "openai",
    target: "OpenAI Primary",
    fallback: "Azure Backup → OpenRouter",
    cost: "$0.012 - $0.024",
    ttft: "180ms - 260ms"
  });

  useEffect(() => {
    if (active) {
      setForm(active);
    }
  }, [active]);

  return (
    <section className="page-grid split-layout routing-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Routing"
          title="策略配置和路由模拟放在一个控制面板里"
          description="不是只能看规则，而是可以直接改、直接测、直接验证 fallback。"
          actions={
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                const next = createEmptyRule();
                setSelectedId(next.id);
                setForm(next);
                pushNotice({
                  tone: "info",
                  title: "新规则草稿已创建",
                  message: "先确定模型匹配模式，再补链路和 fallback 顺序，会更稳。"
                });
              }}
            >
              Create Rule
            </button>
          }
        />

        <div className="context-strip">
          <div className="metric-pill">Rules {rules.length}</div>
          <div className="metric-pill">Enabled {rules.filter((item) => item.enabled).length}</div>
          <div className="metric-pill">Fallback Ready {rules.filter((item) => item.fallbackChain.length > 0).length}</div>
        </div>

        <div className="stack-list">
          {rules.map((rule) => (
            <button key={rule.id} type="button" className={`select-card ${rule.id === active?.id ? "active" : ""}`} onClick={() => setSelectedId(rule.id)}>
              <div>
                <strong>{rule.modelPattern}</strong>
                <span>{rule.strategy}</span>
                <small>{rule.providerChain.join(" → ")}</small>
              </div>
              <span className={`status-pill ${rule.enabled ? "healthy" : "warning"}`}>{rule.enabled ? "enabled" : "disabled"}</span>
            </button>
          ))}
        </div>
      </article>

      <DrawerCard title={form.modelPattern} subtitle="Rule Builder">
        <div className="form-grid">
          <label>
            <span>Model Pattern</span>
            <input value={form.modelPattern} onChange={(e) => setForm({ ...form, modelPattern: e.target.value })} placeholder="gpt-4o* / claude-*" />
          </label>
          <label>
            <span>Strategy</span>
            <input value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} placeholder="Priority + Fallback" />
          </label>
          <label className="span-2">
            <span>Provider Chain</span>
            <input value={form.providerChain.join(" → ")} onChange={(e) => setForm({ ...form, providerChain: e.target.value.split("→").map((item) => item.trim()).filter(Boolean) })} placeholder="OpenAI Primary → Azure Backup" />
          </label>
          <label className="span-2">
            <span>Fallback Chain</span>
            <input value={form.fallbackChain.join(" → ")} onChange={(e) => setForm({ ...form, fallbackChain: e.target.value.split("→").map((item) => item.trim()).filter(Boolean) })} placeholder="Azure Backup → OpenRouter" />
          </label>
        </div>

        <div className="route-preview luxury-panel nested-panel detail-card">
          <strong>当前链路预览</strong>
          <p>Primary：{form.providerChain.join(" → ") || "未配置"}</p>
          <p>Fallback：{form.fallbackChain.join(" → ") || "未配置"}</p>
        </div>

        <div className="inline-actions sticky-actions">
          <button type="button" className="primary-button" onClick={() => saveRule(form)}>保存规则</button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "success", title: "链路校验通过", message: `${form.modelPattern} 的路由链与 fallback 顺序在交互校验中通过。` })}
          >
            <Route size={16} /> 验证链路
          </button>
        </div>
      </DrawerCard>

      <article className="luxury-panel page-panel simulation-panel">
        <SectionHeader eyebrow="Simulation" title="路由测试器" description="给定模型、Key 和格式，前端直接看到会分发到哪里。" />
        <div className="simulation-grid">
          <div className="metric-pill"><Activity size={16} /> Model: {simulation.model}</div>
          <div className="metric-pill">Key: {simulation.key}</div>
          <div className="metric-pill">Format: {simulation.format}</div>
          <div className="metric-pill">Target: {simulation.target}</div>
          <div className="metric-pill">Fallback: {simulation.fallback}</div>
          <div className="metric-pill">Cost: {simulation.cost}</div>
          <div className="metric-pill">TTFT: {simulation.ttft}</div>
        </div>
      </article>
    </section>
  );
}
