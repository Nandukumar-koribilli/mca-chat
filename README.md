# EduConnect — Student Dashboard & Communication Platform

EduConnect is a full-stack, production-ready student dashboard and social communication web application built for college students and MCA cohorts.

The user interface reproduces the clean, minimal aesthetic from the reference dashboard mockup:
- **Canvas**: Soft neutral light canvas (`#EFF2EE`)
- **Card Elements**: 28px rounded corners with subtle borders and micro-shadows
- **Sidebar**: Logo badge, charcoal active navigation pill, and purple notification counters
- **Top Actions**: Dark charcoal search button, lavender notification bell, and student profile pill
- **My Tasks Card**: Dynamic filter pills (`All task`, `To do`, `In progress`, `Done`), mint striped progress bars, comments counter, and task status pills
- **My Notes**: Side-by-side colorful cards (mint green `#A2F08D`, lavender `#9C94FB`, amber, rose, sky)
- **My Schedule**: Timetable table with lecture times, course titles, teacher avatars, and room numbers
- **Real-Time Chat**: 3-panel chat with instant student search by username (`Search students by username...`), 1-on-1 direct messaging, and cohort group discussions backed by Socket.IO and MongoDB Atlas.

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18** with **Vite**
- **Tailwind CSS** with custom tokens for cards, radius (`28px`), and theme colors
- **React Router DOM 7**
- **Socket.IO Client** for real-time bi-directional messaging
- **Axios** with global interceptors and cookie/token handling
- **Lucide React** for icons

### Backend
- **Node.js** with **Express.js** (ES Modules)
- **MongoDB Atlas** cloud database (`mca_chat` database)
- **Mongoose 8** with schemas, indexes, and validation
- **Socket.IO 4** with authenticated handshake and room management
- **JWT (JSON Web Tokens)** stored in HttpOnly cookies with bearer fallback
- **bcryptjs** for 10-round password hashing

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+

### 2. Environment Variables

The backend uses the following environment variables in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://nandukumar9980:kumar456@cluster0.ecnna5x.mongodb.net/mca_chat?retryWrites=true&w=majority
JWT_SECRET=educonnect_super_secret_jwt_key_2025_mca_token
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Installation

Run from the root directory:
```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 4. Database Seeding (Pre-loaded with Reference Data)

To populate MongoDB Atlas with the exact students, tasks, notes, and timetable from the reference mockup:

```bash
cd server
npm run seed
```

**Seeded Accounts (Password: `password123`):**
- `katemalone` — Kate Malone (Class 9A / MCA Sem 2)
- `priya456` — Priya Sharma (MCA Classmate)
- `arjun123` — Arjun Verma (MCA Classmate)
- `nandu` — Nandu Kumar (Student Admin)

### 5. Running the Application

Open two terminal windows:

**Terminal 1 (Backend Server & Sockets):**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend starts at http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Testing

Run the automated integration tests:
```bash
cd server
node src/test-api.js
```

Verifies:
1. Seeded student profiles in MongoDB Atlas.
2. Bcrypt password hashing and rejection of incorrect passwords.
3. Case-insensitive username normalization.
4. Private task data isolation between different students.
5. Notes color styling and persistence.
6. Class schedule timetable entries.
7. Uniqueness constraint on direct conversations.
8. Real-time message storage and cohort group chat.

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://educonnect-api.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your deployed backend URL (e.g. `https://educonnect-api.onrender.com`)
5. Deploy.

### Backend (Render / Railway)
1. Create a **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://nandukumar9980:kumar456@cluster0.ecnna5x.mongodb.net/mca_chat?retryWrites=true&w=majority`
   - `JWT_SECRET`: A secure random secret string
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Your Vercel frontend URL
6. Ensure persistent WebSocket connections are supported.

---

## 📁 Repository Structure

```
chat app/
├── .planning/               # GSD planning documents (UI-SPEC, ROADMAP, STATE)
├── client/
│   ├── src/
│   │   ├── components/      # Sidebar, Header, TaskModal, NoteModal, ScheduleModal, TestModal
│   │   ├── context/         # AuthContext with token & socket lifecycle
│   │   ├── layouts/         # DashboardLayout (Sidebar + Header + Outlet)
│   │   ├── pages/           # Dashboard, Schedule, Tasks, Notes, Tests, Reports, Chat, Settings, Login, Register, Landing
│   │   ├── services/        # api.js (Axios) and socket.js (Socket.IO client)
│   │   ├── App.jsx          # React Router setup
│   │   ├── index.css        # Tailwind directives and striped progress styling
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/          # MongoDB Atlas connection
│   │   ├── controllers/     # Auth, User, Task, Note, Schedule, Test, Report, Conversation
│   │   ├── middleware/      # JWT authentication middleware
│   │   ├── models/          # Mongoose models (User, Task, Note, Schedule, Test, Conversation, Message)
│   │   ├── routes/          # Express route definitions
│   │   ├── sockets/         # Real-time Socket.IO handler (rooms, typing, presence, messages)
│   │   ├── utils/           # Database seeder (seed.js)
│   │   ├── app.js           # Express app with CORS & error handlers
│   │   ├── server.js        # HTTP server with Socket.IO attachment
│   │   └── test-api.js      # Automated integration test runner
│   ├── package.json
│   ├── .env
│   └── .env.example
├── .gitignore
├── package.json
└── README.md
```
