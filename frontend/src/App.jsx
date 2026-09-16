import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import PostJob from "./pages/PostJob";
import MyApplications from "./pages/MyApplications";

const isLoggedIn = () => !!localStorage.getItem("token");

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Navigate to="/jobs" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/jobs"
                    element={isLoggedIn() ? <JobList /> : <Navigate to="/login" />}
                />
                <Route
                    path="/jobs/:id"
                    element={isLoggedIn() ? <JobDetail /> : <Navigate to="/login" />}
                />
                <Route
                    path="/post-job"
                    element={isLoggedIn() ? <PostJob /> : <Navigate to="/login" />}
                />
                <Route
                    path="/my-applications"
                    element={isLoggedIn() ? <MyApplications /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<Navigate to="/jobs" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;