import {clearSession, getSession} from "../state/session";
import {useNavigate} from "react-router-dom";
import {CoreApp} from "../ui/core/CoreApp.tsx";


import {useEffect} from "react";
import {testPointCarteFetch} from "../usecases/dev/testPointCarteFetch";


export function HomePage() {
    const navigate = useNavigate();
    const session = getSession();

    const logout = () => {
        clearSession();
        navigate("/login", {replace: true});
    };

    if (!session) return null;

    const {user} = session;

    useEffect(() => {
        testPointCarteFetch(session.token).catch((e) => console.error("[TEST] fetch failed:", e));
    }, [session.token]);

    console.log("HomePage rendered");
    console.log("user:", user);
    console.log("session:", session);
    console.log("token:", session.token);

    return (
        <div
            style={{
                height: "100dvh",
                width: "100%",
                overflow: "hidden",
            }}
        >
            <CoreApp
                token={session.token}
                userLabel={`${user.username} (${user.role})`}
                onLogout={logout}
            />
        </div>
    );
}