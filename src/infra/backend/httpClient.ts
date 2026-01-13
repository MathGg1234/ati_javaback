// src/api/httpClient.ts

const BASE = (import.meta.env.VITE_URL_BACKEND as string | undefined) ?? "/backend";

export type HttpOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    token?: string;
    body?: unknown;
    headers?: Record<string, string>;
    // si tu veux désactiver le cache bust ponctuellement
    noCacheBust?: boolean;
};

function joinUrl(base: string, path: string): string {
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
}

function withTs(url: string): string {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}_ts=${Date.now()}`;
}

function shortToken(token?: string): string {
    if (!token) return "";
    if (token.length <= 16) return token;
    return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

/**
 * ✅ API générique
 */
export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
    const method = options.method ?? "GET";
    const token = options.token;

    let url = joinUrl(BASE, path);

    // ✅ IMPORTANT: cache bust uniquement pour GET (proxy/browser)
    if (method === "GET" && !options.noCacheBust) {
        url = withTs(url);
    }

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options.headers ?? {}),
    };

    // ✅ Anti-cache côté HTTP (utile avec certains proxies)
    headers["Cache-Control"] = "no-store, no-cache, max-age=0";
    headers["Pragma"] = "no-cache";

    // ✅ Standard backend: Bearer
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const init: RequestInit = {
        method,
        headers,
        cache: "no-store", // ✅ important
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(options.body);
    }

    console.log(`[HTTP] ${method} ${BASE}${path} token=${shortToken(token)}`);

    const res = await fetch(url, init);

    // 204 = no content
    if (res.status === 204) return undefined as T;

    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text().catch(() => "");

    if (!res.ok) {
        console.error(`[HTTP ERROR] ${method} ${BASE}${path} status=${res.status} body=`, text);
        throw new Error(`HTTP ${res.status} on ${path}`);
    }

    if (contentType.includes("application/json")) {
        // si jamais le backend renvoie vide mais JSON
        if (!text) return undefined as T;
        return JSON.parse(text) as T;
    }

    return text as unknown as T;
}

/**
 * ✅ Helpers modernes
 */
export function httpGet<T>(path: string, token?: string): Promise<T> {
    return http<T>(path, { method: "GET", token });
}

export function httpPost<T>(path: string, body: unknown, token?: string): Promise<T> {
    return http<T>(path, { method: "POST", token, body });
}

export function httpPut<T>(path: string, body: unknown, token?: string): Promise<T> {
    return http<T>(path, { method: "PUT", token, body });
}

export function httpDelete<T>(path: string, token?: string): Promise<T> {
    return http<T>(path, { method: "DELETE", token });
}
