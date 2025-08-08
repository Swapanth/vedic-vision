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
  const [myTeam, setMyTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState('');
  const [votingProgress, setVotingProgress] = useState({ voted: 0, total: 0, completed: false });
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });

  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyTeam(),
        loadTeams(),
        loadVotingProgress()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTeam = async () => {
    try {
      const response = await teamAPI.getMyTeam();
      setMyTeam(response.data.data.team);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading my team:', error);
      }
      setMyTeam(null);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await teamAPI.getAllTeams();
      setTeams(response.data.data.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeams([]);
    }
  };

  const loadVotingProgress = async () => {
    if (!myTeam || myTeam.leader._id !== user._id) return;
    
    try {
      const [teamsRes, votesRes] = await Promise.all([
        teamAPI.getAllTeams(),
        voteAPI.getAllTeamsWithRatings()
      ]);
      
      const allTeams = teamsRes.data.data.teams || [];
      const otherTeams = allTeams.filter(team => team._id !== myTeam._id);
      
      // Count how many teams this user has voted for
      let votedCount = 0;
      // This would need to be implemented based on your voting system
      
      setVotingProgress({
        voted: votedCount,
        total: otherTeams.length,
        completed: votedCount === otherTeams.length && otherTeams.length > 0
      });
    } catch (error) {
      console.error('Error loading voting progress:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Team name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      await teamAPI.createTeam(createForm);
      showToast('Team created successfully!', 'success');
      setCreateForm({ name: '', description: '' });
      setShowCreateModal(false);
      await loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      setLoading(true);
      await teamAPI.joinTeam(teamId);
      showToast('Successfully joined the team!', 'success');
      await loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to join team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam) return;
    const isLeader = user?._id && myTeam?.leader?._id && user._id === myTeam.leader._id;
    const otherMembers = (myTeam.members || []).filter(m => m.user?._id !== user?._id);
    
    // If leader and there are other members, show options for leadership transfer
    if (isLeader && otherMembers.length > 0) {
      setSelectedNewLeaderId('');
      setModalContent({
        title: 'Leave Team as Leader',
        content: (
          <div className="space-y-4 p-2">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">👑</div>
              <p className="text-sm text-gray-700">You are the team leader. Choose how to handle leadership when you leave:</p>
            </div>
            
            <div className="space-y-3">
              {/* Option 1: Auto-transfer leadership */}
              <div className="border rounded-lg p-3 hover:bg-gray-50">
                <button
                  onClick={async () => {
                    try {
                      const response = await teamAPI.leaveTeam(myTeam._id);
                      showToast(response.data.message || 'Successfully left the team!', 'success');
                      setMyTeam(null);
                      setShowModal(false);
                      await loadData();
                    } catch (error) {
                      showToast(error.response?.data?.message || 'Failed to leave team', 'error');
                      setShowModal(false);
                    }
                  }}
                  className="w-full text-left"
                >
                  <div className="font-medium text-blue-600">🔄 Auto-Transfer Leadership</div>
                  <div className="text-sm text-gray-600">Leadership will be automatically transferred to {otherMembers[0]?.user?.name}</div>
                </button>
              </div>

              {/* Option 2: Choose specific member */}
              <div className="border rounded-lg p-3">
                <div className="font-medium text-green-600 mb-2">🎯 Choose New Leader</div>
                <select
                  value={selectedNewLeaderId}
                  onChange={(e) => setSelectedNewLeaderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                >
                  <option value="">Select a team member...</option>
                  {otherMembers.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
                <button
                  disabled={!selectedNewLeaderId}
                  onClick={async () => {
                    try {
                      const response = await teamAPI.leaveTeam(myTeam._id, { 
                        transferToUserId: selectedNewLeaderId 
                      });
                      showToast(response.data.message || 'Leadership transferred and left the team!', 'success');
                      setMyTeam(null);
                      setShowModal(false);
                      await loadData();
                    } catch (error) {
                      showToast(error.response?.data?.message || 'Failed to transfer leadership', 'error');
                      setShowModal(false);
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-md transition-colors ${
                    !selectedNewLeaderId 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Transfer to Selected Member & Leave
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )
      });
      setShowModal(true);
      return;
    }

    // For regular members or solo leaders, show simple confirmation
    const isSoloLeader = isLeader && otherMembers.length === 0;
    setModalContent({
      title: isSoloLeader ? 'Disband Team' : 'Leave Team',
      content: (
        <div className="text-center p-6">
          <div className="text-6xl mb-4">{isSoloLeader ? '💥' : '⚠️'}</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isSoloLeader ? 'Disband Team Confirmation' : 'Leave Team Confirmation'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isSoloLeader 
              ? `You are the only member of "${myTeam.name}". Leaving will permanently delete the team.`
              : `Are you sure you want to leave "${myTeam.name}"? This action cannot be undone.`
            }
          </p>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  const response = await teamAPI.leaveTeam(myTeam._id);
                  showToast(response.data.message || 'Successfully left the team!', 'success');
                  setMyTeam(null);
                  setShowModal(false);
                  await loadData();
                } catch (error) {
                  showToast(error.response?.data?.message || 'Failed to leave team', 'error');
                  setShowModal(false);
                }
              }}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              {isSoloLeader ? 'Disband Team' : 'Leave Team'}
            </button>
            <button 
              onClick={() => setShowModal(false)} 
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };

  const handleDeleteTeam = async () => {
    if (!myTeam) return;
    
    setModalContent({
      title: 'Delete Team',
      content: (
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🗑️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Team Confirmation</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to permanently delete "{myTeam.name}"? This will remove all members and cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  await teamAPI.deleteTeam(myTeam._id);
                  showToast('Team deleted successfully!', 'success');
                  setMyTeam(null);
                  setShowModal(false);
                  await loadData();
                } catch (error) {
                  showToast(error.response?.data?.message || 'Failed to delete team', 'error');
                  setShowModal(false);
                }
              }}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Delete Team
            </button>
            <button 
              onClick={() => setShowModal(false)} 
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };

  const handleRemoveMember = async (memberId) => {
    if (!myTeam) return;
    
    const member = myTeam.members.find(m => m.user._id === memberId);
    if (!member) return;

    setModalContent({
      title: 'Remove Member',
      content: (
        <div className="text-center p-6">
          <div className="text-6xl mb-4">👋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Remove Member Confirmation</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove {member.user.name} from the team?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  await teamAPI.removeMember(myTeam._id, memberId);
                  showToast('Member removed successfully!', 'success');
                  setShowModal(false);
                  await loadData();
                } catch (error) {
                  showToast(error.response?.data?.message || 'Failed to remove member', 'error');
                  setShowModal(false);
                }
              }}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Remove Member
            </button>
            <button 
              onClick={() => setShowModal(false)} 
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.leader.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        /* No Team - Show single Join or Create Team button */
        <div className="flex flex-col items-center justify-center py-12">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 rounded-xl font-bold border-2 border-gray-200 shadow-md transition-all text-lg"
            style={{
              background: 'linear-gradient(90deg, #f8fafc 0%, #e0e7ff 100%)',
              color: '#6366f1',
              fontWeight: 700,
              boxShadow: '0 2px 12px 0 #e0e7ff80',
            }}
          >
            ✨ Join or Create Team
          </button>
          <div className="mt-6 bg-yellow-50 rounded-2xl border-2 border-yellow-300 p-6 shadow-lg max-w-xl">
            <div className="text-center">
              <div className="text-4xl mb-3">🗳️</div>
              <h3 className="text-xl font-black text-yellow-800 mb-2">Voting Access</h3>
              <p className="text-yellow-700 font-semibold">
                You need to be part of a team to participate in voting. 
                Join or create a team to start voting for other teams!
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