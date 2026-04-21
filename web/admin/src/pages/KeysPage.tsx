import { useEffect, useMemo, useState } from "react";
import { Copy, RotateCcw, ShieldAlert } from "lucide-react";
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
          eyebrow="本地密钥"
          title="权限 · 预算 · 续期管理"
          description="创建、复制、轮换、吊销、预算限制和工具接入全部集中处理。"
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
                  title: "已创建空白密钥草稿",
                  message: "配置允许模型和预算后，即可保存到本地状态。"
                });
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
                <small>{key.allowedModels.length} 个模型 · 已用 {key.currentSpend.toFixed(1)} / {key.monthlyBudget} 美元</small>
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
            <input
              value={form.allowedModels.join(", ")}
              onChange={(e) => setForm({ ...form, allowedModels: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              placeholder="例如：gpt-4o, claude-sonnet-4"
            />
          </label>
          <label className="span-2">
            <span>允许厂商</span>
            <input
              value={form.allowedProviders.join(", ")}
              onChange={(e) => setForm({ ...form, allowedProviders: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              placeholder="例如：OpenAI 主线路, Claude 高级线路"
            />
          </label>
          <label>
            <span>月预算（美元）</span>
            <input type="number" value={form.monthlyBudget} onChange={(e) => setForm({ ...form, monthlyBudget: Number(e.target.value) })} />
          </label>
          <label>
            <span>令牌预算（个）</span>
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
          <button type="button" className="primary-button" onClick={() => saveKey(form)}>保存变更</button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "success", title: "密钥已复制", message: `${form.name} 的展示密钥已复制到剪贴板流程占位中。` })}
          >
            <Copy size={16} /> 复制密钥
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "warning", title: "轮换流程已预留", message: "后续接上真实接口后，会先生成新密钥，再给旧密钥留出平滑迁移窗口。" })}
          >
            <RotateCcw size={16} /> 轮换密钥
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => pushNotice({ tone: "warning", title: "吊销动作待确认", message: `${form.name} 当前只做交互演示，接后端后建议增加二次确认弹层。` })}
          >
            <ShieldAlert size={16} /> 吊销密钥
          </button>
        </div>
      </DrawerCard>
    </section>
  );
}
