import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/jobs" className="navbar-logo">
                    JobMatch <span>AI</span>
                </Link>

                <div className="navbar-links">
                    {token ? (
                        <>
                            <Link to="/jobs">Jobs</Link>
                            {user?.role === "CANDIDATE" && (
                                <>
                                    <Link to="/my-applications">My Applications</Link>
                                    <Link to="/my-resume">My Resume</Link>
                                </>
                            )}
                            {user?.role === "RECRUITER" && (
                                <>
                                    <Link to="/post-job">Post Job</Link>
                                    <Link to="/my-jobs">My Jobs</Link>
                                </>
                            )}
                            <span className="navbar-user">{user?.email}</span>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;