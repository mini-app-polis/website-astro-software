/**
 * Base URL of the API: PUBLIC_API_URL at build time, the page's
 * data-api-url attribute in the browser. Empty when unset.
 */
export function getApiBase(): string {
  if (typeof document === "undefined") {
    return (import.meta.env.PUBLIC_API_URL as string | undefined) ?? "";
  }
  return document.documentElement.dataset.apiUrl ?? "";
}

/**
 * GET a path on the API and return its `data` field, or `fallback` when
 * the base is unset, the request fails or the response has no data.
 * Never throws.
 */
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
