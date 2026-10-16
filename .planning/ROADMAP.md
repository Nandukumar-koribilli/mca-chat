# EduConnect — Implementation Roadmap

## Phases

- [x] **Phase 1: Project Architecture & UI Design Contract**
  - Design tokens, color palette, reference image layout mapping.
  - Setup `.planning/UI-SPEC.md`, `.planning/PROJECT.md`.

- [x] **Phase 2: Backend Architecture & Database Setup**
  - Express server, Mongoose models (`User`, `Task`, `Note`, `Schedule`, `Test`, `Conversation`, `Message`).
  - MongoDB Atlas connection to `mca_chat` database.
  - JWT authentication with secure cookies, password hashing with bcryptjs.
  - REST endpoints for Auth, Users, Tasks, Notes, Schedule, Tests, Reports, Conversations.

- [x] **Phase 3: Real-Time Socket.IO Engine**
  - Socket.IO server initialization with authenticated handshake.
  - Conversation rooms, direct message routing, broadcast events.
  - Typing indicators, online status tracking, unread counter updates, read receipts.

- [x] **Phase 4: Frontend Core & Reference UI Reproduction**
  - Vite + React + Tailwind CSS configuration.
  - Pixel-perfect recreation of reference layout:
    - Left sidebar (logo, black active pill, purple counter badges, settings/logout).
    - Center column (quick action search/notification buttons, Kate Malone/user profile pill, "My tasks" card with filter pills, status badges, striped progress bar).
    - Right column (mint green & lavender "My notes" cards, "My schedule" timetable with teacher avatars and classrooms).

- [x] **Phase 5: Subpages & Full Functionality**
  - Schedule page (calendar & timetable management).
  - Tasks page (full filtering, search, modal creation, progress).
  - Notes page (masonry/grid, color tagging, pinning, editing).
  - Tests page (exam schedules and prep notes).
  - Reports page (live productivity charts and statistics).
  - Profile & Settings pages (bio, display name, password update).

- [x] **Phase 6: Real-time Chat System**
  - 3-panel chat interface (desktop) & mobile responsive view.
  - Direct student search by username ("Search students by username...").
  - Instant 1-on-1 direct messaging and MCA group chat.
  - Unread badges, online indicator, typing animation.

- [x] **Phase 7: End-to-End Verification & Deployment Prep**
  - Integration tests (18/18 tests passed), seed demo student accounts for MCA, production build verification.
  - Documentation and deployment guides for Vercel & Render.
