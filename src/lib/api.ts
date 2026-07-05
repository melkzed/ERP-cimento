async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Erro ${res.status} ao chamar a API.`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T = { id: number }>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) =>
    request<{ ok: boolean }>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request<{ ok: boolean }>(path, { method: "DELETE" })
};

export const brl = (n: number | null | undefined) =>
  n == null
    ? "—"
    : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Abreviação para compor SKUs automaticamente: remove acentos e símbolos.
// "Couro sintético" -> "COU", "GG" -> "GG", "42" -> "42"
export const abrevia = (s: string, len = 3) => {
  const limpo = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  return /^\d+$/.test(limpo) || limpo.length <= len ? limpo : limpo.slice(0, len);
};
