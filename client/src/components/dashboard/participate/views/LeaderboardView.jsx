import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Users, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { userAPI } from '../../../../services/api';


const LeaderboardView = ({ themeColors }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('participants');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const usersPerPage = 20;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadLeaderboard();
  }, [filter, currentPage, debouncedSearchQuery]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearchQuery]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      if (filter === 'mentors') {
        // For mentors, use the leaderboard endpoint (no pagination needed, but use same endpoint)
        const response = await userAPI.getLeaderboard({ limit: 20, role: 'mentor' });
        const leaderboardUsers = response.data.data.leaderboard || [];
        const paginationData = response.data.data.pagination || {};
        setUsers(leaderboardUsers);
        setPagination(paginationData);
      } else {
        // For participants, use the leaderboard endpoint with pagination and search
        const response = await userAPI.getLeaderboard({
          page: currentPage,
          limit: usersPerPage,
          role: 'participant',
          search: debouncedSearchQuery.trim() || undefined,
          sortBy: 'totalScore',
          sortOrder: 'desc'
        });

        const usersData = response.data.data.leaderboard || [];
        const paginationData = response.data.data.pagination || {};

        setUsers(usersData);
        setPagination({
          totalPages: paginationData.totalPages || 1,
          totalUsers: paginationData.totalUsers || 0,
          hasNextPage: paginationData.hasNextPage || false,
          hasPrevPage: paginationData.hasPrevPage || false
        });
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
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

  const getFilteredUsers = () => {
    return users;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold" style={{ color: themeColors.text }}>#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return `from-blue-400 to-blue-600`;
    }
  };

  // Table Skeleton Component
  const TableSkeleton = ({ isParticipants = true }) => (
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
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-10 w-24 rounded-xl animate-pulse"
                style={{ backgroundColor: themeColors.backgroundSecondary }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search Bar Skeleton - Only for participants */}
      {isParticipants && (
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
      )}

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
          {/* Title Skeleton */}
          <div
            className="h-7 w-48 mb-4 rounded animate-pulse"
            style={{ backgroundColor: themeColors.backgroundSecondary }}
          />

          {/* Table Skeleton */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: themeColors.border }}>
                  {isParticipants ? (
                    <>
                      <th className="text-left py-4 px-2">
                        <div
                          className="h-4 w-12 rounded animate-pulse"
                          style={{ backgroundColor: themeColors.backgroundSecondary }}
                        />
                      </th>
                      <th className="text-left py-4 px-4">
                        <div
                          className="h-4 w-20 rounded animate-pulse"
                          style={{ backgroundColor: themeColors.backgroundSecondary }}
                        />
                      </th>
                      <th className="text-left py-4 px-4 hidden sm:table-cell">
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
                      <th className="text-right py-4 px-4">
                        <div
                          className="h-4 w-12 rounded animate-pulse ml-auto"
                          style={{ backgroundColor: themeColors.backgroundSecondary }}
                        />
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-4 px-4">
                        <div
                          className="h-4 w-16 rounded animate-pulse"
                          style={{ backgroundColor: themeColors.backgroundSecondary }}
                        />
                      </th>
                      <th className="text-left py-4 px-4 hidden sm:table-cell">
                        <div
                          className="h-4 w-16 rounded animate-pulse"
                          style={{ backgroundColor: themeColors.backgroundSecondary }}
                        />
                      </th>
                      <th className="text-left py-4 px-4 hidden md:table-cell">
                        <div
                          className="h-4 w-20 rounded animate-pulse"
                          style={{ backgroundColor: themeColors.backgroundSecondary }}
                        />
                      </th>
                      <th className="text-left py-4 px-4 hidden lg:table-cell">
                        <div
                          className="h-4 w-12 rounded animate-pulse"
                          style={{ backgroundColor: themeColors.backgroundSecondary }}
                        />
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }, (_, i) => (
                  <tr
                    key={i}
                    className="border-b"
                    style={{ borderColor: themeColors.border }}
                  >
                    {isParticipants ? (
                      <>
                        {/* Rank Column */}
                        <td className="py-4 px-2">
                          <div
                            className="h-8 w-8 rounded-full animate-pulse"
                            style={{ backgroundColor: themeColors.backgroundSecondary }}
                          />
                        </td>
                        {/* Participant Column */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-full animate-pulse flex-shrink-0"
                              style={{ backgroundColor: themeColors.backgroundSecondary }}
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className="h-4 w-24 mb-1 rounded animate-pulse"
                                style={{ backgroundColor: themeColors.backgroundSecondary }}
                              />
                              <div
                                className="h-3 w-32 rounded animate-pulse sm:hidden"
                                style={{ backgroundColor: themeColors.backgroundSecondary }}
                              />
                            </div>
                          </div>
                        </td>
                        {/* Email Column */}
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <div
                            className="h-3 w-32 rounded animate-pulse"
                            style={{ backgroundColor: themeColors.backgroundSecondary }}
                          />
                        </td>
                        {/* College Column */}
                        <td className="py-4 px-4 hidden md:table-cell">
                          <div
                            className="h-3 w-28 rounded animate-pulse"
                            style={{ backgroundColor: themeColors.backgroundSecondary }}
                          />
                        </td>
                        {/* Score Column */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <div
                              className="h-5 w-12 mb-1 rounded animate-pulse"
                              style={{ backgroundColor: themeColors.backgroundSecondary }}
                            />
                            <div
                              className="h-3 w-8 rounded animate-pulse"
                              style={{ backgroundColor: themeColors.backgroundSecondary }}
                            />
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Mentor Column */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-full animate-pulse flex-shrink-0"
                              style={{ backgroundColor: themeColors.backgroundSecondary }}
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className="h-4 w-24 mb-1 rounded animate-pulse"
                                style={{ backgroundColor: themeColors.backgroundSecondary }}
                              />
                              <div
                                className="h-3 w-32 rounded animate-pulse sm:hidden"
                                style={{ backgroundColor: themeColors.backgroundSecondary }}
                              />
                            </div>
                          </div>
                        </td>
                        {/* Email Column */}
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <div
                            className="h-3 w-32 rounded animate-pulse"
                            style={{ backgroundColor: themeColors.backgroundSecondary }}
                          />
                        </td>
                        {/* Description Column */}
                        <td className="py-4 px-4 hidden md:table-cell">
                          <div
                            className="h-3 w-40 rounded animate-pulse"
                            style={{ backgroundColor: themeColors.backgroundSecondary }}
                          />
                        </td>
                        {/* Skills Column */}
                        <td className="py-4 px-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {[1, 2, 3].map((j) => (
                              <div
                                key={j}
                                className="h-6 w-16 rounded-lg animate-pulse"
                                style={{ backgroundColor: themeColors.backgroundSecondary }}
                              />
                            ))}
                          </div>
                        </td>
                      </>
                    )}
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
    return <TableSkeleton isParticipants={filter === 'participants'} />;
  }

  const filteredUsers = getFilteredUsers();
  const displayUsers = filteredUsers;

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
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'participants', name: 'Participants', icon: Users },
              { id: 'mentors', name: 'Mentors', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${filter === tab.id ? 'scale-105' : 'hover:scale-102'
                    }`}
                  style={{
                    backgroundColor: filter === tab.id ? themeColors.accent : themeColors.backgroundSecondary,
                    color: filter === tab.id ? '#ffffff' : themeColors.text
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Search Bar - Only for participants */}
      {filter === 'participants' && (
        <motion.div
          className="rounded-2xl backdrop-blur-sm  transition-all duration-300"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                placeholder="Search participants by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: themeColors.backgroundSecondary,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                  fontSize: '16px' // Prevents zoom on iOS
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Summary - Only for participants */}
      {filter === 'participants' && !loading && (
        <motion.div
          className="text-sm px-2"
          style={{ color: themeColors.textSecondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Showing {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, pagination.totalUsers)} of {pagination.totalUsers} participants
          {searchQuery && ` for "${searchQuery}"`}
        </motion.div>
      )}



      {/* Full Leaderboard */}
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
          <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
            {filter === 'mentors' ? 'Mentor Directory' : 'Participants Leaderboard'}
          </h3>

          {displayUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h4 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>
                No users found
              </h4>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                {searchQuery ? `No participants found matching "${searchQuery}"` : 'No users found for this category.'}
              </p>
            </div>
          ) : filter === 'mentors' ? (
            /* Mentors Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: themeColors.border }}>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: themeColors.text }}>
                      Mentor
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden sm:table-cell" style={{ color: themeColors.text }}>
                      Email
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden md:table-cell" style={{ color: themeColors.text }}>
                      Description
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden lg:table-cell" style={{ color: themeColors.text }}>
                      Skills
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
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
                      {/* Mentor Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold truncate" style={{ color: themeColors.text }}>
                              {user.name}
                            </h4>
                            {/* Show email on mobile */}
                            <p className="text-sm truncate sm:hidden" style={{ color: themeColors.textSecondary }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email Column - Hidden on mobile */}
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                          {user.email}
                        </span>
                      </td>

                      {/* Description Column - Hidden on mobile and tablet */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                          {user.description || 'No description available'}
                        </span>
                      </td>

                      {/* Skills Column - Hidden on mobile, tablet, and small desktop */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 text-xs rounded-lg font-medium"
                                style={{
                                  backgroundColor: `${themeColors.accent}20`,
                                  color: themeColors.accent
                                }}
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                              No skills listed
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Participants Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: themeColors.border }}>
                    <th className="text-left py-4 px-2 font-semibold" style={{ color: themeColors.text }}>
                      Rank
                    </th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: themeColors.text }}>
                      Participant
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden sm:table-cell" style={{ color: themeColors.text }}>
                      Email
                    </th>
                    <th className="text-left py-4 px-4 font-semibold hidden md:table-cell" style={{ color: themeColors.text }}>
                      College
                    </th>
                    <th className="text-right py-4 px-4 font-semibold" style={{ color: themeColors.text }}>
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map((user, index) => {
                    const globalRank = user.rank || (((currentPage - 1) * usersPerPage) + index + 1);
                    const isTopThree = globalRank <= 3;

                    return (
                      <motion.tr
                        key={user._id}
                        className="border-b transition-all hover:bg-opacity-50"
                        style={{
                          borderColor: themeColors.border,
                          backgroundColor: isTopThree ? `${themeColors.accent}15` : 'transparent'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: isTopThree ? `${themeColors.accent}25` : `${themeColors.backgroundSecondary}50`
                        }}
                      >
                        {/* Rank Column */}
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            {isTopThree ? (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{
                                backgroundColor: themeColors.accent
                              }}>
                                {getRankIcon(globalRank)}
                              </div>
                            ) : (
                              <span className="text-lg font-bold w-8 text-center" style={{ color: themeColors.text }}>
                                #{globalRank}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Participant Column */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold truncate" style={{ color: themeColors.text }}>
                                {user.name}
                              </h4>
                              {/* Show email on mobile */}
                              <p className="text-sm truncate sm:hidden" style={{ color: themeColors.textSecondary }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email Column - Hidden on mobile */}
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                            {user.email}
                          </span>
                        </td>

                        {/* College Column - Hidden on mobile and tablet */}
                        <td className="py-4 px-4 hidden md:table-cell">
                          <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                            {user.collegeName || 'N/A'}
                          </span>
                        </td>

                        {/* Score Column */}
                        <td className="py-4 px-4 text-right">
                          <div>
                            <div className="text-xl font-bold" style={{ color: themeColors.text }}>
                              {user.totalScore || 0}
                            </div>
                            <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                              points
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pagination - Only for participants */}
      {filter === 'participants' && pagination.totalPages > 1 && (
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
            {/* Mobile-first pagination layout */}
            <div className="space-y-4">
              {/* Page info and navigation on mobile */}
              <div className="flex flex-col sm:hidden space-y-3">
                {/* Page info */}
                <div className="text-center text-sm" style={{ color: themeColors.textSecondary }}>
                  Page {currentPage} of {pagination.totalPages} • {pagination.totalUsers} participants
                </div>

                {/* Navigation buttons */}
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

                  {/* Simple page display for mobile */}
                  <div className="flex items-center space-x-2">
                    {/* Show current page and nearby pages */}
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

              {/* Desktop pagination layout */}
              <div className="hidden sm:flex items-center justify-between">
                {/* Previous Button */}
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

                {/* Page Numbers */}
                <div className="flex items-center space-x-2 overflow-x-auto max-w-md">
                  {/* Show first page */}
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

                  {/* Show page numbers around current page */}
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

                  {/* Show last page */}
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

                {/* Next Button */}
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

              {/* Desktop pagination info */}
              <div className="hidden sm:block text-center text-sm" style={{ color: themeColors.textSecondary }}>
                Page {currentPage} of {pagination.totalPages} • {pagination.totalUsers} total participants
              </div>
            </div>
          </div>
        </motion.div>
      )}


    </div>
  );
};

export default LeaderboardView;