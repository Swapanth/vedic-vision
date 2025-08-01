import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('participants'); // all, participants, admins

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      const allUsers = response.data.data.users || [];
      
      // Sort users by total score (descending)
      const sortedUsers = allUsers
        .filter(user => user.totalScore !== undefined)
        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    switch (filter) {
      case 'participants':
        return users.filter(user => user.role === 'participant');
      case 'mentors':
        return users.filter(user => user.role === 'mentor');
      case 'superadmins':
        return users.filter(user => user.role === 'superadmin');
      default:
        return users;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-white text-gray-900 border-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600">Top performers in Vedic Vision 2K25</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {/* <button
                onClick={() => setFilter('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Users
              </button> */}
              <button
                onClick={() => setFilter('participants')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'participants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Participants
              </button>
              {/* <button
                onClick={() => setFilter('admins')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'admins'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admins
              </button> */}
            </nav>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {filter === 'participants' ? 'Participants' : 'Admins'} Leaderboard
            </h2>
            
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found for this category.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user, index) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  
                  return (
                    <div
                      key={user._id}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        isTopThree ? getRankColor(rank) : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mr-4">
                        <span className="text-lg font-bold text-gray-700">
                          {getRankIcon(rank)}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div className="mr-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'mentor' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {user.totalScore || 0}
                        </div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'participant').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length > 0 
                    ? Math.round(users.reduce((sum, user) => sum + (user.totalScore || 0), 0) / users.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length > 0 ? Math.max(...users.map(u => u.totalScore || 0)) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 