import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import robotImage from "../assets/robot.jpg";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            const token = response.data.token;

            localStorage.setItem("token", token);

            const payload = JSON.parse(atob(token.split(".")[1]));
            localStorage.setItem(
                "user",
                JSON.stringify({
                    email: payload.sub,
                    role: payload.role || "CANDIDATE",
                })
            );

            navigate("/jobs");
            window.location.reload();
        } catch (err) {
            setError(
                err.response?.data || "Login failed. Check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated background orbs */}
            <div className="login-bg">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
            </div>

            <div className="login-container">
                {/* LEFT: Brand panel */}
                <div className="login-brand">
                    <div className="brand-logo">
                        JobMatch <span>AI</span>
                    </div>

                    <h1 className="brand-title">
                        Find your dream job
                        <br />
                        with the <span className="brand-gradient">power of AI</span>
                    </h1>

                    <p className="brand-subtitle">
                        The intelligent platform that matches your skills with
                        the right opportunities.
                    </p>

                    <div className="brand-image-wrapper">
                        <img
                            src={robotImage}
                            alt="AI Robot"
                            className="brand-image"
                        />
                    </div>

                    <div className="brand-features">
                        <div className="feature-item">
                            <span className="feature-icon">🎯</span>
                            <div>
                                <strong>AI Match Scoring</strong>
                                <p>See instant % match for every job</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <span className="feature-icon">📄</span>
                            <div>
                                <strong>Resume Parsing</strong>
                                <p>Auto-extract skills from your PDF</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <span className="feature-icon">✨</span>
                            <div>
                                <strong>Cover Letters</strong>
                                <p>AI-generated, personalized for each job</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <span className="feature-icon">📊</span>
                            <div>
                                <strong>Smart Tracking</strong>
                                <p>Real-time application status updates</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Login card */}
                <div className="login-form-side">
                    <div className="login-card">
                        <div className="login-card-header">
                            <h2 className="welcome-title">
                                Welcome <span>back</span>
                            </h2>
                            <div className="welcome-underline"></div>
                            <p className="welcome-subtitle">
                                Sign in to continue to your JobMatch AI account
                            </p>
                        </div>

                        {error && (
                            <div className="login-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="login-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-link">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="login-btn"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="login-divider">
                            <span>New to JobMatch AI?</span>
                        </div>

                        <Link to="/register" className="register-btn">
                            Create Account →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;