import { CheckCheck, Copy, TerminalSquare } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { useAdminStore } from "../store/admin-store";

export function QuickSetupPage() {
  const { keys } = useAdminStore();
  const currentKey = keys[0];

  const setups = [
    {
      name: "Codex / Cursor / Windsurf",
      snippet: `OPENAI_API_KEY=${currentKey.displayKey}\nOPENAI_BASE_URL=http://localhost:9090/v1`
    },
    {
      name: "Claude Desktop",
      snippet: `{\n  "apiUrl": "http://localhost:9090",\n  "apiKey": "${currentKey.displayKey}"\n}`
    },
    {
      name: "Portable Distribution",
      snippet: "下载 localgateway.zip → 解压 → 运行 localgateway.exe → 打开 /admin 完成剩余配置"
    }
  ];

  return (
    <section className="luxury-panel page-panel">
      <SectionHeader
        eyebrow="Quick Setup"
        title="下载后直接用，配置也尽量别让人费劲"
        description="面向 Codex、Claude Desktop、Cursor 等工具生成一键接入说明。"
        actions={<button type="button" className="ghost-button"><CheckCheck size={16} /> Validate Config</button>}
      />
      <div className="setup-grid">
        {setups.map((item) => (
          <article key={item.name} className="luxury-panel nested-panel setup-card">
            <div className="setup-header">
              <strong>{item.name}</strong>
              <button type="button" className="ghost-button compact"><Copy size={14} /> Copy</button>
            </div>
            <pre>{item.snippet}</pre>
          </article>
        ))}
      </div>
      <div className="inline-actions">
        <button type="button" className="primary-button"><TerminalSquare size={16} /> Open Setup Wizard</button>
      </div>
    </section>
  );
}
