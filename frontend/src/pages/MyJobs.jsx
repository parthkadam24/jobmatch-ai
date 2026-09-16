import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI, applicationAPI } from "../services/api";

function MyJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [applicantCounts, setApplicantCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchJobs = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await jobAPI.myJobs();
            setJobs(res.data);

            // Fetch applicant counts for each job
            const counts = {};
            for (const job of res.data) {
                try {
                    const applicantsRes = await applicationAPI.getApplicants(job.id);
                    counts[job.id] = applicantsRes.data.length;
                } catch (err) {
                    counts[job.id] = 0;
                }
            }
            setApplicantCounts(counts);
        } catch (err) {
            setError("Failed to load your jobs. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (jobId, jobTitle) => {
        if (!window.confirm(`Delete "${jobTitle}"? This cannot be undone.`)) {
            return;
        }

        setSuccess("");
        setError("");

        try {
            await jobAPI.delete(jobId);
            setSuccess("Job deleted successfully.");
            fetchJobs();
        } catch (err) {
            setError(err.response?.data || "Failed to delete job.");
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading">Loading your jobs...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="row-between mb-4">
                    <h1 className="page-title" style={{ marginBottom: 0 }}>
                        My Jobs
                    </h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/post-job")}
                    >
                        + Post New Job
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {jobs.length === 0 ? (
                    <div className="empty-state">
                        <h3>You haven't posted any jobs yet</h3>
                        <p className="mt-2" style={{ marginBottom: "16px" }}>
                            Post your first job opening to start receiving applicants.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/post-job")}
                        >
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div>
                        {jobs.map((job) => {
                            const count = applicantCounts[job.id] ?? "…";
                            return (
                                <div key={job.id} className="card">
                                    <div className="row-between">
                                        <div style={{ flex: 1 }}>
                                            <h3 className="card-title">{job.title}</h3>
                                            <p className="card-subtitle">
                                                {job.company} · {job.location} · {job.salary}
                                            </p>
                                        </div>
                                        <span className="badge badge-info">
                                            {count} applicant{count === 1 ? "" : "s"}
                                        </span>
                                    </div>

                                    <p
                                        className="card-description"
                                        style={{ marginTop: "10px" }}
                                    >
                                        {job.description?.substring(0, 180)}
                                        {job.description?.length > 180 ? "..." : ""}
                                    </p>

                                    <div className="mb-2">
                                        {job.skills &&
                                            job.skills.split(",").map((skill, i) => (
                                                <span key={i} className="badge">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                    </div>

                                    <div className="row mt-4">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/jobs/${job.id}`)}
                                        >
                                            View Job
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(job.id, job.title)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyJobs;