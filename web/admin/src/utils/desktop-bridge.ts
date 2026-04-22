import { EventsOn } from "../wailsjs/runtime/runtime";
import {
  CloseWindow,
  GetDesktopStatus,
  GetVersion,
  MinimiseWindow,
  OpenAdminInBrowser,
  SendNativeNotice,
  ToggleMaximiseWindow
} from "../wailsjs/go/main/DesktopApp";
import { isDesktopMode } from "./desktop-env";

export type DesktopStatus = {
  version: string;
  platform: string;
  serverAddr: string;
  adminUrl: string;
  windowTitle: string;
  desktopMode: boolean;
  notifications: boolean;
  customChrome: boolean;
};

export type DesktopNotice = {
  title: string;
  message: string;
};

const emptyStatus: DesktopStatus = {
  version: "browser",
  platform: "web",
  serverAddr: "",
  adminUrl: "",
  windowTitle: "LocalGateway",
  desktopMode: false,
  notifications: false,
  customChrome: false
};

export async function fetchDesktopStatus(): Promise<DesktopStatus> {
  if (!isDesktopMode) {
    return emptyStatus;
  }

  try {
    return await GetDesktopStatus();
  } catch {
    return emptyStatus;
  }
}

export async function fetchDesktopVersion(): Promise<string> {
  if (!isDesktopMode) {
    return "browser";
  }

  try {
    return await GetVersion();
  } catch {
    return "browser";
  }
}

export function minimiseDesktopWindow() {
  if (!isDesktopMode) {
    return;
  }
  void MinimiseWindow();
}

export function toggleDesktopMaximise() {
  if (!isDesktopMode) {
    return;
  }
  void ToggleMaximiseWindow();
}

export function closeDesktopWindow() {
  if (!isDesktopMode) {
    return;
  }
  void CloseWindow();
}

export function openDesktopAdminInBrowser() {
  if (!isDesktopMode) {
    window.open("/dashboard", "_blank");
    return;
  }
  void OpenAdminInBrowser();
}

export function sendDesktopNotice(title: string, message: string) {
  if (!isDesktopMode) {
    return;
  }
  void SendNativeNotice(title, message);
}

export function onDesktopStatus(handler: (payload: DesktopStatus) => void) {
  if (!isDesktopMode) {
    return () => undefined;
  }

  let unsubscribe = () => undefined;
  void EventsOn("desktop:server-ready", (payload) => handler(payload as DesktopStatus)).then((fn) => {
    unsubscribe = fn;
  });
  return () => unsubscribe();
}

export function onDesktopDomReady(handler: (payload: DesktopStatus) => void) {
  if (!isDesktopMode) {
    return () => undefined;
  }

  let unsubscribe = () => undefined;
  void EventsOn("desktop:dom-ready", (payload) => handler(payload as DesktopStatus)).then((fn) => {
    unsubscribe = fn;
  });
  return () => unsubscribe();
}

export function onDesktopNotice(handler: (payload: DesktopNotice) => void) {
  if (!isDesktopMode) {
    return () => undefined;
  }

  let unsubscribe = () => undefined;
  void EventsOn("desktop:notice", (payload) => handler(payload as DesktopNotice)).then((fn) => {
    unsubscribe = fn;
  });
  return () => unsubscribe();
}

export { isDesktopMode };
