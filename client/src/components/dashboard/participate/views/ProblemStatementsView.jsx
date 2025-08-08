import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { problemAPI } from '../../../../services/api';

const ProblemStatementsView = ({ themeColors }) => {
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadProblemStatements();
  }, [filter, currentPage, debouncedSearchQuery]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearchQuery]);

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
      // Fallback to empty state on error
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: themeColors.border }}>
                  <th className="text-left py-4 px-4">
                    <div
                      className="h-4 w-32 rounded animate-pulse"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    />
                  </th>
                  <th className="text-left py-4 px-4">
                    <div
                      className="h-4 w-16 rounded animate-pulse"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    />
                  </th>
                  <th className="text-left py-4 px-4 hidden md:table-cell">
                    <div
                      className="h-4 w-16 rounded animate-pulse"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    />
                  </th>
                  <th className="text-left py-4 px-4 hidden lg:table-cell">
                    <div
                      className="h-4 w-24 rounded animate-pulse"
                      style={{ backgroundColor: themeColors.backgroundSecondary }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }, (_, i) => (
                  <tr
                    key={i}
                    className="border-b"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
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
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div
                        className="h-6 w-16 rounded-lg animate-pulse"
                        style={{ backgroundColor: themeColors.backgroundSecondary }}
                      />
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div
                        className="h-3 w-24 rounded animate-pulse"
                        style={{ backgroundColor: themeColors.backgroundSecondary }}
                      />
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {[1, 2].map((j) => (
                          <div
                            key={j}
                            className="h-6 w-16 rounded-lg animate-pulse"
                            style={{ backgroundColor: themeColors.backgroundSecondary }}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Problem Statements Table */}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: themeColors.border }}>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: themeColors.text }}>
                      Problem Statement
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden md:table-cell" style={{ color: themeColors.text }}>
                      Domain
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden md:table-cell" style={{ color: themeColors.text }}>
                      Topic
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden lg:table-cell" style={{ color: themeColors.text }}>
                      Technologies
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => (
                    <motion.tr
                      key={problem._id}
                      className="border-b transition-all hover:bg-opacity-50"
                      style={{
                        borderColor: themeColors.border,
                        backgroundColor: 'transparent'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: `${themeColors.backgroundSecondary}50`
                      }}
                    >
                      {/* Problem Statement Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 bg-gradient-to-r ${getDomainColor(problem.domain)} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className="text-lg">
                              {getDomainIcon(problem.domain)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold mb-1 line-clamp-2" style={{ color: themeColors.text }}>
                              {problem.title}
                            </h4>
                            <p className="text-sm line-clamp-3 mb-2" style={{ color: themeColors.textSecondary }}>
                              {problem.description}
                            </p>

                            {/* Mobile-only content - Show all info in a compact format */}
                            <div className="block md:hidden space-y-2">
                              {/* Domain */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>Domain:</span>
                                <span
                                  className="px-2 py-1 text-xs rounded-lg font-medium"
                                  style={{
                                    backgroundColor: `${themeColors.accent}20`,
                                    color: themeColors.accent
                                  }}
                                >
                                  {problem.domain}
                                </span>
                              </div>

                              {/* Topic */}
                              {problem.topic && (
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-medium flex-shrink-0" style={{ color: themeColors.textSecondary }}>Topic:</span>
                                  <span className="text-xs" style={{ color: themeColors.text }}>
                                    {problem.topic}
                                  </span>
                                </div>
                              )}

                              {/* Technologies */}
                              {problem.suggestedTechnologies && (
                                <div className="space-y-1">
                                  <span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>Technologies:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {problem.suggestedTechnologies.split(',').map((tech, techIndex) => (
                                      <span
                                        key={techIndex}
                                        className="px-2 py-1 text-xs rounded-lg font-medium"
                                        style={{
                                          backgroundColor: `${themeColors.backgroundSecondary}`,
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
                        </div>
                      </td>

                      {/* Domain Column - Hidden on mobile */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span
                          className="px-3 py-1 text-sm rounded-lg font-medium"
                          style={{
                            backgroundColor: `${themeColors.accent}20`,
                            color: themeColors.accent
                          }}
                        >
                          {problem.domain}
                        </span>
                      </td>

                      {/* Topic Column - Hidden on mobile and tablet */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                          {problem.topic || 'No topic specified'}
                        </span>
                      </td>

                      {/* Technologies Column - Hidden on mobile, tablet, and small desktop */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {problem.suggestedTechnologies ? (
                            problem.suggestedTechnologies.split(',').map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 text-xs rounded-lg font-medium"
                                style={{
                                  backgroundColor: `${themeColors.backgroundSecondary}`,
                                  color: themeColors.text,
                                  border: `1px solid ${themeColors.border}`
                                }}
                              >
                                {tech.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                              No technologies specified
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
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
            {/* Mobile pagination */}
            <div className="flex flex-col sm:hidden space-y-3">
              <div className="text-center text-sm" style={{ color: themeColors.textSecondary }}>
                Page {currentPage} of {pagination.totalPages} • {pagination.totalProblems} problems
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  style={{
                    backgroundColor: currentPage === 1 ? themeColors.backgroundSecondary : themeColors.accent,
                    color: currentPage === 1 ? themeColors.textSecondary : '#ffffff'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center space-x-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="w-8 h-8 rounded-lg font-semibold text-sm transition-all duration-200"
                      style={{
                        backgroundColor: themeColors.backgroundSecondary,
                        color: themeColors.text
                      }}
                    >
                      {currentPage - 1}
                    </button>
                  )}

                  <button
                    className="w-8 h-8 rounded-lg font-semibold text-sm"
                    style={{
                      backgroundColor: themeColors.accent,
                      color: '#ffffff'
                    }}
                  >
                    {currentPage}
                  </button>

                  {currentPage < pagination.totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="w-8 h-8 rounded-lg font-semibold text-sm transition-all duration-200"
                      style={{
                        backgroundColor: themeColors.backgroundSecondary,
                        color: themeColors.text
                      }}
                    >
                      {currentPage + 1}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
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

            {/* Desktop pagination */}
            <div className="hidden sm:flex items-center justify-between">
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

              <div className="flex items-center space-x-2 overflow-x-auto max-w-md">
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 flex-shrink-0"
                      style={{
                        backgroundColor: themeColors.backgroundSecondary,
                        color: themeColors.text
                      }}
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="flex-shrink-0" style={{ color: themeColors.textSecondary }}>...</span>
                    )}
                  </>
                )}

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
                  if (currentPage > 3 && pageNumber === 1) return null;
                  if (currentPage < pagination.totalPages - 2 && pageNumber === pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 flex-shrink-0"
                      style={{
                        backgroundColor: pageNumber === currentPage ? themeColors.accent : themeColors.backgroundSecondary,
                        color: pageNumber === currentPage ? '#ffffff' : themeColors.text
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {currentPage < pagination.totalPages - 2 && (
                  <>
                    {currentPage < pagination.totalPages - 3 && (
                      <span className="flex-shrink-0" style={{ color: themeColors.textSecondary }}>...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 flex-shrink-0"
                      style={{
                        backgroundColor: themeColors.backgroundSecondary,
                        color: themeColors.text
                      }}
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
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
    </div>
  );
};

export default ProblemStatementsView;