export interface StatsOverview {
  total_sets: number;
  total_plays: number;
  unique_tracks: number;
  years_active: number;
  most_played_artist: string;
}

export interface SetListItem {
  id: string;
  set_date: string;
  year: number;
  venue: string;
  source_file: string | null;
  // Some API versions include this; keep it optional for compatibility.
  track_count?: number;
}

export interface TrackListItem {
  id: string;
  play_order: number | null;
  title: string;
  artist: string;
  genre: string | null;
  bpm: number | null;
  release_year: number | null;
  length_secs: number | null;
  data_quality: string;
}

export interface SetDetail extends SetListItem {
  tracks: TrackListItem[];
}

export interface ArtistStat {
  artist: string;
  play_count: number;
}

export interface TrackStat {
  title: string;
  artist: string;
  play_count: number;
}

export interface ByYear {
  year: number;
  set_count: number;
  track_count: number;
}

function getBaseUrl(): string | undefined {
  // Client-side: read from DOM where Base.astro exposes the environment value.
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.dataset.apiUrl;
    if (fromDom) return fromDom;
  }

  // Server-side: fall back to Astro build-time environment when available.
  const env = (import.meta as any).env?.PUBLIC_API_URL as
    | string
    | undefined;
  return env;
}

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const base = getBaseUrl();
    if (!base) return fallback;
    const res = await fetch(`${base}${path}`);
    if (!res.ok) return fallback;
    const json = await res.json();
    return ((json && "data" in json ? json.data : undefined) ??
      fallback) as T;
  } catch {
    return fallback;
  }
}

export const getOverview = () =>
  apiFetch<StatsOverview>("/v1/stats/overview", {
    total_sets: 0,
    total_plays: 0,
    unique_tracks: 0,
    years_active: 0,
    most_played_artist: "",
  });

export const getSets = (params: Record<string, string | number> = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const query = qs ? `?${qs}` : "";
  return apiFetch<SetListItem[]>(`/v1/sets${query}`, []);
};

export const getSetDetail = (id: string) =>
  apiFetch<SetDetail | null>(`/v1/sets/${id}`, null);

export const getTopArtists = (limit = 20) =>
  apiFetch<ArtistStat[]>(`/v1/stats/top-artists?limit=${limit}`, []);

export const getTopTracks = (limit = 20) =>
  apiFetch<TrackStat[]>(`/v1/stats/top-tracks?limit=${limit}`, []);

export const getByYear = () => apiFetch<ByYear[]>("/v1/stats/by-year", []);

