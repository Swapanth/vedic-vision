import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
  >
    {children}
  </button>
);

const JudgeEvaluate = () => {
  const { teamId } = useParams();
  const [activeRound, setActiveRound] = useState(1);
  const [team, setTeam] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadTeam = async () => {
    try {
      const res = await api.get(`/teams/${teamId}`);
      setTeam((res.data?.data && res.data.data.team) || res.data?.team || null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load team');
    }
  };

  const loadEvaluation = async (round) => {
    try {
      setMessage('');
      setError('');
      const res = await api.get(`/judge/evaluations/${teamId}/${round}`);
      const data = res.data.data;
      if (data) {
        setScore(data.score);
        setFeedback(data.feedback || '');
      } else {
        setScore('');
        setFeedback('');
      }
    } catch (e) {
      setScore('');
      setFeedback('');
      if (e.response?.status === 403) {
        setError('You are not allowed to evaluate this team');
      } else {
        setError(e.response?.data?.message || 'Failed to load evaluation');
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadTeam();
      await loadEvaluation(activeRound);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const switchRound = async (round) => {
    setActiveRound(round);
    await loadEvaluation(round);
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage('');
      setError('');
      const numericScore = Number(score);
      await api.post(`/judge/evaluations/${teamId}/${activeRound}`, { score: numericScore, feedback });
      setMessage('Saved successfully');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Link to="/judge/overview" className="text-blue-600 hover:underline">← Back to Overview</Link>
      </div>
      <h1 className="text-2xl font-bold mb-1">Evaluate Team</h1>
      {team && (
        <div className="text-gray-700 mb-4">
          <div className="font-semibold">{team.name}</div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <TabButton active={activeRound === 1} onClick={() => switchRound(1)}>Round 1</TabButton>
        <TabButton active={activeRound === 2} onClick={() => switchRound(2)}>Round 2</TabButton>
        <TabButton active={activeRound === 3} onClick={() => switchRound(3)}>Round 3</TabButton>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {message && <div className="mb-4 text-green-600">{message}</div>}

      <div className="space-y-4 bg-white p-4 rounded-md border">
        <div>
          <label className="block text-sm font-medium mb-1">Score (1–10)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-32 border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border rounded-md px-3 py-2 h-32"
          />
        </div>
        <div>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgeEvaluate;

