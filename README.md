<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />

  <br /><br />

  <h1>🚀 TeamTask</h1>
  <h3>Full-Stack Team Task Management Platform</h3>

  <p>
    A production-grade collaborative project & task management system
    <br />
    built with <strong>React</strong>, <strong>Spring Boot</strong>, <strong>Supabase</strong>, and <strong>PostgreSQL</strong>
  </p>

  <br />

  <a href="https://team-task-manager-henna.vercel.app">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_App-4f46e5?style=for-the-badge" alt="Live Demo" />
  </a>

  <br /><br />

  <img src="https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white" alt="Railway" />
  <img src="https://img.shields.io/badge/Auth-Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase Auth" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<br />

## 📖 About

**TeamTask** is a cloud-deployed team collaboration platform where organizations can manage projects, delegate tasks with priorities and deadlines, track workloads through interactive analytics dashboards, and administer users with role-based access control.

The system follows a **decoupled full-stack architecture** — a React SPA communicates with a Spring Boot REST API, authenticated through Supabase JWT tokens, and persisted to a PostgreSQL database.

> **Why this project?** Teams need a centralized workspace to organize work into projects, assign tasks with priorities, get real-time visibility into workload distribution, and give admins tools to manage the platform — all in one place.

---

## ✨ Key Features

### 🔐 Authentication & Security
- Supabase Auth with email/password + email confirmation flow
- JWT-secured API with ES256 algorithm validation
- Role-based access control — `USER` and `GLOBAL_ADMIN` roles with granular permissions
- Account suspension with instant platform lockout
- Frontend protected route guards

### 📁 Project Management
- Create projects with automatic creator-as-admin membership
- Invite members by email with role-based permissions (Admin / Member)
- Cascade delete — removing a project deletes all tasks and memberships
- Membership-scoped access — users only see projects they belong to

### ✅ Task Management
- Full CRUD with searchable assignee dropdown
- Priority system: `LOW` · `MEDIUM` · `HIGH` with visual color-coding
- Status workflow: `TODO` → `IN_PROGRESS` → `DONE` with inline updates
- Due dates with overdue detection and pulsing alert badges
- Inline editing via modals for title, description, assignee, priority, and due date

### 📊 Dashboard & Analytics
- Dual-tab view: *Assigned to Me* vs *Tasks I Assigned*
- Interactive Pie chart (task status distribution) & Bar chart (workload comparison)
- Multi-filter system — filter by status, priority, and sort by due date
- 3D parallax tilt task cards with glare effects

### 🛡️ Admin Dashboard (Global Admin Only)
- Platform-wide statistics — total users, projects, and tasks at a glance
- Global task status pie chart & per-user task distribution bar chart
- User management table — promote/demote admins, suspend/unsuspend accounts
- Access guard — non-admin users are auto-redirected

### 📱 Responsive Design
- Mobile-first layout with hamburger navigation
- Adaptive 1/2/3/4-column grids based on viewport
- Glassmorphism UI with backdrop blur modals
- Micro-animations — blob backgrounds, hover transforms, loading spinners

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────┐
                    │       CLIENT (Browser)        │
                    │                               │
                    │  React 19 · Vite 8            │
                    │  React Router v7              │
                    │  Recharts · Parallax Tilt     │
                    │  AuthContext · Axios + JWT     │
                    └──────────────┬────────────────┘
                                   │
                          HTTPS + Bearer JWT
                                   │
                    ┌──────────────▼────────────────┐
                    │    BACKEND (Spring Boot 3.3)   │
                    │                                │
                    │  Spring Security (JWT Decoder)  │
                    │  6 REST Controllers + RBAC      │
                    │  Spring Data JPA (4 Entities)   │
                    └──────────────┬─────────────────┘
                                   │
                    ┌──────────────▼────────────────┐
                    │       SUPABASE (BaaS)          │
                    │                                │
                    │  Auth Service (Email/Password)  │
                    │  JWK Endpoint (ES256 Keys)      │
                    │  PostgreSQL Database             │
                    └────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library with hooks & functional components |
| **Vite 8** | Lightning-fast build tool and dev server |
| **Tailwind CSS 4** | Utility-first CSS with custom glassmorphism tokens |
| **React Router v7** | Client-side routing with protected route guards |
| **Recharts** | Composable charting (Pie, Bar) for analytics |
| **react-parallax-tilt** | 3D hover effects on task cards |
| **Axios** | HTTP client with JWT interceptor |
| **Supabase JS SDK** | Auth client (sign up, sign in, session management) |

### Backend

