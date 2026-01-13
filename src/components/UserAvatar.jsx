import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { LogOut, ChevronDown, Key, X, Eye, EyeOff, User, Check } from "lucide-react";

const AVATAR_COLORS = [
  { name: "amber", hex: "#f59e0b" },
  { name: "orange", hex: "#f97316" },
  { name: "rose", hex: "#f43f5e" },
  { name: "red", hex: "#ef4444" },
  { name: "purple", hex: "#a855f7" },
  { name: "blue", hex: "#3b82f6" },
  { name: "green", hex: "#22c55e" },
  { name: "teal", hex: "#14b8a6" },
  { name: "indigo", hex: "#6366f1" },
  { name: "pink", hex: "#ec4899" },
  { name: "cyan", hex: "#06b6d4" },
  { name: "slate", hex: "#64748b" },
];

const UserAvatar = () => {
  const { user, signOut, updatePassword, updateProfile } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Avatar customization state
  const [selectedColor, setSelectedColor] = useState(null);
  const [customInitials, setCustomInitials] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess(false);
      }, 1500);
    } catch (error) {
      setError(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSave = async () => {
    setAvatarError("");
    setAvatarSuccess(false);

    if (customInitials && (customInitials.length < 1 || customInitials.length > 2)) {
      setAvatarError("Initials must be 1-2 characters");
      return;
    }

    setAvatarLoading(true);
    try {
      await updateProfile({
        avatar_color: selectedColor,
        avatar_initials: customInitials.toUpperCase() || null,
      });
      setAvatarSuccess(true);
      setTimeout(() => {
        setShowAvatarModal(false);
        setAvatarSuccess(false);
      }, 1000);
    } catch (error) {
      setAvatarError(error.message || "Failed to update avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  const openPasswordModal = () => {
    setShowDropdown(false);
    setShowPasswordModal(true);
    setError("");
    setSuccess(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const openAvatarModal = () => {
    setShowDropdown(false);
    setShowAvatarModal(true);
    setAvatarError("");
    setAvatarSuccess(false);
    // Initialize with current values
    setSelectedColor(user?.user_metadata?.avatar_color || null);
    setCustomInitials(user?.user_metadata?.avatar_initials || "");
  };

  // Get initials from email or custom
  const getInitials = () => {
    // Check for custom initials in user metadata
    if (user?.user_metadata?.avatar_initials) {
      return user.user_metadata.avatar_initials;
    }
    if (!user?.email) return "?";
    const parts = user.email.split("@")[0];
    if (parts.length >= 2) {
      return parts.substring(0, 2).toUpperCase();
    }
    return parts[0].toUpperCase();
  };

  // Generate a consistent color based on email or use custom
  const getAvatarColor = () => {
    // Check for custom color in user metadata
    if (user?.user_metadata?.avatar_color) {
      const customColor = AVATAR_COLORS.find(c => c.name === user.user_metadata.avatar_color);
      if (customColor) return customColor.hex;
    }

    const defaultColors = AVATAR_COLORS.map(c => c.hex);
    if (!user?.email) return defaultColors[0];
    const hash = user.email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return defaultColors[hash % defaultColors.length];
  };

  // Preview initials for modal
  const getPreviewInitials = () => {
    if (customInitials) return customInitials.toUpperCase();
    return getInitials();
  };

  // Preview color for modal
  const getPreviewColor = () => {
    if (selectedColor) {
      const color = AVATAR_COLORS.find(c => c.name === selectedColor);
      if (color) return color.hex;
    }
    return getAvatarColor();
  };

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="user-avatar flex items-center gap-2 p-1 rounded-full hover:bg-amber-50 transition-colors"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
            style={{ backgroundColor: getAvatarColor() }}
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
                onClick={openAvatarModal}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2 transition-colors"
              >
                <User size={16} />
                Change avatar
              </button>
              <button
                onClick={openPasswordModal}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2 transition-colors"
              >
                <Key size={16} />
                Change password
              </button>
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

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Change Avatar</h2>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {avatarError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {avatarError}
                </div>
              )}

              {avatarSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Avatar updated successfully!
                </div>
              )}

              {/* Preview */}
              <div className="flex flex-col items-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-all"
                  style={{ backgroundColor: getPreviewColor() }}
                >
                  {getPreviewInitials()}
                </div>
                <p className="text-sm text-gray-500 mt-3">Preview</p>
              </div>

              {/* Custom Initials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Initials (optional)
                </label>
                <input
                  type="text"
                  value={customInitials}
                  onChange={(e) => setCustomInitials(e.target.value.slice(0, 2))}
                  placeholder="e.g. JD"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use email initials
                </p>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avatar Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                        selectedColor === color.name
                          ? "ring-2 ring-offset-2 ring-gray-900"
                          : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.name && (
                        <Check size={18} className="text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedColor(null)}
                  className="text-xs text-amber-600 hover:text-amber-700 mt-2"
                >
                  Reset to default color
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAvatarSave}
                  disabled={avatarLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {avatarLoading ? "Saving..." : "Save Avatar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Password updated successfully!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-amber-400 focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAvatar;
