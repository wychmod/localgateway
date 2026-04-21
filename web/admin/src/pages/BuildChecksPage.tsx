import { BadgeCheck, Boxes, FileCheck2, PackageOpen } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { buildCheckStatusMap } from "../store/labels";

const checks = [
  { title: "管理后台构建资源", description: "等待构建产物进入嵌入目录", icon: Boxes, status: "pending" },
  { title: "便携目录结构", description: "打包目录结构已就绪", icon: PackageOpen, status: "ready" },
  { title: "运行验证", description: "等待运行环境可用后执行真实运行验证", icon: BadgeCheck, status: "blocked" },
  { title: "发布清单", description: "等待生成压缩包、版本说明和校验文件", icon: FileCheck2, status: "pending" }
];

export function BuildChecksPage() {
  return (
    <section className="page-grid build-check-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="构建检查"
          title="构建检查清单"
          description="在发布便携版前，逐项核对关键检查项。"
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
                  <span className="status-pill" style={{ marginTop: 8 }}>{buildCheckStatusMap[item.status] ?? item.status}</span>
                </div>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
