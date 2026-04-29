import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, RefreshCcw, Trash2, Wifi, X } from "lucide-react";
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<ReturnType<typeof emptyProvider>>(emptyProvider(providers.length));
  const [showApiKey, setShowApiKey] = useState(false);

  const active = useMemo(
    () => providers.find((item) => item.id === selectedProviderId),
    [providers, selectedProviderId]
  );

  useEffect(() => {
    if (active) {
      setForm(active);
    }
  }, [active]);

  const openDrawer = (provider?: typeof form) => {
    if (provider) {
      setForm(provider);
      setSelectedProvider(provider.id);
    } else {
      const next = emptyProvider(providers.length);
      setForm(next);
      setSelectedProvider(next.id);
    }
    setDrawerOpen(true);
    setShowApiKey(false);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setShowApiKey(false);
  };

  const handleSave = async () => {
    await saveProvider(form);
    closeDrawer();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此厂商？")) return;
    await deleteProvider(id);
    if (form.id === id) closeDrawer();
  };

  const moveProvider = (id: string, direction: -1 | 1) => {
    const currentIndex = providers.findIndex((provider) => provider.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= providers.length) return;
    const next = [...providers];
    [next[currentIndex], next[nextIndex]] = [next[nextIndex], next[currentIndex]];
    void reorderProviders(next.map((provider) => provider.id));
  };

  const modelsText = form.models.join(", ");
  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(active ?? {});

  return (
    <div className="flex-col gap-4">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-main">
          <span className="eyebrow">模型接入</span>
          <h2 className="section-title">厂商管理</h2>
        </div>
        <div className="section-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openDrawer()}>
            <Plus size={14} /> 新建厂商
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2">
        <span className="pill pill-neutral">总数 {providers.length}</span>
        <span className="pill pill-success">在线 {providers.filter((p) => p.status === "healthy").length}</span>
        <span className="pill pill-warning">异常 {providers.filter((p) => p.status === "warning").length}</span>
      </div>

      {/* List */}
      <div className="flex-col gap-2 list-animate">
        {providers.map((provider, index) => (
          <div
            key={provider.id}
            className="list-row"
            style={{ "--index": index } as React.CSSProperties}
          >
            <div className="list-row-main">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background:
                      provider.status === "healthy"
                        ? "var(--accent)"
                        : provider.status === "warning"
                        ? "var(--warning)"
                        : "var(--text-tertiary)",
                    flexShrink: 0
                  }}
                />
                <span className="list-row-title">{provider.name}</span>
                <span
                  className="pill"
                  style={{
                    background:
                      provider.status === "healthy"
                        ? "var(--accent-dim)"
                        : provider.status === "warning"
                        ? "var(--warning-dim)"
                        : "var(--bg-elevated)",
                    color:
                      provider.status === "healthy"
                        ? "var(--accent)"
                        : provider.status === "warning"
                        ? "var(--warning)"
                        : "var(--text-tertiary)"
                  }}
                >
                  {providerStatusMap[provider.status] ?? provider.status}
                </span>
              </div>
              <span className="list-row-meta">
                {provider.type} · {provider.baseURL}
              </span>
              <span className="list-row-sub">
                {provider.models.length} 个模型 · {provider.rpm} RPM · {provider.tpm.toLocaleString()} TPM · 优先级 #{provider.priority}
              </span>
            </div>
            <div className="list-row-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={index === 0}
                onClick={(e) => { e.stopPropagation(); moveProvider(provider.id, -1); }}
                title="上移"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={index === providers.length - 1}
                onClick={(e) => { e.stopPropagation(); moveProvider(provider.id, 1); }}
                title="下移"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => { e.stopPropagation(); openDrawer(provider); }}
              >
                编辑
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={(e) => { e.stopPropagation(); void handleDelete(provider.id); }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {providers.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: "1.25rem", color: "var(--text-tertiary)" }}>○</span>
            <span className="empty-state-title">暂无厂商</span>
            <span className="empty-state-desc">点击右上角"新建厂商"添加第一个模型接入点</span>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={closeDrawer} />
          <aside className="drawer">
            <div className="drawer-header">
              <div>
                <h3 className="section-title">{form.name}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  {hasUnsavedChanges ? "有未保存的变更" : "厂商详情与配置"}
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={closeDrawer}>
                <X size={16} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="form-grid">
                <div className="form-field span-2">
                  <label className="form-label">厂商名称</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例如：OpenAI 主线路"
                  />
                </div>

                <div className="form-field span-2">
                  <label className="form-label">接入类型</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-2)" }}>
                    {providerTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex-col gap-1"
                        style={{
                          cursor: "pointer",
                          padding: "var(--space-3)",
                          borderRadius: "var(--radius-sm)",
                          background: form.type === option.value ? "var(--accent-dim)" : "var(--bg-base)",
                          border: form.type === option.value ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                          transition: "all 150ms ease"
                        }}
                      >
                        <input
                          type="radio"
                          name="provider-type"
                          value={option.value}
                          checked={form.type === option.value}
                          onChange={() => setForm({ ...form, type: option.value })}
                          style={{ position: "absolute", opacity: 0 }}
                        />
                        <strong style={{ fontSize: "0.85rem" }}>{option.label}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{option.hint}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field span-2">
                  <label className="form-label">接口地址</label>
                  <input
                    className="form-control"
                    type="url"
                    value={form.baseURL}
                    onChange={(e) => setForm({ ...form, baseURL: e.target.value })}
                    placeholder="https://api.example.com"
                    spellCheck={false}
                  />
                  <span className="form-hint">填写基础地址即可，系统会自动追加 /v1/chat/completions 或 /v1/messages</span>
                </div>

                <div className="form-field span-2">
                  <label className="form-label">API Key / Token</label>
                  <div className="secret-input">
                    <input
                      className="form-control"
                      type={showApiKey ? "text" : "password"}
                      value={form.apiKey ?? ""}
                      onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                      placeholder="sk-..."
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => setShowApiKey((v) => !v)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">每分钟请求数 (RPM)</label>
                  <input
                    className="form-control"
                    type="number"
                    min={0}
                    step={1}
                    value={form.rpm}
                    onChange={(e) => setForm({ ...form, rpm: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">每分钟令牌数 (TPM)</label>
                  <input
                    className="form-control"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.tpm}
                    onChange={(e) => setForm({ ...form, tpm: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field span-2">
                  <label className="form-label">支持模型</label>
                  <textarea
                    className="form-control"
                    value={modelsText}
                    onChange={(e) => setForm({ ...form, models: e.target.value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean) })}
                    placeholder="例如：gpt-4o, gpt-4o-mini, o3-mini"
                    rows={3}
                  />
                  <span className="form-hint">支持逗号或换行分隔</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="pill pill-neutral">状态 {providerStatusMap[form.status] ?? form.status}</span>
                <span className="pill pill-neutral">模型 {form.models.length}</span>
                <span className="pill pill-neutral">优先级 {form.priority}</span>
              </div>
            </div>

            <div className="drawer-footer">
              <button type="button" className="btn btn-primary" onClick={() => void handleSave()}>
                保存配置
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => void testProvider(form.id)}>
                <Wifi size={14} /> 测试连接
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  const models = await discoverProviderModels(form.id);
                  if (models.length) setForm({ ...form, models });
                }}
              >
                <RefreshCcw size={14} /> 发现模型
              </button>
              <button type="button" className="btn btn-danger" onClick={() => void handleDelete(form.id)}>
                <Trash2 size={14} /> 删除
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
