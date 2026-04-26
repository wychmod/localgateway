import { useEffect, useMemo, useState } from "react";
import { Activity, Route } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { RoutingSimulation } from "../store/entities";
import { useAdminStore } from "../store/admin-store";

import { useEffect, useMemo, useState } from "react";
import { Activity, Route, Trash2 } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { RoutingSimulation } from "../store/entities";
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
  const { rules, saveRule, deleteRule, testRouting, pushNotice } = useAdminStore();
  const [selectedId, setSelectedId] = useState(rules[0]?.id);
  const active = useMemo(() => rules.find((item) => item.id === selectedId) ?? rules[0], [rules, selectedId]);
  const [form, setForm] = useState(active ?? createEmptyRule());
  const [simulation, setSimulation] = useState<RoutingSimulation>({
    model: "gpt-4o",
    key: "默认本地密钥",
    format: "openai",
    target: "等待模拟",
    fallback: "等待模拟",
    cost: "-",
    ttft: "-"
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
          title="策略配置"
          actions={
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                const next = createEmptyRule();
                setSelectedId(next.id);
                setForm(next);
                pushNotice({ tone: "info", title: "新建规则", message: "配置模型匹配和链路后保存。" });
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
          <button type="button" className="primary-button" onClick={() => void saveRule(form)}>保存规则</button>
          <button
            type="button"
            className="ghost-button"
            onClick={async () => {
              const result = await testRouting({ model: simulation.model, localKey: simulation.key, format: simulation.format });
              if (result) setSimulation(result);
            }}
          >
            <Route size={16} /> 验证链路
          </button>
          <button type="button" className="ghost-button danger" onClick={() => void deleteRule(form.id)}>
            <Trash2 size={16} /> 删除规则
          </button>
        </div>
      </DrawerCard>

      <article className="luxury-panel page-panel simulation-panel">
        <SectionHeader eyebrow="路由模拟" title="路由测试器" />
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <label>
            <span>测试模型</span>
            <input value={simulation.model} onChange={(e) => setSimulation({ ...simulation, model: e.target.value })} placeholder="例如：gpt-4o" />
          </label>
          <label>
            <span>本地密钥</span>
            <input value={simulation.key} onChange={(e) => setSimulation({ ...simulation, key: e.target.value })} placeholder="例如：lg-..." />
          </label>
          <label>
            <span>请求格式</span>
            <input value={simulation.format} onChange={(e) => setSimulation({ ...simulation, format: e.target.value })} placeholder="openai / claude" />
          </label>
        </div>
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

