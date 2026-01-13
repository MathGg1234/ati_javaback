import {useEffect, useState} from "react";
import {Shield, Lock, User} from "lucide-react";
import "./css/LoginPage.css";
import {setSession} from "../state/session.ts";
import {ApiAuth} from "../state/apiAuth.ts";

type Props = {
    onLogin: () => void;
};

export default function LoginPage({onLogin}: Props) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const sessionData = await ApiAuth.login(identifier, password);
            setSession(sessionData);
            onLogin();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="loginRoot">
            {/* Background topo */}
            <div className="loginTopo" aria-hidden="true">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern
                            id="topographic"
                            x="0"
                            y="0"
                            width="120"
                            height="120"
                            patternUnits="userSpaceOnUse"
                        >
                            <path d="M10,14 Q35,6 60,14 T110,14" stroke="currentColor" fill="none" strokeWidth="0.7"/>
                            <path d="M8,36 Q40,50 70,36 T118,36" stroke="currentColor" fill="none" strokeWidth="0.6"/>
                            <path d="M12,58 Q30,72 58,58 T112,58" stroke="currentColor" fill="none" strokeWidth="0.6"/>
                            <path d="M8,80 Q28,92 55,80 T118,80" stroke="currentColor" fill="none" strokeWidth="0.55"/>
                            <path d="M10,102 Q35,95 62,102 T110,102" stroke="currentColor" fill="none"
                                  strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#topographic)"/>
                </svg>
            </div>

            <div className="loginWrap">
                {/* Left panel */}
                <section className="loginInfo">
                    <div className="brand">
                        <div className="brandIcon"><Shield/></div>
                        <div className="brandText">
                            <h1>Assistant Tactique Intelligent</h1>
                            <p>Accès sécurisé • Interface opérationnelle durcie</p>
                        </div>
                    </div>

                    <div className="infoCards">
                        <div className="infoCard">
                            <div className="dot"/>
                            <div>
                                <div className="infoTitle">Chiffrement AES-256</div>
                                <div className="infoSub">Transport + stockage session renforcés</div>
                            </div>
                        </div>
                        <div className="infoCard">
                            <div className="dot"/>
                            <div>
                                <div className="infoTitle">Cartographie temps réel</div>
                                <div className="infoSub">Surcouches tactiques & itinéraires</div>
                            </div>
                        </div>
                        <div className="infoCard">
                            <div className="dot"/>
                            <div>
                                <div className="infoTitle">Communications sécurisées</div>
                                <div className="infoSub">Canaux, messages rapides, audit</div>
                            </div>
                        </div>
                        <div className="infoCard">
                            <div className="dot"/>
                            <div>
                                <div className="infoTitle">Mode dégradé</div>
                                <div className="infoSub">File d'attente hors-ligne & resync</div>
                            </div>
                        </div>
                    </div>

                    <div className="leftFooter">
                        <div className="statusPill">
                            <span className={`statusDot ${isOnline ? "ok" : "ko"}`}/>
                            <span>{isOnline ? "Réseau disponible" : "Hors-ligne détecté"}</span>
                        </div>
                        <div className="mutedSmall">Version UI • Hardened theme</div>
                    </div>
                </section>

                {/* Right card */}
                <section className="loginCard">
                    <div className="mobileBrand">
                        <div className="brandIcon"><Shield/></div>
                        <div className="brandText">
                            <h2>Connexion sécurisée</h2>
                            <p>Accès réservé au personnel autorisé</p>
                        </div>
                    </div>

                    <header className="cardHeader">
                        <h2>Connexion sécurisée</h2>
                        <p>Accès réservé au personnel autorisé</p>
                    </header>

                    <form onSubmit={handleSubmit} className="form">
                        <div className="field">
                            <label htmlFor="identifier">Identifiant</label>
                            <div className="control">
                                <User className="controlIcon"/>
                                <input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="ID Opérateur"
                                    autoComplete="username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="password">Mot de passe</label>
                            <div className="control">
                                <Lock className="controlIcon"/>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="alertError" role="alert">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading || !isOnline} className="btnPrimary">
                            {loading ? "CONNEXION..." : "SE CONNECTER"}
                        </button>
                    </form>

                    <footer className="cardFooter">
                        <div className="netRow">
                            <span className={`netDot ${isOnline ? "ok" : "ko"}`}/>
                            <span className="netText">Connexion sécurisée – Chiffrement militaire</span>
                        </div>
                    </footer>
                </section>
            </div>
        </div>
    );
}