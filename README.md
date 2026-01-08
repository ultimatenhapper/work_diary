# Task Diary - Personal Activity Journal & Task Manager

A beautiful, editorial-style task management application that helps you track your daily activities with precision and ease. Built with React and Supabase.

![Task Diary](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

### Core Functionality
- **Task Management**: Create, edit, and delete tasks with ease
- **Rich Task Data**: Track descriptions, links, labels, priority levels, start dates, and notes
- **Status Tracking**: Mark tasks as active or completed with visual indicators
- **Quick Recovery**: Resume work exactly where you left off with detailed task information

### Advanced Search & Filtering
- **Full-Text Search**: Search across task descriptions, labels, and notes instantly
- **Date Filtering**: Find tasks by specific dates or date ranges
- **Label Filtering**: Interactive label chips for quick filtering
- **Priority Filtering**: Filter by priority levels (low, medium, high, urgent)
- **Combined Filters**: Use multiple filters simultaneously for precise results
- **Real-time Updates**: Filters apply instantly as you type or select

### Design & UX
- **Editorial Aesthetic**: Warm, refined design with Crimson Pro and Inter fonts
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Visual Priority System**: Color-coded priority indicators and badges
- **Statistics Dashboard**: Overview of total, completed, active, and urgent tasks
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Gradient Background**: Beautiful amber-to-rose gradient creating a warm atmosphere

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** (v14 or higher) and npm installed
- A **Supabase account** (free tier is sufficient)
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Basic knowledge of React and JavaScript

## 🚀 Installation

### Step 1: Set Up Your Development Environment

1. **Create a new React project** (if you don't have one already):

```bash
# Using Create React App
npx create-react-app task-diary-app
cd task-diary-app

# OR using Vite (faster alternative)
npm create vite@latest task-diary-app -- --template react
cd task-diary-app
npm install
```

2. **Install required dependencies**:

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install Lucide React icons
npm install lucide-react
```

### Step 2: Set Up Supabase Backend

#### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: task-diary (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select the closest region to you
   - **Pricing Plan**: Select "Free" tier
5. Click **"Create new project"** and wait 1-2 minutes for setup

#### 2.2 Create the Database Table

1. In your Supabase project dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the following SQL:

```sql
-- Create the tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create indexes for better query performance
CREATE INDEX idx_tasks_started_date ON tasks(started_date DESC);
CREATE INDEX idx_tasks_labels ON tasks USING GIN(labels);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Add a comment to the table
COMMENT ON TABLE tasks IS 'Main table for storing task diary entries';

-- Optional: Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Optional: Create a policy to allow all operations (for development)
-- Note: In production, you should implement proper authentication and policies
CREATE POLICY "Enable all operations for all users" ON tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click **"Run"** or press `Ctrl+Enter` to execute the SQL
5. You should see a success message: "Success. No rows returned"

#### 2.3 Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll find two important values:

   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon Public Key**: A long string starting with `eyJ...`

4. **Copy these values** - you'll need them in the next step

### Step 3: Configure the Application

1. **Add the Task Diary component** to your project:
   - Copy the `task-diary.jsx` file to your `src` folder
   - Rename it to `TaskDiary.jsx` (optional, but follows React conventions)

2. **Update the Supabase credentials** in the component:

Open `src/TaskDiary.jsx` (or `src/task-diary.jsx`) and find lines 8-9:

```javascript
// Replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

Replace with your actual credentials:

```javascript
const supabaseUrl = 'https://xxxxxxxxxxxxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

3. **Import and use the component** in your `src/App.js`:

```javascript
import React from 'react';
import TaskDiary from './TaskDiary';
import './App.css';

function App() {
  return (
    <div className="App">
      <TaskDiary />
    </div>
  );
}

export default App;
```

4. **Optional: Clean up default styles**

Replace the contents of `src/App.css` with:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Step 4: Run the Application

1. **Start the development server**:

```bash
npm start
```

2. **Open your browser** to `http://localhost:3000`

3. **Verify the setup**:
   - You should see the Task Diary interface
   - If database setup is needed, you'll see instructions
   - Try adding your first task!

## 🎯 Usage Guide

### Adding a Task

1. Click the **"New Task"** button in the top right
2. Fill in the task details:
   - **Description** (required): What you're working on
   - **Link** (optional): Related URL or resource
   - **Labels** (optional): Comma-separated tags (e.g., "work, urgent, frontend")
   - **Priority**: Select from Low, Medium, High, or Urgent
   - **Started Date**: When you began this task
   - **Notes** (optional): Additional context or details
3. Click **"Add Task"** to save

### Searching and Filtering Tasks

- **Search**: Type in the search bar to find tasks by description, labels, or notes
- **Filter by Priority**: Use the dropdown to show only specific priority levels
- **Filter by Date**: Select a date to see tasks from that day
- **Filter by Labels**: Click on label chips to filter by specific tags
- **Clear Filters**: Click "Clear Filters" to reset all filters

### Managing Tasks

- **Mark as Complete**: Click the circle checkbox next to any task
- **Edit Task**: Click the pencil icon to modify task details
- **Delete Task**: Click the X icon (you'll be asked to confirm)
- **View Links**: Click "Link" to open the associated URL in a new tab

### Understanding Priority Levels

- **🔵 Low**: Nice to have, no rush
- **🟡 Medium**: Standard priority, default for new tasks
- **🟠 High**: Important, should be addressed soon
- **🔴 Urgent**: Critical, needs immediate attention

## 🔧 Configuration

### Customizing Colors

To change the color scheme, modify the Tailwind classes in `TaskDiary.jsx`:

```javascript
// Background gradient
className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50"

// Primary button color
className="btn-primary" // Defined in the style tag with gradient from amber to orange
```

### Adding More Fields

To add additional fields to tasks:

1. Update the database schema in Supabase:
```sql
ALTER TABLE tasks ADD COLUMN your_new_field TEXT;
```

2. Update the form state in `TaskDiary.jsx`:
```javascript
const [formData, setFormData] = useState({
  // ... existing fields
  your_new_field: '',
});
```

3. Add the input field in the form JSX

### Changing Date Format

Modify the date display format in the task card section:

```javascript
{new Date(task.started_date).toLocaleDateString('en-US', {
  month: 'short',    // Try: 'long', 'numeric', '2-digit'
  day: 'numeric',    // Try: '2-digit'
  year: 'numeric'    // Try: '2-digit' or remove entirely
})}
```

## 🐛 Troubleshooting

### "Database Setup Required" Message

**Problem**: The app shows a setup required message.

**Solutions**:
1. Verify your Supabase credentials are correct
2. Check that the `tasks` table exists in your database
3. Ensure the table has the correct column names
4. Verify RLS policies allow access (see database setup step)

### Tasks Not Appearing

**Problem**: You've added tasks but they don't show up.

**Solutions**:
1. Check browser console for errors (F12 → Console tab)
2. Verify your Supabase project is active (not paused)
3. Check RLS policies: Run this in SQL Editor:
   ```sql
   SELECT * FROM tasks;
   ```
4. Clear filters and search in the app

### CORS or Network Errors

**Problem**: Browser console shows CORS or network errors.

**Solutions**:
1. Verify your Supabase URL doesn't have typos
2. Check that your API key is the **anon public** key (not service role)
3. Ensure your Supabase project is not paused (free tier auto-pauses after inactivity)

### Styling Issues

**Problem**: App doesn't look right or styles are missing.

**Solutions**:
1. Ensure Tailwind CSS is properly configured (if using Vite, not CRA)
2. Check that Google Fonts are loading (network tab)
3. Clear browser cache and reload
4. Try a different browser

### Module Not Found Errors

**Problem**: Errors like "Cannot find module '@supabase/supabase-js'".

**Solutions**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or if that doesn't work, install specifically
npm install @supabase/supabase-js lucide-react
```

## 🔒 Security Considerations

### For Production Use

1. **Enable Row Level Security (RLS)**:
   - The provided SQL includes RLS, but with open policies for development
   - Implement proper authentication (see Supabase Auth documentation)
   - Create user-specific policies:

```sql
-- Example: Only allow users to see their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);
```

2. **Environment Variables**:
   - Move credentials to `.env` file:
```
REACT_APP_SUPABASE_URL=your_url_here
REACT_APP_SUPABASE_ANON_KEY=your_key_here
```
   - Update the code:
```javascript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
```
   - Add `.env` to `.gitignore`

3. **Add Authentication**:
   - Implement Supabase Auth for user accounts
   - Add a `user_id` column to tasks table
   - Filter tasks by authenticated user

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

## 🛠️ Tech Stack

- **Frontend**: React 18+
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS (inline)
- **Icons**: Lucide React
- **Fonts**: Crimson Pro, Inter (Google Fonts)

## 📝 Database Schema Reference

```sql
Column         | Type          | Description
---------------|---------------|------------------------------------------
id             | UUID          | Primary key, auto-generated
description    | TEXT          | Task description (required)
link           | TEXT          | Optional URL/resource link
labels         | TEXT[]        | Array of label strings
started_date   | TIMESTAMPTZ   | When the task was started
priority       | TEXT          | low, medium, high, or urgent
status         | TEXT          | active, completed, or paused
notes          | TEXT          | Additional notes or context
created_at     | TIMESTAMPTZ   | Record creation timestamp
updated_at     | TIMESTAMPTZ   | Last update timestamp
```

## 🤝 Contributing

Feel free to fork this project and customize it for your needs! Some ideas for enhancements:

- Add task duration tracking
- Implement task categories
- Add time-based reminders
- Export tasks to CSV or PDF
- Add dark mode
- Implement drag-and-drop reordering
- Add subtasks or task dependencies
- Integrate with calendar apps
- Add task templates

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review the Supabase logs in your dashboard
3. Check browser console for errors
4. Verify all installation steps were completed

---

**Happy Task Tracking! 📔✨**

Made with ❤️ for productivity enthusiasts