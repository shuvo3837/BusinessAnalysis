/**
 * API base URL resolution.
 *
 * - In dev: Vite proxies `/api` → http://localhost:3000 (configured below if needed)
 * - On Vercel: the static SPA calls `/api/...`, which 404s because Vercel doesn't
 *   run the Express backend. VITE_API_BASE_URL is set in the Render deployment
 *   to point at the Render-hosted Express server. When that env var is present,
 *   all API calls go to Render instead of the page's origin.
 *
 * If neither env nor dev proxy is set we fall back to a same-origin fetch, which
 * works when the SPA and the Express server share a host (Render production).
 */
const configuredBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

export const API_BASE: string = (() => {
  if (configuredBase && configuredBase.length > 0) {
    return configuredBase.replace(/\/$/, "");
  }
  return ""; // same-origin relative path
})();

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, init);
  // Helpful diagnostic when the host returns an HTML error page instead of JSON.
  const ct = res.headers.get("content-type") ?? "";
  if (!res.ok || !ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    if (!text || text.trim() === "") {
      throw new Error(
        `Empty response from ${url} (status ${res.status}). ` +
          `Is the backend reachable? Set VITE_API_BASE_URL in your build env.`
      );
    }
  }
  return res;
}

export async function apiJson<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await apiFetch(path, init);
  let data: T;
  try {
    data = (await res.json()) as T;
  } catch (e) {
    throw new Error(
      `Backend returned non-JSON from ${path} (status ${res.status}). ` +
        `Likely the API host is unreachable — check VITE_API_BASE_URL.`
    );
  }
  if (!res.ok) {
    throw new Error((data as any)?.error || `Request failed: ${res.status}`);
  }
  return data;
}
