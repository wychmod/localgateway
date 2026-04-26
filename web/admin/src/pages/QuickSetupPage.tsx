import { CheckCheck, Copy, TerminalSquare } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function QuickSetupPage() {
  const { keys, pushNotice } = useAdminStore();
  const currentKey = keys[0] ?? { name: "未加载", displayKey: "lg-****" };

  const setups = [
    {
      name: "Codex / Cursor / Windsurf",
      snippet: `OPENAI_API_KEY=${currentKey.displayKey}\nOPENAI_BASE_URL=http://localhost:9090/v1`
    },
    {
      name: "Claude Desktop",
      snippet: `{"apiUrl": "http://localhost:9090", "apiKey": "${currentKey.displayKey}"}`
    },
    {
      name: "灵枢便携分发包",
      snippet: "下载 lingshu.zip → 解压 → 运行 lingshu.exe → 打开 /admin 完成剩余配置"
    }
  ];

  return (
    <section className="luxury-panel page-panel">
      <SectionHeader
        eyebrow="接入助手"
        title="接入配置"
        actions={
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              pushNotice({ tone: "success", title: "配置校验通过", message: "接入模板已生成。" })
            }
          >
            <CheckCheck size={16} /> 校验
          </button>
        }
      />

      <div className="context-strip">
        <div className="metric-pill">预设方案 {setups.length}</div>
        <div className="metric-pill">主用密钥 {currentKey.name}</div>
        <div className="metric-pill">网关地址 http://localhost:9090/v1</div>
      </div>

      <div className="setup-grid">
        {setups.map((item) => (
          <article key={item.name} className="luxury-panel nested-panel setup-card">
            <div className="setup-header">
              <div>
                <strong>{item.name}</strong>
                <p className="section-description">复制后再按实际环境补充即可。</p>
              </div>
              <button
                type="button"
                className="ghost-button compact"
                onClick={() =>
                  pushNotice({
                    tone: "info",
                    title: `已复制 ${item.name} 配置`,
                    message: "当前为交互演示态，接上真实剪贴板后会直接写入系统剪贴板。"
                  })
                }
              >
                <Copy size={14} /> 复制配置
              </button>
            </div>
            <pre>{item.snippet}</pre>
          </article>
        ))}
      </div>

      <div className="inline-actions sticky-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() =>
            pushNotice({ tone: "info", title: "接入向导", message: "一步式向导后续开放。" })
          }
        >
          <TerminalSquare size={16} /> 向导
        </button>
      </div>
    </section>
  );
}
