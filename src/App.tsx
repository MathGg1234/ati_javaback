import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { RequireAuth } from "./security/RequireAuth";
import { getSession } from "./state/session";
import LoginPageWrapper from "./login/LoginPageWrapper.tsx";

export default function App() {
    const session = getSession();

    return (
        <Routes>
            {/* Page de login */}
            <Route path="/login" element={<LoginPageWrapper />} />

            {/* Home protégée */}
            <Route
                path="/Home"
                element={
                    <RequireAuth>
                        <HomePage />
                    </RequireAuth>
                }
            />

            {/* Racine : localhost:{PORT} */}
            <Route
                path="/"
                element={<Navigate to={session?.token ? "/Home" : "/login"} replace />}
            />

            {/* Fallback */}
            <Route
                path="*"
                element={<Navigate to={session?.token ? "/Home" : "/login"} replace />}
            />
        </Routes>
    );
}