// src/ui/pages/CorePage.tsx
import { useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../../state/session";

import { CoreApp } from "../core/CoreApp";

export function CorePage() {
    const navigate = useNavigate();
    const session = getSession();

    const logout = () => {
        clearSession();
        navigate("/login", { replace: true });
    };

    if (!session) return null;

    const { user, token } = session;

    return (
        <div
            style={{
                height: "100dvh",
                width: "100%",
                overflow: "hidden",
            }}
        >
            <CoreApp
                userLabel={`${user.username} (${user.role})`}
                onLogout={logout}
                token={token}
            />
        </div>
    );
}
