import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { LogOut, ChevronDown } from "lucide-react";

const UserAvatar = () => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get initials from email
  const getInitials = () => {
    if (!user?.email) return "?";
    const parts = user.email.split("@")[0];
    if (parts.length >= 2) {
      return parts.substring(0, 2).toUpperCase();
    }
    return parts[0].toUpperCase();
  };

  // Generate a consistent color based on email
  const getAvatarColor = () => {
    const colors = [
      "bg-amber-500",
      "bg-orange-500",
      "bg-rose-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-teal-500",
    ];
    if (!user?.email) return colors[0];
    const hash = user.email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="user-avatar flex items-center gap-2 p-1 rounded-full hover:bg-amber-50 transition-colors"
      >
        <div
          className={`w-10 h-10 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-semibold text-sm shadow-md`}
        >
          {getInitials()}
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-amber-100 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Logged in
            </p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
