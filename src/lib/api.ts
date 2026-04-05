import { logger } from "./logger";

export function getApiBase(): string {
  if (typeof document === "undefined") {
    const url = import.meta.env.PUBLIC_API_URL as string | undefined;
    logger.info("api", "resolved SSR base URL", { baseUrl: url ?? "" });
    return url ?? "";
  }
  return document.documentElement.dataset.apiUrl ?? "";
}

export async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const base = getApiBase();
    if (!base) {
      logger.warn("api", "missing base URL; returning fallback", { path });
      return fallback;
    }
    const url = `${base}${path}`;
    logger.info("api", "fetching API path", { path, url });
    const res = await fetch(url);
    if (!res.ok) {
      logger.warn("api", "received non-OK response; returning fallback", {
        path,
        status: res.status,
      });
      return fallback;
    }
    const json = await res.json();
    return ((json && "data" in json ? json.data : undefined) ?? fallback) as T;
  } catch (e) {
    logger.error("api", "API fetch failed; returning fallback", {
      path,
      error: e instanceof Error ? e.message : String(e),
    });
    return fallback;
  }
}
