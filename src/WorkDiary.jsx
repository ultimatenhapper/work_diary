import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  Edit2,
  Link as LinkIcon,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import UserAvatar from "./components/UserAvatar";

/*
DATABASE SETUP:
Create a table in your Supabase project with this SQL:

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  link TEXT,
  labels TEXT[],
  started_date TIMESTAMPTZ DEFAULT NOW(),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_started_date ON tasks(started_date DESC);
CREATE INDEX idx_tasks_labels ON tasks USING GIN(labels);
CREATE INDEX idx_tasks_status ON tasks(status);
*/

const WorkDiary = ({ onSwitchToCalendar }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [statFilter, setStatFilter] = useState(null); // 'completed' or 'active'
  const [labelsExpanded, setLabelsExpanded] = useState(true);
  const [editingLabel, setEditingLabel] = useState(null);
  const [editLabelValue, setEditLabelValue] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    link: "",
    labels: "",
    priority: "medium",
    notes: "",
    started_date: new Date().toISOString().split("T")[0],
  });

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

      if (error) {
        if (
          error.message.includes("relation") ||
          error.message.includes("does not exist")
        ) {
          setSetupNeeded(true);
        }
        throw error;
      }

      setTasks(data || []);
      setFilteredTasks(data || []);
      setSetupNeeded(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on search, date, labels, priority
  useEffect(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.labels?.some((label) =>
            label.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.started_date).toDateString();
        return taskDate === new Date(selectedDate).toDateString();
      });
    }

    // Labels filter
    if (selectedLabels.length > 0) {
      filtered = filtered.filter((task) =>
        task.labels?.some((label) => selectedLabels.includes(label)),
      );
    }

    // Priority filter
    if (selectedPriority) {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    setFilteredTasks(filtered);
  }, [searchQuery, selectedDate, selectedLabels, selectedPriority, tasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
      description: formData.description,
      link: formData.link || null,
      labels: formData.labels
        ? formData.labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
      priority: formData.priority,
      notes: formData.notes || null,
      started_date: formData.started_date,
      status: "active",
      user_id: user.id,
    };

    try {
      if (editingTask) {
        const { error } = await supabase
          .from("tasks")
          .update({ ...taskData, updated_at: new Date().toISOString() })
          .eq("id", editingTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert([taskData]);

        if (error) throw error;
      }

      // Reset form
      setFormData({
        description: "",
        link: "",
        labels: "",
        priority: "medium",
        notes: "",
        started_date: new Date().toISOString().split("T")[0],
      });
      setShowAddForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task. Please check your Supabase configuration.");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      description: task.description,
      link: task.link || "",
      labels: task.labels?.join(", ") || "",
      priority: task.priority,
      notes: task.notes || "",
      started_date: task.started_date.split("T")[0],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "active" ? "completed" : "active";
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", task.id);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleRenameLabel = async (oldLabel, newLabel) => {
    const trimmedNewLabel = newLabel.trim();
    if (!trimmedNewLabel || trimmedNewLabel === oldLabel) {
      setEditingLabel(null);
      setEditLabelValue("");
      return;
    }

    try {
      // Find all tasks that have this label
      const tasksWithLabel = tasks.filter((task) =>
        task.labels?.includes(oldLabel),
      );

      // Update each task, replacing the old label with the new one
      for (const task of tasksWithLabel) {
        const updatedLabels = task.labels.map((l) =>
          l === oldLabel ? trimmedNewLabel : l,
        );
        const { error } = await supabase
          .from("tasks")
          .update({
            labels: updatedLabels,
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.id);

        if (error) throw error;
      }

      // Update selectedLabels if the renamed label was selected
      if (selectedLabels.includes(oldLabel)) {
        setSelectedLabels((prev) =>
          prev.map((l) => (l === oldLabel ? trimmedNewLabel : l)),
        );
      }

      setEditingLabel(null);
      setEditLabelValue("");
      fetchTasks();
    } catch (error) {
      console.error("Error renaming label:", error);
      alert("Error renaming label. Please try again.");
    }
  };

  const handleDeleteLabel = async (labelToDelete) => {
    if (
      !confirm(
        `Delete label "${labelToDelete}"? This will remove it from all tasks.`,
      )
    ) {
      return;
    }

    try {
      // Find all tasks that have this label
      const tasksWithLabel = tasks.filter((task) =>
        task.labels?.includes(labelToDelete),
      );

      // Update each task, removing the label
      for (const task of tasksWithLabel) {
        const updatedLabels = task.labels.filter((l) => l !== labelToDelete);
        const { error } = await supabase
          .from("tasks")
          .update({
            labels: updatedLabels,
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.id);

        if (error) throw error;
      }

      // Remove from selectedLabels if it was selected
      setSelectedLabels((prev) => prev.filter((l) => l !== labelToDelete));

      fetchTasks();
    } catch (error) {
      console.error("Error deleting label:", error);
      alert("Error deleting label. Please try again.");
    }
  };

  // Get unique labels from all tasks, sorted alphabetically
  const allLabels = [
    ...new Set(tasks.flatMap((task) => task.labels || [])),
  ].sort((a, b) => a.localeCompare(b));

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

  if (setupNeeded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-amber-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">
                Database Setup Required
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Please set up your Supabase database first. Here's what you need
              to do:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
              <li>
                Create a Supabase project at{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  className="text-amber-600 hover:underline"
                >
                  supabase.com
                </a>
              </li>
              <li>Get your project URL and anon key from Settings → API</li>
              <li>Update the credentials in the code (lines 8-9)</li>
              <li>
                Run the SQL provided in the code comments to create the tasks
                table
              </li>
            </ol>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-mono text-gray-700">
                const supabaseUrl = 'YOUR_SUPABASE_URL';
                <br />
                const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Crimson Pro', serif;
        }
        
        .task-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .label-chip {
          transition: all 0.2s ease;
        }
        
        .label-chip:hover {
          transform: scale(1.05);
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
        
        .btn-primary {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.3);
        }
        
        .search-input {
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                Work Diary
              </h1>
              <p className="text-gray-600">
                Your personal activity journal and task manager
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onSwitchToCalendar}
                className="flex items-center gap-2 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-medium transition-colors"
              >
                <CalendarDays size={20} />
                Calendar
              </button>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (!showAddForm) {
                    setEditingTask(null);
                    setFormData({
                      description: "",
                      link: "",
                      labels: "",
                      priority: "medium",
                      notes: "",
                      started_date: new Date().toISOString().split("T")[0],
                    });
                  }
                }}
                className="btn-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
              >
                {showAddForm ? <X size={20} /> : <Plus size={20} />}
                {showAddForm ? "Cancel" : "New Task"}
              </button>
              <UserAvatar />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-75 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search tasks, labels, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full pl-12 pr-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:border-amber-400 bg-white"
              />
            </div>

            <select
              value={selectedPriority || ""}
              onChange={(e) => setSelectedPriority(e.target.value || null)}
              className="px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:border-amber-400 bg-white"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:border-amber-400 bg-white"
            />

            {(searchQuery ||
              selectedDate ||
              selectedPriority ||
              selectedLabels.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDate(null);
                  setSelectedPriority(null);
                  setSelectedLabels([]);
                }}
                className="px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Label Filter Chips */}
          {allLabels.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setLabelsExpanded(!labelsExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-2"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${labelsExpanded ? "" : "-rotate-90"}`}
                />
                Labels ({allLabels.length})
                {selectedLabels.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs">
                    {selectedLabels.length} selected
                  </span>
                )}
              </button>
              {labelsExpanded && (
                <div className="flex flex-wrap gap-2">
                  {allLabels.map((label) => {
                    const isSelected = selectedLabels.includes(label);

                    if (isSelected) {
                      return (
                        <button
                          key={label}
                          onClick={() =>
                            setSelectedLabels((prev) =>
                              prev.filter((l) => l !== label),
                            )
                          }
                          className="label-chip px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500 text-white shadow-md transition-all"
                        >
                          {label}
                        </button>
                      );
                    }

                    if (editingLabel === label) {
                      return (
                        <form
                          key={label}
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleRenameLabel(label, editLabelValue);
                          }}
                          className="flex items-center"
                        >
                          <input
                            type="text"
                            value={editLabelValue}
                            onChange={(e) => setEditLabelValue(e.target.value)}
                            onBlur={() =>
                              handleRenameLabel(label, editLabelValue)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setEditingLabel(null);
                                setEditLabelValue("");
                              }
                            }}
                            autoFocus
                            className="w-24 px-3 py-1.5 text-sm rounded-full border border-amber-400 outline-none bg-white text-gray-900"
                          />
                        </form>
                      );
                    }

                    return (
                      <div
                        key={label}
                        className="label-chip group flex items-center gap-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-amber-200 hover:border-amber-400 transition-all"
                      >
                        <button
                          onClick={() =>
                            setSelectedLabels((prev) => [...prev, label])
                          }
                          className="pl-3 py-1.5"
                        >
                          {label}
                        </button>
                        <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLabel(label);
                              setEditLabelValue(label);
                            }}
                            className="p-1 rounded-full transition-colors hover:bg-amber-100"
                            title="Edit label"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLabel(label);
                            }}
                            className="p-1 rounded-full transition-colors hover:bg-red-100 hover:text-red-600"
                            title="Delete label"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-amber-200 fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTask ? "Edit Task" : "Add New Task"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What are you working on?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none resize-none"
                  rows="3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Labels (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.labels}
                    onChange={(e) =>
                      setFormData({ ...formData, labels: e.target.value })
                    }
                    placeholder="work, project, urgent"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Started Date
                  </label>
                  <input
                    type="date"
                    value={formData.started_date}
                    onChange={(e) =>
                      setFormData({ ...formData, started_date: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional context or notes..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none resize-none"
                  rows="2"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary text-white px-6 py-3 rounded-xl font-semibold flex-1"
                >
                  {editingTask ? "Update Task" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-amber-100">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500">
              {tasks.length === 0
                ? "Start by adding your first task!"
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 w-full max-w-5xl">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="task-card bg-white rounded-2xl shadow-lg p-6 border border-amber-100"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Indicator */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        priorityDots[task.priority]
                      }`}
                    />
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={`w-6 h-6 rounded-full border-2 transition-colors ${
                        task.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300 hover:border-amber-500"
                      }`}
                    >
                      {task.status === "completed" && (
                        <svg
                          className="w-full h-full text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p
                          className={`text-lg font-medium text-gray-900 mb-2 ${
                            task.status === "completed"
                              ? "line-through opacity-60"
                              : ""
                          }`}
                        >
                          {task.description}
                        </p>

                        {task.notes && (
                          <p className="text-sm text-gray-600 mb-3">
                            {task.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {new Date(task.started_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>

                          {task.link && (
                            <a
                              href={task.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:underline"
                            >
                              <LinkIcon size={16} />
                              Link
                            </a>
                          )}

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {[...task.labels]
                              .sort((a, b) => a.localeCompare(b))
                              .map((label) => (
                                <span
                                  key={label}
                                  className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200"
                                >
                                  <Tag size={12} className="inline mr-1" />
                                  {label}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className={`px-4 py-2 rounded-lg transition-all font-medium text-sm flex items-center gap-2 ${
                            task.status === "active"
                              ? "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
                              : "bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300"
                          }`}
                          title={
                            task.status === "active"
                              ? "Mark as completed"
                              : "Reactivate task"
                          }
                        >
                          {task.status === "active" ? (
                            <>
                              <Check size={16} />
                              Complete
                            </>
                          ) : (
                            <>
                              <ArrowLeft size={16} />
                              Reactivate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-gray-600 hover:text-amber-600"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-amber-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {tasks.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
            </div>
            <button
              onClick={() =>
                setStatFilter(statFilter === "completed" ? null : "completed")
              }
              className={`text-center p-3 rounded-xl transition-all ${
                statFilter === "completed"
                  ? "bg-green-50 ring-2 ring-green-500"
                  : "hover:bg-green-50"
              }`}
            >
              <div className="text-3xl font-bold text-green-600">
                {tasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </button>
            <button
              onClick={() =>
                setStatFilter(statFilter === "active" ? null : "active")
              }
              className={`text-center p-3 rounded-xl transition-all ${
                statFilter === "active"
                  ? "bg-amber-50 ring-2 ring-amber-500"
                  : "hover:bg-amber-50"
              }`}
            >
              <div className="text-3xl font-bold text-amber-600">
                {tasks.filter((t) => t.status === "active").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active</div>
            </button>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {tasks.filter((t) => t.priority === "urgent").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Urgent</div>
            </div>
          </div>

          {/* Stat Filter Task List */}
          {statFilter && (
            <div className="mt-6 border-t border-amber-100 pt-6 fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {statFilter === "completed"
                    ? "Completed Tasks"
                    : "Active Tasks"}
                </h3>
                <button
                  onClick={() => setStatFilter(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks
                  .filter((t) => t.status === statFilter)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          priorityDots[task.priority]
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium text-gray-900 truncate ${
                            task.status === "completed"
                              ? "line-through opacity-60"
                              : ""
                          }`}
                        >
                          {task.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(task.started_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                          {task.labels?.length > 0 &&
                            ` · ${[...task.labels].sort((a, b) => a.localeCompare(b)).join(", ")}`}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityColors[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                {tasks.filter((t) => t.status === statFilter).length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No {statFilter} tasks found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkDiary;
