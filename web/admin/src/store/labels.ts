// 状态标签中文映射 —— 所有 UI 上展示的状态文本统一收口在这里

export const providerStatusMap: Record<string, string> = {
  healthy: "运行正常",
  warning: "异常警告",
  disabled: "已停用"
};

export const keyStatusMap: Record<string, string> = {
  active: "启用中",
  warning: "预算警告",
  revoked: "已吊销"
};

export const buildCheckStatusMap: Record<string, string> = {
  pending: "待处理",
  ready: "已就绪",
  blocked: "阻塞中"
};

export const themeLabelMap: Record<string, string> = {
  light: "浅色模式",
  dark: "深色模式",
  system: "跟随系统"
};
