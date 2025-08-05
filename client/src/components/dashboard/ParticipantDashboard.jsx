import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, Home, Calendar, CheckCircle, Clock, Trophy, Users, BookOpen, ChevronLeft, ChevronRight, Mail, Shield, Edit3, Lock, Settings, Activity, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { taskAPI, attendanceAPI, submissionAPI, announcementAPI, userAPI } from '../../services/api';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import TasksView from './TasksView';
import LeaderboardView from './LeaderboardView';

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

// Calendar Component for Attendance
const AttendanceCalendar = ({ attendance, themeColors }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (date) => {
    // Format local date as YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;

    return attendance.find(a => {
      // Extract date part from API response (which is in UTC)
      const apiDateStr = a.date.split('T')[0];
      return apiDateStr === localDateStr;
    });
  };

  // Check if a date is within the event period (August 4-15, 2025)
  const getEventDayInfo = (date) => {
    const eventStartDate = new Date(2025, 7, 4); // August 4, 2025
    const eventEndDate = new Date(2025, 7, 15);   // August 15, 2025

    if (date >= eventStartDate && date <= eventEndDate) {
      const daysDiff = Math.floor((date - eventStartDate) / (1000 * 60 * 60 * 24));
      return {
        isEventDay: true,
        dayNumber: daysDiff + 1
      };
    }
    return { isEventDay: false, dayNumber: null };
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const attendanceRecord = getAttendanceForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const eventDayInfo = getEventDayInfo(date);

      // Determine border style for event days
      let borderStyle = {};
      if (eventDayInfo.isEventDay) {
        const borderColor = attendanceRecord
          ? attendanceRecord.status === 'present'
            ? '#10b981' // Green for present
            : '#ef4444' // Red for absent
          : '#94a3b8'; // Gray for no attendance record

        borderStyle = {
          border: `3px solid ${borderColor}`,
          boxShadow: `0 0 8px ${borderColor}40`
        };
      }

      days.push(
        <div
          key={day}
          className={`h-10 w-10 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 relative ${isToday ? 'ring-2 ring-blue-500' : ''
            }`}
          style={{
            backgroundColor: attendanceRecord
              ? attendanceRecord.status === 'present'
                ? themeColors.success
                : themeColors.error
              : themeColors.backgroundSecondary,
            color: attendanceRecord ? '#ffffff' : themeColors.text,
            ...borderStyle
          }}
        >
          <span className="text-sm">{day}</span>
          {eventDayInfo.isEventDay && (
            <span className="text-xs font-bold text-blue-600 bg-white bg-opacity-80 px-1 rounded mt-0.5">
              D{eventDayInfo.dayNumber}
            </span>
          )}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.cardBgSecondary }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
            style={{ color: themeColors.text }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
            style={{ color: themeColors.text }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium" style={{ color: themeColors.textSecondary }}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>

      <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: themeColors.success }}></div>
          <span style={{ color: themeColors.textSecondary }}>Present</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: themeColors.error }}></div>
          <span style={{ color: themeColors.textSecondary }}>Absent</span>
        </div>
      </div>
    </div>
  );
}; const ParticipantDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [activeView, setActiveView] = useState('home'); // 'home', 'tasks', 'leaderboard', 'profile'
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null, taskId: null });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      const [tasksRes, attendanceRes, submissionsRes] = await Promise.all([
        taskAPI.getAllTasks(),
        attendanceAPI.getMyAttendance(),
        submissionAPI.getMySubmissions(),
      ]);

      setTasks(tasksRes.data.data.tasks || []);
      setAttendance(attendanceRes.data.data.attendance || []);
      setSubmissions(submissionsRes.data.data.submissions || []);

      // Load mentor info if available
      try {
        const mentorRes = await userAPI.getMyMentor();
        setMentor(mentorRes.data.data.mentor);
      } catch (error) {
        console.log('No mentor assigned yet');
      }

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

  const handleSubmitTask = async (taskId) => {
    try {
      if (!submissionForm.description && !submissionForm.link) {
        showSuccessModal('Error', 'Please provide a description or link for your submission');
        return;
      }

      setSubmissionLoading(true);

      const formData = new FormData();
      formData.append('taskId', taskId.toString());

      // Determine submission type and content based on what's provided
      let submissionType;
      let content = {};

      if (submissionForm.link && submissionForm.description) {
        // If both link and description are provided, treat as text with link
        submissionType = 'text';
        content = { 
          text: submissionForm.description,
          link: submissionForm.link
        };
      } else if (submissionForm.link) {
        // If only link is provided, treat as link submission
        submissionType = 'link';
        content = { link: submissionForm.link };
      } else {
        // If only description is provided, treat as text submission
        submissionType = 'text';
        content = { text: submissionForm.description };
      }

      formData.append('submissionType', submissionType);
      formData.append('content', JSON.stringify(content));

      // Check if this is an edit operation
      if (modalContent.isEdit && modalContent.submissionId) {
        await submissionAPI.updateSubmission(modalContent.submissionId, formData);
        showSuccessModal('Success', 'Submission updated successfully!');
      } else {
        await submissionAPI.submitTask(taskId, formData);
        showSuccessModal('Success', 'Task submitted successfully!');
      }
      
      setSubmissionForm({ description: '', link: '' });
      setShowModal(false);
      loadDashboardData();
    } catch (error) {
      let errorMessage = modalContent.isEdit ? 'Failed to update submission' : 'Failed to submit task';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      }
      showSuccessModal('Error', errorMessage);
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Calculate statistics
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  const activeTasks = tasks.filter(t => t.isActive);
  const completedSubmissions = submissions.filter(s => s.score);
  const pendingSubmissions = submissions.filter(s => !s.score);

  // Calculate overview score (attendance: 10 points per day + task completion scores)
  const attendanceScore = presentDays * 10;
  const taskCompletionScore = completedSubmissions.reduce((total, submission) => {
    return total + (submission.score || 0);
  }, 0);
  const overviewScore = attendanceScore + taskCompletionScore;

  // Mock participant position in group (this would come from API in real implementation)
  const participantPosition = Math.floor(Math.random() * 50) + 1; // Random position for demo

  // Get attendance streak
  const getAttendanceStreak = () => {
    let streak = 0;
    const sortedAttendance = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const record of sortedAttendance) {
      if (record.status === 'present') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const attendanceStreak = getAttendanceStreak();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 transition-colors duration-300">
      {/* Background overlay for theme consistency */}
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: themeColors.background,
        }}
      >
        {/* Navigation */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav
            className="backdrop-blur-xl rounded-2xl border-2 sticky top-4 z-50"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border
            }}
          >
            <div className="px-8 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="text-2xl font-black" style={{ color: themeColors.text }}>
                    VEDIC VISION<span style={{ color: themeColors.accent }}>&nbsp;2K25</span>
                  </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  <button
                    onClick={() => setActiveView('home')}
                    className={`font-semibold transition-colors hover:opacity-80 ${activeView === 'home' ? 'text-blue-500' : ''}`}
                    style={{ color: activeView === 'home' ? themeColors.accent : themeColors.text }}
                  >
                    <Home className="w-4 h-4 inline mr-2" />
                    Home
                  </button>
                  <button
                    onClick={() => setActiveView('tasks')}
                    className={`font-semibold transition-colors hover:opacity-80 ${activeView === 'tasks' ? 'text-blue-500' : ''}`}
                    style={{ color: activeView === 'tasks' ? themeColors.accent : themeColors.text }}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Tasks
                  </button>
                  <button
                    onClick={() => setActiveView('leaderboard')}
                    className={`font-semibold transition-colors hover:opacity-80 ${activeView === 'leaderboard' ? 'text-blue-500' : ''}`}
                    style={{ color: activeView === 'leaderboard' ? themeColors.accent : themeColors.text }}
                  >
                    <Trophy className="w-4 h-4 inline mr-2" />
                    Leaderboard
                  </button>
                  <button
                    onClick={() => setActiveView('profile')}
                    className={`font-semibold transition-colors hover:opacity-80 ${activeView === 'profile' ? 'text-blue-500' : ''}`}
                    style={{ color: activeView === 'profile' ? themeColors.accent : themeColors.text }}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="font-semibold transition-colors hover:opacity-80 text-red-500"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-md border-2"
                    style={{
                      backgroundColor: themeColors.cardBg,
                      borderColor: themeColors.border
                    }}
                  >
                    {isMenuOpen ? (
                      <X className="h-6 w-6" style={{ color: themeColors.text }} />
                    ) : (
                      <Menu className="h-6 w-6" style={{ color: themeColors.text }} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <motion.div
              className="backdrop-blur-xl rounded-2xl border-2"
              style={{
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.border
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-8 py-6 space-y-2">
                <button
                  onClick={() => {
                    setActiveView('home');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 font-semibold text-left"
                  style={{ color: themeColors.text }}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </button>
                <button
                  onClick={() => {
                    setActiveView('tasks');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 font-semibold text-left"
                  style={{ color: themeColors.text }}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Tasks
                </button>
                <button
                  onClick={() => {
                    setActiveView('leaderboard');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 font-semibold text-left"
                  style={{ color: themeColors.text }}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </button>
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 font-semibold text-left"
                  style={{ color: themeColors.text }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 font-semibold text-left text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                {activeView === 'home' && 'Participant Dashboard'}
                {activeView === 'tasks' && 'Task Management'}
                {activeView === 'leaderboard' && 'Leaderboard'}
                {activeView === 'profile' && 'Profile Management'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Welcome back, {user?.name}! Track your progress and manage your tasks 🚀
              </p>
            </div>
          </motion.div>

          {/* Content based on active view */}
          {activeView === 'home' && (
            <HomeView
              themeColors={themeColors}
              activeTasks={activeTasks}
              attendancePercentage={attendancePercentage}
              presentDays={presentDays}
              totalDays={totalDays}
              attendanceStreak={attendanceStreak}
              attendance={attendance}
              pendingSubmissions={pendingSubmissions}
              completedSubmissions={completedSubmissions}
              mentor={mentor}
              team={team}
              overviewScore={overviewScore}
              attendanceScore={attendanceScore}
              taskCompletionScore={taskCompletionScore}
              participantPosition={participantPosition}
              setModalContent={setModalContent}
              setShowModal={setShowModal}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              themeColors={themeColors}
              tasks={tasks}
              submissions={submissions}
              setSubmissionForm={setSubmissionForm}
              setModalContent={setModalContent}
              setShowModal={setShowModal}
            />
          )}

          {activeView === 'leaderboard' && (
            <LeaderboardView themeColors={themeColors} />
          )}

          {activeView === 'profile' && (
            <ProfileView
              themeColors={themeColors}
              user={user}
              setModalContent={setModalContent}
              setShowModal={setShowModal}
            />
          )}
        </div>

        {/* Task Submission Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalContent.title}>
          {modalContent.taskId ? (
            <div className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Provide at least one field - description, link, or both.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={submissionForm.description}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="Describe your submission, what you learned, challenges faced, etc..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={submissionForm.link}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/username/repo or https://deployed-app.com"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={submissionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitTask(modalContent.taskId)}
                  disabled={submissionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submissionLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {submissionLoading 
                    ? (modalContent.isEdit ? 'Updating...' : 'Submitting...') 
                    : (modalContent.isEdit ? 'Update Submission' : 'Submit Task')
                  }
                </button>
              </div>
            </div>
          ) : (
            modalContent.content
          )}
        </Modal>
      </div>
    </div>
  );
};
// Home View Component
const HomeView = ({
  themeColors,
  activeTasks,
  attendancePercentage,
  presentDays,
  totalDays,
  attendanceStreak,
  attendance,
  pendingSubmissions,
  completedSubmissions,
  mentor,
  team,
  overviewScore,
  attendanceScore,
  taskCompletionScore,
  participantPosition,
  setModalContent,
  setShowModal
}) => {

  const showScoreDetails = () => {
    setModalContent({
      title: 'Score Breakdown',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">{overviewScore}</div>
            <div className="text-lg font-semibold text-gray-700">Total Overview Score</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-green-800">Attendance Score</div>
                <div className="text-sm text-green-600">{presentDays} days × 10 points</div>
              </div>
              <div className="text-xl font-bold text-green-700">{attendanceScore}</div>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-blue-800">Task Completion Score</div>
                <div className="text-sm text-blue-600">{completedSubmissions.length} tasks completed</div>
              </div>
              <div className="text-xl font-bold text-blue-700">{taskCompletionScore}</div>
            </div>

            {/* <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-semibold text-purple-800">Group Position</div>
                <div className="text-sm text-purple-600">Current ranking</div>
              </div>
              <div className="text-xl font-bold text-purple-700">#{participantPosition}</div>
            </div> */}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Scoring System:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Attendance: 10 points per day present</li>
              <li>• Task completion: Variable points based on quality</li>
              <li>• Position calculated based on total score</li>
            </ul>
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
      {/* Overview Score Section */}
      <motion.div
        className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 mb-8"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >

      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100/50 text-center transition-all duration-300 hover:scale-105 border-2 hover:shadow-xl"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >

          <div className="text-3xl font-bold mb-2 text-gray-900">{activeTasks.length}</div>
          <div className="font-medium text-sm text-gray-600">Active Tasks</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100/50 text-center transition-all duration-300 hover:scale-105 border-2 hover:shadow-xl"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >

          <div className="text-3xl font-bold mb-2 text-gray-900">{attendancePercentage}%</div>
          <div className="font-medium text-sm text-gray-600">Attendance Rate</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100/50 text-center transition-all duration-300 hover:scale-105 border-2 hover:shadow-xl"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >

          <div className="text-3xl font-bold mb-2 text-gray-900">{pendingSubmissions.length}</div>
          <div className="font-medium text-sm text-gray-600">Pending Submissions</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100/50 text-center transition-all duration-300 hover:scale-105 border-2 hover:shadow-xl"
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >

          <div className="text-3xl font-bold mb-2 text-gray-900">{completedSubmissions.length}</div>
          <div className="font-medium text-sm text-gray-600">Completed Tasks</div>
        </motion.div>
      </div>
      {/* Main Content Grid - Three Sections in Same Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1 - Attendance Calendar */}
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
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: themeColors.text }}>
              <Calendar className="w-5 h-5 mr-2" />
              Attendance Calendar
            </h3>
            <AttendanceCalendar attendance={attendance} themeColors={themeColors} />
          </div>
        </motion.div>

        {/* Section 2 - Participant Overview */}
        <motion.div
          className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center" style={{ color: themeColors.text }}>
                <Trophy className="w-5 h-5 mr-2" />
                Participant Overview
              </h3>
              <button
                onClick={showScoreDetails}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
              >
                Details
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                <div className="text-3xl font-bold mb-1" style={{ color: themeColors.accent }}>{overviewScore}</div>
                <div className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Score</div>
                {/* <div className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>Position #{participantPosition}</div> */}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: themeColors.textSecondary }}>Attendance</span>
                  <span style={{ color: themeColors.text }}>{presentDays}/{totalDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: themeColors.textSecondary }}>Current Streak</span>
                  <span style={{ color: themeColors.text }}>{attendanceStreak} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: themeColors.textSecondary }}>Completed Tasks</span>
                  <span style={{ color: themeColors.text }}>{completedSubmissions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3 - Mentor & Team Info */}
        <motion.div
          className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: themeColors.text }}>
              <Users className="w-5 h-5 mr-2" />
              Mentor & Team
            </h3>

            {/* Mentor Information */}
            <div className='mb-3'>
              <h4 className="text-sm font-semibold mb-2" style={{ color: themeColors.textSecondary }}>MENTOR</h4>
              {mentor ? (
                <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {mentor.profilePicture ? (
                        <img
                          src={mentor.profilePicture}
                          alt={mentor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: themeColors.text }}>{mentor.name}</div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>{mentor.email}</div>
                    </div>
                  </div>
                  {mentor.mobile && (
                    <div className="mt-1 text-sm" style={{ color: themeColors.textSecondary }}>
                      📞 {mentor.mobile}
                    </div>
                  )}
                  {mentor.description && (
                    <div className="mt-2  " style={{ color: themeColors.textSecondary }}>
                      {mentor.description}
                    </div>
                  )}
                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mentor.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {skill.replace(/"/g, '')}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>No mentor assigned yet</div>
                </div>
              )}
            </div>
            <div className='mb-3 border-t mt-3'>
              <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: themeColors.textSecondary }}>TEAM INFO</h4>
              {team ? (
                <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                  <div className="font-semibold mb-2" style={{ color: themeColors.text }}>{team.name}</div>
                  <div className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>
                    {team.members?.length || 0} members
                  </div>
                  {team.members && team.members.length > 0 && (
                    <div className="space-y-1">
                      {team.members.slice(0, 3).map((member, index) => (
                        <div key={index} className="text-xs" style={{ color: themeColors.textSecondary }}>
                          • {member.name}
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          +{team.members.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>Team formation will be available soon</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

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
          backgroundColor: themeColors.backgroundColor,
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
};

export default ParticipantDashboard;