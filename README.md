# Work Diary - Personal Activity Journal & Task Manager

A beautiful, editorial-style task management application with user authentication and calendar view. Built with React, Supabase, and Tailwind CSS.

![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat&logo=vite&logoColor=white)

## Features

### Authentication
- **Email/Password Login**: Secure user authentication via Supabase Auth
- **User Registration**: Create new accounts with email confirmation
- **User Avatar**: Initials-based avatar with logout dropdown
- **Session Persistence**: Stay logged in across browser sessions
- **Per-User Data**: Each user sees only their own tasks

### Task Management
- **Create, Edit, Delete**: Full CRUD operations for tasks
- **Rich Task Data**: Description, links, labels, priority, dates, and notes
- **Status Tracking**: Mark tasks as active or completed
- **Priority Levels**: Low, Medium, High, Urgent with color coding

### Views
- **List View**: Traditional task list with search and filters
- **Calendar View**: Monthly calendar visualization of tasks by date
  - Navigate by month and year
  - Priority indicators on calendar days
  - Click any day to see tasks

### Search & Filtering
- **Full-Text Search**: Search descriptions, labels, and notes
- **Date Filtering**: Filter by specific dates
- **Label Filtering**: Interactive label chips
- **Priority Filtering**: Filter by priority level
- **Statistics**: Overview of total, completed, active, and urgent tasks

## Tech Stack

- **Frontend**: React 18 + Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Fonts**: Crimson Pro, Inter

## Project Structure

```
src/
├── components/
│   ├── AuthPage.jsx      # Login/signup page
│   └── UserAvatar.jsx    # User avatar with dropdown
├── context/
│   ├── AuthContext.jsx   # Auth provider component
│   └── AuthContextDef.js # Auth context definition
├── hooks/
│   └── useAuth.js        # Auth hook
├── lib/
│   └── supabase.js       # Supabase client
├── App.jsx               # Main app with auth routing
├── WorkDiary.jsx         # List view component
├── CalendarView.jsx      # Calendar view component
└── main.jsx              # Entry point
```

## Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd work_diary
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  link TEXT,
  labels TEXT[],
  started_date TIMESTAMPTZ DEFAULT NOW(),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_started_date ON tasks(started_date DESC);
CREATE INDEX idx_tasks_labels ON tasks USING GIN(labels);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Run the Application

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

### First Time
1. Click "Sign up" on the login page
2. Enter your email and password
3. Check your email for confirmation (if enabled in Supabase)
4. Log in with your credentials

### Adding Tasks
1. Click "New Task" button
2. Fill in the details:
   - **Description** (required)
   - **Link** (optional URL)
   - **Labels** (comma-separated)
   - **Priority** (Low/Medium/High/Urgent)
   - **Date** and **Notes**
3. Click "Add Task"

### Calendar View
1. Click "Calendar" button in the header
2. Navigate months with arrow buttons
3. Click "Today" to jump to current date
4. Click any day to see tasks for that date
5. Click "Back to List" to return

### User Menu
- Click your avatar (top right) to see options
- Click "Sign out" to log out

## Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (references auth.users) |
| description | TEXT | Task description (required) |
| link | TEXT | Optional URL |
| labels | TEXT[] | Array of label strings |
| started_date | TIMESTAMPTZ | Task start date |
| priority | TEXT | low, medium, high, urgent |
| status | TEXT | active, completed, paused |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Set environment variables on your hosting platform
4. Configure Supabase Auth redirect URLs in your Supabase dashboard

## Troubleshooting

### "Invalid login credentials"
- Verify email and password are correct
- Check if email confirmation is required in Supabase Auth settings

### Tasks not showing
- Ensure you're logged in
- Check browser console for errors
- Verify RLS policies are set up correctly

### CORS errors
- Verify Supabase URL is correct
- Check that you're using the anon key (not service role key)

## License

MIT License
