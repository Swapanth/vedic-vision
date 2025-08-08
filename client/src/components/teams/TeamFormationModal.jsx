import React, { useState, useEffect, useRef } from 'react';
import { teamAPI, problemAPI, configAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

const TeamFormationModal = ({ isOpen, onClose, onTeamUpdate, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('select'); // 'select', 'create', 'join'
  const [teams, setTeams] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [teamFormationEnabled, setTeamFormationEnabled] = useState(true);

  // Create team form state
  const [createForm, setCreateForm] = useState({
    name: '',
    problemStatement: ''
  });

  // Join team state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Problem statement dropdown state
  const [problemSearchTerm, setProblemSearchTerm] = useState('');
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configRes, teamsRes, problemsRes] = await Promise.all([
        configAPI.getConfig(),
        teamAPI.getAllTeams(),
        problemAPI.getAllTitles()
      ]);

      setTeamFormationEnabled(configRes.data.teamFormationEnabled);
      setTeams(teamsRes.data.data.teams || []);
      setProblemStatements(problemsRes.data.data || []);
    } catch (error) {
      console.error('Error loading team formation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.problemStatement) {
      if (onSuccess) onSuccess('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating team with data:', createForm); // Debug log
      await teamAPI.createTeam(createForm);
      if (onSuccess) onSuccess('Team created successfully!', 'success');
      onTeamUpdate();
      onClose();
    } catch (error) {
      console.error('Team creation error:', error.response?.data || error); // Debug log
      if (onSuccess) onSuccess(error.response?.data?.message || 'Failed to create team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      setLoading(true);
      await teamAPI.joinTeam(teamId);
      if (onSuccess) onSuccess('Successfully joined the team!', 'success');
      onTeamUpdate();
      onClose();
    } catch (error) {
      if (onSuccess) onSuccess(error.response?.data?.message || 'Failed to join team', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter teams based on search term
  const filteredTeams = teams.filter(team => {
    const searchLower = searchTerm.toLowerCase();
    return (
      team.name.toLowerCase().includes(searchLower) ||
      team.leader.name.toLowerCase().includes(searchLower) ||
      (team.problemStatement && team.problemStatement.title.toLowerCase().includes(searchLower)) ||
      (team.description && team.description.toLowerCase().includes(searchLower)) ||
      team.members.some(member => member.user.name.toLowerCase().includes(searchLower))
    );
  });

  // Filter problem statements based on search term
  const filteredProblemStatements = problemStatements.filter(problem =>
    problem.title.toLowerCase().includes(problemSearchTerm.toLowerCase()) ||
    problem.description?.toLowerCase().includes(problemSearchTerm.toLowerCase())
  );

  // Get selected problem statement details
  const selectedProblem = problemStatements.find(p => p._id === createForm.problemStatement);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProblemDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const resetForm = () => {
    setCreateForm({ name: '', problemStatement: '' });
    setSelectedTeam(null);
    setSearchTerm('');
    setProblemSearchTerm('');
    setIsProblemDropdownOpen(false);
    setMode('select');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!teamFormationEnabled) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Team Formation">
        <div className="text-center py-12" style={{ backgroundColor: '#dff1f8' }}>
          <div className="text-5xl mb-6">⏳</div>
          <h3 className="text-xl font-semibold text-purple-800 mb-3">Team Formation Disabled</h3>
          <p className="text-purple-600 text-sm">Team formation will be available soon. Please check back later.</p>
        </div>
      </Modal>
    );
  }
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Team Formation" className="max-w-2xl">
      {loading && <LoadingSpinner />}
      {mode === 'select' && (
        <div className="space-y-8" style={{ backgroundColor: '#f8fafc' }}>
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Action</h3>
            <p className="text-gray-600 text-sm">Create a new team or join an existing one</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pb-8">
            <button
              onClick={() => setMode('create')}
              className="p-8 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group"
              style={{ backgroundColor: '#dff1f8' }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Create New Team</h4>
              <p className="text-sm text-blue-600 leading-relaxed">Start a new team and become the leader</p>
            </button>
            <button
              onClick={() => setMode('join')}
              className="p-8 border-2 border-green-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 group"
              style={{ backgroundColor: '#f0fdf4' }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤝</div>
              <h4 className="text-lg font-semibold text-green-800 mb-3">Join Existing Team</h4>
              <p className="text-sm text-green-600 leading-relaxed">Join a team that's looking for members</p>
            </button>
          </div>
        </div>
      )}
      {mode === 'create' && (
        <div className="space-y-6" style={{ backgroundColor: '#dff1f8',borderRadius:'20px' }}>
          <div className="flex items-center justify-between p-6 border-b border-blue-100 ">
            <h3 className="text-lg font-semibold text-blue-800">Create New Team</h3>
            <button onClick={() => setMode('select')} className="text-blue-600 hover:text-blue-800 text-sm">← Back</button>
          </div>
          <form onSubmit={handleCreateTeam} className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-3">Team Name *</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                style={{ backgroundColor: '#dff1f8' }}
                placeholder="Enter team name..."
                required
                maxLength={50}
              />
              <p className="text-xs text-blue-500 mt-2">3-50 characters, letters, numbers, spaces, hyphens, and underscores only</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-3">Problem Statement *</label>
              <div className="relative" ref={dropdownRef}>
                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsProblemDropdownOpen(!isProblemDropdownOpen)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left flex items-center justify-between"
                  style={{ backgroundColor: '#dff1f8' }}
                >
                  <span className={selectedProblem ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedProblem ? selectedProblem.title : 'Select a problem statement...'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-blue-400 transition-transform ${isProblemDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProblemDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-blue-100">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={problemSearchTerm}
                          onChange={(e) => setProblemSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Search problem statements..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {problemSearchTerm && (
                        <p className="text-xs text-blue-600 mt-1">
                          Found {filteredProblemStatements.length} statement{filteredProblemStatements.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProblemStatements.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {problemSearchTerm ? 'No problem statements found' : 'No problem statements available'}
                        </div>
                      ) : (
                        filteredProblemStatements.map((problem) => (
                          <button
                            key={problem._id}
                            type="button"
                            onClick={() => {
                              setCreateForm({ ...createForm, problemStatement: problem._id });
                              setIsProblemDropdownOpen(false);
                              setProblemSearchTerm('');
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-blue-50 last:border-b-0 ${createForm.problemStatement === problem._id ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                              }`}
                          >
                            <div className="font-medium text-sm mb-1">{problem.title}</div>
                            {problem.description && (
                              <div className="text-xs text-gray-500 line-clamp-2">
                                {problem.description.length > 100
                                  ? `${problem.description.substring(0, 100)}...`
                                  : problem.description}
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-500 mt-2">Search and select the problem statement your team will work on</p>
            </div>
            <div className="flex space-x-4 pt-4">
              <button type="submit" disabled={loading} className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium">
                {loading ? 'Creating...' : 'Create Team'}
              </button>
              <button type="button" onClick={() => setMode('select')} className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {mode === 'join' && (
        <div className="space-y-6" style={{ backgroundColor: '#f0fdf4' }}>
          <div className="flex items-center justify-between p-6 border-b border-green-100">
            <h3 className="text-lg font-semibold text-green-800">Join Existing Team</h3>
            <button onClick={() => setMode('select')} className="text-green-600 hover:text-green-800 text-sm">← Back</button>
          </div>
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-6">🔍</div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">No Teams Available</h3>
              <p className="text-green-600 text-sm mb-6">No teams are currently looking for members.</p>
              <button onClick={() => setMode('create')} className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium">Create a Team Instead</button>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="px-6 pb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    style={{ backgroundColor: '#f0fdf4' }}
                    placeholder="Search teams by name, leader, problem statement, or members..."
                  />
                </div>
                {searchTerm && (
                  <p className="text-sm text-green-600 mt-2">
                    Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </p>
                )}
              </div>

              {/* Teams List */}
              {filteredTeams.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">No Teams Found</h3>
                  <p className="text-green-600 text-sm mb-4">No teams match your search criteria.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-green-600 hover:text-green-800 text-sm underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="px-6">
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
                    {filteredTeams.map((team) => (
                      <div key={team._id} className="border border-green-200 rounded-xl p-5 hover:border-green-300 transition-all" style={{ backgroundColor: '#f0fdf4' }}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-green-800 mb-1">{team.name}</h4>
                            <p className="text-sm text-green-600">👑 {team.leader.name}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${team.members.length >= 6 ? 'bg-red-100 text-red-800' :
                            team.members.length >= 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {team.members.length}/6 Members
                          </span>
                        </div>
                        {team.problemStatement && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-green-700 mb-1">Problem Statement:</p>
                            <p className="text-sm text-green-600">{team.problemStatement.title}</p>
                          </div>
                        )}
                        {team.description && (<p className="text-sm text-green-600 mb-4">{team.description}</p>)}
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-2">
                            {team.members.slice(0, 3).map((member) => (
                              <span key={member.user._id} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">{member.user.name}</span>
                            ))}
                            {team.members.length > 3 && (<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">+{team.members.length - 3} more</span>)}
                          </div>
                          <button
                            onClick={() => handleJoinTeam(team._id)}
                            disabled={team.members.length >= 6 || loading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${team.members.length >= 6 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                          >
                            {team.members.length >= 6 ? 'Team Full' : 'Join Team'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default TeamFormationModal;
