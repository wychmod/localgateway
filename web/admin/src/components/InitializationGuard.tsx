import { PropsWithChildren } from "react";
import { Lock } from "lucide-react";
import { useUIStore } from "../store/ui-store";

export function InitializationGuard({ children }: PropsWithChildren) {
  const { initialized } = useUIStore();

  if (initialized) {
    return <>{children}</>;
  }

  return (
    <section className="page-grid guard-layout">
      <article className="luxury-panel page-panel guard-panel">
        <div className="guard-icon"><Lock size={28} /></div>
        <h2>当前还未完成首次启动初始化</h2>
        <p className="section-description">
          在进入厂商接入、本地密钥、路由策略等正式页面前，建议先完成管理员账号、安全基线和便携目录确认。
        </p>
        <div className="inline-actions">
          <a className="primary-button nav-button" href="/bootstrap">去做首次配置</a>
          <a className="ghost-button nav-button" href="/security">查看安全设置</a>
        </div>
      </article>
    </section>
  );
}