| Technology | Purpose |
|---|---|
| **Spring Boot 3.3** | REST API framework with auto-configuration |
| **Spring Security** | OAuth2 Resource Server with JWT validation |
| **Spring Data JPA** | ORM layer with repository pattern |
| **PostgreSQL** | Relational database for all application data |
| **Lombok** | Boilerplate reduction for entity models |
| **Java 17** | LTS Java runtime |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Vercel** | Frontend deployment with automatic CI/CD |
| **Railway** | Backend deployment with managed environment |
| **Supabase** | Authentication service with JWK endpoint + PostgreSQL |

---

## 📂 Project Structure

```
team-task-manager/
│
├── frontend/                              # React SPA (Vite)
│   └── src/
│       ├── components/
│       │   └── Navbar.jsx                 # Responsive nav + hamburger menu
│       ├── context/
│       │   └── AuthContext.jsx            # Supabase auth state + JWT mgmt
│       ├── lib/
│       │   ├── api.js                     # Axios instance + JWT interceptor
│       │   └── supabase.js                # Supabase client init
│       ├── pages/
│       │   ├── Login.jsx                  # Sign in with animated blob bg
│       │   ├── Signup.jsx                 # Registration with full name capture
│       │   ├── Dashboard.jsx              # Analytics hub + charts + task cards
│       │   ├── Projects.jsx               # Project grid + create modal
│       │   ├── ProjectDetail.jsx          # Task board + CRUD + member invites
│       │   └── AdminDashboard.jsx         # Admin panel + user management
│       ├── App.jsx                        # Route definitions + protected wrapper
│       └── main.jsx                       # Entry point with AuthProvider
│
├── backend/                               # Spring Boot REST API
│   └── src/main/java/com/example/demo/
│       ├── config/
│       │   ├── SecurityConfig.java        # JWT decoder, CORS, filter chain
│       │   ├── WebConfig.java             # Web MVC configuration
│       │   └── UserRestrictionInterceptor # Account suspension interceptor
│       ├── controller/
│       │   ├── ProjectController.java     # Project CRUD + member management
│       │   ├── TaskController.java        # Task CRUD with RBAC
│       │   ├── DashboardController.java   # Aggregated analytics endpoint
│       │   ├── AdminController.java       # Global admin operations
│       │   ├── UserController.java        # User profile endpoint
│       │   └── HealthController.java      # Health check
│       ├── model/
│       │   ├── Project.java               # Project entity (UUID PK)
│       │   ├── Task.java                  # Task with priority + status
│       │   ├── ProjectMember.java         # Project-User join table
│       │   └── AppUser.java               # User profile with role + restriction
│       ├── dto/
│       │   └── AdminStatsResponse.java    # Admin analytics DTO
│       └── repository/                    # JPA repositories (4 repos)
│
└── README.md
```

---

## 🗄️ Database Schema

### `projects`
| Column | Type | Constraint |
|--------|------|------------|
| `id` | UUID | **PK** |
| `name` | VARCHAR | NOT NULL |
| `created_by` | VARCHAR | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL |

### `tasks`
| Column | Type | Constraint |
|--------|------|------------|
| `id` | UUID | **PK** |
| `title` | VARCHAR | NOT NULL |
| `description` | TEXT | |
| `status` | VARCHAR | `TODO` · `IN_PROGRESS` · `DONE` |
| `priority` | VARCHAR | `LOW` · `MEDIUM` · `HIGH` |
| `assigned_to` | VARCHAR | User email |
| `created_by` | VARCHAR | User email |
| `project_id` | UUID | **FK** → projects |
| `due_date` | DATE | |
| `created_at` | TIMESTAMP | NOT NULL |

### `project_members`
| Column | Type | Constraint |
|--------|------|------------|
| `id` | UUID | **PK** |
| `project_id` | UUID | **FK** → projects |
| `user_email` | VARCHAR | |
| `role` | VARCHAR | `ADMIN` · `MEMBER` |

### `app_users`
| Column | Type | Constraint |
|--------|------|------------|
| `email` | VARCHAR | **PK** |
| `role` | VARCHAR | `USER` · `GLOBAL_ADMIN` |
| `restricted` | BOOLEAN | |

**Relationships:** `projects` 1:N `tasks` · `projects` 1:N `project_members` · `project_members` N:1 `app_users`

---

## 🔌 API Endpoints

> All endpoints except `/health` require `Authorization: Bearer <JWT>` header.

### Projects — 6 endpoints

