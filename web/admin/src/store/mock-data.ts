export const statCards = [
  {
    title: "今日请求",
    value: "12,846",
    delta: "+18.4%",
    tone: "violet"
  },
  {
    title: "本月费用",
    value: "$1,284.73",
    delta: "-6.8%",
    tone: "emerald"
  },
  {
    title: "平均 TTFT",
    value: "218ms",
    delta: "-14ms",
    tone: "sky"
  },
  {
    title: "可用 Provider",
    value: "08",
    delta: "+2",
    tone: "amber"
  }
];

export const providerHealth = [
  { name: "OpenAI Primary", latency: 182, status: "healthy", share: 38 },
  { name: "Claude Premium", latency: 246, status: "healthy", share: 26 },
  { name: "DeepSeek Saver", latency: 128, status: "healthy", share: 21 },
  { name: "Azure Backup", latency: 311, status: "warning", share: 15 }
];

export const costTrend = [
  { day: "Mon", cost: 132, requests: 1840, tokens: 420000 },
  { day: "Tue", cost: 148, requests: 2030, tokens: 458000 },
  { day: "Wed", cost: 141, requests: 1964, tokens: 436000 },
  { day: "Thu", cost: 169, requests: 2210, tokens: 492000 },
  { day: "Fri", cost: 188, requests: 2450, tokens: 538000 },
  { day: "Sat", cost: 124, requests: 1630, tokens: 362000 },
  { day: "Sun", cost: 117, requests: 1520, tokens: 349000 }
];

export const alertFeed = [
  { level: "warning", title: "Claude Premium 延迟升高", description: "最近 5 分钟 TTFT 超过 320ms，已触发备用链路观察。" },
  { level: "info", title: "Cursor Team 预算达到 35%", description: "月度使用趋势正常，无需限流。" },
  { level: "critical", title: "Azure Backup 最近 1 小时 fallback 次数增加", description: "建议检查 OpenAI Primary 出站稳定性。" }
];

export const quickActions = [
  "Add Provider",
  "Create Local Key",
  "Run Routing Test",
  "Open Portable Packaging",
  "Review Failed Logs"
];

export const distributionStatus = {
  artifact: "localgateway.zip",
  mode: "Portable / Download-and-Run",
  bundle: "Admin 前端将内嵌进入单二进制",
  init: "首次启动自动初始化 config、data、logs"
};

export const liveRequests = [
  { tool: "Codex", model: "gpt-4o", provider: "OpenAI Primary", latency: "182ms", status: "streaming" },
  { tool: "Claude Desktop", model: "claude-sonnet-4", provider: "Claude Premium", latency: "246ms", status: "ok" },
  { tool: "Cursor", model: "gpt-4o-mini", provider: "DeepSeek Saver", latency: "128ms", status: "ok" }
];
