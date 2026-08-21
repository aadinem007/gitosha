const API_BASE = "https://api.xflowpay.com";

function authHeaders(): Record<string, string> {
  const key = process.env.XFLOW_API_KEY?.trim() ?? "";
  const account = process.env.XFLOW_ACCOUNT_ID?.trim() ?? "";
  return {
    Authorization: `Bearer ${key}`,
    "Xflow-Account": account,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function xflowReady(): boolean {
  const key = process.env.XFLOW_API_KEY?.trim() ?? "";
  const account = process.env.XFLOW_ACCOUNT_ID?.trim() ?? "";
  const webhook = process.env.XFLOW_WEBHOOK_SECRET?.trim() ?? "";
  return Boolean(key && account && webhook);
}

export async function xflowFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    throw new Error("Xflow request failed");
  }
  return body as T;
}

export type KitIntent = {
  id: string;
  status?: string;
  metadata?: Record<string, string> | null;
  payment_method_details?: { upi?: { intent_url?: string } };
};
