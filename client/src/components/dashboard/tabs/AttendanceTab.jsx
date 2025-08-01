import React, { useState, useEffect } from 'react';
import { userAPI, attendanceAPI } from '../../../services/api';

const AttendanceTab = ({ attendance, onMarkAttendance }) => {
  const [users, setUsers] = useState([]);
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('full-day');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load users for attendance marking
  const loadUsers = async () => {
    try {
      const response = await userAPI.getAllUsers({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        role: 'participant'
      });
      setUsers(response.data.data.users || []);
      setTotalPages(response.data.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const handleMarkAttendance = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    setLoading(true);
    try {
      const attendees = selectedUsers.map(userId => ({
        userId,
        status: 'present'
      }));

      const response = await attendanceAPI.markAttendanceForUsers({
        date: attendanceDate,
        session,
        attendees
      });

      console.log('Attendance marked successfully:', response.data);
      alert(`Attendance marked successfully for ${response.data.data.successful.length} participants!`);
      
      setShowMarkAttendanceModal(false);
      setSelectedUsers([]);
      setSession('full-day');
      setSearchTerm('');
      setCurrentPage(1);
      
      // Refresh attendance data
      if (onMarkAttendance) {
        onMarkAttendance();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user._id));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
        <button
          onClick={() => setShowMarkAttendanceModal(true)}
          className="bg-[#272757] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Mark Attendance
        </button>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
          <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Present</h3>
          <p className="text-2xl font-bold text-green-600">
            {attendance.filter(record => record.status === 'present').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Absent</h3>
          <p className="text-2xl font-bold text-red-600">
            {attendance.filter(record => record.status === 'absent').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
          <p className="text-2xl font-bold text-blue-600">
            {attendance.length > 0 
              ? Math.round((attendance.filter(record => record.status === 'present').length / attendance.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.userId?.name || 'Unknown User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.status === 'present' ? 'bg-green-100 text-green-800' : 
                    record.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.session || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.remarks || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">No attendance records found.</div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showMarkAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Mark Attendance</h3>
              <button
                onClick={() => setShowMarkAttendanceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Date and Session Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-day">Full Day</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>

            {/* User Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Select/Deselect All */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={selectAllUsers}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Select All
              </button>
              <button
                onClick={deselectAllUsers}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                Deselect All
              </button>
            </div>

            {/* User List */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedUsers.includes(user._id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowMarkAttendanceModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                disabled={loading || selectedUsers.length === 0}
                className="px-4 py-2 bg-[#272757] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Marking...' : `Mark Attendance (${selectedUsers.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab; 