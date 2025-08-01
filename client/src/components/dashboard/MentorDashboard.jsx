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

  useEffect(() => {
    loadMentorData();
  }, []);

  const loadMentorData = async () => {
    try {
      setLoading(true);
      const [participantsRes, attendanceRes, submissionsRes, tasksRes] = await Promise.all([
        userAPI.getAllUsers({ role: 'participant' }),
        attendanceAPI.getAllAttendance(),
        submissionAPI.getAllSubmissions(),
        taskAPI.getAllTasks(),
      ]);

      setParticipants(participantsRes.data.data.users || []);
      setAttendance(attendanceRes.data.data.attendance || []);
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
      await attendanceAPI.markAttendance({
        userId: participantId,
        date,
        status
      });
      showNotification('Success', 'Attendance marked successfully!');
      loadMentorData();
    } catch (error) {
      showNotification('Error', 'Failed to mark attendance: ' + (error.response?.data?.message || error.message));
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
    } catch (error) {
      showNotification('Error', 'Failed to provide feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'attendance', name: 'Mark Attendance', icon: '✅' },
    { id: 'reports', name: 'Daily Reports', icon: '📊' },
    { id: 'submissions', name: 'Task Submissions', icon: '📤' },
    { id: 'feedback', name: 'Provide Feedback', icon: '💬' },
  ];

  const renderAttendanceTab = () => {
    const today = new Date().toISOString().split('T')[0];
    const bootcampDays = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 11 + i);
      return date.toISOString().split('T')[0];
    });

    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Mark Daily Attendance</h3>
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
                      a => a.user._id === participant._id && a.date.split('T')[0] === date
                    );
                    return (
                      <td key={date} className="px-3 py-4 text-center">
                        <select
                          value={attendanceRecord?.status || ''}
                          onChange={(e) => markAttendance(participant._id, date, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="">-</option>
                          <option value="present">✅</option>
                          <option value="absent">❌</option>
                          <option value="late">⏰</option>
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
      const userAttendance = attendance.filter(a => a.user._id === participant._id);
      const userSubmissions = submissions.filter(s => s.user._id === participant._id);
      
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

  const renderSubmissionsTab = () => {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Task Submissions</h3>
        <div className="space-y-4">
          {submissions.slice(0, 10).map(submission => (
            <div key={submission._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{submission.user.name}</h4>
                  <p className="text-sm text-gray-600">{submission.task.title}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                  {submission.score && (
                    <div className="font-semibold text-green-600">{submission.score}/100</div>
                  )}
                </div>
              </div>
              {submission.submissionText && (
                <p className="text-sm text-gray-700 mb-2">{submission.submissionText.substring(0, 200)}...</p>
              )}
              {submission.feedback && (
                <div className="bg-blue-50 p-2 rounded text-sm">
                  <strong>Feedback:</strong> {submission.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeedbackTab = () => {
    const pendingSubmissions = submissions.filter(s => !s.feedback || !s.score);

    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Provide Feedback</h3>
        <div className="space-y-4">
          {pendingSubmissions.map(submission => (
            <div key={submission._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{submission.user.name}</h4>
                  <p className="text-sm text-gray-600">{submission.task.title}</p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {submission.submissionText && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Submission:</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {submission.submissionText}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
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
                Submit Feedback
              </button>
            </div>
          ))}
          {pendingSubmissions.length === 0 && (
            <p className="text-gray-500 text-center py-8">No pending submissions to review</p>
          )}
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
      case 'submissions':
        return renderSubmissionsTab();
      case 'feedback':
        return renderFeedbackTab();
      default:
        return renderAttendanceTab();
    }
  };

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
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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