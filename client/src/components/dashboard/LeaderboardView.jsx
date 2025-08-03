import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Users, Star } from 'lucide-react';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const LeaderboardView = ({ themeColors }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('participants');

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const roleParam = filter === 'participants' ? 'participant' : filter === 'mentors' ? 'mentor' : undefined;
      const response = await userAPI.getLeaderboard({ limit: 100, role: roleParam });
      const leaderboardUsers = response.data.data.leaderboard || [];

      setUsers(leaderboardUsers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredUsers = getFilteredUsers();
  const displayUsers = filter === 'mentors' ? filteredUsers.slice(0, 3) : filteredUsers;

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



      {/* Full Leaderboard */}
      <motion.div
        className="rounded-2xl  backdrop-blur-sm border-2 transition-all duration-300"
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
            {filter === 'mentors' ? 'Mentor Directory' : 'Complete Rankings'}
          </h3>

          {displayUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h4 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>
                No users found
              </h4>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                No users found for this category.
              </p>
            </div>
          ) : filter === 'mentors' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  className="p-6 rounded-xl border-2 shadow-md hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: themeColors.cardBgSecondary,
                    borderColor: themeColors.border
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="text-center">
                    
                    <h4 className="text-lg font-bold mb-2" style={{ color: themeColors.text }}>
                      {user.name}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: themeColors.textSecondary }}>
                      {user.email}
                    </p>
                    
                    {user.description && (
                      <p className="text-sm italic" style={{ color: themeColors.textSecondary }}>
                        {user.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {displayUsers.map((user, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;

                return (
                  <motion.div
                    key={user._id}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all hover:scale-102 ${isTopThree ? 'shadow-lg' : 'hover:shadow-md'}`}
                    style={{
                      backgroundColor: isTopThree ? themeColors.backgroundSecondary : themeColors.cardBgSecondary,
                      borderColor: isTopThree ? themeColors.accent : themeColors.border
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{
                      backgroundColor: isTopThree ? themeColors.accent : themeColors.backgroundSecondary
                    }}>
                      {getRankIcon(rank)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 bg-gradient-to-r ${getRankColor(rank)} rounded-full flex items-center justify-center`}>
                          <span className="text-sm font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold" style={{ color: themeColors.text }}>
                            {user.name}
                          </h4>
                          <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mr-4">
                      <span
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: themeColors.success,
                          color: '#ffffff'
                        }}
                      >
                        participant
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: themeColors.text }}>
                        {user.totalScore || 0}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                        points
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>


    </div>
  );
};

export default LeaderboardView;