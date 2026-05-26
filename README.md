# AI Career Coach — Complete Project

Full-stack application: React frontend + Node.js/Express backend + MongoDB.
All 5 modules built, connected, and ready to run.

---

## Quick Start (3 steps)

### Step 1 — Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas free tier:
# https://www.mongodb.com/cloud/atlas
# Copy the connection string for .env
```

### Step 2 — Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

npm run seed    # Seed 50 skills + 10 careers into MongoDB
npm run dev     # Server starts on http://localhost:5000
```

### Step 3 — Frontend
```bash
cd frontend
npm install
npm start       # App starts on http://localhost:3000
```

Open `http://localhost:3000` → Register → Explore!

---

## Project Structure

```
ai-career-coach/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js      register, login, refresh, logout, me
│   │   ├── user.controller.js      profile, skills, experience, education
│   │   ├── career.controller.js    list, detail, recommendations, skill gap
│   │   └── main.controller.js      roadmaps, resumes, interviews
│   ├── middleware/
│   │   ├── auth.middleware.js      JWT protect + role guard
│   │   └── error.middleware.js     global error handler + validators
│   ├── models/
│   │   └── index.js                all 12 Mongoose schemas in one file
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── career.routes.js
│   │   ├── skill.routes.js
│   │   ├── roadmap.routes.js
│   │   ├── resume.routes.js
│   │   └── interview.routes.js
│   ├── utils/
│   │   ├── jwt.utils.js            token generate/verify/cookie helpers
│   │   └── seed.js                 database seeder (50 skills + 10 careers)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── api/
        │   ├── axiosInstance.js    axios + silent token refresh
        │   └── index.js            authAPI, careerAPI, skillAPI, roadmapAPI, resumeAPI, interviewAPI
        ├── context/
        │   └── AuthContext.jsx     global auth state, session restore
        ├── hooks/
        │   └── index.js            all custom hooks per module
        ├── components/
        │   ├── layout/AppLayout.jsx   sidebar + outlet
        │   └── common/ProtectedRoute.jsx
        ├── pages/
        │   ├── auth/AuthPages.jsx         Login + Register
        │   ├── dashboard/DashboardPages.jsx  Dashboard + Profile
        │   ├── careers/CareerPages.jsx    Careers + Skills
        │   └── AllPages.jsx             Roadmaps + Resumes + Interviews
        ├── styles/global.css
        ├── App.jsx
        └── index.js
```

---

## API Endpoints Reference

### Auth
| Method | Endpoint               | Access  |
|--------|------------------------|---------|
| POST   | /api/auth/register     | Public  |
| POST   | /api/auth/login        | Public  |
| POST   | /api/auth/refresh      | Public  |
| POST   | /api/auth/logout       | Private |
| GET    | /api/auth/me           | Private |

### User
| Method | Endpoint                      | Description         |
|--------|-------------------------------|---------------------|
| GET    | /api/user/profile             | Get profile         |
| PATCH  | /api/user/profile             | Update profile      |
| PATCH  | /api/user/change-password     | Change password     |
| GET    | /api/user/skills              | Get user skills     |
| POST   | /api/user/skills              | Add skill           |
| PATCH  | /api/user/skills/:id          | Update level        |
| DELETE | /api/user/skills/:id          | Remove skill        |
| GET    | /api/user/experiences         | Get experience      |
| POST   | /api/user/experiences         | Add experience      |
| GET    | /api/user/educations          | Get education       |
| POST   | /api/user/educations          | Add education       |

### Careers
| Method | Endpoint                            | Description         |
|--------|-------------------------------------|---------------------|
| GET    | /api/careers                        | List (search/filter)|
| GET    | /api/careers/:id                    | Career detail       |
| GET    | /api/careers/recommendations        | AI recommendations  |
| PATCH  | /api/careers/recommendations/:id   | Save/dismiss rec    |
| GET    | /api/careers/skill-gap/:careerId   | Get gap analysis    |
| POST   | /api/careers/skill-gap/:careerId   | Run fresh analysis  |

### Skills | Roadmaps | Resumes | Interviews
```
GET  /api/skills
GET/POST/DELETE /api/roadmaps, /api/roadmaps/:id
POST /api/roadmaps/resources/:id/progress
GET/POST/PATCH/DELETE /api/resumes, /api/resumes/:id
POST /api/resumes/:id/ats-score
POST /api/resumes/:id/ai-improve
GET/POST/PATCH /api/interviews, /api/interviews/start
POST /api/interviews/:id/answer
PATCH /api/interviews/:id/complete
```

---

## Environment Variables

```env
# backend/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ai_career_coach
JWT_ACCESS_SECRET=<random 64-char string>
JWT_REFRESH_SECRET=<different random 64-char string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Features Per Module

| Module | Features |
|---|---|
| Auth | Register, login, JWT access+refresh tokens, HttpOnly cookies, token rotation, RBAC |
| Career Intelligence | Browse/search 10 careers, AI skill-match recommendations, skill gap analysis with readiness score |
| Skills | Skill catalog (50 skills), add/update/remove, 5 proficiency levels |
| Learning Roadmaps | Create roadmaps, AI-generated resource list, per-resource progress tracking, completion % |
| Resume Builder | CRUD resumes, manage sections, ATS scoring (rule-based), AI section improvement |
| Interview Prep | Start sessions by career/difficulty, 5-8 AI questions, per-answer scoring, session completion stats |
