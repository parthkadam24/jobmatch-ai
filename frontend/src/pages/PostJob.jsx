import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../services/api";

function PostJob() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        company: "",
        description: "",
        skills: "",
        location: "",
        salary: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await jobAPI.create(form);
            setSuccess("Job posted successfully! Redirecting...");
            setTimeout(() => navigate("/jobs"), 1500);
        } catch (err) {
            setError(
                err.response?.data || "Failed to post job. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="auth-container" style={{ maxWidth: "600px" }}>
                    <h1 className="auth-title">Post a New Job</h1>
                    <p className="auth-subtitle">
                        Fill in the details below to publish your job opening
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && (
                        <div className="alert alert-success">{success}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Job Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                placeholder="e.g. Senior Java Developer"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Company *</label>
                            <input
                                type="text"
                                name="company"
                                className="form-input"
                                placeholder="e.g. Tech Corp"
                                value={form.company}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                className="form-input"
                                placeholder="Describe the role, responsibilities, and what you're looking for..."
                                value={form.description}
                                onChange={handleChange}
                                rows={5}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Required Skills *
                            </label>
                            <input
                                type="text"
                                name="skills"
                                className="form-input"
                                placeholder="e.g. Java, Spring Boot, MySQL (comma-separated)"
                                value={form.skills}
                                onChange={handleChange}
                                required
                            />
                            <small
                                style={{
                                    color: "#718096",
                                    fontSize: "12px",
                                    marginTop: "4px",
                                    display: "block",
                                }}
                            >
                                Separate skills with commas
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                name="location"
                                className="form-input"
                                placeholder="e.g. Bangalore, Remote"
                                value={form.location}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Salary Range</label>
                            <input
                                type="text"
                                name="salary"
                                className="form-input"
                                placeholder="e.g. 8-12 LPA"
                                value={form.salary}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block mt-4"
                            disabled={loading}
                        >
                            {loading ? "Posting..." : "Post Job"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PostJob;