import React, { useEffect, useState } from 'react';
import { teamAPI, voteAPI } from '../../services/api';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { Star, MessageSquare } from 'lucide-react';

const PAGE_SIZE = 6;

const TeamVotingModal = ({ isOpen, onClose, user, myTeamId, onVoted, onVotingCompleted }) => {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [votedTeams, setVotedTeams] = useState([]);
  const [submitting, setSubmitting] = useState(null);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [totalTeams, setTotalTeams] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      fetchVotedTeams();
    }
  }, [isOpen]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamAPI.getAllTeams({ search });
      const filteredTeams = res.data.data.teams.filter(t => t._id !== myTeamId);
      setTeams(filteredTeams);
      setTotalTeams(filteredTeams.length);
    } catch (err) {
      setTeams([]);
      setTotalTeams(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotedTeams = async () => {
    try {
      const res = await voteAPI.getUserVotingHistory();
      // Filter out votes for the user's own team
      const allVotes = res.data.data.votes.map(v => v.teamId || (v.team && v.team._id) || v.team).filter(Boolean);
      const filteredVotes = allVotes.filter(teamId => String(teamId) !== String(myTeamId));
      setVotedTeams(filteredVotes);
      
      console.log('TeamVotingModal - Vote data:', {
        rawVotes: res.data.data.votes,
        allVotes,
        filteredVotes,
        myTeamId
      });
    } catch (err) {
      setVotedTeams([]);
    }
  };

  const handleVoteClick = async (team) => {
    setSelectedTeam(team);
    
    // Check if user has already voted for this team
    const hasVoted = votedTeams.map(String).includes(String(team._id));
    if (hasVoted) {
      try {
        // Fetch existing vote data
        const voteRes = await voteAPI.checkUserVote(team._id);
        if (voteRes.data.data.vote) {
          setRating(voteRes.data.data.vote.rating);
          setFeedback(voteRes.data.data.vote.comment || '');
        } else {
          setRating(5);
          setFeedback('');
        }
      } catch (err) {
        setRating(5);
        setFeedback('');
      }
    } else {
      setRating(5);
      setFeedback('');
    }
    
    setShowVoteForm(true);
  };

  const handleVoteSubmit = async () => {
    if (!selectedTeam || !rating || !feedback.trim()) {
      return;
    }

    setSubmitting(selectedTeam._id);
    try {
      await voteAPI.submitVote(selectedTeam._id, { 
        rating: parseInt(rating), 
        comment: feedback.trim() 
      });
                    // Update the local state to reflect the new vote immediately
       const newVotedTeams = [...votedTeams.map(String), String(selectedTeam._id)];
       setVotedTeams(newVotedTeams);
       
       // Close the vote form modal
       setShowVoteForm(false);
       setSelectedTeam(null);
       
       // Notify parent component
       if (onVoted) onVoted();
       
       // Check if voting is completed after this vote
       const isCompleted = newVotedTeams.length >= totalTeams && totalTeams > 0;
       
       console.log('Vote submission - checking completion:', {
         newVotedTeams: newVotedTeams.length,
         totalTeams,
         isCompleted,
         myTeamId,
         selectedTeamId: selectedTeam._id,
         oldVotedTeams: votedTeams,
         newVotedTeams: newVotedTeams
       });
      
      if (isCompleted) {
        // Close the main voting modal if all teams have been voted for
        console.log('All teams voted - closing modal and calling completion handler');
        if (onVotingCompleted) onVotingCompleted();
        onClose();
      }
      // Note: The voting form modal is already closed above with setShowVoteForm(false)
      // The main voting modal stays open unless all teams are voted for
    } catch (err) {
      console.error('Error submitting vote:', err);
    } finally {
      setSubmitting(null);
    }
  };

  const isVotingCompleted = votedTeams.length >= totalTeams && totalTeams > 0;

  // Paging
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredTeams.length / PAGE_SIZE);
  const pagedTeams = filteredTeams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Team Voting" className="max-w-2xl">
        {loading ? <LoadingSpinner /> : (
          <div className="space-y-4">
            {/* Voting Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-800">Voting Progress</h4>
                  <p className="text-sm text-blue-600">
                    {votedTeams.length} of {totalTeams} teams voted
                  </p>
                </div>
                {isVotingCompleted && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ Completed Voting - All teams voted!
                  </div>
                )}
              </div>
            </div>

            <input
              type="text"
              placeholder="Search teams..."
              value={search}
              onChange={e => { 
                setSearch(e.target.value); 
                setPage(1); 
                if (e.target.value.length >= 3 || e.target.value.length === 0) {
                  fetchTeams(); 
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {pagedTeams.map(team => {
                 const hasVoted = votedTeams.map(String).includes(String(team._id));
                 return (
                   <div key={team._id} className={`border rounded-lg p-4 flex items-center justify-between ${
                     hasVoted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                   }`}>
                     <div className="flex-1">
<div className="font-semibold text-lg flex items-center mb-2 text-gray-900 dark:text-gray-1000">
                         {team.name}
                         {hasVoted && (
                           <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                             ✅ Voted
                           </span>
                         )}
                       </div>
                       {/* <div className="text-xs text-gray-500 mb-2">{team.problemStatement?.title}</div> */}
                       {hasVoted && (
                          <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span>✏️</span>
                            {/* <span>Click to edit vote</span> */}
                          </div>
                        )}
                     </div>
                     <button
                        disabled={submitting === team._id}
                        onClick={() => handleVoteClick(team)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          hasVoted 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm">
                            {hasVoted ? '✏️' : '🗳️'}
                          </span>
                          <span>
                            {hasVoted 
                              ? 'Edit Vote' 
                              : (submitting === team._id ? 'Voting...' : 'Vote')
                            }
                          </span>
                        </div>
                      </button>
                   </div>
                 );
               })}
             </div>
            <div className="flex justify-between items-center mt-4">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)} 
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(page + 1)} 
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Next
              </button>
            </div>
          </div>
        )}
      </Modal>

             {/* Vote Form Modal */}
      <Modal 
        isOpen={showVoteForm} 
        onClose={() => setShowVoteForm(false)} 
        title={`${votedTeams.map(String).includes(String(selectedTeam?._id)) ? 'Edit Vote for' : 'Vote for'} ${selectedTeam?.name}`}
        className="max-w-lg"
      >
        <div className="space-y-6">
          {/* Rating Section */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <label className="block text-lg font-semibold text-gray-800 mb-3 text-center">
              ⭐ Rate this team (1-5 stars)
            </label>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg transition-colors ${
                    star <= rating 
                      ? 'text-yellow-500 bg-yellow-100' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            
            {/* Rating Description with Emoji */}
            <div className="text-center">
              <div className="inline-block bg-white px-4 py-3 rounded-lg border border-yellow-300">
                <p className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
                  {rating === 1 && '😢 Poor'}
                  {rating === 2 && '😐 Fair'}
                  {rating === 3 && '😊 Good'}
                  {rating === 4 && '😄 Very Good'}
                  {rating === 5 && '🤩 Excellent'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {rating === 1 && 'Needs significant improvement'}
                  {rating === 2 && 'Has room for improvement'}
                  {rating === 3 && 'Meets expectations'}
                  {rating === 4 && 'Exceeds expectations'}
                  {rating === 5 && 'Outstanding performance'}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              💬 Feedback
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                Required
              </span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
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
                {feedback.length}/500
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              disabled={!feedback.trim() || submitting === selectedTeam?._id}
              onClick={handleVoteSubmit}
              className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                !feedback.trim() || submitting === selectedTeam?._id
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">
                  {votedTeams.map(String).includes(String(selectedTeam?._id)) ? '🔄' : '✅'}
                </span>
                <span>
                  {submitting === selectedTeam?._id 
                    ? 'Submitting...' 
                    : (votedTeams.map(String).includes(String(selectedTeam?._id)) ? 'Update Vote' : 'Submit Vote')
                  }
                </span>
              </div>
            </button>
            <button 
              onClick={() => setShowVoteForm(false)}
              className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">❌</span>
                <span>Cancel</span>
              </div>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TeamVotingModal;

