import { useNavigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage.tsx";

/**
 * Wrapper autour de LoginPage pour gérer la redirection après login
 */
export default function LoginPageWrapper() {
    const navigate = useNavigate();

    // Callback appelé par LoginPage après succès login
    const handleLogin = () => {
        // Redirige vers /Home après login
        navigate("/Home", { replace: true });
    };

    return <LoginPage onLogin={handleLogin} />;
}
