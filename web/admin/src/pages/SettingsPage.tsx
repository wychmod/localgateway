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
          eyebrow="系统设置"
          title="系统配置 · 全前端收口"
          description="端口、认证、日志、更新、备份和主题都不需要手动改配置文件。"
          actions={<button type="button" className="primary-button" onClick={() => saveSettings(form)}><Save size={16} /> 保存设置</button>}
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
            <input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value as typeof form.theme })} />
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
        <SectionHeader eyebrow="分发设置" title="下载后直接用" description="单目录分发：拿到压缩包、解压、双击即可启动。" />
        <div className="distribution-stack">
          <div className="metric-pill"><PackageOpen size={16} /> 分发包：lingshu.zip</div>
          <div className="metric-pill">包含：主程序、配置文件、数据与日志目录</div>
          <div className="metric-pill">管理后台将内嵌至单一可执行文件</div>
          <div className="metric-pill">首次启动自动初始化数据库与默认配置</div>
          <div className="inline-actions">
            <button type="button" className="ghost-button"><Download size={16} /> 导出打包说明</button>
            <button type="button" className="ghost-button">生成便携版安装包</button>
          </div>
        </div>
      </article>
    </section>
  );
}
