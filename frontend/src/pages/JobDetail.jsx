import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobAPI, applicationAPI, aiAPI, resumeAPI } from "../services/api";

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
    const [matchData, setMatchData] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = user?.role;

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

    useEffect(() => {
        // Reset state when job changes
        setAlreadyApplied(false);
        setApplyMessage("");
        setApplyError("");
        setMatchData(null);

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

        const fetchMatchScore = async () => {
            if (role !== "CANDIDATE") return;
            try {
                const resumeRes = await resumeAPI.myResume();
                const resume = resumeRes.data;
                if (!resume || !resume.skills) return;

                const candidateId = resume.candidate?.id;
                if (!candidateId) return;

                const matchRes = await aiAPI.matchScore(id, candidateId);
                setMatchData(matchRes.data);
            } catch (err) {
                // No match available
            }
        };

        checkApplication();
        fetchMatchScore();
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

    const getScoreColor = (score) => {
        if (score >= 80) return "#22c55e";
        if (score >= 60) return "#3b82f6";
        if (score >= 40) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: "800px" }}>
                <button
                    className="btn btn-secondary mb-4"
                    onClick={() => navigate("/jobs")}
                >
                    ← Back to Jobs
                </button>

                {/* MATCH SCORE */}
                {matchData && (
                    <div
                        className="card"
                        style={{
                            background:
                                "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
                            borderLeft: "4px solid #4f46e5",
                        }}
                    >
                        <div className="row-between">
                            <div style={{ flex: 1 }}>
                                <h3
                                    className="card-title"
                                    style={{ color: "#4f46e5" }}
                                >
                                    🎯 AI Match Score
                                </h3>
                                <p className="card-subtitle">
                                    {matchData.recommendation}
                                </p>
                            </div>
                            <div
                                style={{
                                    fontSize: "36px",
                                    fontWeight: "800",
                                    color: getScoreColor(matchData.score),
                                    marginLeft: "16px",
                                }}
                            >
                                {matchData.score}%
                            </div>
                        </div>

                        {matchData.matched && matchData.matched.length > 0 && (
                            <>
                                <hr
                                    style={{
                                        margin: "16px 0",
                                        border: "none",
                                        borderTop: "1px solid #e2e8f0",
                                    }}
                                />
                                <h4
                                    style={{
                                        marginBottom: "8px",
                                        fontSize: "14px",
                                        color: "#166534",
                                    }}
                                >
                                    ✅ Matching Skills ({matchData.matched.length})
                                </h4>
                                <div>
                                    {matchData.matched.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="badge badge-success"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}

                        {matchData.missing && matchData.missing.length > 0 && (
                            <>
                                <h4
                                    style={{
                                        marginTop: "16px",
                                        marginBottom: "8px",
                                        fontSize: "14px",
                                        color: "#991b1b",
                                    }}
                                >
                                    📚 Skills to Learn ({matchData.missing.length})
                                </h4>
                                <div>
                                    {matchData.missing.map((skill, i) => (
                                        <span key={i} className="badge badge-danger">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* JOB DETAILS */}
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

                    <h3 style={{ marginTop: "24px", marginBottom: "10px" }}>
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
                </div>
            </div>
        </div>
    );
}

export default JobDetail;