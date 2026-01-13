const URL_BACKEND = import.meta.env.VITE_URL_BACKEND as string | undefined;

if (!URL_BACKEND) {
    throw new Error("Missing VITE_URL_BACKEND in .env");
}

export async function http<T>(
    path: string,
    opts: {
        method?: "GET" | "POST" | "PUT" | "DELETE";
        token?: string;
        body?: unknown;
    } = {}
): Promise<T> {
    const url = `${URL_BACKEND}${path}`;
    const method = opts.method ?? "GET";



    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[HTTP ERROR]", method, url, "status=", res.status, "body=", text);
        throw new Error(`HTTP ${res.status}`);
    }



    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
}
