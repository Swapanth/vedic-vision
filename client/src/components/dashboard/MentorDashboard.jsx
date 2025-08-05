import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, attendanceAPI, submissionAPI, taskAPI } from '../../services/api';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

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
      const taskSubmissionsRes = await submissionAPI.getAllSubmissions({ taskId });
      setTaskSubmissions(taskSubmissionsRes.data.data.submissions || []);
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
    return <LoadingSpinner />;
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

    if (bulkMarkingMode) {
      return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Bulk Mark Attendance</h3>
            <button
              onClick={toggleBulkMarkingMode}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel Bulk Mode
            </button>
          </div>

          {/* Bulk marking controls */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Choose a date...</option>
                  {bootcampDays.map((date, index) => (
                    <option key={date} value={date}>
                      Day {index + 1} - {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Status
                </label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleBulkMarkAttendance}
                  disabled={!selectedDate || selectedParticipants.length === 0 || bulkMarkingLoading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {bulkMarkingLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Mark Attendance (${selectedParticipants.length})`
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={selectAllParticipants}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Select All
              </button>
              <button
                onClick={deselectAllParticipants}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Participant selection list */}
          <div className="grid gap-2">
            {participants.map(participant => (
              <div
                key={participant._id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedParticipants.includes(participant._id)
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                onClick={() => toggleParticipantSelection(participant._id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                    <div className="text-sm text-gray-500">{participant.email}</div>
                  </div>
                  <div className="flex items-center">
                    {selectedParticipants.includes(participant._id) && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                {bootcampDays.map(date => (
                  <th key={date} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day {bootcampDays.indexOf(date) + 1}
                    <br />
                    <span className="text-xs text-gray-400">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <br />
                    <span className="text-xs text-gray-400">
                      {bootcampDays.indexOf(date) >= 10 ? 'Hackathon' : 'Bootcamp'}
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
                      <td key={date} className="px-3 py-4 text-center">
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
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="">-</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          {attendanceRecord && (
                            <option value="remove">Remove</option>
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
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {submission.content.linkTitle || submission.content.link}
                      </a>
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
    return <LoadingSpinner />;
  }

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