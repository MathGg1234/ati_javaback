export type Role = "PC" | "A400M" | "CDS" | "Soldat";

export type Session = {
    token: string;
    user: {
        id: number;
        username: string;
        role: Role;
    };
    permissions: string[];
};

const KEY = "session";

export function setSession(session: Session) {
    localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as Session;
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(KEY);
}
