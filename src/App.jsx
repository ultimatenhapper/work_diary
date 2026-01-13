import React, { useState } from "react";
import WorkDiary from "./WorkDiary";
import CalendarView from "./CalendarView";
import AuthPage from "./components/AuthPage";
import { useAuth } from "./hooks/useAuth";

const App = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState("diary"); // 'diary' or 'calendar'

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show app views if logged in
  if (currentView === "calendar") {
    return <CalendarView onSwitchToList={() => setCurrentView("diary")} />;
  }

  return <WorkDiary onSwitchToCalendar={() => setCurrentView("calendar")} />;
};

export default App;
