import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CANDIDATE");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authAPI.register({
                fullName,
                email,
                password,
                role,
            });

            const token = response.data.token;
            localStorage.setItem("token", token);

            const payload = JSON.parse(atob(token.split(".")[1]));
            localStorage.setItem("user", JSON.stringify({
                email: payload.sub,
                role: role,
            }));

            navigate("/jobs");
            window.location.reload();
        } catch (err) {
            setError(err.response?.data || "Registration failed. Try a different email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join JobMatch AI today</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">I am a...</label>
                    <select
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="CANDIDATE">Candidate (looking for jobs)</option>
                        <option value="RECRUITER">Recruiter (posting jobs)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-block mt-4"
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            <p className="text-center mt-4" style={{ fontSize: "14px" }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;