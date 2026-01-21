# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Work Diary is a personal task management web application with user authentication. React frontend connecting to Supabase for auth and data persistence.

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

### Data Flow

1. `main.jsx` wraps app with `AuthProvider`
2. `App.jsx` checks auth state via `useAuth()` hook
3. If not logged in → `AuthPage`, otherwise → `WorkDiary` or `CalendarView`
4. Both views filter tasks by `user_id` using Supabase RLS

### Key Files

- **App.jsx** - View router + auth guard (diary/calendar toggle)
- **WorkDiary.jsx** - Main list view with task CRUD, search, filters, stats (~900 lines)
- **CalendarView.jsx** - Monthly calendar with task visualization (~400 lines)
- **AuthContext.jsx** - Provides `user`, `signIn`, `signUp`, `signOut`, `updatePassword`, `updateProfile`, `resetPassword`
- **lib/supabase.js** - Centralized Supabase client instance

## Database Schema

Tasks table with Row Level Security:
- `id` (UUID), `user_id` (UUID → auth.users)
- `description` (TEXT, required), `link` (TEXT), `notes` (TEXT)
- `labels` (TEXT[]), `priority` (low/medium/high/urgent), `status` (active/completed/paused)
- `started_date`, `created_at`, `updated_at` (TIMESTAMPTZ)

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Code Patterns

- All Supabase queries go through `src/lib/supabase.js`
- All task queries must include `.eq("user_id", user.id)` filter
- Task creation must include `user_id: user.id` in the data
- Priority colors: low=blue, medium=amber, high=orange, urgent=red
- Labels: comma-separated in forms, converted to arrays for DB storage
- User profile data (avatar_color, avatar_initials) stored in `user.user_metadata`
