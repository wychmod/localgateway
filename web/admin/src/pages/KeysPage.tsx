import { useMemo, useState } from "react";
import { Copy, KeyRound, RotateCcw, ShieldAlert } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function KeysPage() {
  const { keys, selectedKeyId, setSelectedKey, saveKey } = useAdminStore();
  const active = useMemo(() => keys.find((item) => item.id === selectedKeyId) ?? keys[0], [keys, selectedKeyId]);
  const [form, setForm] = useState(active);

  if (!active || !form) {
    return null;
  }

  return (
    <section className="page-grid split-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Local Keys"
          title="权限、预算、续期都在前端完成"
          description="创建、复制、轮换、吊销、预算限制和工具接入提示全部集中处理。"
          actions={<button type="button" className="primary-button">Create Key</button>}
        />
        <div className="stack-list">
          {keys.map((key) => (
            <button
              key={key.id}
              type="button"
              className={`select-card ${key.id === active.id ? "active" : ""}`}
              onClick={() => {
                setSelectedKey(key.id);
                setForm(key);
              }}
            >
              <div>
                <strong>{key.name}</strong>
                <span>{key.displayKey}</span>
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
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            <span>显示 Key</span>
            <input value={form.displayKey} readOnly />
          </label>
          <label className="span-2">
            <span>允许模型</span>
            <input value={form.allowedModels.join(", ")} onChange={(e) => setForm({ ...form, allowedModels: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
          </label>
          <label className="span-2">
            <span>允许 Provider</span>
            <input value={form.allowedProviders.join(", ")} onChange={(e) => setForm({ ...form, allowedProviders: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
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
        <div className="metric-bar-grid">
          <div className="metric-pill">Spend ${form.currentSpend.toFixed(1)} / ${form.monthlyBudget}</div>
          <div className="metric-pill">Tokens {form.currentTokens.toLocaleString()} / {form.tokenBudget.toLocaleString()}</div>
        </div>
        <div className="inline-actions">
          <button type="button" className="primary-button" onClick={() => saveKey(form)}>保存变更</button>
          <button type="button" className="ghost-button"><Copy size={16} /> 复制 Key</button>
          <button type="button" className="ghost-button"><RotateCcw size={16} /> 轮换</button>
          <button type="button" className="ghost-button"><ShieldAlert size={16} /> 吊销</button>
        </div>
      </DrawerCard>
    </section>
  );
}
