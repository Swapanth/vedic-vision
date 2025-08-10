import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Home, Users, BookOpen, FileText, UserCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { hackathonAPI } from '../../../services/api';
import Modal from '../../common/Modal';
import ThemeToggle from '../../common/ThemeToggle';
import { motion } from 'framer-motion';
import { PageLoader } from '../../common/LoadingSpinner';

// Import hackathon-specific views
import HackathonHomeView from './views/HackathonHomeView';
import HackathonTeamsView from './views/HackathonTeamsView';
import HackathonMentorsView from './views/HackathonMentorsView';
import HackathonProblemsView from './views/HackathonProblemsView';
import HackathonProfileView from './views/HackathonProfileView';

function HackathonDashboard() {
  const { user, logout } = useAuth();
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    user: null,
    team: null,
    mentor: null,
    problemStatements: [],
    availableTeams: [],
    stats: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await hackathonAPI.getDashboard();
      setDashboardData(response.data.data);

    } catch (error) {
      console.error('Error loading hackathon dashboard:', error);
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

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'text-blue-600' },
    { id: 'teams', label: 'Teams', icon: Users, color: 'text-purple-600' },
    { id: 'mentors', label: 'Mentors', icon: UserCheck, color: 'text-green-600' },
    { id: 'problems', label: 'Problem Statements', icon: BookOpen, color: 'text-orange-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-indigo-600' }
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
      {/* Header */}
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
              <h1 className="text-xl font-bold" style={{ color: themeColors.text }}>
                VEDIC VISION 2K25 
                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  HACKATHON
                </span>
              </h1>
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
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              
              <button
                onClick={() => setActiveTab('teams')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'teams' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'teams' ? themeColors.blueBg : 'transparent'
                }}
              >
                <Users className="w-4 h-4" />
                <span>Teams</span>
              </button>

              <button
                onClick={() => setActiveTab('mentors')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'mentors' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'mentors' ? themeColors.blueBg : 'transparent'
                }}
              >
                <UserCheck className="w-4 h-4" />
                <span>Mentors</span>
              </button>

              <button
                onClick={() => setActiveTab('problems')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: activeTab === 'problems' ? themeColors.accent : themeColors.textSecondary,
                  backgroundColor: activeTab === 'problems' ? themeColors.blueBg : 'transparent'
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
                style={{ color: themeColors.textSecondary }}
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
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: themeColors.sidebarBg }}
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold" style={{ color: themeColors.text }}>
                HACKATHON DASHBOARD
              </h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: themeColors.textSecondary }}
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2" style={{ color: themeColors.textSecondary }}>
            <span>Welcome to the Hackathon Dashboard, {user?.name || 'User'}!</span>
            <span className="text-orange-500">🏆</span>
          </div>
          <p className="mt-2 text-sm" style={{ color: themeColors.textSecondary }}>
            Focus on team collaboration, mentorship, and problem-solving
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <HackathonHomeView
            themeColors={themeColors}
            dashboardData={dashboardData}
            setActiveTab={setActiveTab}
            showSuccessModal={showSuccessModal}
            loadDashboardData={loadDashboardData}
          />
        )}

        {activeTab === 'teams' && (
          <HackathonTeamsView
            themeColors={themeColors}
            userTeam={dashboardData.team}
            availableTeams={dashboardData.availableTeams}
            showSuccessModal={showSuccessModal}
            loadDashboardData={loadDashboardData}
          />
        )}

        {activeTab === 'mentors' && (
          <HackathonMentorsView
            themeColors={themeColors}
            assignedMentor={dashboardData.mentor}
            showSuccessModal={showSuccessModal}
          />
        )}

        {activeTab === 'problems' && (
          <HackathonProblemsView
            themeColors={themeColors}
            problemStatements={dashboardData.problemStatements}
            userTeam={dashboardData.team}
          />
        )}

        {activeTab === 'profile' && (
          <HackathonProfileView
            user={user}
            themeColors={themeColors}
            setModalContent={setModalContent}
            setShowModal={setShowModal}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent?.title || ''}
      >
        {modalContent?.content}
      </Modal>
    </div>
  );
}

export default HackathonDashboard;