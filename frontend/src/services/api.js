import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
};

export const jobAPI = {
    getAll: () => api.get("/jobs"),
    getById: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post("/jobs", data),
    delete: (id) => api.delete(`/jobs/${id}`),
    search: (keyword) => api.get(`/jobs/search?keyword=${keyword}`),
    myJobs: () => api.get("/jobs/my-jobs"),
};

export const applicationAPI = {
    apply: (jobId) => api.post("/applications", { jobId }),
    myApplications: () => api.get("/applications/my-applications"),
    withdraw: (id) => api.delete(`/applications/${id}`),
    getApplicants: (jobId) => api.get(`/applications/job/${jobId}`),
    updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const resumeAPI = {
    upload: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post("/resumes/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    myResume: () => api.get("/resumes/my-resume"),
    delete: () => api.delete("/resumes"),
};

export const aiAPI = {
    parseResume: (resumeId) => api.post(`/ai/parse-resume/${resumeId}`),
    matchScore: (jobId, candidateId) => api.get(`/ai/match/${jobId}/${candidateId}`),
    coverLetter: (jobId, resumeId) => api.post("/ai/cover-letter", { jobId, resumeId }),
    summarizeJob: (jobId) => api.get(`/ai/summarize-job/${jobId}`),
};

export default api;