import React, { useState, useEffect } from 'react';
import { voteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
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
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={`text-3xl ${interactive ? 'cursor-pointer hover:scale-125 transition-all duration-200 hover:drop-shadow-lg' : ''} ${
              star <= rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300'
            }`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
        {!interactive && (
          <span className="ml-3 text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
            {rating.toFixed(1)} ★
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
      
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-[2px] modal-overlay z-[9999] p-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-[10000] animate-fade-in modal-content">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[#272757] to-[#3a3a6a]">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span className="text-2xl">🗳️</span>
                Start Voting
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors bg-white/20 rounded-full p-1 hover:bg-white/30"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-8 rounded-2xl shadow-2xl border border-gray-200">
                
                {/* Team Count Info */}
                <div className="bg-[#272757] rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">📊 Teams Available for Voting</h3>
                      <p className="text-white/90 font-semibold">Total teams present in the system</p>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-black text-white">{totalTeamsForVoting}</p>
                      <p className="text-white/80 font-bold">Teams</p>
                    </div>
                  </div>
                </div>

                {/* Voting Progress */}
                <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-gray-900">🗳️ Voting Progress</h3>
                    {votingProgress.completed && (
                      <span className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold border-2 border-gray-900">
                        ✅ Completed!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-4 border-2 border-gray-900">
                      <div 
                        className="bg-gradient-to-r from-[#272757] to-[#3a3a6a] h-full rounded-full transition-all duration-500"
                        style={{ width: `${votingProgress.total > 0 ? (votingProgress.voted / votingProgress.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-700">
                      {votingProgress.voted} / {votingProgress.total} teams voted
                    </span>
                  </div>
                  {votingProgress.completed && (
                    <p className="text-gray-700 font-bold text-center mt-3">
                      🎉 Congratulations! You have completed voting for all teams!
                    </p>
                  )}
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                  <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Search teams by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-6 py-3 border-2 border-gray-900 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#272757] text-lg"
                    />
                    <button
                      type="submit"
                      className="bg-[#272757] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black border-2 border-gray-900 shadow-lg hover:shadow-md transition-all text-lg"
                    >
                      🔍 Search
                    </button>
                  </form>
                </div>

                {/* Teams List */}
                {loading ? (
                  <div className="flex justify-center py-12 bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg">
                    <div className="text-center">
                      <LoadingSpinner />
                      <p className="text-gray-600 font-semibold mt-4">Loading teams...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto p-2">
                    {currentTeams.map((team) => {
                      const userVote = userVotes[team._id];
                      console.log('Team voting status:', { teamId: team._id, teamName: team.name, userVote, hasVote: !!userVote });
                      
                      return (
                        <div
                          key={team._id}
                          className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
                          onClick={() => handleTeamSelect(team)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-black text-gray-900">{team.name}</h4>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold border border-gray-900">
                                  Team
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-500 text-lg">👑</span>
                                <p className="text-sm font-bold text-gray-600">{team.leader.name}</p>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold border border-gray-900">
                                  Leader
                                </span>
                              </div>
                              {team.description && (
                                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
                                  <p className="text-gray-600 font-semibold text-sm italic">"{team.description}"</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-2 text-xs font-black rounded-xl border-2 border-gray-900 shadow-sm ${
                                team.members.length >= 6 ? 'bg-red-500 text-white' : 
                                team.members.length >= 4 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
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
                                <span className="text-lg font-bold text-gray-700">
                                  {team.totalVotes || 0}
                                </span>
                                <span className="text-xs text-gray-500">Total Votes</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {userVote && (
                                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-2 rounded-xl border-2 border-gray-900 shadow-sm">
                                  🟢 Voted ({userVote.rating}★)
                                </span>
                              )}
                              {!userVote && (
                                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl border-2 border-gray-900 shadow-sm">
                                  🔵 Click to Vote
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
                  <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-700">
                        Showing {indexOfFirstTeam + 1} to {Math.min(indexOfLastTeam, filteredTeams.length)} of {filteredTeams.length} teams
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-4 py-3 rounded-xl font-bold transition-all text-lg border-2 border-gray-900 ${
                            currentPage === 1
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#272757] hover:bg-blue-700 text-white hover:shadow-md'
                          }`}
                        >
                          ← Previous
                        </button>
                        <span className="px-4 py-3 text-lg font-bold text-gray-700 bg-gray-100 rounded-xl border-2 border-gray-900">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-3 rounded-xl font-bold transition-all text-lg border-2 border-gray-900 ${
                            currentPage === totalPages
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#272757] hover:bg-blue-700 text-white hover:shadow-md'
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {filteredTeams.length === 0 && !loading && (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg">
                    <div className="text-6xl mb-6 animate-bounce">🔍</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No teams found</h3>
                    <p className="text-gray-500 font-semibold mb-4">Try adjusting your search criteria</p>
                    <div className="flex justify-center space-x-2">
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm border border-gray-900">Team name</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm border border-gray-900">Description</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm border border-gray-900">Keywords</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vote Form Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 backdrop-blur-[2px] modal-overlay z-[10001] p-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-[10002] animate-fade-in modal-content">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[#272757] to-[#3a3a6a]">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span className="text-2xl">🗳️</span>
                Vote for {selectedTeam?.name}
              </h3>
              <button
                onClick={() => setShowVoteModal(false)}
                className="text-white hover:text-gray-200 transition-colors bg-white/20 rounded-full p-1 hover:bg-white/30"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-8 rounded-2xl shadow-2xl border border-gray-200">
                
                {/* Team Info */}
                <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#272757] to-[#3a3a6a] rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-900">
                      {selectedTeam?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900">{selectedTeam?.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500 text-lg">👑</span>
                        <p className="text-sm font-bold text-gray-600">{selectedTeam?.leader.name}</p>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold border border-gray-900">
                          Team Leader
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedTeam?.description && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-blue-400 mb-4">
                      <p className="text-gray-700 font-semibold text-sm italic">"{selectedTeam.description}"</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">👥</span>
                      <p className="text-sm font-bold text-gray-700">Team Members</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold border border-gray-900">
                        {selectedTeam?.members.length} members
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTeam?.members.slice(0, 5).map((member) => (
                        <span key={member.user._id} className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 py-2 rounded-xl text-xs font-bold border-2 border-gray-900 shadow-sm">
                          {member.user.name}
                        </span>
                      ))}
                      {selectedTeam?.members.length > 5 && (
                        <span className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-2 rounded-xl text-xs font-bold border-2 border-gray-900 shadow-sm">
                          +{selectedTeam.members.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-2xl">⭐</span>
                      <label className="text-lg font-bold text-gray-700">Rate this team</label>
                      <span className="text-2xl">⭐</span>
                    </div>
                    <p className="text-sm text-gray-500">Click on the stars below to rate from 1 to 5</p>
                  </div>
                  <div className="flex justify-center mb-6">
                    {renderStars(voteForm.rating, true, (star) => setVoteForm({ ...voteForm, rating: star }))}
                  </div>
                  <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 rounded-xl border-2 border-gray-900">
                      <p className="text-lg font-bold text-gray-700">
                        {voteForm.rating === 0 && "Click on a star to rate"}
                        {voteForm.rating === 1 && "Poor ⭐"}
                        {voteForm.rating === 2 && "Fair ⭐⭐"}
                        {voteForm.rating === 3 && "Good ⭐⭐⭐"}
                        {voteForm.rating === 4 && "Very Good ⭐⭐⭐⭐"}
                        {voteForm.rating === 5 && "Excellent ⭐⭐⭐⭐⭐"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💬</span>
                    <label className="text-lg font-bold text-gray-700">Share your thoughts</label>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold border border-gray-900">
                      Required
                    </span>
                  </div>
                  <textarea
                    value={voteForm.comment}
                    onChange={(e) => setVoteForm({ ...voteForm, comment: e.target.value })}
                    rows="4"
                    className="w-full px-6 py-4 border-2 border-gray-900 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#272757] resize-none"
                    placeholder="Tell us what you think about this team's performance, collaboration, innovation, or any other aspects that impressed you..."
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-500">
                      <span className="font-bold">💡 Tip:</span> Be specific and constructive in your feedback
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2 border border-gray-900">
                        <div 
                          className="bg-gradient-to-r from-[#272757] to-[#3a3a6a] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(voteForm.comment.length / 500) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">
                        {voteForm.comment.length}/500
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 rounded-2xl border-2 border-gray-900 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-lg font-bold text-gray-700">Ready to submit your vote?</h3>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSubmitVote}
                      disabled={!voteForm.rating || !voteForm.comment.trim()}
                      className={`flex-1 px-6 py-4 rounded-xl font-black border-2 border-gray-900 shadow-lg transition-all transform hover:scale-105 ${
                        voteForm.rating && voteForm.comment.trim()
                          ? 'bg-[#272757] hover:bg-blue-700 text-white hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">
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
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-black border-2 border-gray-900 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl">🗑️</span>
                          <span className="text-lg">Remove Vote</span>
                        </div>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowVoteModal(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-black border-2 border-gray-900 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">❌</span>
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