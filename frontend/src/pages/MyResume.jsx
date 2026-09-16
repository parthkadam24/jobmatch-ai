import { useState, useEffect } from "react";
import { resumeAPI, aiAPI } from "../services/api";

function MyResume() {
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchResume = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await resumeAPI.myResume();
            setResume(res.data);
        } catch (err) {
            // 400 = no resume yet, not a real error
            setResume(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResume();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please choose a file first.");
            return;
        }

        // Validate file type client-side
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Only PDF, DOC, or DOCX files are allowed.");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5 MB.");
            return;
        }

        setError("");
        setSuccess("");
        setUploading(true);

        try {
            const res = await resumeAPI.upload(selectedFile);
            setResume(res.data);
            setSelectedFile(null);
            setSuccess("Resume uploaded successfully!");
            // Reset file input
            const fileInput = document.getElementById("resume-file-input");
            if (fileInput) fileInput.value = "";
        } catch (err) {
            setError(err.response?.data || "Failed to upload resume.");
        } finally {
            setUploading(false);
        }
    };

    const handleParse = async () => {
        if (!resume) return;

        setError("");
        setSuccess("");
        setParsing(true);

        try {
            const res = await aiAPI.parseResume(resume.id);
            setResume(res.data);
            setSuccess("Resume parsed! Skills extracted by AI.");
        } catch (err) {
            setError(err.response?.data || "Failed to parse resume.");
        } finally {
            setParsing(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete your resume? This cannot be undone.")) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await resumeAPI.delete();
            setResume(null);
            setSuccess("Resume deleted successfully.");
        } catch (err) {
            setError(err.response?.data || "Failed to delete resume.");
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading">Loading your resume...</div>
                </div>
            </div>
        );
    }

    const skillsArray = resume?.skills
        ? resume.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: "800px" }}>
                <h1 className="page-title">My Resume</h1>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* ============================ */}
                {/* CURRENT RESUME */}
                {/* ============================ */}
                {resume ? (
                    <div className="card">
                        <div className="row-between">
                            <div>
                                <h3 className="card-title">📄 Resume Uploaded</h3>
                                <p
                                    className="card-subtitle"
                                    style={{
                                        fontSize: "12px",
                                        wordBreak: "break-all",
                                        marginTop: "4px",
                                    }}
                                >
                                    {resume.fileUrl?.split("\\").pop() ||
                                        resume.fileUrl}
                                </p>
                            </div>
                            <span
                                className={
                                    skillsArray.length > 0
                                        ? "badge badge-success"
                                        : "badge badge-warning"
                                }
                            >
                                {skillsArray.length > 0 ? "Parsed" : "Not Parsed"}
                            </span>
                        </div>

                        <hr
                            style={{
                                margin: "20px 0",
                                border: "none",
                                borderTop: "1px solid #e2e8f0",
                            }}
                        />

                        {/* Parsed skills section */}
                        {skillsArray.length > 0 ? (
                            <>
                                <h4 style={{ marginBottom: "10px" }}>
                                    🧠 AI-Extracted Skills
                                </h4>
                                <div className="mb-4">
                                    {skillsArray.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="badge badge-success"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                {resume.experience && (
                                    <>
                                        <h4 style={{ marginBottom: "10px" }}>
                                            📊 Experience
                                        </h4>
                                        <p className="card-description">
                                            {resume.experience}
                                        </p>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="alert alert-info">
                                ⚡ Run AI parsing to extract your skills
                                automatically.
                            </div>
                        )}

                        <div className="row mt-4">
                            {skillsArray.length === 0 && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleParse}
                                    disabled={parsing}
                                >
                                    {parsing
                                        ? "Parsing with AI..."
                                        : "🧠 Parse with AI"}
                                </button>
                            )}
                            {skillsArray.length > 0 && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleParse}
                                    disabled={parsing}
                                >
                                    {parsing ? "Re-parsing..." : "🔄 Re-Parse"}
                                </button>
                            )}
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                            >
                                Delete Resume
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ============================ */
                    /* UPLOAD ZONE */
                    /* ============================ */
                    <div className="card">
                        <h3 className="card-title">Upload Your Resume</h3>
                        <p className="card-subtitle">
                            PDF, DOC, or DOCX · Max 5 MB
                        </p>

                        <div
                            style={{
                                border: "2px dashed #cbd5e0",
                                borderRadius: "10px",
                                padding: "40px 20px",
                                textAlign: "center",
                                marginTop: "20px",
                                background: "#f7fafc",
                            }}
                        >
                            <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                                📄
                            </div>
                            {selectedFile ? (
                                <>
                                    <p style={{ fontWeight: "600" }}>
                                        {selectedFile.name}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "#718096",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p
                                        style={{
                                            color: "#4a5568",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        Choose a PDF/DOC file to upload
                                    </p>
                                </>
                            )}

                            <input
                                type="file"
                                id="resume-file-input"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />

                            <div className="row mt-4" style={{ justifyContent: "center" }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        document
                                            .getElementById("resume-file-input")
                                            .click()
                                    }
                                >
                                    {selectedFile ? "Choose Different File" : "Select File"}
                                </button>

                                {selectedFile && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleUpload}
                                        disabled={uploading}
                                    >
                                        {uploading ? "Uploading..." : "Upload Resume"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyResume;