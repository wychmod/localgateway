import { CircleCheckBig, Hash, Shield, TimerReset } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

const versionBlocks = [
  { label: "版本号", value: "0.1.0-alpha", icon: Hash },
  { label: "发布通道", value: "便携预览版", icon: TimerReset },
  { label: "安全状态", value: "仅限本地访问 · 登录功能待完善", icon: Shield },
  { label: "当前状态", value: "基础功能已就绪", icon: CircleCheckBig }
];

export function VersionInfoPage() {
  return (
    <section className="page-grid version-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="版本信息"
          title="版本信息与当前产品状态"
          description="把当前阶段、发布通道、提交基线和安全状态展示清楚，方便你判断什么时候可以往外发。"
        />
        <div className="stats-grid version-grid">
          {versionBlocks.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="luxury-panel nested-panel stat-card">
                <span>{item.label}</span>
                <strong><Icon size={18} /> {item.value}</strong>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
