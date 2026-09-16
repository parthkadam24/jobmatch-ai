import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applicationAPI } from "../services/api";

function MyApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchApplications = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await applicationAPI.myApplications();
            setApplications(res.data);
        } catch (err) {
            setError("Failed to load applications. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

   const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) {
        return;
    }

    setSuccess("");
    setError("");

    try {
        await applicationAPI.withdraw(applicationId);
        setSuccess("Application withdrawn successfully.");
        // Refresh the list
        fetchApplications();
    } catch (err) {
        setError(err.response?.data || "Failed to withdraw application.");
    }
};

    const getStatusBadge = (status) => {
        const statusMap = {
            APPLIED: "badge badge-info",
            SHORTLISTED: "badge badge-warning",
            HIRED: "badge badge-success",
            REJECTED: "badge badge-danger",
        };
        return statusMap[status] || "badge";
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading">Loading applications...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <h1 className="page-title">My Applications</h1>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {applications.length === 0 ? (
                    <div className="empty-state">
                        <h3>No applications yet</h3>
                        <p className="mt-2" style={{ marginBottom: "16px" }}>
                            You haven't applied to any jobs yet.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/jobs")}
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div>
                        {applications.map((app) => (
                            <div key={app.id} className="card">
                                <div className="row-between">
                                    <div style={{ flex: 1 }}>
                                        <h3 className="card-title">
                                            {app.job?.title || "Job"}
                                        </h3>
                                        <p className="card-subtitle">
                                            {app.job?.company} · {app.job?.location} ·{" "}
                                            {app.job?.salary}
                                        </p>
                                    </div>
                                    <span className={getStatusBadge(app.status)}>
                                        {app.status}
                                    </span>
                                </div>

                                <p
                                    className="card-description"
                                    style={{ marginTop: "10px" }}
                                >
                                    {app.job?.description?.substring(0, 150)}
                                    {app.job?.description?.length > 150 ? "..." : ""}
                                </p>

                                <div className="row-between mt-4">
                                    <small style={{ color: "#718096" }}>
                                        Applied on{" "}
                                        {app.appliedAt
                                            ? new Date(app.appliedAt).toLocaleDateString()
                                            : "N/A"}
                                    </small>

                                    <div className="row">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/jobs/${app.job?.id}`)}
                                        >
                                            View Job
                                        </button>
                                        {app.status === "APPLIED" && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleWithdraw(app.id)}
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyApplications;