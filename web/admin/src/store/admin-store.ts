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

type AdminState = {
  providers: ProviderRecord[];
  keys: LocalKeyRecord[];
  rules: RoutingRuleRecord[];
  settings: SettingsRecord;
  selectedProviderId?: string;
  selectedKeyId?: string;
  setSelectedProvider: (id?: string) => void;
  setSelectedKey: (id?: string) => void;
  saveProvider: (record: ProviderRecord) => void;
  saveKey: (record: LocalKeyRecord) => void;
  saveRule: (record: RoutingRuleRecord) => void;
  saveSettings: (record: SettingsRecord) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  providers: providerRecords,
  keys: localKeyRecords,
  rules: routingRuleRecords,
  settings: settingsRecord,
  selectedProviderId: providerRecords[0]?.id,
  selectedKeyId: localKeyRecords[0]?.id,
  setSelectedProvider: (id) => set({ selectedProviderId: id }),
  setSelectedKey: (id) => set({ selectedKeyId: id }),
  saveProvider: (record) =>
    set((state) => ({
      providers: upsert(state.providers, record)
    })),
  saveKey: (record) =>
    set((state) => ({
      keys: upsert(state.keys, record)
    })),
  saveRule: (record) =>
    set((state) => ({
      rules: upsert(state.rules, record)
    })),
  saveSettings: (record) => set({ settings: record })
}));

function upsert<T extends { id: string }>(items: T[], next: T): T[] {
  const exists = items.some((item) => item.id === next.id);
  if (!exists) {
    return [next, ...items];
  }
  return items.map((item) => (item.id === next.id ? next : item));
}
