import { BadgeCheck, Boxes, FileCheck2, PackageOpen, ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { buildCheckStatusMap } from "../store/labels";
import { isDesktopMode, runDesktopSelfCheck, type DesktopCheckItem, type DesktopSelfCheck } from "../utils/desktop-bridge";

const fallbackChecks: DesktopCheckItem[] = [
  { key: "assets", title: "管理后台构建资源", description: "等待构建产物进入嵌入目录", status: "pending", detail: "当前为静态演示数据" },
  { key: "portable", title: "便携目录结构", description: "打包目录结构已就绪", status: "ready", detail: "浏览器版便携结构已存在" },
  { key: "runtime", title: "运行验证", description: "等待运行环境可用后执行真实运行验证", status: "blocked", detail: "浏览器模式下不会执行桌面运行检查" },
  { key: "release", title: "发布清单", description: "等待生成压缩包、版本说明和校验文件", status: "pending", detail: "当前尚未生成正式发布物" }
];

export function BuildChecksPage() {
  const [report, setReport] = useState<DesktopSelfCheck | null>(null);
  const checks = report?.checks?.length ? report.checks : fallbackChecks;

  useEffect(() => {
    if (!isDesktopMode) {
      return;
    }
    void runDesktopSelfCheck().then(setReport);
  }, []);

  return (
    <section className="page-grid build-check-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="构建检查"
          title="发布前检查清单"
          description="在发布桌面版或便携版前，逐项核对 Provider、数据库、资源、端口和打包产物。"
        />

        <div className="context-strip">
          <span className="metric-pill">检查模式：{isDesktopMode ? "桌面发布前检查器" : "浏览器演示模式"}</span>
          <span className="metric-pill">总体状态：{buildCheckStatusMap[report?.health ?? "pending"] ?? report?.health ?? "待检查"}</span>
          <span className="metric-pill">完成时间：{report?.completedAt ? new Date(report.completedAt).toLocaleString() : "尚未执行"}</span>
        </div>

        {isDesktopMode ? (
          <div className="inline-actions" style={{ marginBottom: 20 }}>
            <button type="button" className="primary-button" onClick={() => void runDesktopSelfCheck().then(setReport)}>
              <ScanSearch size={16} />
              重新执行发布前检查
            </button>
          </div>
        ) : null}

        <div className="wizard-step-list">
          {checks.map((item, index) => {
            const iconMap = {
              providers: BadgeCheck,
              database: Boxes,
              assets: PackageOpen,
              port: ScanSearch,
              packaging: FileCheck2
            } as const;
            const Icon = iconMap[item.key as keyof typeof iconMap] ?? FileCheck2;
            return (
              <article key={item.key} className={`luxury-panel nested-panel wizard-step-card build-check-card ${item.status}`}>
                <span className="wizard-index">0{index + 1}</span>
                <div>
                  <strong><Icon size={16} /> {item.title}</strong>
                  <p>{item.description}</p>
                  <p>{item.detail}</p>
                  <span className="status-pill" style={{ marginTop: 8 }}>{buildCheckStatusMap[item.status] ?? item.status}</span>
                </div>
              </article>
            );
          })}
        </div>

        {report?.warnings?.length ? (
          <div className="stack-list" style={{ marginTop: 20 }}>
            {report.warnings.map((warning) => (
              <article key={warning} className="luxury-panel nested-panel alert-card warning">
                <strong>发布前注意</strong>
                <p>{warning}</p>
              </article>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
