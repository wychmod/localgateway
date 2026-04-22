import { Download, PackageCheck, TimerReset } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

const releaseChecklist = [
  "嵌入前端静态资源",
  "构建可执行文件",
  "生成默认配置文件",
  "打包数据与日志初始目录",
  "输出压缩包与校验信息"
];

export function ReleaseStatusPage() {
  return (
    <section className="page-grid release-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="发布状态"
          title="便携版分发与发布状态"
          description="距离「下载后直接用」还差多少，一目了然。"
          actions={<button type="button" className="primary-button"><Download size={16} /> 构建便携版</button>}
        />
        <div className="status-grid">
          <div className="metric-pill"><PackageCheck size={16} /> 分发包：lingshu.zip</div>
          <div className="metric-pill">版本号：0.1.0-alpha</div>
          <div className="metric-pill">分发方式：便携版 · 下载即用</div>
          <div className="metric-pill"><TimerReset size={16} /> 发布状态：尚未就绪</div>
        </div>
      </article>

      <article className="luxury-panel page-panel">
        <SectionHeader eyebrow="待办清单" title="发布待办清单" description="真实构建接入前，先铺好完整链路和界面。" />
        <div className="wizard-step-list">
          {releaseChecklist.map((step, index) => (
            <article key={step} className="luxury-panel nested-panel wizard-step-card">
              <span className="wizard-index">0{index + 1}</span>
              <div>
                <strong>{step}</strong>
                <p>完成后即可更接近真正的可下载便携版。</p>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
