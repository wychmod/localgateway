import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, RefreshCcw, Trash2, Wifi } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";
import { providerStatusMap } from "../store/labels";

const emptyProvider = (count: number) => ({
  id: `prov-${Date.now()}`,
  name: "新厂商",
  type: "OpenAI 兼容",
  baseURL: "https://",
  apiKey: "",
  status: "healthy" as const,
  priority: count + 1,
  models: [],
  rpm: 60,
  tpm: 120000
});

const providerTypeOptions = [
  { value: "OpenAI 兼容", label: "OpenAI 兼容", hint: "Chat Completions /v1" },
  { value: "Anthropic 兼容", label: "Anthropic 兼容", hint: "Messages /v1" },
  { value: "DeepSeek 兼容", label: "DeepSeek 兼容", hint: "OpenAI 格式" }
];

export function ProvidersPage() {
  const {
    providers,
    selectedProviderId,
    setSelectedProvider,
    saveProvider,
    deleteProvider,
    reorderProviders,
    testProvider,
    discoverProviderModels,
    pushNotice
  } = useAdminStore();
  const active = useMemo(
    () => providers.find((item) => item.id === selectedProviderId),
    [providers, selectedProviderId]
  );
  const [form, setForm] = useState(active ?? emptyProvider(providers.length));
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (active) {
      setForm(active);
    }
  }, [active]);

  const modelsText = form.models.join(", ");
  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(active ?? {});

  const moveProvider = (id: string, direction: -1 | 1) => {
    const currentIndex = providers.findIndex((provider) => provider.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= providers.length) return;
    const next = [...providers];
    [next[currentIndex], next[nextIndex]] = [next[nextIndex], next[currentIndex]];
    void reorderProviders(next.map((provider) => provider.id));
  };

  return (
    <section className="page-grid split-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="厂商接入"
          title="厂商管理"
          actions={
            <>
              <button
                type="button"
                className="ghost-button compact"
                onClick={() => {
                  const next = emptyProvider(providers.length);
                  setSelectedProvider(next.id);
                  setForm(next);
                  pushNotice({ tone: "info", title: "新建厂商", message: "填写接入地址后保存。" });
                }}
              >
                <Plus size={16} /> 新建
              </button>
              <button
                type="button"
                className="ghost-button compact"
                onClick={async () => {
                  if (!form.id) return;
                  const models = await discoverProviderModels(form.id);
                  if (models.length) setForm({ ...form, models });
                }}
              >
                <RefreshCcw size={16} /> 发现模型
              </button>
            </>
          }
        />

        <div className="context-strip provider-context-strip">
          <div className="metric-pill">厂商总数 {providers.length}</div>
          <div className="metric-pill">可用厂商 {providers.filter((item) => item.status === "healthy").length}</div>
          <div className="metric-pill">优先级 #{form.priority}</div>
        </div>

        <div className="stack-list">
          {providers.map((provider, index) => (
            <article key={provider.id} className={`select-card ${provider.id === active?.id ? "active" : ""}`}>
              <button
                type="button"
                className="select-card-main"
                onClick={() => {
                  setSelectedProvider(provider.id);
                }}
              >
                <div>
                  <strong>{provider.name}</strong>
                  <span>{provider.type} · {provider.baseURL}</span>
                  <small>{provider.models.length} 个模型 · 每分钟 {provider.rpm} 次请求 · 每分钟 {provider.tpm.toLocaleString()} 个令牌</small>
                </div>
                <span className={`status-pill ${provider.status}`}>{providerStatusMap[provider.status] ?? provider.status}</span>
              </button>
              <div className="card-row-actions">
                <button type="button" className="ghost-button compact" disabled={index === 0} onClick={() => moveProvider(provider.id, -1)}><ArrowUp size={14} />上移</button>
                <button type="button" className="ghost-button compact" disabled={index === providers.length - 1} onClick={() => moveProvider(provider.id, 1)}><ArrowDown size={14} />下移</button>
                <button type="button" className="ghost-button compact danger" onClick={() => void deleteProvider(provider.id)}><Trash2 size={14} />删除</button>
              </div>
            </article>
          ))}
        </div>
      </article>

      <DrawerCard title={form.name} subtitle="厂商详情与操作面板">
        <div className="form-grid">
          <label>
            <span>厂商名称</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：OpenAI 主线路" />
          </label>
          <div className="form-field span-2">
            <span>接入类型</span>
            <div className="radio-card-grid" role="radiogroup" aria-label="接入类型">
              {providerTypeOptions.map((option) => (
                <label key={option.value} className={`radio-card ${form.type === option.value ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="provider-type"
                    value={option.value}
                    checked={form.type === option.value}
                    onChange={() => setForm({ ...form, type: option.value })}
                  />
                  <strong>{option.label}</strong>
                  <small>{option.hint}</small>
                </label>
              ))}
            </div>
          </div>
          <label className="span-2">
            <span>接口地址</span>
            <input
              type="url"
              value={form.baseURL}
              onChange={(e) => setForm({ ...form, baseURL: e.target.value })}
              placeholder="https://api.example.com"
              spellCheck={false}
            />
            <small className="field-hint">填写基础地址即可，系统会自动追加 /v1/chat/completions 或 /v1/messages。</small>
          </label>
          <label className="span-2">
            <span>API Key / Token</span>
            <div className="secret-input">
              <input
                type={showApiKey ? "text" : "password"}
                value={form.apiKey ?? ""}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="ghost-button compact icon-button"
                onClick={() => setShowApiKey((value) => !value)}
                aria-label={showApiKey ? "隐藏 Token" : "显示 Token"}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <label>
            <span>每分钟请求数</span>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.rpm}
              onChange={(e) => setForm({ ...form, rpm: Number(e.target.value) })}
            />
          </label>
          <label>
            <span>每分钟令牌数</span>
            <input
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              value={form.tpm}
              onChange={(e) => setForm({ ...form, tpm: Number(e.target.value) })}
            />
          </label>
          <label className="span-2">
            <span>支持模型</span>
            <textarea
              value={modelsText}
              onChange={(e) => setForm({ ...form, models: e.target.value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean) })}
              placeholder="例如：gpt-4o, gpt-4o-mini, o3-mini"
              rows={4}
            />
            <small className="field-hint">支持逗号或换行分隔，保存前会自动去掉空项。</small>
          </label>
        </div>

        <div className="metric-bar-grid detail-metric-grid">
          <div className="metric-pill">当前状态 {providerStatusMap[form.status] ?? form.status}</div>
          <div className="metric-pill">模型数量 {form.models.length}</div>
          <div className="metric-pill">优先级 {form.priority}</div>
          <div className={`metric-pill ${hasUnsavedChanges ? "warning-pill" : "success-pill"}`}>
            {hasUnsavedChanges ? "有未保存变更" : "已与列表同步"}
          </div>
        </div>

        <div className="inline-actions sticky-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => void saveProvider(form)}
          >
            保存配置
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => void testProvider(form.id)}
          >
            <Wifi size={16} /> 测试连接
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={async () => {
              const models = await discoverProviderModels(form.id);
              if (models.length) setForm({ ...form, models });
            }}
          >
            自动发现模型
          </button>
          <button
            type="button"
            className="ghost-button danger"
            onClick={() => void deleteProvider(form.id)}
          >
            <Trash2 size={16} /> 删除厂商
          </button>
        </div>
      </DrawerCard>
    </section>
  );
}
