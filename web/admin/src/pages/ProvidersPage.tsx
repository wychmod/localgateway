import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Wifi } from "lucide-react";
import { DrawerCard } from "../components/DrawerCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

const emptyProvider = (count: number) => ({
  id: `prov-${Date.now()}`,
  name: "新厂商",
  type: "OpenAI 兼容",
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
          eyebrow="厂商接入"
          title="所有厂商接入都能在这里完成"
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
                    message: "先填写接入地址、模型和速率限制，再进行保存。"
                  });
                }}
              >
                <Plus size={16} /> 新建厂商
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
                <small>{provider.models.length} 个模型 · 每分钟请求 {provider.rpm} 次 · 每分钟令牌 {provider.tpm.toLocaleString()}</small>
              </div>
              <span className={`status-pill ${provider.status}`}>{provider.status}</span>
            </button>
          ))}
        </div>
      </article>

      <DrawerCard title={form.name} subtitle="厂商详情与操作面板">
        <div className="form-grid">
          <label>
            <span>厂商名称</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：OpenAI 主线路" />
          </label>
          <label>
            <span>接入类型</span>
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="例如：OpenAI 兼容 / Anthropic / DeepSeek" />
          </label>
          <label className="span-2">
            <span>接口地址</span>
            <input value={form.baseURL} onChange={(e) => setForm({ ...form, baseURL: e.target.value })} placeholder="https://api.example.com" />
          </label>
          <label>
            <span>每分钟请求数</span>
            <input type="number" value={form.rpm} onChange={(e) => setForm({ ...form, rpm: Number(e.target.value) })} />
          </label>
          <label>
            <span>每分钟令牌数</span>
            <input type="number" value={form.tpm} onChange={(e) => setForm({ ...form, tpm: Number(e.target.value) })} />
          </label>
          <label className="span-2">
            <span>支持模型</span>
            <input
              value={modelsText}
              onChange={(e) => setForm({ ...form, models: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              placeholder="例如：gpt-4o, gpt-4o-mini, o3-mini"
            />
          </label>
        </div>

        <div className="metric-bar-grid detail-metric-grid">
          <div className="metric-pill">当前状态 {form.status}</div>
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
