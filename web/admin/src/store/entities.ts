export type ProviderRecord = {
  id: string;
  name: string;
  type: string;
  baseURL: string;
  status: "healthy" | "warning" | "disabled";
  priority: number;
  models: string[];
  rpm: number;
  tpm: number;
};

export type LocalKeyRecord = {
  id: string;
  name: string;
  displayKey: string;
  allowedModels: string[];
  allowedProviders: string[];
  monthlyBudget: number;
  currentSpend: number;
  tokenBudget: number;
  currentTokens: number;
  status: "active" | "warning" | "revoked";
};

export type RoutingRuleRecord = {
  id: string;
  modelPattern: string;
  strategy: string;
  providerChain: string[];
  fallbackChain: string[];
  enabled: boolean;
};

export type SettingsRecord = {
  host: string;
  port: number;
  adminPath: string;
  adminUsername: string;
  theme: "light" | "dark" | "system";
  updateChannel: string;
  backupInterval: string;
  logLevel: string;
  retentionDays: number;
  bundleMode: string;
};

export const providerRecords: ProviderRecord[] = [
  {
    id: "prov-openai-primary",
    name: "OpenAI Primary",
    type: "openai",
    baseURL: "https://api.openai.com",
    status: "healthy",
    priority: 1,
    models: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
    rpm: 120,
    tpm: 400000
  },
  {
    id: "prov-claude-premium",
    name: "Claude Premium",
    type: "anthropic",
    baseURL: "https://api.anthropic.com",
    status: "healthy",
    priority: 2,
    models: ["claude-sonnet-4", "claude-haiku-4"],
    rpm: 90,
    tpm: 320000
  },
  {
    id: "prov-deepseek-saver",
    name: "DeepSeek Saver",
    type: "deepseek",
    baseURL: "https://api.deepseek.com",
    status: "warning",
    priority: 3,
    models: ["deepseek-chat", "deepseek-reasoner"],
    rpm: 160,
    tpm: 600000
  }
];

export const localKeyRecords: LocalKeyRecord[] = [
  {
    id: "key-codex",
    name: "Codex Pro",
    displayKey: "lg-a3f8****9k2m",
    allowedModels: ["gpt-4o", "claude-sonnet-4"],
    allowedProviders: ["OpenAI Primary", "Claude Premium"],
    monthlyBudget: 150,
    currentSpend: 42.8,
    tokenBudget: 10000000,
    currentTokens: 2340000,
    status: "active"
  },
  {
    id: "key-cursor",
    name: "Cursor Team",
    displayKey: "lg-b8d2****c1q9",
    allowedModels: ["gpt-4o-mini", "deepseek-chat"],
    allowedProviders: ["OpenAI Primary", "DeepSeek Saver"],
    monthlyBudget: 80,
    currentSpend: 28.1,
    tokenBudget: 8500000,
    currentTokens: 1720000,
    status: "warning"
  }
];

export const routingRuleRecords: RoutingRuleRecord[] = [
  {
    id: "route-gpt4o",
    modelPattern: "gpt-4o*",
    strategy: "Priority + Fallback",
    providerChain: ["OpenAI Primary", "Azure Backup"],
    fallbackChain: ["Azure Backup", "OpenRouter"],
    enabled: true
  },
  {
    id: "route-claude",
    modelPattern: "claude-*",
    strategy: "Priority + Fallback",
    providerChain: ["Claude Premium", "OpenRouter"],
    fallbackChain: ["OpenRouter", "DeepSeek Saver"],
    enabled: true
  }
];

export const settingsRecord: SettingsRecord = {
  host: "127.0.0.1",
  port: 9090,
  adminPath: "/admin",
  adminUsername: "admin",
  theme: "system",
  updateChannel: "stable",
  backupInterval: "24h",
  logLevel: "standard",
  retentionDays: 30,
  bundleMode: "single-binary"
};
