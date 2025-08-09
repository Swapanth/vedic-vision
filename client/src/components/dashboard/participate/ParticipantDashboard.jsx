import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Home, CheckCircle, Trophy, BookOpen, FileText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { taskAPI, attendanceAPI, submissionAPI, userAPI, teamAPI } from '../../../services/api';
import Modal from '../../common/Modal';
import ThemeToggle from '../../common/ThemeToggle';
import ProfileView from './views/ProfileView';
import { motion } from 'framer-motion';
import HomeView from './views/HomeView';
import TasksView from './views/TasksView';
import LeaderboardView from './views/LeaderboardView';
import ProblemStatementsView from './views/ProblemStatementsView';
import { PageLoader, ButtonLoader } from '../../common/LoadingSpinner';
import QuickTour from '../../common/QuickTour';
import { useTour, tourSteps } from '../../../hooks/useTour';

function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Data states
  const [activeTasks, setActiveTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [completedSubmissions, setCompletedSubmissions] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [team, setTeam] = useState(null);

  const [submissionForm, setSubmissionForm] = useState({ description: '', link: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculated values
  const [overviewScore, setOverviewScore] = useState(0);
  const [attendanceScore, setAttendanceScore] = useState(0);
  const [taskCompletionScore, setTaskCompletionScore] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [presentDays, setPresentDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [attendanceStreak, setAttendanceStreak] = useState(0);
  const [participantPosition, setParticipantPosition] = useState(0);

  // Tour functionality
  const { isTourOpen, hasCompletedTour, startTour, closeTour, completeTour } = useTour('complete', tourSteps.complete);

  // Auto-start tour for new users
  useEffect(() => {
    if (!hasCompletedTour && user) {
      // Start tour after a short delay to let the page load
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour, user, startTour]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel (except team which might fail)
      const [
        tasksRes,
        attendanceRes,
        submissionsRes,
        mentorRes
      ] = await Promise.all([
        taskAPI.getAllTasks(),
        attendanceAPI.getMyAttendance(),
        submissionAPI.getMySubmissions(),
        userAPI.getMyMentor()
      ]);

      // Set tasks
      const tasks = tasksRes.data.data.tasks || [];
      setActiveTasks(tasks.filter(task => task.isActive === true));

      // Set attendance
      const attendanceData = attendanceRes.data.data.attendance || [];
      setAttendance(attendanceData);

      // Calculate attendance metrics
      const presentRecords = attendanceData.filter(record => record.status === 'present');
      const totalRecords = attendanceData.length;
      setPresentDays(presentRecords.length);
      setTotalDays(totalRecords);
      setAttendancePercentage(totalRecords > 0 ? Math.round((presentRecords.length / totalRecords) * 100) : 0);
      setAttendanceScore(presentRecords.length * 10); // 10 points per day

      // Calculate attendance streak
      let streak = 0;
      const sortedAttendance = [...attendanceData].sort((a, b) => new Date(b.date) - new Date(a.date));
      for (const record of sortedAttendance) {
        if (record.status === 'present') {
          streak++;
        } else {
          break;
        }
      }
      setAttendanceStreak(streak);

      // Set submissions
      const submissions = submissionsRes.data.data.submissions || [];
      setPendingSubmissions(submissions.filter(sub => sub.status === 'pending' || sub.status === 'submitted'));
      setCompletedSubmissions(submissions.filter(sub => sub.status === 'completed' || sub.status === 'graded'));

      // Calculate task completion score
      const completedTasks = submissions.filter(sub => sub.status === 'completed');
      const taskScore = completedTasks.reduce((total, sub) => total + (sub.score || 0), 0);
      setTaskCompletionScore(taskScore);

      // Set mentor
      setMentor(mentorRes.data.data.mentor);

      // Try to load team data separately (handle 404 gracefully)
      try {
        const teamRes = await teamAPI.getMyTeam();
        if (teamRes.data && teamRes.data.data && teamRes.data.data.team && teamRes.data.data.team._id) {
          setTeam(teamRes.data.data.team);
        } else {
          setTeam(null);
        }
      } catch (teamError) {
        if (teamError.response && teamError.response.status === 404) {
          // User is not in a team, this is normal
          setTeam(null);
        } else {
          // Only show an error if it's not a 404
          setError('Failed to load your team. Please try again.');
        }
      }

      // Calculate total overview score
      const totalScore = (presentRecords.length * 10) + taskScore;
      setOverviewScore(totalScore);

      // Calculate position (placeholder - you might want to implement this based on your ranking system)
      setParticipantPosition(1); // Placeholder

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
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

  const handleSubmitTask = async (taskId) => {
    setIsSubmitting(true);
    try {
      if (!submissionForm.description && !submissionForm.link) {
        showSuccessModal('Error', 'Please provide a description or link for your submission');
        return;
      }

      const formData = new FormData();
      formData.append('taskId', taskId.toString());

      let submissionType = 'text';
      let content = { text: submissionForm.description || 'No description provided' };

      if (submissionForm.link) {
        submissionType = 'link';
        content = {
          link: submissionForm.link,
          linkTitle: submissionForm.description || ''
        };
      }

      formData.append('submissionType', submissionType);
      formData.append('content', JSON.stringify(content));

      // Add isEdit flag if this is an edit operation
      if (modalContent.isEdit || modalContent.isRedo) {
        formData.append('isEdit', 'true');
      }

      await submissionAPI.submitTask(taskId, formData);
      showSuccessModal('Success', modalContent.isEdit ? 'Submission updated successfully!' : 'Task submitted successfully!');
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
      setIsSubmitting(false);
    }
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'text-blue-600' },
    { id: 'problems', label: 'Problem Statements', icon: BookOpen, color: 'text-blue-600' },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle, color: 'text-purple-600' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-green-600' }
  ];




  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: themeColors.background }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text }}>Error Loading Dashboard</h2>
          <p className="mb-4" style={{ color: themeColors.textSecondary }}>{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen animate-gradient"
      style={{ backgroundColor: themeColors.background }}
    >
      <div
        className="shadow-sm border-b"
        style={{
          backgroundColor: themeColors.background,
          borderColor: themeColors.navbarBorder
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold" style={{ color: themeColors.text }}>VEDIC VISION 2K25</h1>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-4 items-center">
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'home' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'home' ? themeColors.blueBg : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'home') {
                    e.target.style.backgroundColor = themeColors.hover;
                    e.target.style.color = themeColors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'home') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = themeColors.textSecondary;
                  }
                }}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'tasks' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'tasks' ? themeColors.blueBg : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'tasks') {
                    e.target.style.backgroundColor = themeColors.hover;
                    e.target.style.color = themeColors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'tasks') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = themeColors.textSecondary;
                  }
                }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'leaderboard' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'leaderboard' ? themeColors.blueBg : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'leaderboard') {
                    e.target.style.backgroundColor = themeColors.hover;
                    e.target.style.color = themeColors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'leaderboard') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = themeColors.textSecondary;
                  }
                }}
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>
              <button
                onClick={() => setActiveTab('problems')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'problems' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'problems' ? themeColors.blueBg : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'problems') {
                    e.target.style.backgroundColor = themeColors.hover;
                    e.target.style.color = themeColors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'problems') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = themeColors.textSecondary;
                  }
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Problems</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'profile' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'profile' ? themeColors.blueBg : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'profile') {
                    e.target.style.backgroundColor = themeColors.hover;
                    e.target.style.color = themeColors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'profile') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = themeColors.textSecondary;
                  }
                }}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              {/* Theme Toggle */}
              <div className="mx-2">
                <ThemeToggle />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: themeColors.error }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeColors.errorBg;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: themeColors.textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeColors.hover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: themeColors.modalOverlay }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ backgroundColor: themeColors.sidebarBg }}
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{ borderColor: themeColors.border }}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold" style={{ color: themeColors.text }}>VEDIC VISION 2K25</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: themeColors.textSecondary }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeColors.hover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? themeColors.blueBg : 'transparent',
                    color: isActive ? themeColors.accent : themeColors.textSecondary,
                    borderRight: isActive ? `2px solid ${themeColors.accent}` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = themeColors.sidebarHover;
                      e.target.style.color = themeColors.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = themeColors.textSecondary;
                    }
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: themeColors.accent }} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
              style={{ color: themeColors.error }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = themeColors.errorBg;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8"           data-tour="completed-tasks-card"
        >
          <div className="flex items-center justify-center space-x-2" style={{ color: themeColors.textSecondary }}>
            <span>Welcome back, {user?.name || 'User'}! Track your progress and manage your tasks</span>
            <span className="text-red-500">🚀</span>
          </div>
        </div>


        {/* Tab Content */}
        {activeTab === 'home' && (
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
            user={user}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            themeColors={themeColors}
            setModalContent={setModalContent}
            setShowModal={setShowModal}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={activeTasks}
            submissions={[...pendingSubmissions, ...completedSubmissions]}
            setSubmissionForm={setSubmissionForm}
            themeColors={themeColors}
            setModalContent={setModalContent}
            setShowModal={setShowModal}
            submissionForm={submissionForm}
            onSubmitTask={handleSubmitTask}
            isSubmitting={isSubmitting}
            user={user}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            themeColors={themeColors}
            user={user}
            overviewScore={overviewScore}
            attendanceScore={attendanceScore}
            taskCompletionScore={taskCompletionScore}
            participantPosition={participantPosition}
            setModalContent={setModalContent}
            setShowModal={setShowModal}
          />
        )}

        {activeTab === 'problems' && (
          <ProblemStatementsView
            themeColors={themeColors}
          />
        )}
      </div>

      {/* Tour Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={startTour}
          className="flex items-center space-x-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
          style={{
            backgroundColor: themeColors.accent,
            color: '#ffffff'
          }}
          title="Take a quick tour"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Quick Tour</span>
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent?.title || ''}
      >
        {modalContent?.taskId ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={submissionForm.description}
                onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={10}
                placeholder="Describe your submission..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link (optional)
              </label>
              <input
                type="url"
                value={submissionForm.link}
                onChange={(e) => setSubmissionForm(prev => ({ ...prev, link: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
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
                onClick={() => handleSubmitTask(modalContent.taskId)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <ButtonLoader text={modalContent.isEdit ? 'Updating...' : 'Submitting...'} />
                ) : (
                  modalContent.isEdit ? 'Update Submission' : 'Submit Task'
                )}
              </button>
            </div>
          </div>
        ) : (
          modalContent?.content
        )}
      </Modal>

      {/* Quick Tour */}
      <QuickTour
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={completeTour}
        steps={tourSteps.complete}
        themeColors={themeColors}
        tourKey="complete"
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

export default ParticipantDashboard;