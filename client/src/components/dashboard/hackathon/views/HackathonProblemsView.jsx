import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Users, Tag, Clock, Star, Plus } from 'lucide-react';
import { hackathonAPI, problemAPI } from '../../../../services/api';
import CustomProblemModal from './CustomProblemModal';

function HackathonProblemsView({ themeColors, problemStatements, userTeam }) {
  const [problems, setProblems] = useState(problemStatements || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Custom problem modal state
  const [showCustomProblemModal, setShowCustomProblemModal] = useState(false);
  const [hasCustomProblem, setHasCustomProblem] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProblems();
    checkCustomProblem();
  }, [currentPage, searchTerm, selectedCategory]);

  const checkCustomProblem = async () => {
    try {
      const response = await problemAPI.getMyCustom();
      setHasCustomProblem(true);
    } catch (error) {
      // User doesn't have a custom problem, which is fine
      setHasCustomProblem(false);
    }
  };

  const handleCustomProblemSuccess = (message, type) => {
    setToast({ message, type });
    if (type === 'success') {
      setHasCustomProblem(true);
      loadProblems(); // Refresh to show the new custom problem
    }
    // Auto-hide toast after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await hackathonAPI.getProblemStatements({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory
      });

      // Handle the actual response structure from the API
      const responseData = response.data;
      setProblems(responseData.problems || []);

      // Extract unique domains/categories from problems
      const uniqueCategories = [...new Set((responseData.problems || []).map(p => p.domain).filter(Boolean))];
      setCategories(uniqueCategories);

      setPagination(responseData.pagination || {});
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProblems();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
          Problem Statements
        </h2>
        <p style={{ color: themeColors.textSecondary }}>
          Explore challenging problems to solve during the hackathon
        </p>
      </div>

      {/* Current Team's Problem */}
      {userTeam && userTeam.problemStatement && (
        <div
          className="rounded-xl p-6 border-2"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.accent
          }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Your Team's Problem
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-2" style={{ color: themeColors.text }}>
                {userTeam.problemStatement.title}
              </h4>
              <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                {userTeam.problemStatement.description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                <span
                  className="px-2 py-1 text-sm rounded-full"
                  style={{
                    backgroundColor: themeColors.blueBg,
                    color: themeColors.accent
                  }}
                >
                  {userTeam.problemStatement.category}
                </span>
              </div>

              {userTeam.problemStatement.difficulty && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                  <span className={`px-2 py-1 text-sm rounded-full ${getDifficultyColor(userTeam.problemStatement.difficulty)}`}>
                    {userTeam.problemStatement.difficulty}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Problem Statement Section */}
      {!userTeam && (
        <div
          className="rounded-xl p-6 border-2 border-dashed transition-all hover:border-solid"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.accent + '40'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: themeColors.accent + '20' }}
              >
                <Plus className="w-6 h-6" style={{ color: themeColors.accent }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
                  Create Custom Problem Statement
                </h3>
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                  {hasCustomProblem
                    ? "You've already created a custom problem statement"
                    : "Can't find the perfect problem? Create your own custom problem statement that only you can use"
                  }
                </p>
              </div>
            </div>
            {!hasCustomProblem && (
              <button
                onClick={() => setShowCustomProblemModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: themeColors.accent,
                  color: '#ffffff'
                }}
              >
                <Plus className="w-4 h-4" />
                Create Custom Problem
              </button>
            )}
            {hasCustomProblem && (
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                ✓ Custom Problem Created
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search problem statements..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Problem Statements Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
          All Problem Statements ({pagination.totalProblems || problems.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2" style={{ color: themeColors.textSecondary }}>Loading problems...</p>
          </div>
        ) : problems.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.textSecondary }} />
            <p className="text-lg font-medium mb-2" style={{ color: themeColors.text }}>
              No problem statements found
            </p>
            <p style={{ color: themeColors.textSecondary }}>
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className={`rounded-xl p-6 border transition-all hover:shadow-lg ${userTeam?.problemStatement?._id === problem._id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  style={{
                    backgroundColor: themeColors.cardBg,
                    borderColor: userTeam?.problemStatement?._id === problem._id
                      ? themeColors.accent
                      : themeColors.border
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold text-lg leading-tight" style={{ color: themeColors.text }}>
                      {problem.title}
                    </h4>
                    {userTeam?.problemStatement?._id === problem._id && (
                      <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <p className="text-sm mb-4 line-clamp-3" style={{ color: themeColors.textSecondary }}>
                    {problem.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: themeColors.blueBg,
                        color: themeColors.accent
                      }}
                    >
                      {problem.domain}
                    </span>

                    {problem.difficulty && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                        {problem.selectionCount || 0} teams
                      </span>
                    </div>

                    {userTeam?.problemStatement?._id === problem._id && (
                      <span className="text-sm font-medium text-green-600">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  style={{ borderColor: themeColors.border }}
                >
                  Previous
                </button>

                <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  style={{ borderColor: themeColors.border }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <h4 className="font-semibold mb-2" style={{ color: themeColors.text }}>
          💡 Tips for Problem Selection
        </h4>
        <ul className="text-sm space-y-1" style={{ color: themeColors.textSecondary }}>
          <li>• Choose a problem that aligns with your team's skills and interests</li>
          <li>• Consider the difficulty level and time constraints</li>
          <li>• Look for problems that allow creative and innovative solutions</li>
          <li>• Discuss with your team members before making the final decision</li>
        </ul>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Custom Problem Statement Modal */}
      <CustomProblemModal
        isOpen={showCustomProblemModal}
        onClose={() => setShowCustomProblemModal(false)}
        themeColors={themeColors}
        onSuccess={handleCustomProblemSuccess}
      />
    </div>
  );
}

export default HackathonProblemsView;