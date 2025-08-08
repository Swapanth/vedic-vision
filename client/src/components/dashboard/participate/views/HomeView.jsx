import { motion } from 'framer-motion';
import { Calendar, Trophy, Users, User, Edit, LogOut, Vote } from 'lucide-react';
import AttendanceCalendar from '../../utils/AttendanceCalendar';
import TeamFormationModal from '../../../teams/TeamFormationModal';
import TeamEditModal from '../../../teams/TeamEditModal';
import TeamVotingModal from '../../../teams/TeamVotingModal';
import Toast from '../../../common/Toast';
import { useState, useEffect } from 'react';
import { teamAPI, configAPI, voteAPI } from '../../../../services/api';

const HomeView = ({
  themeColors,
  activeTasks,
  attendancePercentage,
  presentDays,
  totalDays,
  attendanceStreak,
  attendance,
  pendingSubmissions,
  completedSubmissions,
  mentor,
  team,
  overviewScore,
  attendanceScore,
  taskCompletionScore,
  participantPosition,
  setModalContent,
  setShowModal,
  user
}) => {
  const [showTeamFormation, setShowTeamFormation] = useState(false);
  const [showTeamEdit, setShowTeamEdit] = useState(false);
  const [showTeamVoting, setShowTeamVoting] = useState(false);
  const [teamFormationEnabled, setTeamFormationEnabled] = useState(true);
  const [votingEnabled, setVotingEnabled] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(team);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState('');
  const [votingCompleted, setVotingCompleted] = useState(false);
  const [votingProgress, setVotingProgress] = useState({ voted: 0, total: 0 });

  useEffect(() => {
    console.log('Team prop received:', team);
    setCurrentTeam(team);
  }, [team]);

  useEffect(() => {
    const checkTeamFormationStatus = async () => {
      try {
        const configRes = await configAPI.getConfig();
        setTeamFormationEnabled(configRes.data.teamFormationEnabled);
        setVotingEnabled(configRes.data.votingEnabled);
      } catch (error) {
        console.error('Error checking team formation status:', error);
      }
    };
    checkTeamFormationStatus();
  }, []);

  useEffect(() => {
    if (votingEnabled && currentTeam && user && currentTeam.leader?._id === user._id) {
      checkVotingCompletion();
    }
  }, [votingEnabled, currentTeam, user]);

  // Additional check to ensure progress updates properly
  useEffect(() => {
    if (votingEnabled && currentTeam && user && currentTeam.leader?._id === user._id && showTeamVoting) {
      const interval = setInterval(() => {
        checkVotingCompletion();
      }, 2000); // Check every 2 seconds while modal is open

      return () => clearInterval(interval);
    }
  }, [votingEnabled, currentTeam, user, showTeamVoting]);

  // Check progress when voting modal opens
  useEffect(() => {
    if (showTeamVoting && votingEnabled && currentTeam && user && currentTeam.leader?._id === user._id) {
      checkVotingCompletion();
    }
  }, [showTeamVoting]);

  const handleTeamUpdate = async () => {
    try {
      const teamRes = await teamAPI.getMyTeam();
      console.log('Team update response:', teamRes.data);

      // Check if the response has a valid team
      if (teamRes.data && teamRes.data.data && teamRes.data.data.team && teamRes.data.data.team._id) {
        setCurrentTeam(teamRes.data.data.team);
      } else {
        // User is not in a team
        setCurrentTeam(null);
      }
    } catch (error) {
      console.log('User is not in a team or error occurred:', error);
      // User is not in a team
      setCurrentTeam(null);
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentTeam) return;
    const isLeader = user?._id && currentTeam?.leader?._id && user._id === currentTeam.leader._id;
    const otherMembers = (currentTeam.members || []).filter(m => m.user?._id !== user?._id);

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
                      const response = await teamAPI.leaveTeam(currentTeam._id);
                      setToast({
                        message: response.data.message || 'Successfully left the team!',
                        type: 'success',
                        isVisible: true
                      });
                      setCurrentTeam(null);
                      setShowModal(false);
                    } catch (error) {
                      setToast({
                        message: error.response?.data?.message || 'Failed to leave team',
                        type: 'error',
                        isVisible: true
                      });
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
                      const response = await teamAPI.leaveTeam(currentTeam._id, {
                        transferToUserId: selectedNewLeaderId
                      });
                      setToast({
                        message: response.data.message || 'Leadership transferred and left the team!',
                        type: 'success',
                        isVisible: true
                      });
                      setCurrentTeam(null);
                      setShowModal(false);
                    } catch (error) {
                      setToast({
                        message: error.response?.data?.message || 'Failed to transfer leadership',
                        type: 'error',
                        isVisible: true
                      });
                      setShowModal(false);
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-md transition-colors ${!selectedNewLeaderId
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
              ? `You are the only member of "${currentTeam.name}". Leaving will permanently delete the team.`
              : `Are you sure you want to leave "${currentTeam.name}"? This action cannot be undone.`
            }
          </p>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  const response = await teamAPI.leaveTeam(currentTeam._id);
                  setToast({
                    message: response.data.message || 'Successfully left the team!',
                    type: 'success',
                    isVisible: true
                  });
                  setCurrentTeam(null);
                  setShowModal(false);
                } catch (error) {
                  setToast({
                    message: error.response?.data?.message || 'Failed to leave team',
                    type: 'error',
                    isVisible: true
                  });
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

  const showSuccessMessage = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const checkVotingCompletion = async () => {
    if (!votingEnabled || !currentTeam || !user || currentTeam.leader?._id !== user._id) {
      return;
    }

    try {
      const [teamsRes, votesRes] = await Promise.all([
        teamAPI.getAllTeams(),
        voteAPI.getUserVotingHistory()
      ]);

      // Only include teams with a valid _id
      const allTeams = teamsRes.data.data.teams.filter(t => t && t._id && t._id !== currentTeam._id);
      // Ensure votedTeams are all strings
      const votedTeams = votesRes.data.data.votes.map(v => v.teamId || (v.team && v.team._id) || v.team).filter(Boolean).map(String);
      // Filter out votes for the user's own team
      const filteredVotedTeams = votedTeams.filter(teamId => teamId !== String(currentTeam._id));

      console.log('Raw vote data:', votesRes.data.data.votes);
      console.log('Vote structure check:', {
        firstVote: votesRes.data.data.votes[0],
        allVoteTeams: votesRes.data.data.votes.map(v => ({ team: v.team, teamId: v.teamId, fullVote: v }))
      });

      // Defensive: Only check teams with a valid _id
      const isCompleted = allTeams.length > 0 && allTeams.every(team => filteredVotedTeams.includes(String(team._id)));
      setVotingCompleted(isCompleted);
      setVotingProgress({ voted: filteredVotedTeams.length, total: allTeams.length });

      console.log('Voting completion check:', {
        allTeams: allTeams.length,
        votedTeams: votedTeams.length,
        filteredVotedTeams: filteredVotedTeams.length,
        isCompleted,
        votedTeamIds: votedTeams,
        filteredVotedTeamIds: filteredVotedTeams,
        allTeamIds: allTeams.map(t => t._id),
        currentTeamId: currentTeam._id,
        progressDisplay: `${filteredVotedTeams.length}/${allTeams.length}`
      });
    } catch (error) {
      console.error('Error checking voting completion:', error);
    }
  };

  const handleVoteSubmitted = () => {
    // Immediately update the progress to reflect the new vote
    setVotingProgress(prev => ({ ...prev, voted: prev.voted + 1 }));

    // Also check from backend after a small delay
    setTimeout(() => {
      checkVotingCompletion();
    }, 500);
    showSuccessMessage('Vote submitted successfully!', 'success');
    console.log('Vote submitted - checking completion status');
  };

  const handleVotingCompleted = () => {
    setVotingCompleted(true);
    setVotingProgress(prev => ({ ...prev, voted: prev.total }));
    showSuccessMessage('Congratulations! You have completed voting for all teams!', 'success');
    console.log('Voting completed - setting completion state');
  };

  const handleVoteModalClose = () => {
    setShowTeamVoting(false);
    // Refresh voting progress when modal is closed
    setTimeout(() => {
      checkVotingCompletion();
    }, 300); // Small delay to ensure backend updates are processed
  };

  const showScoreDetails = () => {
    setModalContent({
      title: 'Score Breakdown',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">{overviewScore}</div>
            <div className="text-lg font-semibold text-gray-700">Total Overview Score</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-green-800">Attendance Score</div>
                <div className="text-sm text-green-600">{presentDays} days × 10 points</div>
              </div>
              <div className="text-xl font-bold text-green-700">{attendanceScore}</div>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-blue-800">Task Completion Score</div>
                <div className="text-sm text-blue-600">{completedSubmissions.length} tasks completed</div>
              </div>
              <div className="text-xl font-bold text-blue-700">{taskCompletionScore}</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Scoring System:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Attendance: 10 points per day present</li>
              <li>• Task completion: Variable points based on quality</li>
              <li>• Position calculated based on total score</li>
            </ul>
          </div>
        </div>
      )
    });
    setShowModal(true);
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="rounded-xl shadow-sm  p-6"
          style={{
            backgroundColor: themeColors.blueBg,
            borderColor: themeColors.blue
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: themeColors.blue }}>{activeTasks.length}</p>
            <p className="text-sm font-medium" style={{ color: themeColors.blue }}>Active Tasks</p>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl shadow-sm  p-6"
          style={{
            backgroundColor: themeColors.greenBg,
            borderColor: themeColors.green
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: themeColors.green }}>{attendancePercentage}%</p>
            <p className="text-sm font-medium" style={{ color: themeColors.green }}>Attendance Rate</p>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl shadow-sm  p-6"
          style={{
            backgroundColor: themeColors.orangeBg,
            borderColor: themeColors.orange
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: themeColors.orange }}>{pendingSubmissions.length}</p>
            <p className="text-sm font-medium" style={{ color: themeColors.orange }}>Pending Submissions</p>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl shadow-sm  p-6"
          style={{
            backgroundColor: themeColors.purpleBg,
            borderColor: themeColors.purple
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: themeColors.purple }}>{completedSubmissions.length}</p>
            <p className="text-sm font-medium" style={{ color: themeColors.purple }}>Completed Tasks</p>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Attendance Calendar */}
          <motion.div
            className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: themeColors.text }}>
                <Calendar className="w-5 h-5 mr-2" />
                Attendance Calendar
              </h3>
              <AttendanceCalendar attendance={attendance} themeColors={themeColors} />
            </div>
          </motion.div>

          {/* Middle: Score Overview */}
          <motion.div
            className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center" style={{ color: themeColors.text }}>
                  <Trophy className="w-5 h-5 mr-2" />
                  Participant Overview
                </h3>
                <button
                  onClick={showScoreDetails}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                >
                  Details
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: themeColors.accent }}>{overviewScore}</div>
                  <div className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Score</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Attendance</span>
                    <span style={{ color: themeColors.text }}>{presentDays}/{totalDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Current Streak</span>
                    <span style={{ color: themeColors.text }}>{attendanceStreak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Completed Tasks</span>
                    <span style={{ color: themeColors.text }}>{completedSubmissions.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Mentor & Team */}
          <motion.div
            className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: themeColors.text }}>
                <Users className="w-5 h-5 mr-2" />
                Mentor & Team
              </h3>

              {/* Mentor Section */}
              <div className="mb-3">
                <h4 className="text-sm font-semibold mb-2" style={{ color: themeColors.textSecondary }}>MENTOR</h4>
                {mentor ? (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        {mentor.profilePicture ? (
                          <img
                            src={mentor.profilePicture}
                            alt={mentor.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: themeColors.text }}>{mentor.name}</div>
                        <div className="text-sm" style={{ color: themeColors.textSecondary }}>{mentor.email}</div>
                      </div>
                    </div>
                    {mentor.mobile && (
                      <div className="mt-1 text-sm" style={{ color: themeColors.textSecondary }}>
                        📞 {mentor.mobile}
                      </div>
                    )}
                    {mentor.description && (
                      <div className="mt-2 text-sm" style={{ color: themeColors.textSecondary }}>
                        {mentor.description}
                      </div>
                    )}
                    {mentor.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mentor.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                            {skill.replace(/"/g, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                    <div className="text-sm" style={{ color: themeColors.textSecondary }}>No mentor assigned yet</div>
                  </div>
                )}
              </div>

              {/* Team Section */}
              <div className="mb-3 border-t mt-3">
                <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: themeColors.textSecondary }}>TEAM INFO</h4>
                {!teamFormationEnabled ? (
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                    <div className="text-sm" style={{ color: themeColors.textSecondary }}>Team formation will be available soon</div>
                  </div>
                ) : currentTeam && currentTeam._id ? (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                    {/* Team Details with Labels */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-semibold mb-1" style={{ color: themeColors.textSecondary }}>
                            Team Name:
                          </div>
                          <div className="text-lg font-bold" style={{ color: themeColors.text }}>
                            {currentTeam.name || 'Unnamed Team'}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowTeamEdit(true)}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            title="Edit Team"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={handleLeaveTeam}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            title="Leave Team"
                          >
                            <LogOut className="w-4 h-4 inline mr-1" />
                            Leave
                          </button>
                        </div>
                      </div>

                      {currentTeam.problemStatement && (
                        <div>
                          <div className="text-sm font-semibold mb-1" style={{ color: themeColors.textSecondary }}>
                            Problem Statement:
                          </div>
                          <div className="text-sm" style={{ color: themeColors.text }}>
                            {currentTeam.problemStatement.title || 'No title'}
                          </div>
                          {currentTeam.problemStatement.description && (
                            <div className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                              {currentTeam.problemStatement.description}
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-semibold mb-2" style={{ color: themeColors.textSecondary }}>
                          Team Members ({(currentTeam.members?.length || 0)}/6):
                        </div>
                        {currentTeam.members && currentTeam.members.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {currentTeam.members.map((member) => (
                              <div
                                key={member.user?._id || Math.random()}
                                className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg"
                              >
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  {member.user?.profilePicture ? (
                                    <img
                                      src={member.user.profilePicture}
                                      alt={member.user.name || 'Member'}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                                  {member.user?.name || 'Unknown Member'}
                                  {member.user?._id === currentTeam.leader?._id && (
                                    <span className="ml-1 text-yellow-600">👑</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                            No members yet
                          </div>
                        )}
                      </div>

                      {currentTeam.description && (
                        <div>
                          <div className="text-sm font-semibold mb-1" style={{ color: themeColors.textSecondary }}>
                            Team Description:
                          </div>
                          <div className="text-sm" style={{ color: themeColors.text }}>
                            {currentTeam.description}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-semibold mb-1" style={{ color: themeColors.textSecondary }}>
                          Team Status:
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(currentTeam.members?.length || 0) >= 6 ? 'bg-red-100 text-red-800' :
                              (currentTeam.members?.length || 0) >= 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {(currentTeam.members?.length || 0) >= 6 ? 'Team Full' :
                              (currentTeam.members?.length || 0) >= 4 ? 'Well Balanced' : 'Looking for Members'}
                          </span>
                          <span className="text-xs" style={{ color: themeColors.textSecondary }}>
                            ({(currentTeam.members?.length || 0)}/6 members)
                          </span>
                        </div>
                      </div>

                      {/* Voting Section */}
                      {votingEnabled && currentTeam && currentTeam.leader && user && currentTeam.leader._id === user._id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm font-semibold mb-2" style={{ color: themeColors.textSecondary }}>
                            Team Voting:
                          </div>
                          {votingCompleted ? (
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                ✅ Completed Voting
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowTeamVoting(true)}
                              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              <Vote className="w-4 h-4" />
                              <span>Vote for Teams ({votingProgress.voted}/{votingProgress.total})</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                    <div className="text-sm mb-3" style={{ color: themeColors.textSecondary }}>Not part of any team</div>
                    <button
                      onClick={() => setShowTeamFormation(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Join or Create Team
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Team Formation Modal */}
        <TeamFormationModal
          isOpen={showTeamFormation}
          onClose={() => setShowTeamFormation(false)}
          onTeamUpdate={handleTeamUpdate}
          onSuccess={showSuccessMessage}
        />

        {/* Team Edit Modal */}
        <TeamEditModal
          isOpen={showTeamEdit}
          onClose={() => setShowTeamEdit(false)}
          team={currentTeam}
          onTeamUpdate={handleTeamUpdate}
          onSuccess={showSuccessMessage}
        />

        {/* Team Voting Modal */}
        <TeamVotingModal
          isOpen={showTeamVoting}
          onClose={handleVoteModalClose}
          user={user}
          myTeamId={currentTeam?._id}
          onVoted={handleVoteSubmitted}
          onVotingCompleted={handleVotingCompleted}
        />
      </motion.div>
    </div>
  );
};

export default HomeView;
