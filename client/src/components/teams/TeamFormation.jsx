import React, { useState, useEffect } from 'react';
import { teamAPI, voteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import LoadingSpinner, { PageLoader } from '../common/LoadingSpinner';
import TeamVoting from '../voting/TeamVoting';
import Toast from '../common/Toast';

const TeamFormation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [votingProgress, setVotingProgress] = useState({ total: 0, voted: 0, completed: false });
  
  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [teamsRes, myTeamRes, usersRes] = await Promise.all([
        teamAPI.getAllTeams({ search: searchTerm }),
        teamAPI.getMyTeam(),
        teamAPI.getAvailableUsers()
      ]);

      setTeams(teamsRes.data.data.teams || []);
      setMyTeam(myTeamRes.data.data.team);
      setAvailableUsers(usersRes.data.data.users || []);
      
      // Load voting progress
      await loadVotingProgress();
    } catch (error) {
      console.error('Error loading team data:', error);
      showSuccessModal('Error', 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const loadVotingProgress = async () => {
    try {
      console.log('TeamFormation: Loading voting progress...', {
        user: { id: user.id, _id: user._id }
      });
      
      const [teamsRes, votesRes] = await Promise.all([
        teamAPI.getAllTeams(),
        voteAPI.getUserVotingHistory()
      ]);
      
      const allTeams = teamsRes.data.data.teams || [];
      const userVotes = votesRes.data.data.votes || [];
      
      console.log('TeamFormation: Data loaded', {
        teamsCount: allTeams.length,
        votesCount: userVotes.length,
        userVotesSample: userVotes.slice(0, 3).map(v => ({ 
          hasTeam: !!v.team, 
          teamId: v.team?._id,
          teamName: v.team?.name 
        }))
      });
      
      // Check if user is a team leader (with null safety)
      const userTeam = allTeams.find(team => 
        team.members && team.members.some(member => 
          member.user && (member.user._id === user._id || member.user._id === user.id)
        )
      );
      
      console.log('TeamFormation: User team found:', userTeam ? {
        teamName: userTeam.name,
        teamLeader: userTeam.leader,
        isUserLeader: userTeam.leader && (userTeam.leader._id === user._id || userTeam.leader._id === user.id)
      } : 'No team found');
      
      if (!userTeam || !userTeam.leader) {
        setVotingProgress({ total: 0, voted: 0, completed: false });
        return;
      }
      
      const isTeamLeader = userTeam.leader._id === user._id || userTeam.leader._id === user.id;
      
      if (!isTeamLeader) {
        setVotingProgress({ total: 0, voted: 0, completed: false });
        return;
      }
      
      // Get votable teams (excluding user's own team) (with null safety)
      const votableTeams = allTeams.filter(team => 
        !team.members || !team.members.some(member => 
          member.user && (member.user._id === user._id || member.user._id === user.id)
        )
      );
      
      // Get votable team IDs
      const votableTeamIds = votableTeams.map(team => team._id);
      
      // Count only votes for votable teams (with null safety)
      const votesForVotableTeams = userVotes.filter(vote => 
        vote.team && vote.team._id && votableTeamIds.includes(vote.team._id)
      );
      
      console.log('Voting Progress Debug:', {
        totalTeams: allTeams.length,
        votableTeams: votableTeams.length,
        userVotes: userVotes.length,
        votesForVotableTeams: votesForVotableTeams.length,
        user: { id: user.id, _id: user._id },
        votableTeamIds,
        userVoteTeamIds: userVotes.filter(v => v.team && v.team._id).map(v => v.team._id),
        isTeamLeader
      });
      
      const totalVotableTeams = votableTeams.length;
      const votedTeams = votesForVotableTeams.length;
      const completed = totalVotableTeams > 0 && votedTeams >= totalVotableTeams;
      
      setVotingProgress({
        total: totalVotableTeams,
        voted: votedTeams,
        completed
      });
    } catch (error) {
      console.error('Error loading voting progress:', error);
    }
  };

  const showSuccessModal = (title, message) => {
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
    setShowModal(true);
  };

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'info' });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      if (!createForm.name.trim()) {
        showToast('Team name is required', 'error');
        return;
      }

      showToast('Creating team...', 'info');
      await teamAPI.createTeam(createForm);
      showToast('Team created successfully!', 'success');
      setCreateForm({ name: '', description: '' });
      setShowCreateModal(false);
      loadTeamData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create team';
      showToast(errorMessage, 'error');
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      showToast('Joining team...', 'info');
      await teamAPI.joinTeam(teamId);
      showToast('Successfully joined the team!', 'success');
      setShowJoinModal(false);
      loadTeamData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join team';
      showToast(errorMessage, 'error');
    }
  };

  const handleLeaveTeam = async () => {
    try {
      showToast('Leaving team...', 'info');
      await teamAPI.leaveTeam(myTeam._id);
      showToast('Successfully left the team', 'success');
      loadTeamData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to leave team';
      showToast(errorMessage, 'error');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      showToast('Removing member...', 'info');
      await teamAPI.removeMember(myTeam._id, memberId);
      showToast('Member removed successfully', 'success');
      loadTeamData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove member';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      showToast('Deleting team...', 'info');
      await teamAPI.deleteTeam(myTeam._id);
      showToast('Team deleted successfully', 'success');
      loadTeamData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete team';
      showToast(errorMessage, 'error');
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      
      {/* Header */}
      <div className="bg-[#272757] rounded-2xl border-2 border-gray-900 p-8 shadow-lg">
        <h1 className="text-4xl font-black text-white mb-2">👥 Team Formation</h1>
        <p className="text-xl text-white/90 font-semibold">
          {myTeam ? 'Manage your team or explore others' : 'Create or join a team to collaborate!'}
        </p>
      </div>

      {/* My Team Section */}
      {myTeam ? (
        <div className="bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">🏆 My Team</h2>
              <h3 className="text-2xl font-bold text-blue-600">{myTeam.name}</h3>
              {myTeam.description && (
                <p className="text-gray-600 font-semibold mt-2">{myTeam.description}</p>
              )}
            </div>
            <div className="flex gap-3 items-center">
              {myTeam.leader._id === user.id ? (
                <button
                  onClick={handleDeleteTeam}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold border-2 border-gray-900 shadow-lg hover:shadow-md transition-all"
                >
                  🗑️ Delete Team
                </button>
              ) : (
                <button
                  onClick={handleLeaveTeam}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold border-2 border-gray-900 shadow-lg hover:shadow-md transition-all"
                >
                  🚪 Leave Team
                </button>
              )}
              {myTeam.leader._id === user._id || myTeam.leader._id === user.id ? (
                <button
                  onClick={() => setShowVotingModal(true)}
                  className={`px-4 py-2 rounded-xl font-bold border-2 border-gray-900 shadow-lg hover:shadow-md transition-all whitespace-nowrap ${
                    votingProgress.completed
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {votingProgress.completed ? `🟢 Completed Voting (${votingProgress.voted}/${votingProgress.total})` : `🗳️ Start Voting ${votingProgress.total > 0 ? `(${votingProgress.voted}/${votingProgress.total})` : ''}`}
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl font-bold border-2 border-gray-400 bg-gray-300 text-gray-600 shadow-lg">
                  👑 Only Team Leader Can Vote
                </div>
              )}
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#272757] rounded-xl border-2 border-gray-900 p-4 text-center shadow-lg">
              <div className="text-2xl font-black text-white">{myTeam.members.length}</div>
              <div className="text-white/90 font-bold text-sm">Members</div>
            </div>
            <div className="bg-green-500 rounded-xl border-2 border-gray-900 p-4 text-center shadow-lg">
              <div className="text-2xl font-black text-white">{6 - myTeam.members.length}</div>
              <div className="text-white/90 font-bold text-sm">Slots Left</div>
            </div>
            <div className="bg-purple-600 rounded-xl border-2 border-gray-900 p-4 text-center shadow-lg">
              <div className="text-2xl font-black text-white">
                {myTeam.members.length >= 4 ? '✅' : '⏳'}
              </div>
              <div className="text-white/90 font-bold text-sm">
                {myTeam.members.length >= 4 ? 'Ready' : 'Need More'}
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h4 className="text-xl font-black text-gray-900 mb-4">👥 Team Members</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeam.members.map((member) => (
                <div key={member.user._id} className="bg-gray-50 rounded-xl border-2 border-gray-900 p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#272757] rounded-full flex items-center justify-center text-white font-bold">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{member.user.name}</p>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                        {member.role === 'leader' && (
                          <span className="inline-flex px-2 py-1 text-xs font-black rounded-full bg-yellow-500 text-white border border-gray-900">
                            👑 Leader
                          </span>
                        )}
                      </div>
                    </div>
                    {myTeam.leader._id === user.id && member.user._id !== user.id && (
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold border border-gray-900 shadow-md hover:shadow-sm transition-all"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* No Team - Show Create/Join Options */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Create New Team</h3>
              <p className="text-gray-600 font-semibold mb-6">Start your own team and invite others to join your mission!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#272757] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black border-2 border-gray-900 shadow-lg hover:shadow-md transition-all"
              >
                ✨ Create Team
              </button>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-900 p-8 shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Join Existing Team</h3>
              <p className="text-gray-600 font-semibold mb-6">Browse available teams and join one that matches your interests!</p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-black border-2 border-gray-900 shadow-lg hover:shadow-md transition-all"
              >
                🔍 Browse Teams
              </button>
            </div>
          </div>
          
          {/* Voting Notice for users without team */}
          <div className="mt-6 bg-yellow-50 rounded-2xl border-2 border-yellow-300 p-6 shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-3">🗳️</div>
              <h3 className="text-xl font-black text-yellow-800 mb-2">Voting Access</h3>
              <p className="text-yellow-700 font-semibold">
                You need to be part of a team to participate in voting. 
                Create a team or join an existing one to start voting for other teams!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Teams Section */}
      {!myTeam && (
        <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-lg">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-gray-900">🌟 Available Teams</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-900 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <div key={team._id} className="bg-gray-50 rounded-2xl border-2 border-gray-900 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-black text-gray-900">{team.name}</h4>
                      <p className="text-sm font-bold text-gray-600">👑 {team.leader.name}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-black rounded-full border-2 border-gray-900 ${
                      team.members.length >= 6 ? 'bg-red-500 text-white' : 
                      team.members.length >= 4 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {team.members.length}/6 Members
                    </span>
                  </div>

                  {team.description && (
                    <p className="text-gray-600 font-semibold mb-4">{team.description}</p>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">Team Members:</p>
                    <div className="flex flex-wrap gap-2">
                      {team.members.slice(0, 3).map((member) => (
                        <span key={member.user._id} className="bg-[#272757] text-white px-2 py-1 rounded-lg text-xs font-bold">
                          {member.user.name}
                        </span>
                      ))}
                      {team.members.length > 3 && (
                        <span className="bg-gray-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          +{team.members.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinTeam(team._id)}
                    disabled={team.members.length >= 6}
                    className={`w-full px-4 py-2 rounded-xl font-bold border-2 border-gray-900 shadow-lg transition-all ${
                      team.members.length >= 6
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-md'
                    }`}
                  >
                    {team.members.length >= 6 ? '🚫 Team Full' : '🤝 Join Team'}
                  </button>
                </div>
              ))}
            </div>

            {filteredTeams.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-bold text-gray-500">No teams found</p>
                <p className="text-gray-400 font-semibold">Try adjusting your search or create a new team!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="🚀 Create New Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Team Name *</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-900 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your team name..."
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">3-50 characters, letters, numbers, spaces, hyphens, and underscores only</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-900 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your team's goals and vision..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 200 characters</p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-[#272757] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black border-2 border-gray-900 shadow-lg hover:shadow-md transition-all"
            >
              ✨ Create Team
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-xl font-black border-2 border-gray-900 shadow-lg hover:shadow-md transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Success/Error Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>

      {/* Team Voting Modal */}
      <TeamVoting
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        onVoteUpdate={loadVotingProgress}
      />
    </div>
  );
};

export default TeamFormation;