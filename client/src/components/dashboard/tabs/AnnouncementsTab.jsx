import React, { useState } from 'react';

const AnnouncementsTab = ({ announcements, onCreateAnnouncement, onDeleteAnnouncement }) => {
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    expiresAt: '',
    priority: 'medium',
    targetAudience: 'all',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateAnnouncement(announcementForm);
    setAnnouncementForm({ title: '', content: '', expiresAt: '', priority: 'medium', targetAudience: 'all' });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Announcements Management</h2>
      
      {/* Create Announcement Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Announcement</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={announcementForm.priority}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select
              value={announcementForm.targetAudience}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="participants">Participants</option>
              <option value="admins">Admins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
            <input
              type="datetime-local"
              value={announcementForm.expiresAt}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-[#272757] hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Create Announcement
            </button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Announcements</h3>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                  <p className="text-sm text-gray-600">{announcement.content}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => onDeleteAnnouncement(announcement._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</p>
                <p>Expires: {announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          ))}
        </div>
        {announcements.length === 0 && (
          <div className="text-center py-8 text-gray-500">No announcements found.</div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsTab; 