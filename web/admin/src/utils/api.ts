const API_BASE = "/admin/api";

export type ApiResult<T> = {
  ok: boolean;
  data?: T;
  rawKey?: string;
  error?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
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
