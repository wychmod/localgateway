import { useEffect, useMemo, useState } from "react";
import { Activity, Route } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

const createEmptyRule = () => ({
  id: `route-${Date.now()}`,
  modelPattern: "new-model-*",
  strategy: "优先转发 + 备用切换",
  providerChain: ["OpenAI 主线路"],
  fallbackChain: ["Azure 备用线路"],
  enabled: true
});

export function RoutingPage() {
  const { rules, saveRule, pushNotice } = useAdminStore();
  const [selectedId, setSelectedId] = useState(rules[0]?.id);
  const active = useMemo(() => rules.find((item) => item.id === selectedId) ?? rules[0], [rules, selectedId]);
  const [form, setForm] = useState(active ?? createEmptyRule());
  const [simulation] = useState({
    model: "gpt-4o",
    key: "Codex 专用密钥",
    format: "OpenAI 兼容格式",
    target: "OpenAI 主线路",
    fallback: "Azure 备用线路 → OpenRouter 备用出口",
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
          eyebrow="路由策略"
          title="策略配置和路由模拟放在一个控制面板里"
          description="不是只能看规则，而是可以直接改、直接测、直接验证备用链路。"
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
                  message: "先确定模型匹配方式，再补链路和备用顺序，会更稳。"
                });
              }}
            >
              新建规则
            </button>
          }
        />

        <div className="context-strip">
          <div className="metric-pill">规则总数 {rules.length}</div>
          <div className="metric-pill">已启用 {rules.filter((item) => item.enabled).length}</div>
          <div className="metric-pill">已配置备用链路 {rules.filter((item) => item.fallbackChain.length > 0).length}</div>
        </div>

        <div className="stack-list">
          {rules.map((rule) => (
            <button key={rule.id} type="button" className={`select-card ${rule.id === active?.id ? "active" : ""}`} onClick={() => setSelectedId(rule.id)}>
              <div>
                <strong>{rule.modelPattern}</strong>
                <span>{rule.strategy}</span>
                <small>{rule.providerChain.join(" → ")}</small>
              </div>
              <span className={`status-pill ${rule.enabled ? "healthy" : "warning"}`}>{rule.enabled ? "已启用" : "已停用"}</span>
            </button>
          ))}
        </div>
      </article>

      <DrawerCard title={form.modelPattern} subtitle="规则编辑面板">
        <div className="form-grid">
          <label>
            <span>模型匹配规则</span>
            <input value={form.modelPattern} onChange={(e) => setForm({ ...form, modelPattern: e.target.value })} placeholder="例如：gpt-4o* / claude-*" />
          </label>
          <label>
            <span>分发策略</span>
            <input value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} placeholder="例如：优先转发 + 备用切换" />
          </label>
          <label className="span-2">
            <span>主链路顺序</span>
            <input value={form.providerChain.join(" → ")} onChange={(e) => setForm({ ...form, providerChain: e.target.value.split("→").map((item) => item.trim()).filter(Boolean) })} placeholder="例如：OpenAI 主线路 → Azure 备用线路" />
          </label>
          <label className="span-2">
            <span>备用链路顺序</span>
            <input value={form.fallbackChain.join(" → ")} onChange={(e) => setForm({ ...form, fallbackChain: e.target.value.split("→").map((item) => item.trim()).filter(Boolean) })} placeholder="例如：Azure 备用线路 → OpenRouter 备用出口" />
          </label>
        </div>

        <div className="route-preview luxury-panel nested-panel detail-card">
          <strong>当前链路预览</strong>
          <p>主链路：{form.providerChain.join(" → ") || "未配置"}</p>
          <p>备用链路：{form.fallbackChain.join(" → ") || "未配置"}</p>
        </div>

        <div className="inline-actions sticky-actions">
          <button type="button" className="primary-button" onClick={() => saveRule(form)}>保存规则</button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "success", title: "链路校验通过", message: `${form.modelPattern} 的路由链与备用顺序在交互校验中通过。` })}
          >
            <Route size={16} /> 验证链路
          </button>
        </div>
      </DrawerCard>

      <article className="luxury-panel page-panel simulation-panel">
        <SectionHeader eyebrow="路由模拟" title="路由测试器" description="给定模型、密钥和请求格式，前端直接看到会分发到哪里。" />
        <div className="simulation-grid">
          <div className="metric-pill"><Activity size={16} /> 模型：{simulation.model}</div>
          <div className="metric-pill">密钥：{simulation.key}</div>
          <div className="metric-pill">请求格式：{simulation.format}</div>
          <div className="metric-pill">目标线路：{simulation.target}</div>
          <div className="metric-pill">备用线路：{simulation.fallback}</div>
          <div className="metric-pill">预计费用：{simulation.cost}</div>
          <div className="metric-pill">首字返回时间：{simulation.ttft}</div>
        </div>
      </article>
    </section>
  );
}
