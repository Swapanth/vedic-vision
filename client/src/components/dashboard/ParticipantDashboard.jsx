import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { taskAPI, attendanceAPI, submissionAPI, announcementAPI } from '../../services/api';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import TeamFormation from '../teams/TeamFormation';
import MentorDetails from './MentorDetails';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null, taskId: null });

  // Form states
  const [submissionForm, setSubmissionForm] = useState({
    description: '',
    link: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, attendanceRes, submissionsRes, announcementsRes] = await Promise.all([
        taskAPI.getAllTasks(),
        attendanceAPI.getMyAttendance(),
        submissionAPI.getMySubmissions(),
        announcementAPI.getAllAnnouncements(),
      ]);

      setTasks(tasksRes.data.data.tasks || []);
      setAttendance(attendanceRes.data.data.attendance || []);
      setSubmissions(submissionsRes.data.data.submissions || []);
      setAnnouncements(announcementsRes.data.data.announcements || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showSuccessModal('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessModal = (title, message) => {
    setModalContent({
      title,
      content: (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600">{message}</p>
        </div>
      )
    });
    setShowModal(true);
  };

  // Calculate attendance statistics
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const handleSubmitTask = async (taskId) => {
    try {
      // Validate that at least one submission content is provided
      if (!submissionForm.description && !submissionForm.link) {
        showSuccessModal('Error', 'Please provide a description or link for your submission');
        return;
      }

      const formData = new FormData();
      formData.append('taskId', taskId.toString());

      // Determine submission type and content
      let submissionType = 'text';
      let content = { text: submissionForm.description || 'No description provided' };

      if (submissionForm.link) {
        submissionType = 'link';
        content = { link: submissionForm.link };
      } else {
        // Text-only submission
        submissionType = 'text';
        content = { text: submissionForm.description || 'Text submission' };
      }

      formData.append('submissionType', submissionType);
      formData.append('content', JSON.stringify(content));

      // Ensure content is not empty
      if (!submissionForm.description && !submissionForm.link) {
        showSuccessModal('Error', 'Please provide a description or link for your submission');
        return;
      }

      // Debug: Log form data
      console.log('Submitting task:', taskId);
      console.log('Form data:', {
        taskId,
        submissionType,
        content
      });

      // Log the actual FormData entries
      for (let [key, value] of formData.entries()) {
        console.log('FormData entry:', key, value);
      }

      await submissionAPI.submitTask(taskId, formData);
      showSuccessModal('Success', 'Task submitted successfully!');
      setSubmissionForm({ description: '', link: '' });
      setShowModal(false);
      loadDashboardData();
    } catch (error) {
      let errorMessage = 'Failed to submit task';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage += ': ' + error.response.data.errors.map(e => e.msg).join(', ');
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      showSuccessModal('Error', errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'mentor', name: 'My Mentor', icon: '👨‍🏫' },
    { id: 'tasks', name: 'Tasks', icon: '📝' },
    { id: 'teams', name: 'Team Formation', icon: '👥' },
    { id: 'attendance', name: 'Attendance', icon: '✅' },
    { id: 'submissions', name: 'My Submissions', icon: '📤' },
    { id: 'announcements', name: 'Announcements', icon: '📢' },
  ];

  const activeTasks = tasks.filter(t => t.isActive);
  const completedSubmissions = submissions.filter(s => s.score);
  const pendingSubmissions = submissions.filter(s => !s.score);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-[#272757] rounded-2xl border-2 border-gray-900 p-8 shadow-lg">
            <h1 className="text-4xl font-black text-white mb-2">Participant Dashboard</h1>
            <p className="text-xl text-white/90 font-semibold">Welcome, {user?.name}! 🚀</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-lg p-2">
            <nav className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                    ? 'bg-[#272757] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
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
        <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-lg">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-8">📊 Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#272757] rounded-2xl border-2 border-gray-900 p-6 shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-3xl font-black text-white mb-2">{activeTasks.length}</div>
                  <div className="text-white/90 font-bold text-sm">Active Tasks</div>
                </div>

                <div className="bg-green-500 rounded-2xl border-2 border-gray-900 p-6 shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-3xl font-black text-white mb-2">{attendancePercentage}%</div>
                  <div className="text-white/90 font-bold text-sm">Attendance Rate</div>
                  <div className="text-white/70 text-xs mt-1">{presentDays}/{totalDays} days</div>
                </div>

                <div className="bg-orange-500 rounded-2xl border-2 border-gray-900 p-6 shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="text-4xl mb-2">⏳</div>
                  <div className="text-3xl font-black text-white mb-2">{pendingSubmissions.length}</div>
                  <div className="text-white/90 font-bold text-sm">Pending Submissions</div>
                </div>

                <div className="bg-purple-600 rounded-2xl border-2 border-gray-900 p-6 shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="text-3xl font-black text-white mb-2">{completedSubmissions.length}</div>
                  <div className="text-white/90 font-bold text-sm">Completed Tasks</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-12">
                <h3 className="text-2xl font-black text-gray-900 mb-6">⚡ Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                    <div className="text-xl font-black text-gray-900 mb-2">View Attendance</div>
                    <div className="text-gray-600 font-semibold">Check your attendance history and stats</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                    <div className="text-xl font-black text-gray-900 mb-2">View Tasks</div>
                    <div className="text-gray-600 font-semibold">Check available tasks and deadlines</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('teams')}
                    className="bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                    <div className="text-xl font-black text-gray-900 mb-2">Team Formation</div>
                    <div className="text-gray-600 font-semibold">Create or join a team for collaboration</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mentor Tab */}
          {activeTab === 'mentor' && (
            <div className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-8">👨‍🏫 My Mentor</h2>
              <MentorDetails />
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-8">📝 Available Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTasks.map((task) => {
                  const submission = submissions.find(s => s.taskId === task._id);
                  const isSubmitted = !!submission;
                  const isGraded = submission?.score;

                  return (
                    <div key={task._id} className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-black text-gray-900">{task.title}</h4>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 border-gray-900 ${isGraded ? 'bg-green-500 text-white' :
                          isSubmitted ? 'bg-orange-500 text-white' :
                            'bg-[#272757] text-white'
                          }`}>
                          {isGraded ? '✅ Graded' : isSubmitted ? '⏳ Submitted' : '🔥 Active'}
                        </span>
                      </div>
                      <p className="text-gray-600 font-semibold mb-4">{task.description}</p>
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                        <p className="text-sm font-bold text-gray-700">📋 Type: {task.type}</p>
                        <p className="text-sm font-bold text-gray-700">⏰ Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                        <p className="text-sm font-bold text-gray-700">🎯 Max Score: {task.maxScore}</p>
                        {isGraded && <p className="text-sm font-bold text-green-600">🏆 Your Score: {submission.score}</p>}
                      </div>

                      {!isSubmitted && (
                        <button
                          onClick={() => {
                            setSubmissionForm({ description: '', link: '' });
                            setModalContent({
                              title: `Submit Task: ${task.title}`,
                              content: null,
                              taskId: task._id
                            });
                            setShowModal(true);
                          }}
                          className="w-full bg-[#272757] hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-black border-2 border-gray-900 shadow-lg hover:shadow-md transition-all"
                        >
                          🚀 Submit Task
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {activeTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl font-bold text-gray-500">No active tasks available</p>
                  <p className="text-gray-400 font-semibold">Check back later for new assignments!</p>
                </div>
              )}
            </div>
          )}

          {/* Team Formation Tab */}
          {activeTab === 'teams' && (
            <div className="p-8">
              <TeamFormation />
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-8">✅ Attendance History</h2>
              <div className="mb-8">
                <div className="bg-green-500 rounded-2xl border-2 border-gray-900 p-8 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">📊 Attendance Summary</h3>
                      <p className="text-white/90 font-semibold">Your attendance statistics</p>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-black text-white">{attendancePercentage}%</p>
                      <p className="text-white/80 font-bold">{presentDays} of {totalDays} days</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">📅 Date</th>
                        <th className="px-8 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">📊 Status</th>
                        <th className="px-8 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider">🎯 Session</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendance.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-black rounded-full border-2 border-gray-900 ${record.status === 'present' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                              {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                            </span>
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                            {record.session || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {attendance.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📅</div>
                      <p className="text-xl font-bold text-gray-500">No attendance records found</p>
                      <p className="text-gray-400 font-semibold">Your attendance will appear here once recorded!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-8">📤 My Submissions</h2>
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <div key={submission._id} className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-black text-gray-900">📋 {submission.taskId?.title || 'Unknown Task'}</h4>
                        <p className="text-sm font-bold text-gray-600">📅 Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 text-xs font-black rounded-full border-2 border-gray-900 ${submission.score ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                          }`}>
                          {submission.score ? `🏆 Score: ${submission.score}` : '⏳ Not graded'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700">
                        {submission.content?.text || submission.description || 'No description provided'}
                      </p>
                      <div className="flex gap-4 mt-3">
                        {submission.content?.fileUrl && (
                          <a href={submission.content.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-[#272757] hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold border-2 border-gray-900 shadow-md hover:shadow-sm transition-all">
                            📎 Download File
                          </a>
                        )}
                        {submission.content?.link && (
                          <a href={submission.content.link} target="_blank" rel="noopener noreferrer" className="bg-[#272757] hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold border-2 border-gray-900 shadow-md hover:shadow-sm transition-all">
                            🔗 View Link
                          </a>
                        )}
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="bg-[#272757] rounded-xl border-2 border-gray-900 p-4 shadow-lg">
                        <p className="text-sm font-bold text-white">💬 <strong>Feedback:</strong> {submission.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
                {submissions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📤</div>
                    <p className="text-xl font-bold text-gray-500">No submissions found</p>
                    <p className="text-gray-400 font-semibold">Your task submissions will appear here!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-8">📢 Announcements</h2>
              <div className="space-y-6">
                {announcements.filter(a => a.isActive).map((announcement) => (
                  <div key={announcement._id} className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">📣 {announcement.title}</h4>
                        <p className="text-gray-600 font-semibold">{announcement.content}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-black rounded-full border-2 border-gray-900 ${announcement.priority === 'urgent' ? 'bg-red-500 text-white' :
                        announcement.priority === 'high' ? 'bg-orange-500 text-white' :
                          announcement.priority === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                        }`}>
                        {announcement.priority === 'urgent' ? '🚨 URGENT' :
                          announcement.priority === 'high' ? '⚠️ HIGH' :
                            announcement.priority === 'medium' ? '📌 MEDIUM' :
                              '✅ LOW'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between text-sm font-bold text-gray-700">
                        <p>📅 Posted: {new Date(announcement.createdAt).toLocaleDateString()}</p>
                        {announcement.expiresAt && (
                          <p>⏰ Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {announcements.filter(a => a.isActive).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📢</div>
                    <p className="text-xl font-bold text-gray-500">No active announcements</p>
                    <p className="text-gray-400 font-semibold">Important updates will appear here!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
      >
        {modalContent.content || (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={submissionForm.description}
                onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your submission or provide details about your work..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">Provide a description or link (at least one is required)</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
              <input
                type="url"
                value={submissionForm.link}
                onChange={(e) => setSubmissionForm({ ...submissionForm, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  handleSubmitTask(modalContent.taskId);
                }}
                className="flex-1 bg-[#272757] hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Submit Task
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParticipantDashboard;