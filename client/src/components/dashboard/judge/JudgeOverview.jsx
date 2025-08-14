import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { evaluationAPI } from '../../../services/api';

const StatusIcon = ({ done }) => (
  <span className={done ? 'text-green-600' : 'text-yellow-600'}>
    {done ? '✅' : '⏳'}
  </span>
);

const JudgeOverview = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await evaluationAPI.getTeamEvaluationOverview();
        setTeams(res.data.data || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Judge Overview</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem Statement</th>
              <th className="px-6 py-3">Round 1</th>
              <th className="px-6 py-3">Round 2</th>
              <th className="px-6 py-3">Round 3</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.map((t) => (
              <tr key={t.teamId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{t.teamName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t.problemStatement}</td>
                <td className="px-6 py-4 text-center"><StatusIcon done={t.rounds.round1} /></td>
                <td className="px-6 py-4 text-center"><StatusIcon done={t.rounds.round2} /></td>
                <td className="px-6 py-4 text-center"><StatusIcon done={t.rounds.round3} /></td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => navigate(`/judge/evaluate/${t.teamId}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Evaluate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JudgeOverview;

