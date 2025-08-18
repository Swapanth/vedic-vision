import React, { useState, useEffect } from 'react';
import { voteAPI } from '../../../../services/api';
import LoadingSpinner from '../../../common/LoadingSpinner';

const VotesTab = ({ onShowModal }) => {
  const [votesData, setVotesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalVotes'); // totalVotes, averageRating, name
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedTeam, setExpandedTeam] = useState(null);

  useEffect(() => {
    loadVotesData();
  }, []);

  const loadVotesData = async () => {
    try {
      setLoading(true);
      const response = await voteAPI.getAllVotesByTeam();
      setVotesData(response.data.data);
    } catch (error) {
      console.error('Error loading votes data:', error);
      onShowModal('Error', 'Failed to load votes data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTeams = votesData?.teams ? votesData.teams
    .filter(team => 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.teamNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'averageRating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case 'totalVotes':
        default:
          aValue = a.totalVotes || 0;
          bValue = b.totalVotes || 0;
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }) : [];

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-100';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 1.5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Voting Results</h2>
        <p className="text-gray-600">View all votes organized by team</p>
      </div>

      {/* Statistics Cards */}
      {votesData?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{votesData.statistics.totalVotes}</div>
            <div className="text-sm text-blue-800">Total Votes</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{votesData.statistics.totalTeams}</div>
            <div className="text-sm text-green-800">Total Teams</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{votesData.statistics.teamsWithVotes}</div>
            <div className="text-sm text-purple-800">Teams with Votes</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{votesData.statistics.teamsWithoutVotes}</div>
            <div className="text-sm text-orange-800">Teams without Votes</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="totalVotes">Sort by Votes</option>
            <option value="averageRating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {filteredAndSortedTeams.map((team) => (
          <div key={team._id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Team Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    {team.teamNumber && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        #{team.teamNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Leader: {team.leader?.name} • {team.members?.length || 0} members
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Rating */}
                  <div className="text-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(team.averageRating)}`}>
                      {team.averageRating > 0 ? team.averageRating.toFixed(1) : 'No rating'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Rating</div>
                  </div>
                  
                  {/* Vote Count */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{team.totalVotes}</div>
                    <div className="text-xs text-gray-500">Votes</div>
                  </div>
                  
                  {/* Expand Icon */}
                  <div className="text-gray-400">
                    {expandedTeam === team._id ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedTeam === team._id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {/* Team Members */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Team Members</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {team.members?.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          member.role === 'leader' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role}
                        </span>
                        <span className="text-gray-900">{member.user?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Votes */}
                {team.votes && team.votes.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Votes ({team.votes.length})</h4>
                    <div className="space-y-3">
                      {team.votes.map((vote) => (
                        <div key={vote._id} className="bg-white p-3 rounded border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {vote.voter?.name || 'Anonymous'}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-sm ${
                                        i < vote.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                  <span className="ml-1 text-sm text-gray-600">({vote.rating}/5)</span>
                                </div>
                              </div>
                              {vote.comment && (
                                <p className="text-sm text-gray-700 mt-1">{vote.comment}</p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 ml-4">
                              {formatDate(vote.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No votes yet for this team</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedTeams.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg">No teams found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default VotesTab;