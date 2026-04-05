export function getApiBase(): string {
  if (typeof document === "undefined") {
    return (import.meta.env.PUBLIC_API_URL as string | undefined) ?? "";
  }
  return document.documentElement.dataset.apiUrl ?? "";
}

export async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const base = getApiBase();
    if (!base) return fallback;
    const res = await fetch(`${base}${path}`);
    if (!res.ok) return fallback;
    const json = await res.json();
    return ((json && "data" in json ? json.data : undefined) ?? fallback) as T;
  } catch {
    return fallback;
  }
}
