# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Work Diary is a personal activity journal and task management web application with user authentication. It's a React frontend that connects to Supabase for authentication and data persistence.

## Common Commands

```bash
npm run dev       # Start development server (Vite, hot reload)
npm run build     # Build for production
npm run lint      # Run ESLint checks
npm run preview   # Preview production build locally
```

## Tech Stack

- **Frontend:** React 18 with Vite
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react

## Architecture

```
src/
├── components/
│   ├── AuthPage.jsx      # Login/signup UI
│   └── UserAvatar.jsx    # User avatar with logout dropdown
├── context/
│   ├── AuthContext.jsx   # Auth provider (manages auth state)
│   └── AuthContextDef.js # Auth context definition
├── hooks/
│   └── useAuth.js        # Hook to access auth context
├── lib/
│   └── supabase.js       # Centralized Supabase client
├── App.jsx               # View router + auth guard
├── WorkDiary.jsx         # Main list view (~900 lines)
├── CalendarView.jsx      # Calendar view (~400 lines)
└── main.jsx              # Entry point with AuthProvider
```

### Key Components

- **App.jsx** - Routes between views, shows AuthPage if not logged in
- **WorkDiary.jsx** - List view with task CRUD, search, filters, stats
- **CalendarView.jsx** - Monthly calendar with task visualization
- **AuthContext.jsx** - Provides user, signIn, signUp, signOut

### Data Flow

1. `main.jsx` wraps app with `AuthProvider`
2. `App.jsx` checks auth state via `useAuth()` hook
3. If logged in, renders WorkDiary or CalendarView
4. Both views filter tasks by `user_id` using Supabase RLS

## Database Schema

Tasks table with Row Level Security:
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users(id)
- `description` (TEXT) - Required task description
- `link` (TEXT) - Optional URL
- `labels` (TEXT[]) - Array of label strings
- `started_date` (TIMESTAMPTZ) - Task start date
- `priority` (TEXT) - low/medium/high/urgent
- `status` (TEXT) - active/completed/paused
- `notes` (TEXT) - Optional notes
- `created_at`, `updated_at` (TIMESTAMPTZ)

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Code Patterns

- Supabase client is centralized in `src/lib/supabase.js`
- Auth state managed via React Context (`AuthContext`)
- All task queries include `.eq("user_id", user.id)` filter
- Task creation includes `user_id: user.id` in the data
- Priority colors: low=blue, medium=amber, high=orange, urgent=red
- Labels stored as comma-separated in form, converted to arrays for DB
