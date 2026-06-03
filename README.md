# 🚀 Trava — Driving Instructor Management SaaS

### React + TypeScript + Supabase + Vite

> **Stack:** React 19 · TypeScript · Supabase · Vite · Tailwind CSS  
> **Purpose:** A full-featured SaaS dashboard for driving instructors to manage students, lessons, payments, and progress.

---

## 🧠 Tech Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 19 + TypeScript | Component-based UI with full type safety |
| Build Tool | Vite 7 | Fast dev server & optimised production builds |
| Styling | Tailwind CSS 4 | Utility-first responsive design |
| Routing | React Router 7 | Client-side navigation |
| Backend / DB | Supabase (PostgreSQL) | Database, auth, storage, realtime |
| Authentication | Supabase Auth | Email/Password + Google OAuth |
| File Storage | Supabase Storage | Profile photo uploads |
| Data Security | Row Level Security (RLS) | Per-instructor data isolation |
| Deployment | Vercel / Static host | Single-file bundle via vite-plugin-singlefile |

---

## 📦 Project Structure

```
saas/
├── src/
│   ├── components/        # Reusable UI (Dashboard, Sidebar, Views)
│   ├── context/           # AuthContext — session & login state
│   ├── hooks/             # useInstructorData custom hook
│   ├── layouts/           # AppLayout, DashboardLayout
│   ├── lib/               # Supabase client, auth redirect, storage
│   ├── pages/             # LoginPage, RegisterPage, AuthCallbackPage, ProfilePage
│   ├── services/          # Data fetching, CSV export
│   ├── types/             # TypeScript interfaces (Student, Lesson, Payment…)
│   ├── utils/             # cn(), formatId helpers
│   ├── App.tsx            # Router & route definitions
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles & font imports
├── supabase/
│   └── schema.sql         # PostgreSQL schema + RLS policies
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript compiler options
└── .env.example           # Environment variable template
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1 — Clone & Install

```bash
git clone https://github.com/your-username/saas.git
cd saas
npm install
```

### 2 — Configure Environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_STORAGE_BUCKET=avatars
```

### 3 — Set Up the Database

Run the schema in your Supabase SQL editor:

```bash
# Open supabase/schema.sql and run it in the Supabase dashboard SQL editor
```

### 4 — Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build optimised production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## ✨ Features

### 📊 Dashboard
Real-time overview of your business at a glance:
- Active student count
- Today's lesson schedule
- Monthly earnings tracking
- Upcoming lessons (next 7 days)
- Student payment balance alerts

### 📅 Smart Diary
- Book and manage driving lessons
- Time-slot based scheduling
- View lessons by date

### 👥 Students
- Full student profile management
- Status tracking: Active · Passed · Cancelled
- Theory test progress monitoring
- Contact information storage

### 📈 Progress Tracker
- Per-student skill ratings (1–5 scale)
- Skill categories stored as JSONB in PostgreSQL
- Visual progress overview

### 💳 Payments
- Log payments with Paid / Due status
- Track balances per student
- Monthly earnings summary
- CSV export for accounting

### 📚 Resource Library
- Store YouTube video links and learning materials
- Category-based organisation
- Descriptions and quick-access links

### 📤 Import / Export
- CSV backup of all data
- Export students, lessons, and payments

### 👤 Profile
- Personal information management
- Hourly rate configuration
- Avatar upload (Supabase Storage)
- Social media links
- Password change

---

## 🗄️ Database Schema

```
profiles          — instructor info, hourly rate, social links
students          — student data, status, theory test progress
lessons           — bookings with start/end times, linked to student
payments          — payment records, status (Paid/Due), amount
student_progress  — skill ratings per student (JSONB)
resources         — learning materials, YouTube links, categories
```

All tables are protected by **Row Level Security (RLS)** — each instructor can only read and write their own data.

---

## 🔐 Authentication

