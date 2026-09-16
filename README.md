# 🎯 JobMatch AI — Intelligent Resume-to-Job Matching Platform

> An AI-powered full-stack job matching platform connecting candidates with the right opportunities, built with Spring Boot, React, MySQL, and integrated AI features for resume parsing and skill-based matching.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/Java-17-red)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control: **CANDIDATE**, **RECRUITER**, **ADMIN**
- BCrypt password hashing
- Secure multi-user access

### 💼 Job Management
- Full CRUD operations for job postings
- Search jobs by keyword
- Filter jobs by skill and location
- Role-restricted actions (only recruiters can post jobs)

### 📝 Application System
- Candidates can apply to jobs
- Recruiters can review, shortlist, or reject applicants
- Duplicate application prevention
- Application status tracking: `APPLIED` → `SHORTLISTED` → `HIRED` / `REJECTED`

### 🤖 AI-Powered Features
- **Resume Parsing** — PDF text extraction (Apache PDFBox) + skill detection
- **Match Score** — % match between candidate skills and job requirements
- **Cover Letter Generator** — personalized cover letters
- **Job Summary** — auto-generated job description summaries

### 📄 Resume Management
- Upload PDF/DOC/DOCX (max 5 MB)
- Secure file storage
- Auto-deletion of old resumes

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Spring Boot 3.1.5** | REST API framework |
| **Spring Security 6** | Authentication & authorization |
| **JWT (JJWT 0.11.5)** | Stateless tokens |
| **Spring Data JPA** | Database ORM |
| **Hibernate 6** | JPA provider |
| **MySQL 8** | Relational database |
| **Apache PDFBox 3.0** | PDF text extraction |
| **Maven** | Build tool |
| **Java 17** | Language |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **Vite** | Build tool (fast dev) |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **Custom CSS** | Styling |

---

## 📁 Project Structure

```
jobmatch-ai
├── backend/                     # Spring Boot API
│   ├── src/main/java/com/jobmatch/backend/
│   │   ├── config/              # Security config
│   │   ├── controller/          # REST controllers
│   │   ├── dto/                 # Data transfer objects
│   │   ├── entity/              # JPA entities
│   │   ├── repository/          # JPA repositories
│   │   ├── security/            # JWT filter & util
│   │   └── service/             # Business logic
│   └── pom.xml
│
└── frontend/                    # React app
    ├── src/
    │   ├── components/          # Reusable UI components
    │   ├── pages/               # Route pages
    │   ├── services/            # API client
    │   └── App.jsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js 18+** and npm
- **MySQL 8+**
- **Maven 3.8+**

### 1. Clone the Repository
```bash
git clone https://github.com/parthkadam24/jobmatch-ai.git
cd jobmatch-ai
```

### 2. Setup Database
```sql
CREATE DATABASE jobmatch_db;
```

### 3. Configure Backend
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/jobmatch_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs at **http://localhost:8081**

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

---

## 📡 API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs` | 🔒 Recruiter | Create job |
| GET | `/api/jobs` | 🌍 Public | Get all jobs |
| GET | `/api/jobs/{id}` | 🌍 Public | Get job by ID |
| GET | `/api/jobs/search?keyword=X` | 🌍 Public | Search jobs |
| GET | `/api/jobs/skill?skill=X` | 🌍 Public | Filter by skill |
| GET | `/api/jobs/location?location=X` | 🌍 Public | Filter by location |
| DELETE | `/api/jobs/{id}` | 🔒 Owner | Delete job |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/applications` | 🔒 Candidate | Apply to job |
| GET | `/api/applications/my-applications` | 🔒 Candidate | My applications |
| GET | `/api/applications/job/{id}` | 🔒 Recruiter | View applicants |
| PUT | `/api/applications/{id}/status` | 🔒 Recruiter | Update status |
| DELETE | `/api/applications/{id}` | 🔒 Candidate | Withdraw |

### Resume + AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/resumes/upload` | 🔒 Candidate | Upload resume |
| GET | `/api/resumes/my-resume` | 🔒 Candidate | View my resume |
| POST | `/api/ai/parse-resume/{id}` | 🔒 | Parse resume with AI |
| GET | `/api/ai/match/{jobId}/{candId}` | 🔒 | Match score |
| POST | `/api/ai/cover-letter` | 🔒 | Generate cover letter |
| GET | `/api/ai/summarize-job/{id}` | 🔒 | Summarize job |

---

## 📸 Screenshots

### Login Page
_Screenshots coming soon_

### Job Listings
_Screenshots coming soon_

### Match Score
_Screenshots coming soon_

---

## 🔮 Roadmap

 JWT authentication with role-based access
 Job posting with search and filters
 Application system with status tracking
 Resume upload with PDF parsing
 AI match scoring and cover letter generation
 React frontend with login/register/jobs
 Real OpenAI integration (currently mock)
 Real-time notifications via Firebase
 Recruiter analytics dashboard
 Deployment on AWS/Render

---

## 👨‍💻 Author

**Parth Kadam**
- GitHub: [@parthkadam24](https://github.com/parthkadam24)
- Email: parthkadam484@gmail.com

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ If you find this project useful, please give it a star!
