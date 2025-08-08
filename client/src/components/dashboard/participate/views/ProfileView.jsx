import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Trophy, User, Calendar, Lock } from 'lucide-react';

// Profile View Component
const ProfileView = ({ themeColors, user, setModalContent, setShowModal }) => {
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return { backgroundColor: '#3b82f6', color: '#ffffff' };
      case 'superadmin':
        return { backgroundColor: '#8b5cf6', color: '#ffffff' };
      default:
        return { backgroundColor: '#10b981', color: '#ffffff' };
    }
  };

  const showChangePasswordModal = () => {
    setModalContent({
      title: 'Change Password',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle password change logic here
                setShowModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Change Password
            </button>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Profile Header Card */}
      <motion.div
        className="rounded-2xl shadow-xl backdrop-blur-sm border-2 transition-all duration-300 mb-8"
        style={{
          backgroundColor: themeColors.background,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="relative  rounded-t-2xl px-8 py-12">
          <div className="absolute inset-0 rounded-t-2xl"></div>
          <div className="relative flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="relative">
              <div className="h-24 w-24  backdrop-blur-sm rounded-full flex items-center justify-center border-1">
                <span className="text-3xl font-bold ">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

            </div>

            <div className="text-center sm:text-left flex-1" style={{ color: themeColors.textSecondary }}>
              <h2 className="text-2xl font-bold  mb-2">{user?.name}</h2>
              <p className="text-blue-100 text-base mb-4 flex items-center justify-center sm:justify-start">
                <Mail size={16} className="mr-2" />
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <span
                  className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full"
                  style={getRoleBadgeStyle(user?.role)}
                >
                  <Shield size={14} className="mr-2" />
                  {user?.role}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
                  <Trophy size={14} className="mr-2" />
                  {user?.totalScore || 0} Points
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Account Information */}
            <div
              className="p-6 rounded-xl border-2"
              style={{
                backgroundColor: themeColors.cardBgSecondary,
                borderColor: themeColors.border
              }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.accent }}
                >
                  <User size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>Account Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: themeColors.border }}>
                  <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Full Name</span>
                  <span className="font-semibold" style={{ color: themeColors.text }}>{user?.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: themeColors.border }}>
                  <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Email Address</span>
                  <span className="font-semibold" style={{ color: themeColors.text }}>{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 " style={{ borderColor: themeColors.border }}>
                  <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Role</span>
                  <span className="font-semibold capitalize" style={{ color: themeColors.text }}>{user?.role}</span>
                </div>

              </div>
            </div>

            {/* Account Status */}
            <div
              className="p-6 rounded-xl border-2"
              style={{
                backgroundColor: themeColors.cardBgSecondary,
                borderColor: themeColors.border
              }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.success }}
                >
                  <Shield size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>Account Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: themeColors.border }}>
                  <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Status</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${user?.isActive !== false
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${user?.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'
                      }`}></div>
                    {user?.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Member Since</span>
                  <span className="font-semibold flex items-center" style={{ color: themeColors.text }}>
                    <Calendar size={14} className="mr-2" style={{ color: themeColors.textSecondary }} />
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={showChangePasswordModal}
              className="group flex items-center justify-center px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              style={{
                backgroundColor: themeColors.cardBgSecondary,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`
              }}
            >
              <Lock size={18} className="mr-3 group-hover:scale-110 transition-transform duration-200" />
              Change Password
            </button>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
export default ProfileView;