import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationAPI } from '../../../services/api';

const JudgeOverviewPage = () => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-2 py-8">
      <div className="w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 bg-white/70 backdrop-blur-md p-0 sm:p-10 relative overflow-hidden">
        <div className="w-full h-32 bg-white/80 border-b border-gray-100 rounded-t-3xl flex flex-col justify-center items-center shadow-md">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2 mt-4">Judge Team Evaluation Overview</h1>
          <p className="text-gray-500 text-lg font-medium mb-2">All teams & your round completion status</p>
        </div>
        <div className="p-4 sm:p-8">
          {loading ? (
            <div className="text-center text-pink-400 py-10 text-xl font-semibold animate-pulse">Loading…</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10 text-lg font-bold">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2 mb-10">
                <thead>
                  <tr>
                    <th className="py-4 px-6 text-left text-gray-700 text-lg font-bold bg-white/90 rounded-l-xl">Team Name</th>
                    <th className="py-4 px-6 text-center text-gray-700 text-lg font-bold bg-white/90">Round 1</th>
                    <th className="py-4 px-6 text-center text-gray-700 text-lg font-bold bg-white/90">Round 2</th>
                    <th className="py-4 px-6 text-center text-gray-700 text-lg font-bold bg-white/90 rounded-r-xl">Round 3</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.map(item => (
                    <tr key={item.teamId} className="hover:bg-gray-50 hover:scale-[1.01] hover:shadow-lg transition-transform duration-200">
                      <td className="py-4 px-6 bg-white/95 rounded-l-xl font-semibold text-gray-900 text-lg border-y border-gray-100 shadow-sm">{item.teamName}</td>
                      {['round1', 'round2', 'round3'].map(roundKey => (
                        <td key={roundKey} className="py-4 px-6 bg-white/95 text-center border-y border-gray-100 shadow-sm">
                          {item.rounds && item.rounds[roundKey] ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-base font-semibold shadow-sm animate-fade-in">✅ Completed</span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 text-base font-semibold shadow-sm animate-fade-in">⏳ Pending</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-center mt-8">
            <button
              className="px-12 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-extrabold text-xl shadow-lg hover:scale-105 hover:from-pink-600 hover:to-pink-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-200"
              onClick={() => navigate('/evaluation/judge')}
            >
              Go to Evaluation Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeOverviewPage;

