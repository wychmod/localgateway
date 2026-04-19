import { useMemo, useState } from "react";
import { Plus, RefreshCcw, Wifi } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function ProvidersPage() {
  const { providers, selectedProviderId, setSelectedProvider, saveProvider } = useAdminStore();
  const active = useMemo(
    () => providers.find((item) => item.id === selectedProviderId) ?? providers[0],
    [providers, selectedProviderId]
  );
  const [form, setForm] = useState(active);

  if (!active || !form) {
    return null;
  }

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
                onClick={() =>
                  setForm({
                    id: `prov-${Date.now()}`,
                    name: "New Provider",
                    type: "openai",
                    baseURL: "https://",
                    status: "healthy",
                    priority: providers.length + 1,
                    models: [],
                    rpm: 60,
                    tpm: 120000
                  })
                }
              >
                <Plus size={16} /> New
              </button>
              <button type="button" className="ghost-button compact">
                <RefreshCcw size={16} /> Discover
              </button>
            </>
          }
        />
        <div className="stack-list">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={`select-card ${provider.id === active.id ? "active" : ""}`}
              onClick={() => {
                setSelectedProvider(provider.id);
                setForm(provider);
              }}
            >
              <div>
                <strong>{provider.name}</strong>
                <span>{provider.type} · {provider.baseURL}</span>
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
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            <span>类型</span>
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          </label>
          <label className="span-2">
            <span>Base URL</span>
            <input value={form.baseURL} onChange={(e) => setForm({ ...form, baseURL: e.target.value })} />
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
            <input value={form.models.join(", ")} onChange={(e) => setForm({ ...form, models: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
          </label>
        </div>
        <div className="inline-actions">
          <button type="button" className="primary-button" onClick={() => saveProvider(form)}>保存配置</button>
          <button type="button" className="ghost-button"><Wifi size={16} /> 测试连接</button>
          <button type="button" className="ghost-button">自动发现模型</button>
        </div>
      </DrawerCard>
    </section>
  );
}
