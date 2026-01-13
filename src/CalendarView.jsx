import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  List,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import UserAvatar from "./components/UserAvatar";

const CalendarView = ({ onSwitchToList }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 border-blue-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    urgent: "bg-red-100 text-red-800 border-red-300",
  };

  const priorityDots = {
    low: "bg-blue-500",
    medium: "bg-amber-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch tasks from Supabase
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("started_date", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((task) => {
      const taskDate = new Date(task.started_date);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  const navigateMonth = (direction) => {
    setCalendarDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setSelectedDay(null);
  };

  const navigateYear = (direction) => {
    setCalendarDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + direction);
      return newDate;
    });
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCalendarDate(new Date());
    setSelectedDay(new Date());
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        h1, h2, h3 {
          font-family: 'Crimson Pro', serif;
        }

        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                Calendar View
              </h1>
              <p className="text-gray-600">
                Visualize your tasks by date
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onSwitchToList}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-medium transition-colors"
              >
                <List size={20} />
                Back to List
              </button>
              <UserAvatar />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-amber-100 fade-in">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateYear(-1)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-gray-600 hover:text-amber-600"
                title="Previous year"
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-gray-600 hover:text-amber-600"
                title="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-gray-600 hover:text-amber-600"
                title="Next month"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => navigateYear(1)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-gray-600 hover:text-amber-600"
                title="Next year"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors"
            >
              Today
            </button>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(calendarDate).map((date, index) => {
              const tasksForDay = date ? getTasksForDate(date) : [];
              const hasUrgent = tasksForDay.some((t) => t.priority === "urgent");
              const hasHigh = tasksForDay.some((t) => t.priority === "high");
              const hasMedium = tasksForDay.some((t) => t.priority === "medium");
              const hasLow = tasksForDay.some((t) => t.priority === "low");

              return (
                <button
                  key={index}
                  onClick={() => date && setSelectedDay(date)}
                  disabled={!date}
                  className={`
                    calendar-day relative aspect-square p-2 rounded-xl transition-all text-sm font-medium
                    ${!date ? "invisible" : ""}
                    ${date && isToday(date) ? "bg-amber-500 text-white shadow-lg" : ""}
                    ${date && isSameDay(date, selectedDay) && !isToday(date) ? "ring-2 ring-amber-500 bg-amber-50" : ""}
                    ${date && !isToday(date) && !isSameDay(date, selectedDay) ? "hover:bg-gray-100 text-gray-700" : ""}
                  `}
                >
                  {date && (
                    <>
                      <span className="block">{date.getDate()}</span>
                      {tasksForDay.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {hasUrgent && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          {hasHigh && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                          {hasMedium && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {hasLow && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Tasks */}
        {selectedDay && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Tasks for {selectedDay.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {getTasksForDate(selectedDay).length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No tasks for this day.
                </p>
              ) : (
                getTasksForDate(selectedDay).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-amber-300 transition-colors"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${priorityDots[task.priority]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-gray-900 ${
                        task.status === "completed" ? "line-through opacity-60" : ""
                      }`}>
                        {task.description}
                      </p>
                      {task.notes && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {task.notes}
                        </p>
                      )}
                      {task.labels?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[...task.labels].sort((a, b) => a.localeCompare(b)).map((label) => (
                            <span
                              key={label}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-200"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-amber-100 text-amber-700 border border-amber-300"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Calendar Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-4 border border-amber-100">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
