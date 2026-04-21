import { ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

const setupSteps = [
  "设置管理员账号",
  "确认监听地址与端口",
  "选择主题与默认体验",
  "检查便携分发目录",
  "完成首次启动标记"
];

export function BootstrapPage() {
  return (
    <section className="page-grid bootstrap-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="首次配置"
          title="首次启动向导 / 初始化流程"
          description="目标是让用户第一次打开就像安装一个成熟产品，而不是面对一堆空白配置。"
          actions={<button type="button" className="primary-button"><Wand2 size={16} /> 开始向导</button>}
        />
        <div className="wizard-step-list">
          {setupSteps.map((step, index) => (
            <article key={step} className="luxury-panel nested-panel wizard-step-card">
              <span className="wizard-index">0{index + 1}</span>
              <div>
                <strong>{step}</strong>
                <p>前端完成操作，后端记录初始化状态并生成首次启动标记。</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="luxury-panel page-panel">
        <SectionHeader eyebrow="初始化状态" title="当前初始化状态" description="这块会在真实运行时根据本地配置与首次启动标记动态变化。" />
        <div className="status-grid">
          <div className="metric-pill"><ShieldCheck size={16} /> 管理员账号待设置</div>
          <div className="metric-pill"><Sparkles size={16} /> 主题尚未确认</div>
          <div className="metric-pill">便携目录已就绪</div>
          <div className="metric-pill">数据库初始化已准备</div>
        </div>
      </article>
    </section>
  );
}
