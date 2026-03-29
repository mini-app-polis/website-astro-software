export function getApiBase(): string {
  if (typeof document === "undefined") {
    const url = import.meta.env.PUBLIC_API_URL as string | undefined;
    console.log("[api] SSR base URL:", url);
    return url ?? "";
  }
  return document.documentElement.dataset.apiUrl ?? "";
}

export async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const base = getApiBase();
    if (!base) {
      console.warn("[api] no base URL, returning fallback for", path);
      return fallback;
    }
    console.log("[api] fetching:", `${base}${path}`);
    const res = await fetch(`${base}${path}`);
    if (!res.ok) {
      console.warn("[api] bad response:", res.status, path);
      return fallback;
    }
    const json = await res.json();
    return ((json && "data" in json ? json.data : undefined) ?? fallback) as T;
  } catch (e) {
    console.error("[api] error:", e, path);
    return fallback;
  }
}