| Method | Endpoint | Description | Access |
|:------:|----------|-------------|--------|
| `POST` | `/projects` | Create a new project | Authenticated |
| `GET` | `/projects` | List user's projects | Authenticated |
| `GET` | `/projects/:id` | Get project details | Project Member |
| `DELETE` | `/projects/:id` | Delete project (cascade) | Project Admin / Global Admin |
| `POST` | `/projects/:id/members` | Invite a team member | Project Admin |
| `GET` | `/projects/:id/members` | List project members | Project Member |

### Tasks — 4 endpoints

| Method | Endpoint | Description | Access |
|:------:|----------|-------------|--------|
| `POST` | `/tasks` | Create a task | Project Admin |
| `GET` | `/tasks?projectId=<UUID>` | List project tasks | Project Member |
| `PATCH` | `/tasks/:id` | Update task (status/details) | Admin / Creator / Assignee |
| `DELETE` | `/tasks/:id` | Delete a task | Admin / Creator |

### Dashboard — 1 endpoint

| Method | Endpoint | Description | Access |
|:------:|----------|-------------|--------|
| `GET` | `/dashboard` | Aggregated task analytics | Authenticated |

### Admin — 4 endpoints

| Method | Endpoint | Description | Access |
|:------:|----------|-------------|--------|
| `GET` | `/admin/users` | List all users | Global Admin |
| `PATCH` | `/admin/users/:email/restrict` | Suspend/unsuspend user | Global Admin |
| `PATCH` | `/admin/users/:email/role` | Promote/demote user | Global Admin |
| `GET` | `/admin/stats` | Platform-wide statistics | Global Admin |

### Utility — 2 endpoints

| Method | Endpoint | Description | Access |
|:------:|----------|-------------|--------|
| `GET` | `/health` | Health check | Public |
| `GET` | `/users/me` | Current user profile | Authenticated |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 18 |
| Java | 17 |
| Maven | 3.8+ |
| PostgreSQL | 15+ (or Supabase project) |

### 1. Clone the Repository

```bash
git clone https://github.com/RAJNEESHMIST/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
```

Create `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taskmanager
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080
```

Run the backend:

```bash
./mvnw spring-boot:run
```

> API will be available at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the frontend:

```bash
npm run dev
```

> App will be available at `http://localhost:5173`

---

## 🌐 Deployment

| Layer | Platform | Details |
|-------|----------|---------|
| **Frontend** | Vercel | Git integration with automatic CI/CD |
| **Backend** | Railway | Deployed via Nixpacks |
| **Database** | Supabase | Managed PostgreSQL |
| **Auth** | Supabase | Email/password with JWT |

### Environment Variables

**Frontend (Vercel)**

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.railway.app` |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

**Backend (Railway)**

| Variable | Value |
|----------|-------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://host:5432/railway` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Your database password |

---

## 📚 What I Learned

### Backend
- Implemented **OAuth2 Resource Server** with Supabase JWT (ES256 algorithm) for stateless authentication
- Designed **multi-level RBAC**: Global Admin → Project Admin → Member → Assignee
- Built a **user restriction interceptor** that blocks suspended accounts mid-request
- Managed **transactional cascade deletion** to ensure data consistency
- Configured **CORS wildcard patterns** to support dynamic Vercel preview deployments

### Frontend
- Architected **React Context** for global auth state management with Supabase session listeners
- Built **Axios interceptors** for automatic JWT injection and 403 (restricted user) handling
- Implemented **interactive data visualizations** with Recharts (responsive pie and bar charts)
- Created **custom searchable select dropdowns** from scratch for task assignment UX
- Designed a **mobile-responsive layout** with hamburger navigation and adaptive grid breakpoints

### DevOps
- Deployed a **Spring Boot** application to **Railway** with proper environment variable injection
- Configured **Vercel** for React SPA routing with rewrite rules
- Managed **cross-environment connectivity** between Vercel frontend and Railway backend

---

## 🔮 Future Enhancements

- [ ] **Real-time updates** — WebSocket integration for live task status changes
- [ ] **Kanban board** — Drag-and-drop task management with status columns
- [ ] **Notifications** — Email/in-app alerts for task assignments and deadlines
- [ ] **File attachments** — Upload and associate documents with tasks
- [ ] **Activity log** — Audit trail for all project and task changes
- [ ] **Team chat** — In-project messaging for contextual discussions
- [ ] **Time tracking** — Log hours spent on individual tasks
- [ ] **CSV/PDF export** — Downloadable reports for stakeholder updates

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/RAJNEESHMIST/team-task-manager/issues).

---

<div align="center">
  <br />
  <strong>Built with ❤️ by <a href="https://github.com/RAJNEESHMIST">Rajneesh</a></strong>
  <br /><br />
  <sub>If you found this project helpful, please consider giving it a ⭐</sub>
  <br /><br />
</div>
