import type {ReactNode} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../state/session";

export function RequireAuth({ children }: { children: ReactNode }) {
    const session = getSession();
    const location = useLocation();

    if (!session?.token) {
        console.log("Le token n'est pas bon " + session?.token)
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
}

