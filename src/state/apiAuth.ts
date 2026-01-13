import type {Session} from "./session";

const URL_BACKEND = import.meta.env.VITE_URL_BACKEND;

export const ApiAuth = {
    login: async (username: string, password: string): Promise<Session> => {
        const res = await fetch(`${URL_BACKEND}/api/v1/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Identifiants invalides");
        }

        const data = await res.json();

        if (!data.token) {
            throw new Error("Token manquant dans la réponse");
        }

        // On retourne l'objet Session formatté
        return {
            token: data.token,
            user: data.user || { id: 0, username: username, role: "Soldat" },
            permissions: data.permissions || []
        };
    }
};