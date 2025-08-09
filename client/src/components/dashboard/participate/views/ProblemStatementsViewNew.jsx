import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Plus
} from 'lucide-react';
import { problemAPI, teamAPI } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import TeamCreationModal from './TeamCreationModal';

const ProblemStatementsView = ({ themeColors }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalProblems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const problemsPerPage = 10;
  
  // Team creation modal state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [toast, setToast] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadProblemStatements();
    checkUserTeam();
  }, [filter, currentPage, debouncedSearchQuery]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearchQuery]);

  const checkUserTeam = async () => {
    try {
      const response = await teamAPI.getMyTeam();
      setUserTeam(response.data.data.team);
    } catch (error) {
      // User doesn't have a team, which is fine
      setUserTeam(null);
    }
  };

  const loadProblemStatements = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: problemsPerPage,
        search: debouncedSearchQuery.trim(),
        domain: filter
      };

      const response = await problemAPI.getAll(params);
      const { problems: fetchedProblems, pagination: paginationData } = response.data;

      setProblems(fetchedProblems);
      setPagination({
        totalPages: paginationData.totalPages,
        totalProblems: paginationData.totalProblems,
        hasNextPage: paginationData.hasNextPage,
        hasPrevPage: paginationData.hasPrevPage
      });

    } catch (error) {
      console.error('Error loading problem statements:', error);
      setProblems([]);
      setPagination({
        totalPages: 1,
        totalProblems: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setShowTeamModal(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleTeamCreated = (message, type) => {
    showToast(message, type);
    if (type === 'success') {
      checkUserTeam();
      loadProblemStatements(); // Refresh to update selection counts
    }
  };

  const getDomainIcon = (domain) => {
    switch (domain?.toLowerCase()) {
      case 'health':
        return '🏥';
      case 'sports':
        return '⚽';
      case 'agriculture':
        return '🌱';
      case 'yoga':
        return '🧘';
      case 'education':
        return '📚';
      case 'technology':
        return '💻';
      default:
        return '💡';
    }
  };

  const getDomainColor = (domain) => {
    switch (domain?.toLowerCase()) {
      case 'health':
        return 'from-red-400 to-red-600';
      case 'sports':
        return 'from-green-400 to-green-600';
      case 'agriculture':
        return 'from-emerald-400 to-emerald-600';
      case 'yoga':
        return 'from-purple-400 to-purple-600';
      case 'education':
        return 'from-blue-400 to-blue-600';
      case 'technology':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-orange-400 to-orange-600';
    }
  };

  // Table Skeleton Component
  const TableSkeleton = () => (
    <div className="space-y-6">
      {/* Filter Tabs Skeleton */}
      <motion.div
        className="rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-20 rounded-xl animate-pulse"
                style={{ backgroundColor: themeColors.backgroundSecondary }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search Bar Skeleton */}
      <motion.div
        className="rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="p-6">
          <div
            className="h-12 w-full rounded-xl animate-pulse"
            style={{ backgroundColor: themeColors.backgroundSecondary }}
          />
        </div>
      </motion.div>

      {/* Table Skeleton */}
      <motion.div
        className="rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="p-6">
          <div
            className="h-7 w-48 mb-4 rounded animate-pulse"
            style={{ backgroundColor: themeColors.backgroundSecondary }}
          />

          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border"
                style={{ borderColor: themeColors.border }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-full animate-pulse flex-shrink-0"
                    style={{ backgroundColor: themeColors.backgroundSecondary }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="h-4 w-32 mb-2 rounded animate-pulse"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    />
                    <div
                      className="h-3 w-48 rounded animate-pulse"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    />
                  </div>
                  <div
                    className="h-8 w-24 rounded animate-pulse"
                    style={{ backgroundColor: themeColors.backgroundSecondary }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (loading) {
    return <TableSkeleton />;
  }

  const domains = ['all', 'health', 'sports', 'agriculture', 'yoga', 'education', 'technology'];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* User Team Status */}
      {userTeam && (
        <motion.div
          className="rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5" style={{ color: themeColors.accent }} />
              <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
                Your Team
              </h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium" style={{ color: themeColors.text }}>
                  {userTeam.name}
                </h4>
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Working on: {userTeam.problemStatement?.title}
                </p>
              </div>
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                {userTeam.members?.length || 0}/6 Members
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        className="rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5" style={{ color: themeColors.text }} />
            <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
              Filter by Domain
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setFilter(domain)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${filter === domain ? 'scale-105' : 'hover:scale-102'
                  }`}
                style={{
                  backgroundColor: filter === domain ? themeColors.accent : themeColors.backgroundSecondary,
                  color: filter === domain ? '#ffffff' : themeColors.text
                }}
              >
                <span>{domain === 'all' ? '🌐' : getDomainIcon(domain)}</span>
                <span className="capitalize">{domain}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: themeColors.textSecondary }} />
            <input
              type="text"
              placeholder="Search problem statements by title, description, domain, or technologies..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                backgroundColor: themeColors.backgroundSecondary,
                borderColor: themeColors.border,
                color: themeColors.text,
                fontSize: '16px'
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Problem Statements */}
      <motion.div
        className="rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6" style={{ color: themeColors.accent }} />
            <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Problem Statements
            </h3>
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>
                No problem statements found
              </h4>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                {searchQuery ? `No problem statements found matching "${searchQuery}"` : 'No problem statements found for this domain.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem, index) => {
                const isAtLimit = (problem.selectionCount || 0) >= 4;
                const canSelect = !userTeam && !isAtLimit;
                
                return (
                  <motion.div
                    key={problem._id}
                    className="p-4 rounded-xl border transition-all hover:shadow-md"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.backgroundSecondary
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{
                      backgroundColor: `${themeColors.hover}50`
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 bg-gradient-to-r ${getDomainColor(problem.domain)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl">
                          {getDomainIcon(problem.domain)}
                        </span>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg" style={{ color: themeColors.text }}>
                            {problem.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-4">
                            <span 
                              className={`px-3 py-1 text-sm rounded-full font-medium ${
                                isAtLimit 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {problem.selectionCount || 0}/4 teams
                            </span>
                            {isAtLimit && (
                              <span className="text-sm text-red-600 font-medium">FULL</span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3 line-clamp-3" style={{ color: themeColors.textSecondary }}>
                          {problem.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span
                              className="px-3 py-1 text-sm rounded-lg font-medium"
                              style={{
                                backgroundColor: `${themeColors.accent}20`,
                                color: themeColors.accent
                              }}
                            >
                              {problem.domain}
                            </span>
                            {problem.topic && (
                              <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                                Topic: {problem.topic}
                              </span>
                            )}
                          </div>
                          
                          {canSelect && (
                            <button
                              onClick={() => handleSelectProblem(problem)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                              style={{
                                backgroundColor: themeColors.accent,
                                color: '#ffffff'
                              }}
                            >
                              <Plus className="w-4 h-4" />
                              Select Problem
                            </button>
                          )}
                          
                          {userTeam && (
                            <span className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-600">
                              Already in team
                            </span>
                          )}
                        </div>
                        
                        {problem.suggestedTechnologies && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {problem.suggestedTechnologies.split(',').map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="px-2 py-1 text-xs rounded-lg font-medium"
                                  style={{
                                    backgroundColor: themeColors.backgroundSecondary,
                                    color: themeColors.text,
                                    border: `1px solid ${themeColors.border}`
                                  }}
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Results Summary */}
      {!loading && (
        <motion.div
          className="text-sm px-2"
          style={{ color: themeColors.textSecondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Showing {((currentPage - 1) * problemsPerPage) + 1}-{Math.min(currentPage * problemsPerPage, pagination.totalProblems)} of {pagination.totalProblems} problem statements
          {searchQuery && ` for "${searchQuery}"`}
          {filter !== 'all' && ` in ${filter} domain`}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          className="rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                style={{
                  backgroundColor: currentPage === 1 ? themeColors.backgroundSecondary : themeColors.accent,
                  color: currentPage === 1 ? themeColors.textSecondary : '#ffffff'
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  if (pageNumber < 1 || pageNumber > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: pageNumber === currentPage ? themeColors.accent : themeColors.backgroundSecondary,
                        color: pageNumber === currentPage ? '#ffffff' : themeColors.text
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                style={{
                  backgroundColor: currentPage === pagination.totalPages ? themeColors.backgroundSecondary : themeColors.accent,
                  color: currentPage === pagination.totalPages ? themeColors.textSecondary : '#ffffff'
                }}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Team Creation Modal */}
      <TeamCreationModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        selectedProblem={selectedProblem}
        themeColors={themeColors}
        onSuccess={handleTeamCreated}
      />
    </div>
  );
};

export default ProblemStatementsView;