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
  set_id: string;
  set_date: string;
  venue: string;
  play_order: number | null;
  play_time: string | null;
  label: string | null;
  title: string;
  remix: string | null;
  artist: string;
  comment: string | null;
  genre: string | null;
  bpm: number | null;
  release_year: number | null;
  length_secs: number | null;
  data_quality: string;
  catalog_id: string | null;
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

export function getApiBase(): string {
  if (typeof document === "undefined") {
    const url = import.meta.env.PUBLIC_API_URL as string | undefined;
    console.log("[api] SSR base URL:", url);
    return url ?? "";
  }
  return document.documentElement.dataset.apiUrl ?? "";
}

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
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

export interface SpotifyPlaylist {
  id: string;
  name: string;
  spotify_url: string | null;
  tracks_total: number | null;
  snapshot_id: string | null;
}

export const getPlaylists = () =>
  apiFetch<SpotifyPlaylist[]>("/v1/spotify/playlists", []);

