const API_BASE = "/admin/api";

export type ApiResult<T> = {
  ok: boolean;
  data?: T;
  rawKey?: string;
  error?: string;
};

function getStoredCredentials(): string | null {
  try { return sessionStorage.getItem("lg_admin_auth"); } catch { return null; }
}
function setStoredCredentials(value: string) {
  try { sessionStorage.setItem("lg_admin_auth", value); } catch { /* */ }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> ?? {})
    };
    const stored = getStoredCredentials();
    if (stored) headers["Authorization"] = `Basic ${stored}`;

    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

    if (res.status === 401) {
      const user = prompt("管理后台需要认证，请输入用户名：");
      const pass = prompt("请输入密码：");
      if (user != null && pass != null) {
        const encoded = btoa(`${user}:${pass}`);
        setStoredCredentials(encoded);
        const retryHeaders = { ...headers, "Authorization": `Basic ${encoded}` };
        const retryRes = await fetch(`${API_BASE}${path}`, { ...init, headers: retryHeaders });
        const retryPayload = await retryRes.json().catch(() => ({}));
        if (!retryRes.ok) return { ok: false, error: retryPayload.error ?? `请求失败：${retryRes.status}` };
        return { ok: true, data: retryPayload.data as T, rawKey: retryPayload.raw_key };
      }
      return { ok: false, error: "需要认证才能访问管理后台" };
    }

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: payload.error ?? `请求失败：${res.status}` };
    }
    return { ok: true, data: payload.data as T, rawKey: payload.raw_key };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "网络请求失败" };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" })
};
