import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, UserPlus, Eye, Crown, Calendar } from 'lucide-react';
import { hackathonAPI, teamAPI } from '../../../../services/api';
import { ButtonLoader } from '../../../common/LoadingSpinner';

function HackathonTeamsView({ themeColors, userTeam, availableTeams, showSuccessModal, loadDashboardData }) {
  const [teams, setTeams] = useState(availableTeams || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [problems, setProblems] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTeamData, setCreateTeamData] = useState({
    name: '',
    description: '',
    problemStatement: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTeamsData();
    loadProblems();
  }, []);

  const loadTeamsData = async () => {
    try {
      setLoading(true);
      const response = await hackathonAPI.getTeams({
        search: searchTerm,
        problemStatementId: selectedProblem
      });
      setTeams(response.data.data.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      showSuccessModal('Error', 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async () => {
    try {
      const response = await hackathonAPI.getProblemStatements();
      // Handle the actual response structure from the API
      const responseData = response.data;
      setProblems(responseData.problems || responseData.problemStatements || []);
    } catch (error) {
      console.error('Error loading problems:', error);
    }
  };

  const handleSearch = () => {
    loadTeamsData();
  };

  const handleJoinTeam = async (teamId) => {
    try {
      await teamAPI.joinTeam(teamId);
      showSuccessModal('Success', 'Successfully joined the team!');
      loadDashboardData();
      loadTeamsData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join team';
      showSuccessModal('Error', message);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setIsCreating(true);
      await teamAPI.createTeam(createTeamData);
      showSuccessModal('Success', 'Team created successfully!');
      setShowCreateForm(false);
      setCreateTeamData({ name: '', description: '', problemStatement: '' });
      loadDashboardData();
      loadTeamsData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create team';
      showSuccessModal('Error', message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!userTeam?._id) {
      showSuccessModal('Error', 'No team to leave');
      return;
    }
    
    try {
      await teamAPI.leaveTeam(userTeam._id);
      showSuccessModal('Success', 'Successfully left the team!');
      loadDashboardData();
      loadTeamsData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave team';
      showSuccessModal('Error', message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
            Teams
          </h2>
          <p style={{ color: themeColors.textSecondary }}>
            Join a team or create your own to participate in the hackathon
          </p>
        </div>

        {!userTeam && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </button>
        )}
      </div>

      {/* Current Team */}
      {userTeam && (
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Your Team
            </h3>
            <span
              className="px-3 py-1 text-sm rounded-full"
              style={{
                backgroundColor: themeColors.blueBg,
                color: themeColors.accent
              }}
            >
              {userTeam.memberCount}/{userTeam.maxMembers} members
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: themeColors.text }}>
                {userTeam.name}
              </h4>
              {userTeam.description && (
                <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                  {userTeam.description}
                </p>
              )}

              {userTeam.problemStatement && (
                <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: themeColors.hover }}>
                  <p className="font-medium" style={{ color: themeColors.text }}>
                    Problem: {userTeam.problemStatement.title}
                  </p>
                  <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                    {userTeam.problemStatement.category} • {userTeam.problemStatement.difficulty}
                  </p>
                </div>
              )}

              <button
                onClick={handleLeaveTeam}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Leave Team
              </button>
            </div>

            <div>
              <h5 className="font-medium mb-3" style={{ color: themeColors.text }}>
                Team Members
              </h5>
              <div className="space-y-3">
                {userTeam.members?.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium" style={{ color: themeColors.text }}>
                          {member.user.name}
                        </p>
                        {member.role === 'leader' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                        {member.user.participantType === 'hackathon' ? 'Hackathon' : 'Bootcamp'} Participant
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Form */}
      {showCreateForm && (
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
            Create New Team
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Team Name *
              </label>
              <input
                type="text"
                value={createTeamData.name}
                onChange={(e) => setCreateTeamData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Description
              </label>
              <textarea
                value={createTeamData.description}
                onChange={(e) => setCreateTeamData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your team and goals"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Problem Statement *
              </label>
              <select
                value={createTeamData.problemStatement}
                onChange={(e) => setCreateTeamData(prev => ({ ...prev, problemStatement: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a problem statement</option>
                {problems.map((problem) => (
                  <option key={problem._id} value={problem._id}>
                    {problem.title} ({problem.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCreateTeam}
                disabled={isCreating || !createTeamData.name || !createTeamData.problemStatement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? <ButtonLoader text="Creating..." /> : 'Create Team'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {!userTeam && (
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: themeColors.textSecondary }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search teams..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:w-64">
              <select
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Problems</option>
                {problems.map((problem) => (
                  <option key={problem._id} value={problem._id}>
                    {problem.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Available Teams */}
      {!userTeam && (
        <div>
          <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
            Available Teams ({teams.length})
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2" style={{ color: themeColors.textSecondary }}>Loading teams...</p>
            </div>
          ) : teams.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl border"
              style={{
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.border
              }}
            >
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.textSecondary }} />
              <p className="text-lg font-medium mb-2" style={{ color: themeColors.text }}>
                No teams found
              </p>
              <p style={{ color: themeColors.textSecondary }}>
                Try adjusting your search criteria or create a new team
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="rounded-xl p-6 border transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: themeColors.cardBg,
                    borderColor: themeColors.border
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold" style={{ color: themeColors.text }}>
                      {team.name}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${team.isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {team.memberCount}/{team.maxMembers}
                    </span>
                  </div>

                  {team.description && (
                    <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                      {team.description}
                    </p>
                  )}

                  {team.problemStatement && (
                    <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: themeColors.hover }}>
                      <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                        {team.problemStatement.title}
                      </p>
                      <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                        {team.problemStatement.category}
                      </p>
                    </div>
                  )}

                  {team.participantTypeBreakdown && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                        Team Composition:
                      </p>
                      <div className="flex space-x-2 text-xs">
                        <span
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: themeColors.blueBg,
                            color: themeColors.accent
                          }}
                        >
                          {team.participantTypeBreakdown.bootcamp || 0} Bootcamp
                        </span>
                        <span
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: themeColors.orangeBg || '#FFF7ED',
                            color: '#EA580C'
                          }}
                        >
                          {team.participantTypeBreakdown.hackathon || 0} Hackathon
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleJoinTeam(team._id)}
                    disabled={team.isFull}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${team.isFull
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {team.isFull ? 'Team Full' : 'Join Team'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HackathonTeamsView;