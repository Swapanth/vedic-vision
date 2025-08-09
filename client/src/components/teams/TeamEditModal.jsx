import React, { useState, useEffect, useRef } from 'react';
import { teamAPI, problemAPI } from '../../services/api';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

const TeamEditModal = ({ isOpen, onClose, team, onTeamUpdate, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [problemStatements, setProblemStatements] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    problemStatement: ''
  });

  // Problem statement dropdown state
  const [problemSearchTerm, setProblemSearchTerm] = useState('');
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Member management state
  const [removingMember, setRemovingMember] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (isOpen && team) {
      setFormData({
        name: team.name || '',
        problemStatement: team.problemStatement?._id || ''
      });
      loadProblemStatements();
    }
  }, [isOpen, team]);

  // Filter problem statements based on search term
  const filteredProblemStatements = problemStatements.filter(problem =>
    problem.title.toLowerCase().includes(problemSearchTerm.toLowerCase()) ||
    problem.description?.toLowerCase().includes(problemSearchTerm.toLowerCase())
  );

  // Get selected problem statement details
  const selectedProblem = problemStatements.find(p => p._id === formData.problemStatement);

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

  const loadProblemStatements = async () => {
    try {
      const problemsRes = await problemAPI.getAllTitles();
      setProblemStatements(problemsRes.data.data || []);
    } catch (error) {
      console.error('Error loading problem statements:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.problemStatement) {
      if (onSuccess) onSuccess('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await teamAPI.updateTeam(team._id, formData);
      if (onSuccess) onSuccess('Team updated successfully!', 'success');
      onTeamUpdate();
      onClose();
    } catch (error) {
      if (onSuccess) onSuccess(error.response?.data?.message || 'Failed to update team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      await teamAPI.removeMember(team._id, memberId);
      if (onSuccess) onSuccess('Member removed successfully!', 'success');
      onTeamUpdate();
      setShowRemoveConfirm(false);
      setRemovingMember(null);
    } catch (error) {
      if (onSuccess) onSuccess(error.response?.data?.message || 'Failed to remove member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveMember = (member) => {
    setRemovingMember(member);
    setShowRemoveConfirm(true);
  };

  // Check if current user is the team leader
  const isTeamLeader = currentUser && team && team.leader &&
    (currentUser._id === team.leader._id || currentUser.id === team.leader._id);

  // Get team members excluding the current user
  const teamMembers = team?.members?.filter(member =>
    member.user._id !== currentUser?._id && member.user._id !== currentUser?.id
  ) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Team" className="max-w-md">
      {loading && <LoadingSpinner />}

      <div className="space-y-6" style={{ backgroundColor: '#f2f3f3', borderRadius: '10px' }}>
        <div className="text-center p-6 border-b border-pink-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Edit Team Details</h3>
          <p className="text-sm text-blue-600">Update your team name and problem statement</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-3">
              Team Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              style={{ color:'blue' }}
              placeholder="Enter team name..."
              required
              maxLength={50}
            />
            <p className="text-xs text-blue-500 mt-2">
              3-50 characters, letters, numbers, spaces, hyphens, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-3">
              Problem Statement *
            </label>
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsProblemDropdownOpen(!isProblemDropdownOpen)}
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-left flex items-center justify-between"
                style={{ backgroundColor: '#fef7ff' }}
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
                <div className="absolute z-50 w-full mt-1 bg-white border border-pink-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-pink-100">
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
                        className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent text-sm"
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
                            setFormData({ ...formData, problemStatement: problem._id });
                            setIsProblemDropdownOpen(false);
                            setProblemSearchTerm('');
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors border-b border-pink-50 last:border-b-0 ${formData.problemStatement === problem._id ? 'bg-pink-100 text-blue-800' : 'text-gray-700'
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

          {/* Team Members Management Section */}
          {isTeamLeader && teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-3">
                Team Members ({teamMembers.length})
              </label>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex items-center justify-between p-3 bg-white border border-pink-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{member.user.name}</p>
                        <p className="text-xs text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => confirmRemoveMember(member)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-500 mt-2">
                As team leader, you can remove members to make room for new ones
              </p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Updating...' : 'Update Team'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && removingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Remove Team Member</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove <strong>{removingMember.user.name}</strong> from the team?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRemoveMember(removingMember.user._id)}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Removing...' : 'Remove Member'}
                </button>
                <button
                  onClick={() => {
                    setShowRemoveConfirm(false);
                    setRemovingMember(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TeamEditModal;
