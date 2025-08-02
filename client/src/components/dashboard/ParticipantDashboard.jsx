import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { taskAPI, attendanceAPI, submissionAPI, announcementAPI } from '../../services/api';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import TeamFormation from '../teams/TeamFormation';
import MentorDetails from './MentorDetails';

// Theme detection hook
const useThemeDetection = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const detectTheme = () => {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkTheme(prefersDark);
      }
    };

    detectTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);

    return () => mediaQuery.removeEventListener('change', detectTheme);
  }, []);

  return isDarkTheme;
};

// Theme-aware color utility
const getThemeColors = (isDark) => ({
  background: isDark ? '#0f0f0f' : '#ffffff',
  backgroundSecondary: isDark ? '#1a1a1a' : '#f8fafc',
  text: isDark ? '#e2e8f0' : '#1e293b',
  textSecondary: isDark ? '#94a3b8' : '#64748b',
  border: isDark ? '#334155' : '#e2e8f0',
  cardBg: isDark ? '#1e293b' : '#ffffff',
  cardBgSecondary: isDark ? '#334155' : '#f1f5f9',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  purple: '#8b5cf6',
});

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

  // Theme detection
  const isDarkTheme = useThemeDetection();
  const themeColors = getThemeColors(isDarkTheme);

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
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: themeColors.backgroundSecondary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="rounded-3xl p-8 shadow-xl backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border,
              background: `linear-gradient(135deg, ${themeColors.accent} 0%, ${themeColors.purple} 100%)`
            }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Participant Dashboard</h1>
            <p className="text-xl text-white/90 font-medium">Welcome back, {user?.name}! 🚀</p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            className="rounded-2xl shadow-lg p-2 backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
          >
            <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="whitespace-nowrap px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: activeTab === tab.id ? themeColors.accent : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : themeColors.text,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-8" style={{ color: themeColors.text }}>📊 Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className="rounded-2xl p-6 shadow-lg text-center transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: themeColors.accent }}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-3xl font-bold text-white mb-2">{activeTasks.length}</div>
                  <div className="text-white/90 font-medium text-sm">Active Tasks</div>
                </motion.div>

                <motion.div
                  className="rounded-2xl p-6 shadow-lg text-center transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: themeColors.success }}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-3xl font-bold text-white mb-2">{attendancePercentage}%</div>
                  <div className="text-white/90 font-medium text-sm">Attendance Rate</div>
                  <div className="text-white/70 text-xs mt-1">{presentDays}/{totalDays} days</div>
                </motion.div>

                <motion.div
                  className="rounded-2xl p-6 shadow-lg text-center transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: themeColors.warning }}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="text-4xl mb-2">⏳</div>
                  <div className="text-3xl font-bold text-white mb-2">{pendingSubmissions.length}</div>
                  <div className="text-white/90 font-medium text-sm">Pending Submissions</div>
                </motion.div>

                <motion.div
                  className="rounded-2xl p-6 shadow-lg text-center transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: themeColors.purple }}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="text-3xl font-bold text-white mb-2">{completedSubmissions.length}</div>
                  <div className="text-white/90 font-medium text-sm">Completed Tasks</div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6" style={{ color: themeColors.text }}>⚡ Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.button
                    onClick={() => setActiveTab('attendance')}
                    className="rounded-2xl p-8 shadow-lg transition-all duration-300 text-center group hover:scale-105"
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                      borderColor: themeColors.border
                    }}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                    <div className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>View Attendance</div>
                    <div className="font-medium" style={{ color: themeColors.textSecondary }}>Check your attendance history and stats</div>
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('tasks')}
                    className="rounded-2xl p-8 shadow-lg transition-all duration-300 text-center group hover:scale-105"
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                      borderColor: themeColors.border
                    }}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                    <div className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>View Tasks</div>
                    <div className="font-medium" style={{ color: themeColors.textSecondary }}>Check available tasks and deadlines</div>
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('teams')}
                    className="rounded-2xl p-8 shadow-lg transition-all duration-300 text-center group hover:scale-105"
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                      borderColor: themeColors.border
                    }}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                    <div className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>Team Formation</div>
                    <div className="font-medium" style={{ color: themeColors.textSecondary }}>Create or join a team for collaboration</div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mentor Tab */}
          {activeTab === 'mentor' && (
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-8" style={{ color: themeColors.text }}>👨‍🏫 My Mentor</h2>
              <MentorDetails />
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-8" style={{ color: themeColors.text }}>📝 Available Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTasks.map((task, index) => {
                  const submission = submissions.find(s => s.taskId === task._id);
                  const isSubmitted = !!submission;
                  const isGraded = submission?.score;

                  return (
                    <motion.div
                      key={task._id}
                      className="rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: themeColors.cardBgSecondary,
                        borderColor: themeColors.border
                      }}
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold" style={{ color: themeColors.text }}>{task.title}</h4>
                        <span
                          className="px-3 py-1 text-xs font-bold rounded-full"
                          style={{
                            backgroundColor: isGraded ? themeColors.success :
                              isSubmitted ? themeColors.warning : themeColors.accent,
                            color: '#ffffff'
                          }}
                        >
                          {isGraded ? '✅ Graded' : isSubmitted ? '⏳ Submitted' : '🔥 Active'}
                        </span>
                      </div>
                      <p className="font-medium mb-4" style={{ color: themeColors.textSecondary }}>{task.description}</p>
                      <div
                        className="rounded-xl p-4 mb-4 space-y-2"
                        style={{ backgroundColor: themeColors.backgroundSecondary }}
                      >
                        <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>📋 Type: {task.type}</p>
                        <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>⏰ Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                        <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>🎯 Max Score: {task.maxScore}</p>
                        {isGraded && <p className="text-sm font-bold" style={{ color: themeColors.success }}>🏆 Your Score: {submission.score}</p>}
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
                          className="w-full px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: themeColors.accent,
                            color: '#ffffff'
                          }}
                        >
                          🚀 Submit Task
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {activeTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl font-bold" style={{ color: themeColors.textSecondary }}>No active tasks available</p>
                  <p className="font-medium" style={{ color: themeColors.textSecondary }}>Check back later for new assignments!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Team Formation Tab */}
          {activeTab === 'teams' && (
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <TeamFormation />
            </motion.div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-8" style={{ color: themeColors.text }}>✅ Attendance History</h2>
              <div className="mb-8">
                <motion.div
                  className="rounded-2xl p-8 shadow-lg"
                  style={{ backgroundColor: themeColors.success }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">📊 Attendance Summary</h3>
                      <p className="text-white/90 font-medium">Your attendance statistics</p>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-bold text-white">{attendancePercentage}%</p>
                      <p className="text-white/80 font-medium">{presentDays} of {totalDays} days</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div
                className="rounded-2xl shadow-lg overflow-hidden border"
                style={{
                  backgroundColor: themeColors.cardBgSecondary,
                  borderColor: themeColors.border
                }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead style={{ backgroundColor: themeColors.backgroundSecondary }}>
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider" style={{ color: themeColors.text }}>📅 Date</th>
                        <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider" style={{ color: themeColors.text }}>📊 Status</th>
                        <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider" style={{ color: themeColors.text }}>🎯 Session</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
                      {attendance.map((record, index) => (
                        <motion.tr
                          key={record._id}
                          className="transition-colors duration-200"
                          style={{
                            backgroundColor: 'transparent',
                            ':hover': { backgroundColor: themeColors.backgroundSecondary }
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td className="px-8 py-4 whitespace-nowrap text-sm font-medium" style={{ color: themeColors.text }}>
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap">
                            <span
                              className="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                              style={{
                                backgroundColor: record.status === 'present' ? themeColors.success : themeColors.error,
                                color: '#ffffff'
                              }}
                            >
                              {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                            </span>
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                            {record.session || 'N/A'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {attendance.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📅</div>
                      <p className="text-xl font-bold" style={{ color: themeColors.textSecondary }}>No attendance records found</p>
                      <p className="font-medium" style={{ color: themeColors.textSecondary }}>Your attendance will appear here once recorded!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-8" style={{ color: themeColors.text }}>📤 My Submissions</h2>
              <div className="space-y-6">
                {submissions.map((submission, index) => (
                  <motion.div
                    key={submission._id}
                    className="rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                      borderColor: themeColors.border
                    }}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold" style={{ color: themeColors.text }}>📋 {submission.taskId?.title || 'Unknown Task'}</h4>
                        <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>📅 Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                          style={{
                            backgroundColor: submission.score ? themeColors.success : themeColors.warning,
                            color: '#ffffff'
                          }}
                        >
                          {submission.score ? `🏆 Score: ${submission.score}` : '⏳ Not graded'}
                        </span>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4 mb-4"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    >
                      <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                        {submission.content?.text || submission.description || 'No description provided'}
                      </p>
                      <div className="flex gap-4 mt-3">
                        {submission.content?.fileUrl && (
                          <a
                            href={submission.content.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg text-xs font-bold shadow-md hover:shadow-sm transition-all duration-200 hover:scale-105"
                            style={{
                              backgroundColor: themeColors.accent,
                              color: '#ffffff'
                            }}
                          >
                            📎 Download File
                          </a>
                        )}
                        {submission.content?.link && (
                          <a
                            href={submission.content.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg text-xs font-bold shadow-md hover:shadow-sm transition-all duration-200 hover:scale-105"
                            style={{
                              backgroundColor: themeColors.accent,
                              color: '#ffffff'
                            }}
                          >
                            🔗 View Link
                          </a>
                        )}
                      </div>
                    </div>

                    {submission.feedback && (
                      <div
                        className="rounded-xl p-4 shadow-lg"
                        style={{ backgroundColor: themeColors.accent }}
                      >
                        <p className="text-sm font-bold text-white">💬 <strong>Feedback:</strong> {submission.feedback}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
                {submissions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📤</div>
                    <p className="text-xl font-bold" style={{ color: themeColors.textSecondary }}>No submissions found</p>
                    <p className="font-medium" style={{ color: themeColors.textSecondary }}>Your task submissions will appear here!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-8" style={{ color: themeColors.text }}>📢 Announcements</h2>
              <div className="space-y-6">
                {announcements.filter(a => a.isActive).map((announcement, index) => (
                  <motion.div
                    key={announcement._id}
                    className="rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                      borderColor: themeColors.border
                    }}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>📣 {announcement.title}</h4>
                        <p className="font-medium" style={{ color: themeColors.textSecondary }}>{announcement.content}</p>
                      </div>
                      <span
                        className="px-3 py-1 text-xs font-bold rounded-full"
                        style={{
                          backgroundColor: announcement.priority === 'urgent' ? themeColors.error :
                            announcement.priority === 'high' ? themeColors.warning :
                              announcement.priority === 'medium' ? '#eab308' :
                                themeColors.success,
                          color: '#ffffff'
                        }}
                      >
                        {announcement.priority === 'urgent' ? '🚨 URGENT' :
                          announcement.priority === 'high' ? '⚠️ HIGH' :
                            announcement.priority === 'medium' ? '📌 MEDIUM' :
                              '✅ LOW'}
                      </span>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    >
                      <div className="flex justify-between text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                        <p>📅 Posted: {new Date(announcement.createdAt).toLocaleDateString()}</p>
                        {announcement.expiresAt && (
                          <p>⏰ Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {announcements.filter(a => a.isActive).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📢</div>
                    <p className="text-xl font-bold" style={{ color: themeColors.textSecondary }}>No active announcements</p>
                    <p className="font-medium" style={{ color: themeColors.textSecondary }}>Important updates will appear here!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
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
    </div >
  );
};

export default ParticipantDashboard;