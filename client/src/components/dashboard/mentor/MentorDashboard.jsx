import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { userAPI, attendanceAPI, submissionAPI, taskAPI } from '../../../services/api';
import Modal from '../../common/Modal';
import LoadingSpinner, { PageLoader, ButtonLoader } from '../../common/LoadingSpinner';

const MentorDashboard = () => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [bulkMarkingMode, setBulkMarkingMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('present');
  const [bulkMarkingLoading, setBulkMarkingLoading] = useState(false);

  useEffect(() => {
    loadMentorData();
  }, []);

  const loadAllAttendance = async () => {
    let allAttendance = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const response = await attendanceAPI.getAllAttendance({
          page: currentPage,
          limit: 100
        });

        const { attendance, pagination } = response.data.data;
        allAttendance = [...allAttendance, ...attendance];

        hasNextPage = pagination.hasNextPage;
        currentPage++;
      } catch (error) {
        console.error('Error fetching attendance page:', currentPage, error);
        break;
      }
    }

    return allAttendance;
  };

  const loadMentorData = async () => {
    try {
      setLoading(true);
      const [participantsRes, allAttendance, submissionsRes, tasksRes] = await Promise.all([
        userAPI.getMentorParticipants(), // Get only assigned participants
        loadAllAttendance(), // Fetch all attendance records across all pages
        submissionAPI.getAllSubmissions(),
        taskAPI.getAllTasks(),
      ]);

      setParticipants(participantsRes.data.data.participants || []);
      setAttendance(allAttendance);
      setSubmissions(submissionsRes.data.data.submissions || []);
      setTasks(tasksRes.data.data.tasks || []);
    } catch (error) {
      console.error('Error loading mentor data:', error);
      showNotification('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title, message) => {
    setModalContent({
      title,
      content: (
        <div className="text-center">
          <p className="text-gray-600">{message}</p>
        </div>
      )
    });
    setShowModal(true);
  };

  const markAttendance = async (participantId, date, status) => {
    try {
      await attendanceAPI.markAttendanceForUser({
        userId: participantId,
        date,
        status
      });
      showNotification('Success', 'Attendance marked successfully!');
      // Refresh attendance data to get the actual server response
      await loadMentorData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      showNotification('Error', 'Failed to mark attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  const removeAttendance = async (participantId, date) => {
    // Find the attendance record to delete
    const attendanceRecord = attendance.find(
      a => a.userId._id === participantId &&
        new Date(a.date).toISOString().split('T')[0] === date
    );

    if (!attendanceRecord) {
      showNotification('Error', 'No attendance record found to remove');
      return;
    }

    // Optimistically remove from UI
    setAttendance(prevAttendance =>
      prevAttendance.filter(a => a._id !== attendanceRecord._id)
    );

    try {
      await attendanceAPI.deleteAttendance(attendanceRecord._id);
      showNotification('Success', 'Attendance status removed successfully!');
      // Refresh attendance data to get the actual server response
      await loadMentorData();
    } catch (error) {
      console.error('Error removing attendance:', error);
      // Revert optimistic update on error
      await loadMentorData();
      showNotification('Error', 'Failed to remove attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  const provideFeedback = async (submissionId, feedback, score) => {
    try {
      await submissionAPI.gradeSubmission(submissionId, {
        feedback,
        score: parseInt(score)
      });
      showNotification('Success', 'Feedback provided successfully!');
      loadMentorData();
      // Reload task submissions if we're in task review mode
      if (selectedTask) {
        await loadTaskSubmissions(selectedTask._id);
      }
    } catch (error) {
      showNotification('Error', 'Failed to provide feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  const loadTaskSubmissions = async (taskId) => {
    try {
      let allSubmissions = [];
      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const taskSubmissionsRes = await submissionAPI.getAllSubmissions({
          taskId,
          page: currentPage,
          limit: 100
        });

        const { submissions, pagination } = taskSubmissionsRes.data.data;
        allSubmissions = [...allSubmissions, ...submissions];

        hasNextPage = pagination.hasNextPage;
        currentPage++;
      }

      setTaskSubmissions(allSubmissions);
    } catch (error) {
      console.error('Error loading task submissions:', error);
      showNotification('Error', 'Failed to load task submissions');
    }
  };

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    await loadTaskSubmissions(task._id);
  };

  const handleBackToTasks = () => {
    setSelectedTask(null);
    setTaskSubmissions([]);
  };

  // Bulk marking functions
  const toggleBulkMarkingMode = () => {
    setBulkMarkingMode(!bulkMarkingMode);
    setSelectedParticipants([]);
    setSelectedDate('');
  };

  const toggleParticipantSelection = (participantId) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const selectAllParticipants = () => {
    setSelectedParticipants(participants.map(p => p._id));
  };

  const deselectAllParticipants = () => {
    setSelectedParticipants([]);
  };

  const handleBulkMarkAttendance = async () => {
    if (!selectedDate) {
      showNotification('Error', 'Please select a date');
      return;
    }
    if (selectedParticipants.length === 0) {
      showNotification('Error', 'Please select at least one participant');
      return;
    }

    setBulkMarkingLoading(true);
    try {
      const attendees = selectedParticipants.map(userId => ({
        userId,
        status: bulkStatus
      }));

      await attendanceAPI.markAttendanceForUsers({
        date: selectedDate,
        session: 'full-day',
        attendees
      });

      showNotification('Success', `Attendance marked for ${selectedParticipants.length} participants!`);
      await loadMentorData();
      setBulkMarkingMode(false);
      setSelectedParticipants([]);
      setSelectedDate('');
    } catch (error) {
      showNotification('Error', 'Failed to mark bulk attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setBulkMarkingLoading(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading mentor dashboard..." />;
  }

  const tabs = [
    { id: 'attendance', name: 'Mark Attendance', icon: '✅' },
    { id: 'reports', name: 'Daily Reports', icon: '📊' },
    { id: 'task-reviews', name: 'Task Reviews', icon: '📝' },
  ];

  const renderAttendanceTab = () => {
    // Bootcamp starts on August 4th, 2025
    const bootcampStartDate = new Date('2025-08-04');
    const bootcampDays = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(bootcampStartDate);
      date.setDate(bootcampStartDate.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    // Debug logging
    console.log('Bootcamp days:', bootcampDays);
    console.log('Participants:', participants);
    console.log('Attendance records:', attendance);

    if (bulkMarkingMode) {
      return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Bulk Mark Attendance
              </h3>
              <p className="text-gray-600 mt-1">Select participants and mark their attendance for a specific date</p>
            </div>
            <button
              onClick={toggleBulkMarkingMode}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Bulk Mode
            </button>
          </div>

          {/* Bulk marking controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Attendance Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📅 Select Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="" className="text-gray-500">Choose a date...</option>
                  {bootcampDays.map((date, index) => (
                    <option key={date} value={date} className="text-gray-700">
                      Day {index + 1} - {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📊 Attendance Status
                </label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className={`w-full border-2 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${bulkStatus === 'present'
                      ? 'border-green-300 bg-green-50 text-green-800'
                      : 'border-red-300 bg-red-50 text-red-800'
                    }`}
                >
                  <option value="present" className="text-green-700">✓ Present</option>
                  <option value="absent" className="text-red-700">✗ Absent</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleBulkMarkAttendance}
                  disabled={!selectedDate || selectedParticipants.length === 0 || bulkMarkingLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  {bulkMarkingLoading ? (
                    <ButtonLoader text="Processing..." />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark Attendance ({selectedParticipants.length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex flex-wrap gap-3 items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex space-x-3">
                <button
                  onClick={selectAllParticipants}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select All
                </button>
                <button
                  onClick={deselectAllParticipants}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Deselect All
                </button>
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="font-semibold text-blue-600">{selectedParticipants.length}</span> of <span className="font-semibold">{participants.length}</span> participants selected
              </div>
            </div>
          </div>

          {/* Participant selection list */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Select Participants
              </h4>
              <p className="text-sm text-gray-600 mt-1">Click on participants to select/deselect them for attendance marking</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="grid gap-1 p-2">
                {participants.map((participant, index) => (
                  <div
                    key={participant._id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${selectedParticipants.includes(participant._id)
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    onClick={() => toggleParticipantSelection(participant._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedParticipants.includes(participant._id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{participant.name}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            {participant.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {selectedParticipants.includes(participant._id) ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Selected
                            </span>
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {participants.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-lg font-medium">No participants found</p>
                <p className="text-sm">There are no participants assigned to you.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mark Daily Attendance</h3>
          <button
            onClick={toggleBulkMarkingMode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Bulk Mark
          </button>
        </div>

        <div className="overflow-x-auto" style={{ minHeight: '400px' }}>
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10" style={{ minWidth: '200px' }}>
                  Participant
                </th>
                {bootcampDays.map((date, index) => (
                  <th key={date} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                    Day {index + 1}
                    <br />
                    <span className="text-xs text-gray-400">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <br />
                    <span className="text-xs text-gray-400">
                      {index >= 10 ? 'Hackathon' : 'Bootcamp'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map(participant => (
                <tr key={participant._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                    <div className="text-sm text-gray-500">{participant.email}</div>
                  </td>
                  {bootcampDays.map(date => {
                    const attendanceRecord = attendance.find(
                      a => a.userId._id === participant._id &&
                        new Date(a.date).toISOString().split('T')[0] === date
                    );

                    return (
                      <td key={date} className="px-2 py-3 text-center bg-gray-50">
                        <select
                          key={`${participant._id}-${date}-${attendanceRecord?._id || 'none'}`}
                          value={attendanceRecord?.status || ''}
                          onChange={(e) => {
                            if (e.target.value === 'remove') {
                              removeAttendance(participant._id, date);
                            } else if (e.target.value) {
                              markAttendance(participant._id, date, e.target.value);
                            }
                          }}
                          className={`text-xs border-2 rounded-md px-2 py-1 font-medium min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${attendanceRecord?.status === 'present'
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : attendanceRecord?.status === 'absent'
                              ? 'bg-red-100 border-red-300 text-red-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                            }`}
                        >
                          <option value="" className="text-gray-500">-</option>
                          <option value="present" className="text-green-700 bg-green-50">✓ Present</option>
                          <option value="absent" className="text-red-700 bg-red-50">✗ Absent</option>
                          {attendanceRecord && (
                            <option value="remove" className="text-orange-700 bg-orange-50">🗑 Remove</option>
                          )}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReportsTab = () => {
    const participantStats = participants.map(participant => {
      const userAttendance = attendance.filter(a => a.userId._id === participant._id);
      const userSubmissions = submissions.filter(s => s.userId._id === participant._id);

      return {
        ...participant,
        attendanceRate: userAttendance.length > 0 ?
          (userAttendance.filter(a => a.status === 'present').length / userAttendance.length * 100).toFixed(1) : 0,
        submissionCount: userSubmissions.length,
        avgScore: userSubmissions.length > 0 ?
          (userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / userSubmissions.length).toFixed(1) : 0
      };
    });

    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Progress Reports</h3>
        <div className="grid gap-4">
          {participantStats.map(participant => (
            <div key={participant._id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{participant.name}</h4>
                <span className="text-sm text-gray-500">{participant.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Attendance Rate:</span>
                  <div className="font-semibold text-green-600">{participant.attendanceRate}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Tasks Submitted:</span>
                  <div className="font-semibold text-blue-600">{participant.submissionCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Average Score:</span>
                  <div className="font-semibold text-purple-600">{participant.avgScore}/100</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTaskReviewsTab = () => {
    if (selectedTask) {
      // Show submissions for the selected task
      return (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToTasks}
              className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Tasks
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h3>
              <p className="text-sm text-gray-600">Day {selectedTask.day.replace('day', '')} - Max Score: {selectedTask.maxScore}</p>
            </div>
          </div>

          <div className="space-y-4">
            {taskSubmissions.length > 0 ? (
              taskSubmissions.map(submission => (
                <div key={submission._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{submission.userId.name}</h4>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      {submission.score !== undefined && submission.score !== null && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          Score: {submission.score}/{selectedTask.maxScore}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${submission.status === 'graded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  {/* Submission Content */}
                  {submission.content?.text && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Submission:</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {submission.content.text}
                      </p>
                    </div>
                  )}

                  {submission.content?.link && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Submission Link:</h5>
                      <a
                        href={submission.content.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline block mb-2"
                      >
                        {submission.content.link}
                      </a>
                      {submission.content.linkTitle && (
                        <div>
                          <h6 className="font-medium text-gray-700 mb-1">Description:</h6>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {submission.content.linkTitle}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {submission.content?.fileUrl && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Submitted File:</h5>
                      <a
                        href={`http://localhost:9000${submission.content.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {submission.content.fileName || 'Download File'}
                      </a>
                    </div>
                  )}

                  {/* Existing Feedback */}
                  {submission.feedback && (
                    <div className="mb-4 bg-blue-50 p-3 rounded">
                      <h5 className="font-medium text-gray-700 mb-1">Previous Feedback:</h5>
                      <p className="text-sm text-gray-600">{submission.feedback}</p>
                    </div>
                  )}

                  {/* Grading Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0-{selectedTask.maxScore})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedTask.maxScore}
                        className="w-full border rounded px-3 py-2"
                        id={`score-${submission._id}`}
                        defaultValue={submission.score || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback
                      </label>
                      <textarea
                        className="w-full border rounded px-3 py-2"
                        rows="3"
                        id={`feedback-${submission._id}`}
                        defaultValue={submission.feedback || ''}
                        placeholder="Provide constructive feedback..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const score = document.getElementById(`score-${submission._id}`).value;
                      const feedback = document.getElementById(`feedback-${submission._id}`).value;
                      if (score && feedback) {
                        provideFeedback(submission._id, feedback, score);
                      } else {
                        showNotification('Error', 'Please provide both score and feedback');
                      }
                    }}
                    className="mt-3 bg-[#272757] text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {submission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No submissions found for this task</p>
            )}
          </div>
        </div>
      );
    }

    // Show day-wise tasks list
    const tasksByDay = tasks.reduce((acc, task) => {
      const day = task.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(task);
      return acc;
    }, {});

    const dayOrder = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10', 'day11', 'day12'];

    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">Task Reviews - Day Wise</h3>

        <div className="space-y-6">
          {dayOrder.map(day => {
            const dayTasks = tasksByDay[day] || [];
            const dayNumber = day.replace('day', '');
            const bootcampStartDate = new Date('2025-08-04');
            const dayDate = new Date(bootcampStartDate);
            dayDate.setDate(bootcampStartDate.getDate() + parseInt(dayNumber) - 1);

            return (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Day {dayNumber}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {dayDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {parseInt(dayNumber) >= 11 ? 'Hackathon' : 'Bootcamp'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {dayTasks.length > 0 ? (
                  <div className="grid gap-3">
                    {dayTasks.map(task => {
                      const taskSubmissions = submissions.filter(s => s.taskId._id === task._id);
                      const gradedSubmissions = taskSubmissions.filter(s => s.status === 'graded');

                      return (
                        <div
                          key={task._id}
                          className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{task.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                Max Score: {task.maxScore} | Status: {task.isActive ? 'Active' : 'Inactive'}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm text-gray-600">
                                {taskSubmissions.length} submission{taskSubmissions.length !== 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-gray-500">
                                {gradedSubmissions.length} graded
                              </div>
                              {taskSubmissions.length > gradedSubmissions.length && (
                                <div className="text-xs text-orange-600 font-medium">
                                  {taskSubmissions.length - gradedSubmissions.length} pending
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tasks assigned for this day</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'attendance':
        return renderAttendanceTab();
      case 'reports':
        return renderReportsTab();
      case 'task-reviews':
        return renderTaskReviewsTab();
      default:
        return renderAttendanceTab();
    }
  };

  if (loading) {
    return <PageLoader text="Loading mentor dashboard..." />;
  }

  // Debug logging
  console.log('MentorDashboard render - participants:', participants.length, participants);
  console.log('MentorDashboard render - attendance:', attendance.length, attendance);
  console.log('MentorDashboard render - activeTab:', activeTab);
  console.log('MentorDashboard render - bulkMarkingMode:', bulkMarkingMode);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Track your participants' progress.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>
    </div>
  );
};

export default MentorDashboard;