import { CheckCheck, Copy, TerminalSquare } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function QuickSetupPage() {
  const { keys, pushNotice } = useAdminStore();
  const currentKey = keys[0];

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
      name: "便携版分发包",
      snippet: "下载 localgateway.zip → 解压 → 运行 localgateway.exe → 打开 /admin 完成剩余配置"
    }
  ];

  return (
    <section className="luxury-panel page-panel">
      <SectionHeader
        eyebrow="快速接入"
        title="下载后直接用，配置也尽量别让人费劲"
        description="面向 Codex、Claude Desktop、Cursor 等工具生成一键接入说明。"
        actions={
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              pushNotice({
                tone: "success",
                title: "配置校验通过",
                message: "当前示例以本地网关地址和首个本地密钥生成，适合作为接入模板。"
              })
            }
          >
            <CheckCheck size={16} /> 校验配置
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
            pushNotice({
              tone: "info",
              title: "接入向导已预留",
              message: "后续可以把工具类型、密钥选择和配置导出整合成真正的一步式向导。"
            })
          }
        >
          <TerminalSquare size={16} /> 打开接入向导
        </button>
      </div>
    </section>
  );
}
