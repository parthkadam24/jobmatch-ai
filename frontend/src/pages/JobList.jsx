import { useState, useEffect } from "react";
import { jobAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

function JobList() {
    const navigate = useNavigate();   // ← Moved INSIDE the function

    const [jobs, setJobs] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchJobs = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await jobAPI.getAll();
            setJobs(response.data);
        } catch (err) {
            setError("Failed to load jobs. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) {
            fetchJobs();
            return;
        }
        setLoading(true);
        try {
            const response = await jobAPI.search(keyword);
            setJobs(response.data);
        } catch (err) {
            setError("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <h1 className="page-title">Available Jobs</h1>

                <form onSubmit={handleSearch} className="row mb-4">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search jobs by title or description..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ flex: 1, minWidth: "220px" }}
                    />
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                    {keyword && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setKeyword("");
                                fetchJobs();
                            }}
                        >
                            Clear
                        </button>
                    )}
                </form>

                {error && <div className="alert alert-error">{error}</div>}

                {loading ? (
                    <div className="loading">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="empty-state">
                        <h3>No jobs found</h3>
                        <p className="mt-2">
                            {keyword ? "Try a different keyword." : "Check back soon!"}
                        </p>
                    </div>
                ) : (
                    <div>
                        {jobs.map((job) => (
                            <div key={job.id} className="card">
                                <h3 className="card-title">{job.title}</h3>
                                <p className="card-subtitle">
                                    {job.company} · {job.location} · {job.salary}
                                </p>
                                <p className="card-description">
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

                                <div className="row">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                    >
                                        View & Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobList;