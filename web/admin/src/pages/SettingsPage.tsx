import { useState } from "react";
import { Download, PackageOpen, Save } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function SettingsPage() {
  const { settings, saveSettings } = useAdminStore();
  const [form, setForm] = useState(settings);

  return (
    <section className="page-grid settings-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="Settings"
          title="系统配置全部前端收口"
          description="端口、认证、日志、更新、备份和主题都不需要去碰配置文件。"
          actions={<button type="button" className="primary-button" onClick={() => saveSettings(form)}><Save size={16} /> Save</button>}
        />
        <div className="form-grid">
          <label>
            <span>Host</span>
            <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
          </label>
          <label>
            <span>Port</span>
            <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
          </label>
          <label>
            <span>Admin Path</span>
            <input value={form.adminPath} onChange={(e) => setForm({ ...form, adminPath: e.target.value })} />
          </label>
          <label>
            <span>Admin Username</span>
            <input value={form.adminUsername} onChange={(e) => setForm({ ...form, adminUsername: e.target.value })} />
          </label>
          <label>
            <span>Theme</span>
            <input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value as typeof form.theme })} />
          </label>
          <label>
            <span>Update Channel</span>
            <input value={form.updateChannel} onChange={(e) => setForm({ ...form, updateChannel: e.target.value })} />
          </label>
          <label>
            <span>Backup Interval</span>
            <input value={form.backupInterval} onChange={(e) => setForm({ ...form, backupInterval: e.target.value })} />
          </label>
          <label>
            <span>Log Level</span>
            <input value={form.logLevel} onChange={(e) => setForm({ ...form, logLevel: e.target.value })} />
          </label>
          <label>
            <span>Retention Days</span>
            <input type="number" value={form.retentionDays} onChange={(e) => setForm({ ...form, retentionDays: Number(e.target.value) })} />
          </label>
          <label>
            <span>Bundle Mode</span>
            <input value={form.bundleMode} onChange={(e) => setForm({ ...form, bundleMode: e.target.value })} />
          </label>
        </div>
      </article>

      <article className="luxury-panel page-panel distribution-panel">
        <SectionHeader eyebrow="Distribution" title="下载后直接用" description="目标是单目录分发：拿到压缩包、解压、双击即可启动。" />
        <div className="distribution-stack">
          <div className="metric-pill"><PackageOpen size={16} /> localgateway.zip</div>
          <div className="metric-pill">包含 localgateway.exe / config.yaml / data / logs</div>
          <div className="metric-pill">Admin 前端最终会内嵌进 Go 二进制</div>
          <div className="metric-pill">首次启动自动初始化 SQLite 与默认配置</div>
          <div className="inline-actions">
            <button type="button" className="ghost-button"><Download size={16} /> Export Bundle Spec</button>
            <button type="button" className="ghost-button">Generate Portable Package</button>
          </div>
        </div>
      </article>
    </section>
  );
}
