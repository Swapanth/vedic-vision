import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationAPI } from '../../services/api';

const HackathonEvaluationPage = () => {
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const overviewRes = await evaluationAPI.getTeamEvaluationOverview();
        setOverview(overviewRes.data.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load teams or evaluations.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEvaluateTeam = (teamId) => {
    navigate(`/judge/evaluate/${teamId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading evaluation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-2 py-8">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            HACKATHON EVALUATION
          </h1>
          <p className="text-lg text-gray-600">
            Evaluate your assigned teams
          </p>
        </div>

        {overview.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No teams have been assigned to you for evaluation yet.
            </p>
            <button
              onClick={() => navigate('/judge/overview')}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Back to Overview
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-900">Team Name</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Round 1</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Round 2</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Round 3</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.map((team, index) => (
                    <tr key={team._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-semibold text-gray-900">{team.teamName}</td>
                      <td className="text-center py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          team.round1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {team.round1 ? `${team.round1}/10` : 'Pending'}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          team.round2 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {team.round2 ? `${team.round2}/10` : 'Pending'}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          team.round3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {team.round3 ? `${team.round3}/10` : 'Pending'}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <button
                          onClick={() => handleEvaluateTeam(team.teamId)}
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
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
        )}
        
        <div className="flex justify-center mt-8">
          <button
            className="px-12 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-extrabold text-xl shadow-lg hover:scale-105 hover:from-pink-600 hover:to-pink-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-200"
            onClick={() => navigate('/judge/overview')}
          >
            Back to Overview
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackathonEvaluationPage;
