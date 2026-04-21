import { create } from "zustand";
import {
  LocalKeyRecord,
  ProviderRecord,
  RoutingRuleRecord,
  SettingsRecord,
  localKeyRecords,
  providerRecords,
  routingRuleRecords,
  settingsRecord
} from "./entities";

type NoticeTone = "success" | "warning" | "info";

type Notice = {
  id: number;
  title: string;
  message: string;
  tone: NoticeTone;
};

type AdminState = {
  providers: ProviderRecord[];
  keys: LocalKeyRecord[];
  rules: RoutingRuleRecord[];
  settings: SettingsRecord;
  selectedProviderId?: string;
  selectedKeyId?: string;
  notices: Notice[];
  setSelectedProvider: (id?: string) => void;
  setSelectedKey: (id?: string) => void;
  saveProvider: (record: ProviderRecord) => void;
  saveKey: (record: LocalKeyRecord) => void;
  saveRule: (record: RoutingRuleRecord) => void;
  saveSettings: (record: SettingsRecord) => void;
  pushNotice: (notice: Omit<Notice, "id">) => void;
  dismissNotice: (id: number) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  providers: providerRecords,
  keys: localKeyRecords,
  rules: routingRuleRecords,
  settings: settingsRecord,
  selectedProviderId: providerRecords[0]?.id,
  selectedKeyId: localKeyRecords[0]?.id,
  notices: [
    {
      id: 1,
      tone: "info",
      title: "欢迎来到 LocalGateway Admin",
      message: "当前界面基于本地 mock 数据运行，适合先打磨配置流、状态流与交互细节。"
    }
  ],
  setSelectedProvider: (id) => set({ selectedProviderId: id }),
  setSelectedKey: (id) => set({ selectedKeyId: id }),
  saveProvider: (record) =>
    set((state) => ({
      providers: upsert(state.providers, record),
      selectedProviderId: record.id,
      notices: prependNotice(state.notices, {
        tone: "success",
        title: "Provider 已保存",
        message: `${record.name} 的接入配置已更新，后续可以继续做连接测试与模型发现。`
      })
    })),
  saveKey: (record) =>
    set((state) => ({
      keys: upsert(state.keys, record),
      selectedKeyId: record.id,
      notices: prependNotice(state.notices, {
        tone: "success",
        title: "Local Key 已更新",
        message: `${record.name} 的预算、模型权限和 Provider 约束已保存。`
      })
    })),
  saveRule: (record) =>
    set((state) => ({
      rules: upsert(state.rules, record),
      notices: prependNotice(state.notices, {
        tone: "success",
        title: "路由规则已保存",
        message: `${record.modelPattern} 的策略链路已写入当前工作区状态。`
      })
    })),
  saveSettings: (record) =>
    set((state) => ({
      settings: record,
      notices: prependNotice(state.notices, {
        tone: "success",
        title: "系统设置已保存",
        message: `服务监听 ${record.host}:${record.port}，Admin 路径保持为 ${record.adminPath}。`
      })
    })),
  pushNotice: (notice) =>
    set((state) => ({
      notices: prependNotice(state.notices, notice)
    })),
  dismissNotice: (id) =>
    set((state) => ({
      notices: state.notices.filter((notice) => notice.id !== id)
    }))
}));

function upsert<T extends { id: string }>(items: T[], next: T): T[] {
  const exists = items.some((item) => item.id === next.id);
  if (!exists) {
    return [next, ...items];
  }
  return items.map((item) => (item.id === next.id ? next : item));
}

function prependNotice(notices: Notice[], notice: Omit<Notice, "id">): Notice[] {
  return [{ id: Date.now(), ...notice }, ...notices].slice(0, 4);
}
