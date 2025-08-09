import React, { useState } from 'react';
import { X, Users, FileText } from 'lucide-react';
import { teamAPI } from '../../../../services/api';

const TeamCreationModal = ({ isOpen, onClose, selectedProblem, themeColors, onSuccess }) => {
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) {
      onSuccess?.('Please enter a team name', 'error');
      return;
    }

    try {
      setIsCreating(true);
      await teamAPI.createTeam({
        name: teamForm.name.trim(),
        description: teamForm.description.trim(),
        problemStatement: selectedProblem._id
      });
      
      onSuccess?.('Team created successfully! You can now collaborate on your selected problem statement.', 'success');
      setTeamForm({ name: '', description: '' });
      onClose();
    } catch (error) {
      console.error('Team creation error:', error);
      onSuccess?.(error.response?.data?.message || 'Failed to create team', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTeamForm({ name: '', description: '' });
    onClose();
  };

  if (!isOpen || !selectedProblem) return null;

  const isAtLimit = (selectedProblem.selectionCount || 0) >= 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" style={{ color: themeColors.accent }} />
            <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Create Team for Problem Statement
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: themeColors.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Problem Statement */}
        <div className="p-6 border-b" style={{ borderColor: themeColors.border, backgroundColor: themeColors.backgroundSecondary }}>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 mt-1" style={{ color: themeColors.accent }} />
            <div className="flex-1">
              <h3 className="font-semibold mb-2" style={{ color: themeColors.text }}>
                Selected Problem Statement:
              </h3>
              <h4 className="font-medium mb-2" style={{ color: themeColors.text }}>
                {selectedProblem.title}
              </h4>
              <p className="text-sm mb-3" style={{ color: themeColors.textSecondary }}>
                {selectedProblem.description}
              </p>
              <div className="flex items-center gap-2">
                <span 
                  className={`px-3 py-1 text-sm rounded-full font-medium ${
                    isAtLimit 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedProblem.selectionCount || 0}/4 teams selected
                </span>
                {isAtLimit && (
                  <span className="text-sm text-red-600 font-medium">SELECTION LIMIT REACHED</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {isAtLimit ? (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>
              Selection Limit Reached
            </h3>
            <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
              This problem statement has already been selected by 4 teams. Please choose a different problem statement.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: themeColors.accent, color: '#ffffff' }}
            >
              Choose Different Problem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Team Name *
              </label>
              <input
                type="text"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: themeColors.backgroundSecondary,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
                placeholder="Enter your team name..."
                required
                maxLength={50}
              />
              <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                3-50 characters, must be unique
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Team Description (Optional)
              </label>
              <textarea
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all resize-none"
                style={{
                  backgroundColor: themeColors.backgroundSecondary,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
                placeholder="Describe your team's approach or goals..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                Maximum 200 characters
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors border-2"
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.textSecondary,
                  backgroundColor: 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !teamForm.name.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: themeColors.accent,
                  color: '#ffffff'
                }}
              >
                {isCreating ? 'Creating Team...' : 'Create Team'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeamCreationModal;