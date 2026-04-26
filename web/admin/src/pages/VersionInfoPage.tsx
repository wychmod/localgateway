import { CircleCheckBig, Hash, Shield, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { labelFromMap, platformLabelMap } from "../store/labels";
import { fetchDesktopStatus, fetchDesktopVersion, isDesktopMode } from "../utils/desktop-bridge";

type VersionBlock = {
  label: string;
  value: string;
  icon: typeof Hash;
};

export function VersionInfoPage() {
  const [desktopVersion, setDesktopVersion] = useState("0.1.0-alpha");
  const [platform, setPlatform] = useState("web");

  useEffect(() => {
    void fetchDesktopVersion().then((version) => {
      if (version && version !== "browser") {
        setDesktopVersion(version);
      }
    });

    void fetchDesktopStatus().then((status) => {
      if (status.platform) {
        setPlatform(status.platform);
      }
    });
  }, []);

  const versionBlocks = useMemo<VersionBlock[]>(() => [
    { label: "版本号", value: isDesktopMode ? desktopVersion : "0.1.0-alpha", icon: Hash },
    { label: "发布通道", value: isDesktopMode ? `桌面版 · ${labelFromMap(platformLabelMap, platform)}` : "便携预览版", icon: TimerReset },
    { label: "安全状态", value: "仅限本地访问 · 登录功能待完善", icon: Shield },
    { label: "当前状态", value: isDesktopMode ? "桌面特性已启用" : "基础功能已就绪", icon: CircleCheckBig }
  ], [desktopVersion, platform]);

  return (
    <section className="page-grid version-layout">
      <article className="luxury-panel page-panel">
        <SectionHeader
          eyebrow="版本概览"
          title="灵枢版本与产品状态"
          description="把当前阶段、发布通道、提交基线和安全状态展示清楚，方便判断什么时候可以对外分发。"
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
