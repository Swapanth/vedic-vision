import React, { useState, useEffect } from 'react';
import { voteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner, { CardLoader } from '../common/LoadingSpinner';
import Toast from '../common/Toast';

const TeamVoting = ({ isOpen, onClose, onVoteUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [userVotes, setUserVotes] = useState({});
  const [votingProgress, setVotingProgress] = useState({ total: 0, voted: 0, completed: false });
  const [totalTeamsForVoting, setTotalTeamsForVoting] = useState(0);
  
  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(5);

  // Vote form state
  const [voteForm, setVoteForm] = useState({
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      loadUserVotes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (teams.length > 0) {
      calculateVotingProgress();
    }
  }, [teams, userVotes]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await voteAPI.getAllTeamsWithRatings({ search: searchTerm });
      setTeams(response.data.data.teams || []);
      setTotalTeamsForVoting(response.data.data.teams?.length || 0);
    } catch (error) {
      console.error('Error loading teams:', error);
      showToast('Failed to load teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    try {
      const response = await voteAPI.getUserVotingHistory();
      const votes = response.data.data.votes || [];
      const voteMap = {};
      votes.forEach(vote => {
        voteMap[vote.team._id] = vote;
      });
      console.log('Loaded user votes:', { votes, voteMap, userVotes: Object.keys(voteMap) });
      setUserVotes(voteMap);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const calculateVotingProgress = () => {
    const votableTeams = teams.filter(team => 
      !team.members || !team.members.some(member => 
        member.user && (member.user._id === user.id || member.user._id === user._id)
      )
    );
    
    const votableTeamIds = votableTeams.map(team => team._id);
    const votesForVotableTeams = Object.keys(userVotes).filter(voteTeamId => 
      votableTeamIds.includes(voteTeamId)
    );
    
    const totalVotableTeams = votableTeams.length;
    const votedTeams = votesForVotableTeams.length;
    const completed = totalVotableTeams > 0 && votedTeams >= totalVotableTeams;
    
    setVotingProgress({
      total: totalVotableTeams,
      voted: votedTeams,
      completed
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTeams();
  };

  const handleTeamSelect = async (team) => {
    setSelectedTeam(team);
    
    try {
      const response = await voteAPI.checkUserVote(team._id);
      const { hasVoted, vote } = response.data.data;
      
      if (hasVoted) {
        setVoteForm({
          rating: vote.rating,
          comment: vote.comment || ''
        });
        showToast(`Loading your previous vote for ${team.name}`, 'info');
      } else {
        setVoteForm({
          rating: 0,
          comment: ''
        });
        showToast(`Ready to vote for ${team.name}`, 'info');
      }
      
      setShowVoteModal(true);
    } catch (error) {
      console.error('Error checking user vote:', error);
      showToast('Failed to check voting status', 'error');
    }
  };

  const handleSubmitVote = async () => {
    try {
      if (!voteForm.rating || voteForm.rating < 1 || voteForm.rating > 5) {
        showToast('Please select a rating between 1 and 5 stars', 'error');
        return;
      }

      if (!voteForm.comment || voteForm.comment.trim() === '') {
        showToast('Please provide a comment for your vote', 'error');
        return;
      }

      const voteData = {
        rating: voteForm.rating,
        comment: voteForm.comment.trim()
      };

      const userVote = userVotes[selectedTeam._id];
      
      if (userVote) {
        await voteAPI.updateVote(selectedTeam._id, voteData);
        showToast('Your vote has been updated successfully!', 'success');
      } else {
        await voteAPI.submitVote(selectedTeam._id, voteData);
        showToast('Your vote has been submitted successfully!', 'success');
      }

      setShowVoteModal(false);
      
      // Update voting progress in parent component first
      if (onVoteUpdate) {
        onVoteUpdate();
      }
      
      // Then reload data and recalculate
      await loadTeams();
      await loadUserVotes();
      
      // Recalculate voting progress immediately after data is loaded
      setTimeout(() => {
        calculateVotingProgress();
      }, 1000);
      
      // Also update parent component again after recalculation
      setTimeout(() => {
        if (onVoteUpdate) {
          onVoteUpdate();
        }
      }, 1200);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit vote';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteVote = async () => {
    try {
      await voteAPI.deleteVote(selectedTeam._id);
      showToast('Your vote has been removed successfully!', 'success');
      setShowVoteModal(false);
      
      // Update voting progress in parent component first
      if (onVoteUpdate) {
        onVoteUpdate();
      }
      
      // Then reload data and recalculate
      await loadTeams();
      await loadUserVotes();
      
      // Recalculate voting progress immediately after data is loaded
      setTimeout(() => {
        calculateVotingProgress();
      }, 1000);
      
      // Also update parent component again after recalculation
      setTimeout(() => {
        if (onVoteUpdate) {
          onVoteUpdate();
        }
      }, 1200);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete vote';
      showToast(errorMessage, 'error');
    }
  };

  const showModal = (title, message) => {
    setModalContent({
      title,
      content: (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600 font-semibold">{message}</p>
        </div>
      )
    });
    setShowSuccessModal(true);
  };

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'info' });
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const getRatingEmoji = (rating) => {
      switch (rating) {
        case 1: return '😢';
        case 2: return '😐';
        case 3: return '😊';
        case 4: return '😄';
        case 5: return '🤩';
        default: return '';
      }
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={`text-3xl transition-all duration-200 ${
              interactive 
                ? 'cursor-pointer hover:scale-125 hover:drop-shadow-lg transform' 
                : ''
            } ${
              star <= rating 
                ? 'text-yellow-400 drop-shadow-md' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
        {!interactive && rating > 0 && (
          <span className="ml-3 text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
            <span>{getRatingEmoji(rating)}</span>
            <span>{rating.toFixed(1)} ★</span>
          </span>
        )}
      </div>
    );
  };

  const filteredTeams = teams.filter(team => {
    const isUserTeam = team.members && team.members.some(member => 
      member.user && (member.user._id === user.id || member.user._id === user._id)
    );
    if (isUserTeam) return false;
    
    return team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           team.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      
      {/* Main Voting Interface */}
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm modal-overlay z-[10000] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[10001] animate-fade-in modal-content">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🗳️</span>
                Team Voting
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors bg-gray-100 rounded-full p-2 hover:bg-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Progress Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-blue-800">Voting Progress</h3>
                  <span className="text-sm text-blue-600 font-medium">
                    {votingProgress.voted} / {votingProgress.total} teams
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${votingProgress.total > 0 ? (votingProgress.voted / votingProgress.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-700">
                  {votingProgress.voted} / {votingProgress.total} teams voted
                </span>
                {votingProgress.completed && (
                  <p className="text-blue-700 font-medium text-center mt-3">
                    🎉 Congratulations! You have completed voting for all teams!
                  </p>
                )}
              </div>

              {/* Search Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Search teams by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    🔍 Search
                  </button>
                </form>
              </div>

              {/* Teams List */}
              {loading ? (
                <div className="flex justify-center py-12 bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg">
                  <CardLoader text="Loading teams..." />
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto p-2">
                  {currentTeams.map((team) => {
                    const userVote = userVotes[team._id];
                    console.log('Team voting status:', { teamId: team._id, teamName: team.name, userVote, hasVote: !!userVote });
                    
                    return (
                      <div
                        key={team._id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleTeamSelect(team)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-800">{team.name}</h4>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                Team
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-yellow-500 text-sm">👑</span>
                              <p className="text-sm font-medium text-gray-600">{team.leader.name}</p>
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                                Leader
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                              team.members.length >= 6 ? 'bg-red-100 text-red-700' : 
                              team.members.length >= 4 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {team.members.length}/6 Members
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-center">
                              {renderStars(team.rating || 0)}
                              <span className="text-xs text-gray-500 mt-1">Average Rating</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-semibold text-gray-700">
                                {team.totalVotes || 0}
                              </span>
                              <span className="text-xs text-gray-500">Total Votes</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {userVote && (
                              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <span className="text-xs">✏️</span>
                                <span>Edit ({userVote.rating}★)</span>
                              </span>
                            )}
                            {!userVote && (
                              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <span className="text-xs">🗳️</span>
                                <span>Vote</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredTeams.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-xl p-6 shadow-lg dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white px-3 py-2 rounded-lg shadow-sm dark:bg-gray-700">
                      Showing {indexOfFirstTeam + 1} to {Math.min(indexOfLastTeam, filteredTeams.length)} of {filteredTeams.length} teams
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                          currentPage === 1
                            ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed shadow-inner'
                            : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">←</span>
                          <span>Previous</span>
                        </div>
                      </button>
                      <div className="px-6 py-3 text-sm font-bold text-gray-800 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-xl shadow-lg border-2 border-yellow-200 dark:bg-gradient-to-r dark:from-yellow-900 dark:via-orange-900 dark:to-red-900 dark:text-yellow-200 dark:border-yellow-700">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400">📄</span>
                          <span>Page {currentPage} of {totalPages}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                          currentPage === totalPages
                            ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed shadow-inner'
                            : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-2xl hover:shadow-green-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>Next</span>
                          <span className="text-lg">→</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {filteredTeams.length === 0 && !loading && (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-lg p-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No teams found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
                  <div className="flex justify-center space-x-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Team name</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Keywords</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vote Form Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 backdrop-blur-sm modal-overlay z-[10001] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10002] animate-fade-in modal-content">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🗳️</span>
                {userVotes[selectedTeam?._id] ? 'Edit Vote for' : 'Vote for'} {selectedTeam?.name}
              </h3>
              <button
                onClick={() => setShowVoteModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors bg-gray-100 rounded-full p-2 hover:bg-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Team Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg font-semibold">{selectedTeam?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{selectedTeam?.name}</h4>
                      <p className="text-sm text-gray-600">Team Leader: {selectedTeam?.leader?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-xl">⭐</span>
                      <label className="text-lg font-semibold text-gray-700">Rate this team</label>
                      <span className="text-xl">⭐</span>
                    </div>
                    <p className="text-sm text-gray-500">Click on the stars below to rate from 1 to 5</p>
                  </div>
                  <div className="flex justify-center mb-4">
                    {renderStars(voteForm.rating, true, (star) => setVoteForm({ ...voteForm, rating: star }))}
                  </div>
                  <div className="text-center">
                    <div className="inline-block bg-white px-4 py-3 rounded-lg border border-yellow-300">
                      <p className="text-lg font-semibold text-gray-700 flex items-center justify-center gap-2">
                        {voteForm.rating === 0 && "Click on a star to rate"}
                        {voteForm.rating === 1 && "😢 Poor"}
                        {voteForm.rating === 2 && "😐 Fair"}
                        {voteForm.rating === 3 && "😊 Good"}
                        {voteForm.rating === 4 && "😄 Very Good"}
                        {voteForm.rating === 5 && "🤩 Excellent"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {voteForm.rating === 0 && "Select a rating to continue"}
                        {voteForm.rating === 1 && "Needs significant improvement"}
                        {voteForm.rating === 2 && "Has room for improvement"}
                        {voteForm.rating === 3 && "Meets expectations"}
                        {voteForm.rating === 4 && "Exceeds expectations"}
                        {voteForm.rating === 5 && "Outstanding performance"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    💬 Feedback
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      Required
                    </span>
                  </label>
                  <textarea
                    value={voteForm.comment}
                    onChange={(e) => setVoteForm({ ...voteForm, comment: e.target.value })}
                    placeholder="Share your thoughts about this team's performance, collaboration, innovation, or any other aspects..."
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none font-medium"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-600">
                      💡 Be specific and constructive in your feedback
                    </p>
                    <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded border">
                      {voteForm.comment.length}/500
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    disabled={!voteForm.rating || !voteForm.comment.trim()}
                    onClick={handleSubmitVote}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">
                        {userVotes[selectedTeam?._id] ? '🔄' : '✅'}
                      </span>
                      <span className="text-lg">
                        {userVotes[selectedTeam?._id] ? 'Update Vote' : 'Submit Vote'}
                      </span>
                    </div>
                  </button>
                  
                  {userVotes[selectedTeam?._id] && (
                    <button
                      onClick={handleDeleteVote}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🗑️</span>
                        <span className="text-lg">Remove Vote</span>
                      </div>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowVoteModal(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">❌</span>
                      <span className="text-lg">Cancel</span>
                    </div>
                  </button>
                </div>
                {(!voteForm.rating || !voteForm.comment.trim()) && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    ⚠️ Please complete both rating and comment to submit your vote
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-[2px] modal-overlay z-[10003] p-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl w-full max-w-md relative z-[10004] animate-fade-in modal-content">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">{modalContent.title}</h3>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {modalContent.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamVoting; 