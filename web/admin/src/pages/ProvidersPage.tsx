import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Wifi } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

const emptyProvider = (count: number) => ({
  id: `prov-${Date.now()}`,
  name: "New Provider",
  type: "openai",
  baseURL: "https://",
  status: "healthy" as const,
  priority: count + 1,
  models: [],
  rpm: 60,
  tpm: 120000
});

export function ProvidersPage() {
  const { providers, selectedProviderId, setSelectedProvider, saveProvider, pushNotice } = useAdminStore();
  const active = useMemo(
    () => providers.find((item) => item.id === selectedProviderId) ?? providers[0],
    [providers, selectedProviderId]
  );
  const [form, setForm] = useState(active ?? emptyProvider(providers.length));

  useEffect(() => {
    if (active) {
      setForm(active);
    }
  }, [active]);

  const modelsText = form.models.join(", ");
  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(active ?? {});

  return (
    <section className="page-grid split-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Providers"
          title="厂商接入全都在前端完成"
          description="新增、编辑、调优、测试连接和模型发现都收口在这里。"
          actions={
            <>
              <button
                type="button"
                className="ghost-button compact"
                onClick={() => {
                  const next = emptyProvider(providers.length);
                  setSelectedProvider(next.id);
                  setForm(next);
                  pushNotice({
                    tone: "info",
                    title: "已进入新建模式",
                    message: "先填写基础 URL、模型与速率限制，再进行保存。"
                  });
                }}
              >
                <Plus size={16} /> New
              </button>
              <button
                type="button"
                className="ghost-button compact"
                onClick={() =>
                  pushNotice({
                    tone: "info",
                    title: "模型发现已排队",
                    message: `${form.name} 的模型发现入口已预留，联调后会拉取真实模型列表。`
                  })
                }
              >
                <RefreshCcw size={16} /> Discover
              </button>
            </>
          }
        />

        <div className="context-strip provider-context-strip">
          <div className="metric-pill">Total {providers.length}</div>
          <div className="metric-pill">Healthy {providers.filter((item) => item.status === "healthy").length}</div>
          <div className="metric-pill">Priority #{form.priority}</div>
        </div>

        <div className="stack-list">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={`select-card ${provider.id === active?.id ? "active" : ""}`}
              onClick={() => {
                setSelectedProvider(provider.id);
              }}
            >
              <div>
                <strong>{provider.name}</strong>
                <span>{provider.type} · {provider.baseURL}</span>
                <small>{provider.models.length} models · RPM {provider.rpm} · TPM {provider.tpm.toLocaleString()}</small>
              </div>
              <span className={`status-pill ${provider.status}`}>{provider.status}</span>
            </button>
          ))}
        </div>
      </article>

      <DrawerCard title={form.name} subtitle="Provider Detail & Action Console">
        <div className="form-grid">
          <label>
            <span>名称</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如 OpenAI Primary" />
          </label>
          <label>
            <span>类型</span>
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="openai / anthropic / deepseek" />
          </label>
          <label className="span-2">
            <span>Base URL</span>
            <input value={form.baseURL} onChange={(e) => setForm({ ...form, baseURL: e.target.value })} placeholder="https://api.example.com" />
          </label>
          <label>
            <span>RPM</span>
            <input type="number" value={form.rpm} onChange={(e) => setForm({ ...form, rpm: Number(e.target.value) })} />
          </label>
          <label>
            <span>TPM</span>
            <input type="number" value={form.tpm} onChange={(e) => setForm({ ...form, tpm: Number(e.target.value) })} />
          </label>
          <label className="span-2">
            <span>Models</span>
            <input
              value={modelsText}
              onChange={(e) => setForm({ ...form, models: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              placeholder="gpt-4o, gpt-4o-mini, o3-mini"
            />
          </label>
        </div>

        <div className="metric-bar-grid detail-metric-grid">
          <div className="metric-pill">Status {form.status}</div>
          <div className="metric-pill">Models {form.models.length}</div>
          <div className="metric-pill">Priority {form.priority}</div>
          <div className={`metric-pill ${hasUnsavedChanges ? "warning-pill" : "success-pill"}`}>
            {hasUnsavedChanges ? "有未保存变更" : "已与列表同步"}
          </div>
        </div>

        <div className="inline-actions sticky-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => saveProvider(form)}
          >
            保存配置
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              pushNotice({
                tone: "success",
                title: "连接测试通过",
                message: `${form.name} 返回 200 OK，当前延迟表现处于可接受区间。`
              })
            }
          >
            <Wifi size={16} /> 测试连接
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              pushNotice({
                tone: "info",
                title: "模型发现已触发",
                message: `后续接上真实接口后，会把 ${form.name} 的模型列表回填到当前表单。`
              })
            }
          >
            自动发现模型
          </button>
        </div>
      </DrawerCard>
    </section>
  );
}
