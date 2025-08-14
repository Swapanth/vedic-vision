import React, { useEffect, useState } from 'react';
import { userAPI, teamAPI } from '../../../../services/api';

const JudgeAssignmentTab = ({ onShowModal }) => {
  const [judges, setJudges] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [judgesRes, teamsRes] = await Promise.all([
          userAPI.getAllUsers({ role: 'judge', limit: 100 }),
          teamAPI.getAllTeams({ limit: 200 })
        ]);
        setJudges(judgesRes.data.data.users || []);
        setTeams(teamsRes.data.data.teams || []);
      } catch (e) {
        onShowModal?.('Error', 'Failed to load judges or teams');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [onShowModal]);

  const toggleTeam = (teamId) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const assign = async () => {
    if (!selectedJudgeId || selectedTeamIds.length === 0) {
      onShowModal?.('Error', 'Select a judge and at least one team');
      return;
    }
    try {
      setSaving(true);
      await userAPI.assignTeamsToJudge({ judgeId: selectedJudgeId, teamIds: selectedTeamIds });
      onShowModal?.('Success', 'Teams assigned to judge successfully');
      setSelectedTeamIds([]);
    } catch (e) {
      onShowModal?.('Error', e.response?.data?.message || 'Failed to assign teams');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedJudgeId || selectedTeamIds.length === 0) {
      onShowModal?.('Error', 'Select a judge and at least one team');
      return;
    }
    try {
      setSaving(true);
      await userAPI.removeTeamsFromJudge({ judgeId: selectedJudgeId, teamIds: selectedTeamIds });
      onShowModal?.('Success', 'Teams removed from judge successfully');
      setSelectedTeamIds([]);
    } catch (e) {
      onShowModal?.('Error', e.response?.data?.message || 'Failed to remove teams');
    } finally {
      setSaving(false);
    }
  };

  const filteredTeams = teams.filter((t) =>
    !filter ? true : t.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Judge Team Assignment</h2>
  
      {/* Judge Selection & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Select Judge */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">
            Select Judge
          </label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800 focus:bg-white focus:border-blue-500 focus:ring focus:ring-blue-200"
            value={selectedJudgeId}
            onChange={(e) => setSelectedJudgeId(e.target.value)}
          >
            <option value="">Choose a judge…</option>
            {judges.map((j) => (
              <option key={j._id} value={j._id}>
                {j.name} ({j.email})
              </option>
            ))}
          </select>
        </div>
  
        {/* Filter Teams */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-800">
            Filter Teams
          </label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Search team by name…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>
  
      {/* Team List */}
      <div className="border border-gray-300 rounded p-4 max-h-96 overflow-y-auto bg-white shadow-sm">
        {filteredTeams.length === 0 ? (
          <div className="text-gray-500">No teams found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTeams.map((team) => (
              <label
                key={team._id}
                className="flex items-center p-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedTeamIds.includes(team._id)}
                  onChange={() => toggleTeam(team._id)}
                  className="mr-3 accent-blue-600"
                />
                <div>
                  <div className="font-semibold text-gray-900">{team.name}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
  
      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={saving}
          onClick={assign}
        >
          {saving ? "Assigning…" : "Assign Selected to Judge"}
        </button>
      
      </div>
    </div>
  );
};

export default JudgeAssignmentTab;



