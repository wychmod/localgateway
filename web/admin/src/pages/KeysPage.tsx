import { useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, RotateCcw, ShieldAlert } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

const createEmptyKey = () => ({
  id: `key-${Date.now()}`,
  name: "New Local Key",
  displayKey: `lg-${Math.random().toString(36).slice(2, 6)}****${Math.random().toString(36).slice(2, 6)}`,
  allowedModels: [],
  allowedProviders: [],
  monthlyBudget: 100,
  currentSpend: 0,
  tokenBudget: 5000000,
  currentTokens: 0,
  status: "active" as const
});

export function KeysPage() {
  const { keys, selectedKeyId, setSelectedKey, saveKey, pushNotice } = useAdminStore();
  const active = useMemo(() => keys.find((item) => item.id === selectedKeyId) ?? keys[0], [keys, selectedKeyId]);
  const [form, setForm] = useState(active ?? createEmptyKey());

  useEffect(() => {
    if (active) {
      setForm(active);
    }
  }, [active]);

  const spendUsage = Math.min(100, Math.round((form.currentSpend / Math.max(form.monthlyBudget, 1)) * 100));
  const tokenUsage = Math.min(100, Math.round((form.currentTokens / Math.max(form.tokenBudget, 1)) * 100));

  return (
    <section className="page-grid split-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Local Keys"
          title="权限、预算、续期都在前端完成"
          description="创建、复制、轮换、吊销、预算限制和工具接入提示全部集中处理。"
          actions={
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                const next = createEmptyKey();
                setSelectedKey(next.id);
                setForm(next);
                pushNotice({
                  tone: "info",
                  title: "已创建空白 Key 草稿",
                  message: "给它配置允许模型和预算后，就可以直接保存到本地状态。"
                });
              }}
            >
              Create Key
            </button>
          }
        />

        <div className="context-strip">
          <div className="metric-pill">Keys {keys.length}</div>
          <div className="metric-pill">Active {keys.filter((item) => item.status === "active").length}</div>
          <div className="metric-pill">Budget Alert {keys.filter((item) => item.status === "warning").length}</div>
        </div>

        <div className="stack-list">
          {keys.map((key) => (
            <button
              key={key.id}
              type="button"
              className={`select-card ${key.id === active?.id ? "active" : ""}`}
              onClick={() => setSelectedKey(key.id)}
            >
              <div>
                <strong>{key.name}</strong>
                <span>{key.displayKey}</span>
                <small>{key.allowedModels.length} models · ${key.currentSpend.toFixed(1)} / ${key.monthlyBudget}</small>
              </div>
              <span className={`status-pill ${key.status}`}>{key.status}</span>
            </button>
          ))}
        </div>
      </article>

      <DrawerCard title={form.name} subtitle="Local Key Control Center">
        <div className="form-grid">
          <label>
            <span>名称</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如 Codex Pro" />
          </label>
          <label>
            <span>显示 Key</span>
            <input value={form.displayKey} readOnly />
          </label>
          <label className="span-2">
            <span>允许模型</span>
            <input
              value={form.allowedModels.join(", ")}
              onChange={(e) => setForm({ ...form, allowedModels: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              placeholder="gpt-4o, claude-sonnet-4"
            />
          </label>
          <label className="span-2">
            <span>允许 Provider</span>
            <input
              value={form.allowedProviders.join(", ")}
              onChange={(e) => setForm({ ...form, allowedProviders: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              placeholder="OpenAI Primary, Claude Premium"
            />
          </label>
          <label>
            <span>月预算</span>
            <input type="number" value={form.monthlyBudget} onChange={(e) => setForm({ ...form, monthlyBudget: Number(e.target.value) })} />
          </label>
          <label>
            <span>Token Budget</span>
            <input type="number" value={form.tokenBudget} onChange={(e) => setForm({ ...form, tokenBudget: Number(e.target.value) })} />
          </label>
        </div>

        <div className="usage-stack">
          <div>
            <div className="usage-label-row">
              <span>本月预算使用率</span>
              <strong>{spendUsage}%</strong>
            </div>
            <div className="usage-bar"><span style={{ width: `${spendUsage}%` }} /></div>
          </div>
          <div>
            <div className="usage-label-row">
              <span>Token 配额使用率</span>
              <strong>{tokenUsage}%</strong>
            </div>
            <div className="usage-bar secondary"><span style={{ width: `${tokenUsage}%` }} /></div>
          </div>
        </div>

        <div className="metric-bar-grid">
          <div className="metric-pill">Spend ${form.currentSpend.toFixed(1)} / ${form.monthlyBudget}</div>
          <div className="metric-pill">Tokens {form.currentTokens.toLocaleString()} / {form.tokenBudget.toLocaleString()}</div>
        </div>

        <div className="inline-actions sticky-actions">
          <button type="button" className="primary-button" onClick={() => saveKey(form)}>保存变更</button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "success", title: "Key 已复制", message: `${form.name} 的展示 Key 已复制到剪贴板流程占位中。` })}
          >
            <Copy size={16} /> 复制 Key
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "warning", title: "轮换流程已预留", message: `后续接上真实接口后，会先生成新 Key，再给旧 Key 留出平滑迁移窗口。` })}
          >
            <RotateCcw size={16} /> 轮换
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "warning", title: "吊销动作待确认", message: `${form.name} 当前只做交互演示，接后端后建议增加二次确认弹层。` })}
          >
            <ShieldAlert size={16} /> 吊销
          </button>
        </div>
      </DrawerCard>
    </section>
  );
}
