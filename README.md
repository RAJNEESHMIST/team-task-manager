<![CDATA[<div align="center">

# 🚀 TeamTask — Full-Stack Team Task Management Platform

**A production-grade collaborative project & task management system built with React, Spring Boot, Supabase, and PostgreSQL.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Deployed on Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

---

**[Live Demo](#-deployment)** · **[Features](#-key-features)** · **[Architecture](#-system-architecture)** · **[Getting Started](#-getting-started)**

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [What I Learned](#-what-i-learned)
- [Future Enhancements](#-future-enhancements)

---

## 📖 About the Project

**TeamTask** is a fully functional, cloud-deployed team collaboration platform that enables organizations to manage projects, delegate tasks with priorities, track workloads via interactive analytics dashboards, and administer users with role-based access control.

The system follows a **decoupled full-stack architecture** — a React SPA communicates with a Spring Boot REST API, authenticated through Supabase JWT tokens, and persisted to a PostgreSQL database. The entire stack is production-deployed with the frontend on **Vercel** and the backend on **Railway**.

### 🎯 Problem Statement

Teams need a centralized workspace to:
- Organize work into **projects** and break them into **tasks** with deadlines, priorities, and assignees
- Provide **role-based access** so admins can manage teams while members focus on execution
- Offer **real-time visibility** into task distribution, overdue items, and individual workload
- Enable a **Global Admin** to monitor the entire platform, manage users, and enforce restrictions

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Supabase Auth** — Email/password registration with email confirmation flow
- **JWT-secured API** — Every backend request validated via Supabase-issued ES256 JWTs
- **Role-based access control** — `USER` and `GLOBAL_ADMIN` roles with granular permissions
- **Account suspension** — Admins can restrict users, blocking their platform access instantly
- **Protected routes** — Frontend route guards redirect unauthenticated users to login

### 📁 Project Management
- **Create projects** with automatic creator-as-admin membership assignment
- **Invite team members** by email with role-based permissions (Admin / Member)
- **Cascade delete** — Deleting a project removes all associated tasks and memberships
- **Membership-scoped access** — Users only see projects they belong to (unless Global Admin)

### ✅ Task Management
- **Full CRUD** — Create, read, update, and delete tasks within projects
- **Task assignment** — Searchable user dropdown to assign tasks to team members
- **Priority system** — `LOW`, `MEDIUM`, `HIGH` with visual color-coding
- **Status tracking** — `TODO` → `IN_PROGRESS` → `DONE` workflow with inline status updates
- **Due dates & overdue detection** — Visual alerts and pulsing badges for overdue tasks
- **Inline editing** — Edit task title, description, assignee, priority, and due date via modal

### 📊 Dashboard & Analytics
- **Personal dashboard** with dual-tab view: *Tasks Assigned to Me* vs *Tasks I Assigned*
- **Interactive charts** — Pie chart (task distribution by status) & bar chart (workload comparison) using Recharts
- **Multi-filter system** — Filter tasks by status, priority, and sort by due date
- **Parallax tilt task cards** — 3D hover effects with glare using `react-parallax-tilt`

### 🛡️ Admin Dashboard (Global Admin Only)
- **Platform-wide statistics** — Total users, projects, and tasks at a glance
- **Global task status pie chart** — Visualize TODO/IN_PROGRESS/DONE across all users
- **Per-user task distribution bar chart** — Identify workload imbalances
- **User management table** — Promote/demote admins, suspend/unsuspend accounts
- **Access guard** — Non-admin users are auto-redirected to their dashboard

### 📱 Responsive Design
- **Mobile-first layout** with hamburger navigation
- **Adaptive grid systems** — 1/2/3/4-column grids based on viewport
- **Glassmorphism UI** — Frosted-glass nav, backdrop blur modals, subtle shadows
- **Micro-animations** — Blob backgrounds, hover transforms, loading spinners

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   React 19   │  │  React Router│  │   Recharts / Tilt      │ │
│  │   (Vite 8)   │  │    v7        │  │   Interactive Charts   │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────────┘ │
│         │                 │                                      │
│  ┌──────┴─────────────────┴──────────────────────────────────┐  │
│  │              AuthContext (Supabase Client SDK)             │  │
│  │         JWT stored in localStorage → Axios interceptor    │  │
│  └──────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              │  HTTPS + Bearer JWT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Spring Boot 3.3)                    │
│                                                                  │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Security Config │  │  REST Controllers│  │  JPA Repos     │  │
│  │  JWT Decoder     │──│  (6 controllers) │──│  (4 entities)  │  │
│  │  CORS Policy     │  │  RBAC logic      │  │  PostgreSQL    │  │
│  └──────────────────┘  └─────────────────┘  └───────┬────────┘  │
└──────────────────────────────────────────────────────┼──────────┘
                                                       │
                              ┌─────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE (BaaS Layer)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Auth Service │  │  JWK Endpoint│  │  PostgreSQL Database   │ │
│  │  (Email/Pass) │  │  (ES256 keys)│  │  (Projects, Tasks,     │ │
│  └──────────────┘  └──────────────┘  │   Members, Users)      │ │
│                                       └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with hooks and functional components |
| **Vite 8** | Lightning-fast build tool and dev server |
| **Tailwind CSS 4** | Utility-first CSS with custom glassmorphism tokens |
| **React Router v7** | Client-side routing with protected route guards |
| **Recharts** | Composable charting (PieChart, BarChart) for analytics |
| **react-parallax-tilt** | 3D hover effects on task cards |
| **Axios** | HTTP client with JWT interceptor |
| **Supabase JS SDK** | Authentication client (sign up, sign in, session management) |

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
| **Railway** | Backend deployment with managed PostgreSQL |
| **Supabase** | Authentication service with JWK endpoint |

---

## 📂 Project Structure

```
Team Task Management/
│
├── frontend/                          # React SPA (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx             # Responsive nav with mobile hamburger menu
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Supabase auth state + JWT management
│   │   ├── lib/
│   │   │   ├── api.js                 # Axios instance with JWT interceptor
│   │   │   └── supabase.js            # Supabase client initialization
│   │   ├── pages/
│   │   │   ├── Login.jsx              # Sign in with animated blob backgrounds
│   │   │   ├── Signup.jsx             # Registration with full name capture
│   │   │   ├── Dashboard.jsx          # Analytics hub with charts & task cards
│   │   │   ├── Projects.jsx           # Project listing with create modal
│   │   │   ├── ProjectDetail.jsx      # Task board with CRUD, edit, & member invite
│   │   │   └── AdminDashboard.jsx     # Global admin panel with user management
│   │   ├── App.jsx                    # Route definitions & protected route wrapper
│   │   ├── main.jsx                   # App entry point with AuthProvider
│   │   ├── App.css                    # Custom CSS with design tokens
│   │   └── index.css                  # Tailwind imports and base styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Spring Boot REST API
│   ├── src/main/java/com/example/demo/
│   │   ├── TaskmanagerApplication.java    # Spring Boot entry point
│   │   ├── config/
│   │   │   ├── SecurityConfig.java        # JWT decoder, CORS, filter chain
│   │   │   ├── WebConfig.java             # Web MVC configuration
│   │   │   └── UserRestrictionInterceptor.java  # Account suspension check
│   │   ├── controller/
│   │   │   ├── ProjectController.java     # Project CRUD + member management
│   │   │   ├── TaskController.java        # Task CRUD with RBAC
│   │   │   ├── DashboardController.java   # Aggregated analytics endpoint
│   │   │   ├── AdminController.java       # Global admin operations
│   │   │   ├── UserController.java        # User profile endpoint
│   │   │   └── HealthController.java      # Health check endpoint
│   │   ├── model/
│   │   │   ├── Project.java               # Project entity (UUID PK)
│   │   │   ├── Task.java                  # Task entity with priority & status
│   │   │   ├── ProjectMember.java         # Join table: project ↔ user
│   │   │   └── AppUser.java               # User profile with role & restriction
│   │   ├── dto/
│   │   │   └── AdminStatsResponse.java    # Admin analytics DTO
│   │   └── repository/
│   │       ├── ProjectRepository.java
│   │       ├── TaskRepository.java
│   │       ├── ProjectMemberRepository.java
│   │       └── AppUserRepository.java
│   └── pom.xml                        # Maven dependencies
│
└── README.md
```

---

## 🗄️ Database Schema

```sql
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│    projects       │       │   project_members     │       │    app_users      │
├──────────────────┤       ├──────────────────────┤       ├──────────────────┤
│ id (UUID, PK)    │◄──────│ project_id (UUID, FK)│       │ email (PK)       │
│ name (VARCHAR)   │       │ user_email (VARCHAR)  │──────►│ role (VARCHAR)   │
│ created_by       │       │ role (VARCHAR)        │       │ restricted (BOOL)│
│ created_at       │       │ id (UUID, PK)        │       └──────────────────┘
└──────────────────┘       └──────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────┐
│       tasks           │
├──────────────────────┤
│ id (UUID, PK)        │
│ title (VARCHAR)      │
│ description (TEXT)   │
│ status (VARCHAR)     │  ← TODO | IN_PROGRESS | DONE
│ priority (VARCHAR)   │  ← LOW | MEDIUM | HIGH
│ assigned_to (VARCHAR)│
│ created_by (VARCHAR) │
│ project_id (UUID, FK)│
│ due_date (DATE)      │
│ created_at (TIMESTAMP)│
└──────────────────────┘
```

---

## 🔌 API Endpoints

### Authentication
All endpoints (except `/health`) require a valid `Authorization: Bearer <JWT>` header.

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/projects` | Create a new project | Authenticated |
| `GET` | `/projects` | List user's projects | Authenticated |
| `GET` | `/projects/:id` | Get project details | Project Member |
| `DELETE` | `/projects/:id` | Delete project (cascade) | Project Admin / Global Admin |
| `POST` | `/projects/:id/members` | Invite a team member | Project Admin |
| `GET` | `/projects/:id/members` | List project members | Project Member |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/tasks` | Create a task | Project Admin |
| `GET` | `/tasks?projectId=<UUID>` | List tasks for a project | Project Member |
| `PATCH` | `/tasks/:id` | Update task (status/details) | Admin / Creator / Assignee |
| `DELETE` | `/tasks/:id` | Delete a task | Admin / Creator |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/dashboard` | Get aggregated task analytics | Authenticated |

### Admin
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/admin/users` | List all users | Global Admin |
| `PATCH` | `/admin/users/:email/restrict` | Suspend/unsuspend user | Global Admin |
| `PATCH` | `/admin/users/:email/role` | Promote/demote user | Global Admin |
| `GET` | `/admin/stats` | Platform-wide statistics | Global Admin |

### Utility
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/health` | Health check | Public |
| `GET` | `/users/me` | Get current user profile | Authenticated |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Java** 17
- **Maven** 3.8+
- **PostgreSQL** 15+ (or Supabase project)

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

The API will be available at `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🌐 Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| **Frontend** | Vercel | Deployed via Git integration |
| **Backend** | Railway | Deployed with Dockerfile / Nixpacks |
| **Database** | Supabase PostgreSQL | Managed cloud database |
| **Auth** | Supabase Auth | Email/password with JWT |

### Environment Variables

#### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### Backend (Railway)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/railway
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
```

---

## 📸 Screenshots

> **Note:** To view the live application, deploy locally using the [Getting Started](#-getting-started) instructions.

### Key Pages

| Page | Description |
|------|-------------|
| **Login** | Glassmorphism card with animated blob backgrounds |
| **Signup** | Registration form with full name capture and email confirmation |
| **Dashboard** | Analytics hub with pie/bar charts and parallax task cards |
| **Projects** | Grid layout with hover animations and creation modal |
| **Project Detail** | Task board with inline status updates, editing, and member management |
| **Admin Hub** | Platform statistics, charts, and user management table |

---

## 📚 What I Learned

### Backend
- Implemented **OAuth2 Resource Server** with Supabase JWT (ES256 algorithm) for stateless authentication
- Designed **role-based access control** at multiple levels: Global Admin, Project Admin, Member, and Assignee
- Built a **user restriction system** with an HTTP interceptor that blocks suspended accounts mid-request
- Managed **cascade deletion** with transactional boundaries to ensure data consistency
- Configured **CORS** with wildcard patterns to support dynamic Vercel preview deployments

### Frontend
- Architected **React Context** for global auth state management with Supabase session listeners
- Built **Axios interceptors** to inject JWTs and handle 403 (restricted user) edge cases globally
- Implemented **interactive data visualizations** with Recharts (responsive pie charts, bar charts)
- Created **searchable select dropdowns** from scratch for task assignment UX
- Designed a **mobile-responsive** layout system with hamburger navigation and adaptive grid breakpoints

### DevOps
- Deployed a **Spring Boot** application to **Railway** with proper environment variable injection
- Configured **Vercel** for React SPA routing with proper rewrite rules
- Managed **cross-environment connectivity** between Vercel frontend and Railway backend

---

## 🔮 Future Enhancements

- [ ] **Real-time updates** — WebSocket integration for live task status changes
- [ ] **Drag-and-drop Kanban board** — Visual task management with columns for each status
- [ ] **Notification system** — Email/in-app notifications when tasks are assigned or due
- [ ] **File attachments** — Upload and associate documents with tasks
- [ ] **Activity log** — Audit trail for all project and task changes
- [ ] **Team chat** — In-project messaging for contextual discussions
- [ ] **Time tracking** — Log hours spent on individual tasks
- [ ] **Export to CSV/PDF** — Downloadable reports for stakeholder updates

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/RAJNEESHMIST/team-task-manager/issues).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Rajneesh](https://github.com/RAJNEESHMIST)**

*If you found this project helpful, please consider giving it a ⭐!*

</div>
]]>
