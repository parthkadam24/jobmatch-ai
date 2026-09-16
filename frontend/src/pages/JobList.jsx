import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI, aiAPI, resumeAPI } from "../services/api";

function JobList() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [matchScores, setMatchScores] = useState({});
    const [hasResume, setHasResume] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = user?.role;

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

    // Fetch match scores if user is candidate with parsed resume
    useEffect(() => {
        const fetchMatches = async () => {
            if (role !== "CANDIDATE" || jobs.length === 0) return;

            try {
                const resumeRes = await resumeAPI.myResume();
                const resume = resumeRes.data;

                if (!resume || !resume.skills) {
                    setHasResume(false);
                    return;
                }

                setHasResume(true);
                const candidateId = resume.candidate?.id;

                if (!candidateId) return;

                const scores = {};
                for (const job of jobs) {
                    try {
                        const matchRes = await aiAPI.matchScore(job.id, candidateId);
                        scores[job.id] = matchRes.data;
                    } catch (err) {
                        // Skip jobs with no match
                    }
                }
                setMatchScores(scores);
            } catch (err) {
                setHasResume(false);
            }
        };

        fetchMatches();
    }, [jobs, role]);

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

    const getMatchColor = (score) => {
        if (score >= 80) return "badge badge-success";
        if (score >= 60) return "badge badge-info";
        if (score >= 40) return "badge badge-warning";
        return "badge badge-danger";
    };

    return (
        <div className="page">
            <div className="container">
                <h1 className="page-title">Available Jobs</h1>

                {role === "CANDIDATE" && !hasResume && (
                    <div className="alert alert-info">
                        💡 Upload and parse your resume to see AI-powered match
                        scores!{" "}
                        <a
                            href="/my-resume"
                            style={{ fontWeight: "600", marginLeft: "6px" }}
                        >
                            Upload Now →
                        </a>
                    </div>
                )}

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
                        {jobs.map((job) => {
                            const match = matchScores[job.id];
                            return (
                                <div key={job.id} className="card">
                                    <div className="row-between">
                                        <div style={{ flex: 1 }}>
                                            <h3 className="card-title">{job.title}</h3>
                                            <p className="card-subtitle">
                                                {job.company} · {job.location} ·{" "}
                                                {job.salary}
                                            </p>
                                        </div>
                                        {match && (
                                            <span className={getMatchColor(match.score)}>
                                                🎯 {match.score}% Match
                                            </span>
                                        )}
                                    </div>

                                    <p className="card-description">
                                        {job.description?.substring(0, 180)}
                                        {job.description?.length > 180 ? "..." : ""}
                                    </p>

                                    <div className="mb-2">
                                        {job.skills &&
                                            job.skills
                                                .split(",")
                                                .map((skill, i) => (
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobList;