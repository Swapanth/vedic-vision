import React, { useState } from 'react';
import { User, Mail, Phone, School, Calendar, Edit2, Save, X } from 'lucide-react';
import { authAPI } from '../../../../services/api';
import { ButtonLoader } from '../../../common/LoadingSpinner';

function HackathonProfileView({ user, themeColors, setModalContent, setShowModal }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    profilePicture: user?.profilePicture || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || '',
      profilePicture: user?.profilePicture || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      profilePicture: user?.profilePicture || ''
    });
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await authAPI.updateProfile(editForm);
      setModalContent({
        title: 'Success',
        content: (
          <div className="text-center py-4">
            <p className="text-gray-600">Profile updated successfully!</p>
            <button
              onClick={() => {
                setShowModal(false);
                window.location.reload(); // Refresh to show updated data
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        )
      });
      setShowModal(true);
      setIsEditing(false);
    } catch (error) {
      setModalContent({
        title: 'Error',
        content: (
          <div className="text-center py-4">
            <p className="text-gray-600">Failed to update profile. Please try again.</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              OK
            </button>
          </div>
        )
      });
      setShowModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const showChangePasswordModal = () => {
    setModalContent({
      title: 'Change Password',
      content: <ChangePasswordForm onClose={() => setShowModal(false)} showSuccessModal={showSuccessModal} />
    });
    setShowModal(true);
  };

  const showSuccessModal = (title, message) => {
    setModalContent({
      title,
      content: (
        <div className="text-center py-4">
          <p className="text-gray-600">{message}</p>
          <button
            onClick={() => setShowModal(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      )
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
          Profile
        </h2>
        <p style={{ color: themeColors.textSecondary }}>
          Manage your hackathon profile and account settings
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-xl p-8 border"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
            Personal Information
          </h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <ButtonLoader text="Saving..." />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <span
                className="inline-block px-3 py-1 text-sm rounded-full"
                style={{
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C'
                }}
              >
                🏆 Hackathon Participant
              </span>
              
              {user?.registrationDate && (
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Joined {new Date(user.registrationDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                    <span style={{ color: themeColors.text }}>{user?.name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Email Address
                </label>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                  <span style={{ color: themeColors.text }}>{user?.email || 'Not provided'}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Mobile Number
                </label>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                  <span style={{ color: themeColors.text }}>{user?.mobile || 'Not provided'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  College/Institution
                </label>
                <div className="flex items-center space-x-3">
                  <School className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                  <span style={{ color: themeColors.text }}>{user?.collegeName || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Hackathon-specific info */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: themeColors.hover }}
            >
              <h4 className="font-medium mb-2" style={{ color: themeColors.text }}>
                Hackathon Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span style={{ color: themeColors.textSecondary }}>Participant Type:</span>
                  <span className="ml-2 font-medium" style={{ color: themeColors.text }}>
                    Hackathon Only
                  </span>
                </div>
                <div>
                  <span style={{ color: themeColors.textSecondary }}>Focus Areas:</span>
                  <span className="ml-2 font-medium" style={{ color: themeColors.text }}>
                    Team Collaboration, Problem Solving
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
          Account Settings
        </h3>
        
        <div className="space-y-4">
          <button
            onClick={showChangePasswordModal}
            className="flex items-center space-x-3 p-4 rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: themeColors.border }}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium" style={{ color: themeColors.text }}>
                Change Password
              </p>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                Update your account password
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Hackathon Features Info */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
          Available Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <h4 className="font-medium mb-1" style={{ color: themeColors.text }}>
              Team Management
            </h4>
            <p className="text-sm" style={{ color: themeColors.textSecondary }}>
              Create and join teams
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <h4 className="font-medium mb-1" style={{ color: themeColors.text }}>
              Mentor Support
            </h4>
            <p className="text-sm" style={{ color: themeColors.textSecondary }}>
              Get guidance from experts
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h4 className="font-medium mb-1" style={{ color: themeColors.text }}>
              Problem Statements
            </h4>
            <p className="text-sm" style={{ color: themeColors.textSecondary }}>
              Choose challenges to solve
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: themeColors.hover }}>
          <p className="text-sm" style={{ color: themeColors.textSecondary }}>
            <strong>Note:</strong> As a hackathon participant, you don't have access to daily tasks, 
            attendance tracking, or leaderboards. Focus on collaboration and innovation!
          </p>
        </div>
      </div>
    </div>
  );
}

// Change Password Component
function ChangePasswordForm({ onClose, showSuccessModal }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showSuccessModal('Error', 'New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      showSuccessModal('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      showSuccessModal('Success', 'Password changed successfully!');
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      showSuccessModal('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Password
        </label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={6}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={6}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <ButtonLoader text="Changing..." /> : 'Change Password'}
        </button>
      </div>
    </form>
  );
}

export default HackathonProfileView;