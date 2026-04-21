import { LockKeyhole, ShieldAlert } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

export function SecurityPage() {
  return (
    <section className="page-grid split-layout security-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="安全设置"
          title="登录与安全入口"
          description="把管理员登录、默认安全策略和后续会话能力都放到显性入口里。"
          actions={<button type="button" className="primary-button"><LockKeyhole size={16} /> 立即登录</button>}
        />
        <div className="form-grid">
          <label>
            <span>管理员账号</span>
            <input defaultValue="admin" />
          </label>
          <label>
            <span>密码</span>
            <input type="password" defaultValue="ChangeMeNow!" />
          </label>
          <label className="span-2">
            <span>会话模式</span>
            <input defaultValue="cookie-session" />
          </label>
        </div>
        <div className="inline-actions">
          <button type="button" className="primary-button">保存安全设置</button>
          <button type="button" className="ghost-button">测试登录入口</button>
        </div>
      </article>

      <article className="luxury-panel page-panel">
        <SectionHeader eyebrow="安全清单" title="默认安全清单" description="下载即用不代表默认裸奔，首次使用必须看到这些安全基线。" />
        <div className="stack-list">
          <article className="luxury-panel nested-panel alert-card warning">
            <strong>首次启动必须设置管理员密码</strong>
            <p>默认密码只应作为初始化占位，真实运行时必须强制修改。</p>
          </article>
          <article className="luxury-panel nested-panel alert-card">
            <strong>仅监听 127.0.0.1</strong>
            <p>默认阻止外部访问，后续如需开放必须在设置页显式修改。</p>
          </article>
          <article className="luxury-panel nested-panel alert-card">
            <strong>后续增加会话过期与登出</strong>
            <p>目前先把入口和状态流设计好，真实会话逻辑待 Go 运行时接入。</p>
          </article>
          <article className="luxury-panel nested-panel alert-card critical">
            <strong><ShieldAlert size={16} /> 完整日志默认关闭</strong>
            <p>避免首次使用就记录 Prompt 与敏感数据。</p>
          </article>
        </div>
      </article>
    </section>
  );
}
