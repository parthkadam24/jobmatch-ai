import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobAPI, applicationAPI, aiAPI } from "../services/api";

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [applyMessage, setApplyMessage] = useState("");
    const [applyError, setApplyError] = useState("");
    const [applying, setApplying] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = user?.role;

    // Fetch job details
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await jobAPI.getById(id);
                setJob(res.data);
            } catch (err) {
                setError("Job not found or failed to load.");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    // Check if already applied (only for candidates)
       // Check if already applied (only for candidates)
    useEffect(() => {
        // Reset state when navigating to a new job
        setAlreadyApplied(false);
        setApplyMessage("");
        setApplyError("");

        const checkApplication = async () => {
            if (role !== "CANDIDATE") return;
            try {
                const res = await applicationAPI.myApplications();
                const hasApplied = res.data.some(
                    (app) => app.job?.id === parseInt(id)
                );
                setAlreadyApplied(hasApplied);
            } catch (err) {
                setAlreadyApplied(false);
            }
        };
        checkApplication();
    }, [id, role]);

    const handleApply = async () => {
        setApplyMessage("");
        setApplyError("");
        setApplying(true);

        try {
            await applicationAPI.apply(parseInt(id));
            setApplyMessage("Application submitted successfully!");
            setAlreadyApplied(true);
        } catch (err) {
            setApplyError(
                err.response?.data || "Failed to apply. Try again later."
            );
        } finally {
            setApplying(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading">Loading job details...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="container">
                    <div className="alert alert-error">{error}</div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/jobs")}
                    >
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    const skills = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: "800px" }}>
                <button
                    className="btn btn-secondary mb-4"
                    onClick={() => navigate("/jobs")}
                >
                    ← Back to Jobs
                </button>

                <div className="card">
                    <h1 className="card-title" style={{ fontSize: "26px" }}>
                        {job.title}
                    </h1>
                    <p
                        className="card-subtitle"
                        style={{ fontSize: "16px", marginTop: "6px" }}
                    >
                        {job.company} · {job.location} · {job.salary}
                    </p>

                    <hr
                        style={{
                            margin: "20px 0",
                            border: "none",
                            borderTop: "1px solid #e2e8f0",
                        }}
                    />

                    <h3 style={{ marginBottom: "10px" }}>Job Description</h3>
                    <p className="card-description" style={{ fontSize: "15px" }}>
                        {job.description}
                    </p>

                    <h3
                        style={{
                            marginTop: "24px",
                            marginBottom: "10px",
                        }}
                    >
                        Required Skills
                    </h3>
                    <div>
                        {skills.map((skill, i) => (
                            <span key={i} className="badge">
                                {skill}
                            </span>
                        ))}
                    </div>

                    <hr
                        style={{
                            margin: "24px 0",
                            border: "none",
                            borderTop: "1px solid #e2e8f0",
                        }}
                    />

                    {applyMessage && (
                        <div className="alert alert-success">{applyMessage}</div>
                    )}
                    {applyError && (
                        <div className="alert alert-error">{applyError}</div>
                    )}

                    {role === "CANDIDATE" && (
                        <div>
                            {alreadyApplied ? (
                                <button
                                    className="btn btn-secondary btn-block"
                                    disabled
                                    style={{ padding: "14px" }}
                                >
                                    ✓ Already Applied
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={handleApply}
                                    disabled={applying}
                                    style={{ padding: "14px", fontSize: "16px" }}
                                >
                                    {applying ? "Applying..." : "Apply Now"}
                                </button>
                            )}
                        </div>
                    )}

                    {role === "RECRUITER" && (
                        <div className="alert alert-info">
                            You are viewing this job as a recruiter.
                        </div>
                    )}

                    {!user && (
                        <div className="alert alert-info">
                            Please{" "}
                            <a href="/login" style={{ fontWeight: "600" }}>
                                login
                            </a>{" "}
                            as a candidate to apply.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobDetail;