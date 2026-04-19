import { useMemo, useState } from "react";
import { Activity, Route } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function RoutingPage() {
  const { rules, saveRule } = useAdminStore();
  const [selectedId, setSelectedId] = useState(rules[0]?.id);
  const active = useMemo(() => rules.find((item) => item.id === selectedId) ?? rules[0], [rules, selectedId]);
  const [form, setForm] = useState(active);
  const [simulation] = useState({
    model: "gpt-4o",
    key: "Codex Pro",
    format: "openai",
    target: "OpenAI Primary",
    fallback: "Azure Backup → OpenRouter",
    cost: "$0.012 - $0.024",
    ttft: "180ms - 260ms"
  });

  if (!active || !form) {
    return null;
  }

  return (
    <section className="page-grid split-layout routing-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Routing"
          title="策略配置和路由模拟放在一个控制面板里"
          description="不是只能看规则，而是可以直接改、直接测、直接验证 fallback。"
          actions={<button type="button" className="primary-button">Create Rule</button>}
        />
        <div className="stack-list">
          {rules.map((rule) => (
            <button key={rule.id} type="button" className={`select-card ${rule.id === active.id ? "active" : ""}`} onClick={() => { setSelectedId(rule.id); setForm(rule); }}>
              <div>
                <strong>{rule.modelPattern}</strong>
                <span>{rule.strategy}</span>
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
            <input value={form.modelPattern} onChange={(e) => setForm({ ...form, modelPattern: e.target.value })} />
          </label>
          <label>
            <span>Strategy</span>
            <input value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} />
          </label>
          <label className="span-2">
            <span>Provider Chain</span>
            <input value={form.providerChain.join(" → ")} onChange={(e) => setForm({ ...form, providerChain: e.target.value.split("→").map((item) => item.trim()).filter(Boolean) })} />
          </label>
          <label className="span-2">
            <span>Fallback Chain</span>
            <input value={form.fallbackChain.join(" → ")} onChange={(e) => setForm({ ...form, fallbackChain: e.target.value.split("→").map((item) => item.trim()).filter(Boolean) })} />
          </label>
        </div>
        <div className="inline-actions">
          <button type="button" className="primary-button" onClick={() => saveRule(form)}>保存规则</button>
          <button type="button" className="ghost-button"><Route size={16} /> 验证链路</button>
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
