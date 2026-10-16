# EduConnect — Student Dashboard & Social Communication Platform

## Executive Summary
EduConnect is a full-stack, production-ready student dashboard and social communication platform designed specifically for college students (e.g. MCA cohort). It pairs an authentic recreation of a modern tablet/desktop student dashboard with a real-time MongoDB-backed communication and organization suite.

## Core Features
1. **Dashboard & Visual Identity**: Pixel-accurate implementation of the reference student dashboard (soft off-white canvas `#F1F3F0`, 28px rounded cards, black active nav pills, pastel green and lavender note cards, striped progress indicators, timetable schedule).
2. **Authentication & Session Persistence**: Secure JWT in HttpOnly cookies, registration with username uniqueness, login, password hashing with bcrypt, session refresh, protected routes.
3. **Task Management**: CRUD tasks, status workflow (`todo`, `in_progress`, `done`), subject categorization, priority, comments count, progress bar, persistent storage in MongoDB.
4. **Notes System**: Colorful cards (soft mint green, lavender, amber, rose), pinning, rich content, categorization.
5. **Schedule & Timetable**: Day/week timetable, lesson, teacher with avatar, classroom location, time slots.
6. **Tests & Exam Tracker**: Subject tests, dates, prep notes, status.
7. **Personal Reports**: Real-time calculated completion rates, workload analytics, upcoming deadlines.
8. **Real-time Messaging & Chat**:
   - Universal group chat ("MCA Cohort Discussion").
   - Direct messaging with instant username search ("Search students by username...").
   - Socket.IO real-time delivery, online presence, typing indicators, unread badges, read receipts.
9. **Settings & Profile**: Profile personalization, password updates, theme settings.

## Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React, Socket.IO Client.
- **Backend**: Node.js, Express, MongoDB Atlas (`mca_chat` DB), Mongoose, Socket.IO, JWT, bcryptjs, cors, cookie-parser.
- **Database**: MongoDB Atlas (`mongodb+srv://nandukumar9980:kumar456@cluster0.ecnna5x.mongodb.net/mca_chat`).
