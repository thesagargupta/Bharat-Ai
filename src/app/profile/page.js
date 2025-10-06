"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiArrowLeft, FiUser, FiMail, FiCalendar, FiEdit2, FiCamera } from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Sagar Gupta",
    email: "sagar@bharatai.com",
    joinedDate: "October 2025",
    bio: "AI enthusiast and developer passionate about creating intelligent solutions.",
    avatar: "/logo.png"
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const handleSave = () => {
    setProfile({ ...editForm });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <FiArrowLeft size={24} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">Manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-6 sm:px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
                  <Image
                    src={profile.avatar}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors">
                  <FiCamera size={16} />
                </button>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end mb-6">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <FiEdit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiUser size={18} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profile.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiMail size={18} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profile.email}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  About
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="text-gray-700">{profile.bio}</p>
                )}
              </div>

              {/* Joined Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar size={18} />
                  Member Since
                </label>
                <p className="text-lg text-gray-900">{profile.joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">42</div>
            <div className="text-sm text-gray-600">Total Chats</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">15</div>
            <div className="text-sm text-gray-600">Images Analyzed</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">128</div>
            <div className="text-sm text-gray-600">Messages Sent</div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Bharat AI v1.0.0 • Made with ❤️ by Sagar Gupta
          </p>
        </div>
      </div>
    </div>
  );
}
