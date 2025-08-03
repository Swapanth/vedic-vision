import React, { useState, useEffect } from 'react';
import { userAPI, attendanceAPI, exportAPI } from '../../../services/api';

const AttendanceTab = ({ attendance, onMarkAttendance }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('full-day');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate daily attendance stats
  const getDailyAttendanceStats = () => {
    const dailyStats = {};
    attendance.forEach(record => {
      const date = new Date(record.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { present: 0, total: 0 };
      }
      dailyStats[date].total++;
      if (record.status === 'present') {
        dailyStats[date].present++;
      }
    });
    
    // Sort by date
    return Object.entries(dailyStats)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, stats], index) => ({
        day: `Day ${index + 1}`,
        date,
        ...stats
      }));
  };

  const dailyStats = getDailyAttendanceStats();

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

  // Export attendance data
  const handleExportAttendance = async () => {
    try {
      const response = await exportAPI.exportAttendance();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Attendance data exported successfully!');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      alert('Failed to export attendance data');
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
        <div className="flex space-x-3">
          <button
            onClick={handleExportAttendance}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
         
        </div>
      </div>

      {/* Daily Attendance Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Overview</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {dailyStats.map((stat, index) => (
              <div key={stat.date} className="border rounded-lg p-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900">{stat.day}</h4>
                  <p className="text-sm text-gray-500">{new Date(stat.date).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-green-600">{stat.present}</span>
                    <span className="text-sm text-gray-500"> present</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm text-gray-500">
                      {stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0}% attendance
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
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
              ? Math.round((attendance.filter(r => r.status === 'present').length / attendance.length) * 100)
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
    </div>
  );
};

export default AttendanceTab; 