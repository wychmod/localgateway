import { useEffect, useState } from "react";
import { Download, PackageOpen, RefreshCw, Save } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function SettingsPage() {
  const { settings, distributionPlan, saveSettings, backupSettings, reloadDistributionPlan } = useAdminStore();
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  return (
    <section className="page-grid settings-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="系统设置"
          title="系统配置"
          actions={<button type="button" className="primary-button" onClick={() => void saveSettings(form)}><Save size={16} /> 保存</button>}
        />
        <div className="form-grid">
          <label>
            <span>监听地址</span>
            <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
          </label>
          <label>
            <span>端口</span>
            <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
          </label>
          <label>
            <span>管理后台路径</span>
            <input value={form.adminPath} onChange={(e) => setForm({ ...form, adminPath: e.target.value })} />
          </label>
          <label>
            <span>管理员账号</span>
            <input value={form.adminUsername} onChange={(e) => setForm({ ...form, adminUsername: e.target.value })} />
          </label>
          <label>
            <span>界面主题</span>
            <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value as typeof form.theme })}>
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>
          <label>
            <span>更新通道</span>
            <input value={form.updateChannel} onChange={(e) => setForm({ ...form, updateChannel: e.target.value })} />
          </label>
          <label>
            <span>备份间隔</span>
            <input value={form.backupInterval} onChange={(e) => setForm({ ...form, backupInterval: e.target.value })} />
          </label>
          <label>
            <span>日志级别</span>
            <input value={form.logLevel} onChange={(e) => setForm({ ...form, logLevel: e.target.value })} />
          </label>
          <label>
            <span>保留天数</span>
            <input type="number" value={form.retentionDays} onChange={(e) => setForm({ ...form, retentionDays: Number(e.target.value) })} />
          </label>
          <label>
            <span>打包方式</span>
            <input value={form.bundleMode} onChange={(e) => setForm({ ...form, bundleMode: e.target.value })} />
          </label>
        </div>
      </article>

      <article className="luxury-panel page-panel distribution-panel">
        <SectionHeader
          eyebrow="分发设置"
          title="分发包"
          actions={
            <button type="button" className="ghost-button compact" onClick={() => void reloadDistributionPlan()}>
              <RefreshCw size={14} /> 刷新
            </button>
          }
        />
        <div className="distribution-stack">
          <div className="metric-pill"><PackageOpen size={16} /> 分发包：{distributionPlan?.package_name ?? "lingshu.zip"}</div>
          <div className="metric-pill">包含：{(distributionPlan?.includes ?? ["主程序", "配置文件", "数据与日志目录"]).join(" / ")}</div>
          <div className="metric-pill">模式：{distributionPlan?.mode ?? "单目录分发"}</div>
          {distributionPlan?.notes?.map((note) => (
            <div key={note} className="metric-pill">{note}</div>
          ))}
          <div className="inline-actions">
            <button type="button" className="ghost-button" onClick={() => void backupSettings()}><Download size={16} /> 导出打包说明</button>
            <button type="button" className="ghost-button" onClick={() => void backupSettings()}>生成便携版安装包</button>
          </div>
        </div>
      </article>
    </section>
  );
}

