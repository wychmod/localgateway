import { BadgeCheck, Boxes, FileCheck2, PackageOpen } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

const checks = [
  { title: "管理后台构建资源", description: "等待 Vite build 产物进入 embed 目录", icon: Boxes, status: "pending" },
  { title: "便携目录结构", description: "packaging/windows-portable 结构已就绪", icon: PackageOpen, status: "ready" },
  { title: "运行验证", description: "等待 Go 环境可用后执行真实运行验证", icon: BadgeCheck, status: "blocked" },
  { title: "发布清单", description: "等待生成 zip、版本说明和校验文件", icon: FileCheck2, status: "pending" }
];

export function BuildChecksPage() {
  return (
    <section className="page-grid build-check-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="构建检查"
          title="构建检查项页"
          description="在真正出便携版安装包前，先把每个关键检查项做成显性清单。"
        />
        <div className="wizard-step-list">
          {checks.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={`luxury-panel nested-panel wizard-step-card build-check-card ${item.status}`}>
                <span className="wizard-index">0{index + 1}</span>
                <div>
                  <strong><Icon size={16} /> {item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
