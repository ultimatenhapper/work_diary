# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Work Diary is a personal activity journal and task management web application. It's a modern React frontend that connects to Supabase (PostgreSQL) for data persistence.

## Common Commands

```bash
npm run dev       # Start development server (Vite, hot reload)
npm run build     # Build for production
npm run lint      # Run ESLint checks
npm run preview   # Preview production build locally
```

## Tech Stack

- **Frontend:** React 18 with Vite 7
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react

## Architecture

The application uses a monolithic single-component architecture:

- `src/WorkDiary.jsx` - Main component containing all application logic (~800 lines):
  - State management using React Hooks (useState, useEffect)
  - Supabase CRUD operations for tasks
  - Filtering system (search, date, priority, labels)
  - Task list rendering with inline actions
  - Form modal for creating/editing tasks
  - Statistics dashboard

- `src/main.jsx` - React entry point, renders WorkDiary component

## Database Schema

Tasks table structure in Supabase:
- `id` (UUID) - Primary key
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

- All Supabase interactions are in WorkDiary.jsx using `@supabase/supabase-js`
- Filtering is client-side after fetching all tasks
- Priority levels are color-coded (low=blue, medium=amber, high=orange, urgent=rose)
- Labels are stored as comma-separated strings in the form, converted to arrays for storage
