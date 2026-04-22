import { Sparkles, ShieldCheck } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { useUIStore } from "../store/ui-store";

export function BootstrapSuccessPage() {
  const { setInitialized } = useUIStore();

  return (
    <section className="page-grid success-layout">
      <article className="luxury-panel page-panel success-panel">
        <SectionHeader
          eyebrow="初始化完成"
          title="首次启动初始化已完成"
          description="灵枢已具备进入正式管理模式的基础条件，接下来可以直接配置厂商接入、本地密钥和路由策略。"
          actions={<button type="button" className="primary-button" onClick={() => setInitialized(true)}><ShieldCheck size={16} /> 进入管理后台</button>}
        />
        <div className="success-stack">
          <div className="metric-pill"><Sparkles size={16} /> 管理员账号已就绪</div>
          <div className="metric-pill">本地配置已初始化</div>
          <div className="metric-pill">便携目录已确认</div>
          <div className="metric-pill">安全基线已应用</div>
        </div>
      </article>
    </section>
  );
}