| Method | Status |
|---|---|
| Email / Password sign-up | ✅ Supported |
| Email / Password login | ✅ Supported |
| Google OAuth | ✅ Supported |
| Session persistence | ✅ Auto via Supabase |
| Protected routes | ✅ ProtectedRoute component |

---

## 🚀 Deployment

### Deploy to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_STORAGE_BUCKET`
4. Deploy — Vercel handles the rest automatically

### Deploy as Single File

The project includes `vite-plugin-singlefile`. To bundle everything into one HTML file:

```bash
npm run build
# dist/index.html will contain the entire app
```

---

## ✅ Development Checklist

- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS 4 integration
- [x] Supabase client configuration
- [x] Authentication (email/password + Google OAuth)
- [x] Protected routes with middleware
- [x] Dashboard with real-time stats
- [x] Student management module
- [x] Smart Diary (lesson booking)
- [x] Progress tracker with skill ratings
- [x] Payments module with balance tracking
- [x] Resource Library
- [x] CSV import/export
- [x] Profile management with avatar upload
- [x] RLS policies for all tables
- [ ] Stripe subscription billing
- [ ] Email notifications (Resend)
- [ ] Sentry error tracking
- [ ] PostHog analytics
- [ ] Mobile-optimised layout

---

## 📋 Complete Tech Stack

```
Frontend      →  React 19 (Vite) + TypeScript
Styling       →  Tailwind CSS 4 + custom design tokens
Database      →  Supabase (PostgreSQL)
Auth          →  Supabase Auth (Email + Google OAuth)
File Storage  →  Supabase Storage (avatar bucket)
Routing       →  React Router 7
Data Security →  Row Level Security (RLS)
Deployment    →  Vercel
Bundle        →  vite-plugin-singlefile (single HTML output)
```

---

## 🇧🇩 বাংলায় সংক্ষিপ্ত গাইড

### প্রজেক্ট কী?
**Trava** হলো একটি ড্রাইভিং ইন্সট্রাক্টরদের জন্য তৈরি SaaS ড্যাশবোর্ড। এটা দিয়ে একজন ইন্সট্রাক্টর তাঁর ছাত্রছাত্রী, লেসন শিডিউল, পেমেন্ট এবং প্রোগ্রেস ট্র্যাক করতে পারবেন।

### কীভাবে শুরু করবেন?
1. রেপো clone করুন এবং `npm install` দিন
2. `.env.example` কপি করে `.env.local` বানান এবং Supabase credentials দিন
3. `supabase/schema.sql` ফাইলটি Supabase SQL editor-এ রান করুন
4. `npm run dev` দিয়ে local server চালু করুন

### গুরুত্বপূর্ণ বিষয়সমূহ
- **RLS Policy:** প্রতিটি ইন্সট্রাক্টর শুধু তাঁর নিজের data দেখতে পারবেন — এটা database level-এ enforce হয়
- **Google OAuth:** Supabase dashboard-এ Google provider enable করতে হবে
- **Environment Variables:** `.env.local` ফাইল কখনো git-এ push করবেন না

---

## 💡 Pro Tips

1. **RLS সবার আগে:** নতুন table বানালেই RLS policy লিখুন — পরে মনে থাকে না।
2. **TypeScript strict mode:** `tsconfig.json`-এ strict mode চালু আছে — `any` type এড়িয়ে চলুন।
3. **Supabase local dev:** `supabase start` দিয়ে locally Supabase চালাতে পারবেন — production DB-তে test করবেন না।
4. **Vite env prefix:** শুধু `VITE_` prefix দেওয়া variables client-side-এ accessible — secret keys কখনো `VITE_` দিয়ে শুরু করবেন না।
5. **React Router + Supabase Auth:** Auth callback URL Supabase dashboard-এ whitelist করতে ভুলবেন না।

---

*Built for driving instructors — manage your business, not spreadsheets.*  
*Last updated: June 2026*
