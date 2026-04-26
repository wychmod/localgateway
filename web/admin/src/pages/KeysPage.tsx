import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Copy, RotateCcw, ShieldAlert } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";
import { keyStatusMap } from "../store/labels";

const createEmptyKey = () => ({
  id: `key-${Date.now()}`,
  name: "新本地密钥",
  displayKey: `lg-${Math.random().toString(36).slice(2, 6)}****${Math.random().toString(36).slice(2, 6)}`,
  allowedModels: [],
  allowedProviders: [],
  monthlyBudget: 100,
  currentSpend: 0,
  tokenBudget: 5000000,
  currentTokens: 0,
  enabled: true,
  status: "active" as const
});

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

export function KeysPage() {
  const { keys, providers, selectedKeyId, setSelectedKey, saveKey, rotateKey, revokeKey, extendKey, pushNotice } = useAdminStore();
  const active = useMemo(() => keys.find((item) => item.id === selectedKeyId) ?? keys[0], [keys, selectedKeyId]);
  const [form, setForm] = useState(active ?? createEmptyKey());
  const [expiresAt, setExpiresAt] = useState("");
  const providerOptions = useMemo(
    () => providers.filter((provider) => provider.enabled !== false && provider.status !== "disabled").map((provider) => provider.name),
    [providers]
  );
  const selectedProviders = form.allowedProviders.filter((provider) => providerOptions.includes(provider));
  const modelOptions = useMemo(
    () => unique(providers.filter((provider) => selectedProviders.includes(provider.name)).flatMap((provider) => provider.models)),
    [providers, selectedProviders]
  );
  const selectedModels = form.allowedModels.filter((model) => modelOptions.includes(model));
  const hasProviderOptions = providerOptions.length > 0;
  const hasModelOptions = modelOptions.length > 0;

  useEffect(() => {
    if (active) {
      setForm(active);
      setExpiresAt(active.expires_at ? active.expires_at.slice(0, 10) : "");
    }
  }, [active]);

  const spendUsage = Math.min(100, Math.round((form.currentSpend / Math.max(form.monthlyBudget, 1)) * 100));
  const tokenUsage = Math.min(100, Math.round((form.currentTokens / Math.max(form.tokenBudget, 1)) * 100));

  return (
    <section className="page-grid split-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="本地密钥"
          title="密钥管理"
          actions={
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                const next = createEmptyKey();
                setSelectedKey(next.id);
                setForm(next);
                setExpiresAt("");
                pushNotice({ tone: "info", title: "新建密钥", message: "配置模型和预算后保存。" });
              }}
            >
              新建密钥
            </button>
          }
        />

        <div className="context-strip">
          <div className="metric-pill">密钥总数 {keys.length}</div>
          <div className="metric-pill">启用中 {keys.filter((item) => item.status === "active").length}</div>
          <div className="metric-pill">预算提醒 {keys.filter((item) => item.status === "warning").length}</div>
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
                <small>{key.allowedModels.length} 个模型 · 已用 {key.currentSpend.toFixed(1)} / {key.monthlyBudget} 美元 · 到期 {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : "长期有效"}</small>
              </div>
              <span className={`status-pill ${key.status}`}>{keyStatusMap[key.status] ?? key.status}</span>
            </button>
          ))}
        </div>
      </article>

      <DrawerCard title={form.name} subtitle="本地密钥控制中心">
        <div className="form-grid">
          <label>
            <span>密钥名称</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：Codex 专用密钥" />
          </label>
          <label>
            <span>显示密钥</span>
            <input value={form.displayKey} readOnly />
          </label>
          <label className="span-2">
            <span>允许模型</span>
            <select
              multiple
              value={selectedModels}
              disabled={!hasModelOptions}
              onChange={(e) =>
                setForm({
                  ...form,
                  allowedModels: Array.from(e.currentTarget.selectedOptions, (option) => option.value)
                })
              }
            >
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <small className="field-hint">{hasModelOptions ? "模型来自已选厂商的模型配置，可多选" : "请先选择带有模型配置的厂商"}</small>
          </label>
          <label className="span-2">
            <span>允许厂商</span>
            <select
              multiple
              value={selectedProviders}
              disabled={!hasProviderOptions}
              onChange={(e) => {
                const nextProviders = Array.from(e.currentTarget.selectedOptions, (option) => option.value);
                const nextModelOptions = unique(providers.filter((provider) => nextProviders.includes(provider.name)).flatMap((provider) => provider.models));
                setForm({
                  ...form,
                  allowedProviders: nextProviders,
                  allowedModels: form.allowedModels.filter((model) => nextModelOptions.includes(model))
                });
              }}
            >
              {providerOptions.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
            <small className="field-hint">{hasProviderOptions ? "按住 Ctrl 可选择多个厂商" : "请先到厂商接入页面新增厂商"}</small>
          </label>
          <label>
            <span>月预算（美元）</span>
            <input type="number" value={form.monthlyBudget} onChange={(e) => setForm({ ...form, monthlyBudget: Number(e.target.value) })} />
          </label>
          <label>
            <span>令牌预算（个）</span>
            <input type="number" value={form.tokenBudget} onChange={(e) => setForm({ ...form, tokenBudget: Number(e.target.value) })} />
          </label>
          <label>
            <span>到期日期</span>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
          <label>
            <span>当前有效期</span>
            <input value={form.expires_at ? new Date(form.expires_at).toLocaleString() : "长期有效"} readOnly />
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
              <span>令牌配额使用率</span>
              <strong>{tokenUsage}%</strong>
            </div>
            <div className="usage-bar secondary"><span style={{ width: `${tokenUsage}%` }} /></div>
          </div>
        </div>

        <div className="metric-bar-grid">
          <div className="metric-pill">已用费用 {form.currentSpend.toFixed(1)} / {form.monthlyBudget} 美元</div>
          <div className="metric-pill">已用令牌 {form.currentTokens.toLocaleString()} / {form.tokenBudget.toLocaleString()} 个</div>
        </div>

        <div className="inline-actions sticky-actions">
          <button
            type="button"
            className="primary-button"
            disabled={!hasProviderOptions || selectedProviders.length === 0 || selectedModels.length === 0}
            onClick={() => {
              if (!hasProviderOptions) {
                pushNotice({ tone: "warning", title: "请先新增厂商", message: "生成本地 API 前需要至少配置一个可用厂商。" });
                return;
              }
              if (selectedProviders.length === 0) {
                pushNotice({ tone: "warning", title: "请选择厂商", message: "本地 API 需要绑定至少一个允许厂商。" });
                return;
              }
              if (selectedModels.length === 0) {
                pushNotice({ tone: "warning", title: "请选择模型", message: "本地 API 需要绑定至少一个所选厂商支持的模型。" });
                return;
              }
              void saveKey({
                ...form,
                allowedProviders: selectedProviders,
                allowedModels: selectedModels,
                expires_at: expiresAt ? `${expiresAt}T23:59:59Z` : null
              });
            }}
          >
            保存变更
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              void navigator.clipboard?.writeText(form.displayKey);
              pushNotice({ tone: "success", title: "密钥已复制", message: `${form.name} 的展示密钥已复制到剪贴板。` });
            }}
          >
            <Copy size={16} /> 复制密钥
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => void rotateKey(form.id)}
          >
            <RotateCcw size={16} /> 轮换密钥
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => void extendKey(form.id, expiresAt ? `${expiresAt}T23:59:59Z` : null)}
          >
            <CalendarClock size={16} /> 保存有效期
          </button>
          <button
            type="button"
            className="ghost-button danger"
            onClick={() => void revokeKey(form.id)}
          >
            <ShieldAlert size={16} /> 吊销密钥
          </button>
        </div>
      </DrawerCard>
    </section>
  );
}

