import React, { useEffect, useState } from 'react';
import axios from 'axios';

const columns = [
  { label: 'Team Name', key: 'teamName' },
  { label: 'Judge Name', key: 'judgeName' },
  { label: 'Round 1 Rating', key: 'round1Rating' },
  { label: 'Round 1 Description', key: 'round1Description' },
  { label: 'Round 2 Rating', key: 'round2Rating' },
  { label: 'Round 2 Description', key: 'round2Description' },
  { label: 'Round 3 Rating', key: 'round3Rating' },
  { label: 'Round 3 Description', key: 'round3Description' },
];

function processEvaluations(evaluations) {
  // Group by team+judge
  const map = {};
  evaluations.forEach(e => {
    const teamName = e.teamId?.name || '';
    const judgeName = e.judgeId?.name || '';
    const key = `${teamName}||${judgeName}`;
    if (!map[key]) {
      map[key] = {
        teamName,
        judgeName,
        round1Rating: '',
        round1Description: '',
        round2Rating: '',
        round2Description: '',
        round3Rating: '',
        round3Description: '',
      };
    }
    if (e.round === 1) {
      map[key].round1Rating = e.score ?? '';
      map[key].round1Description = e.description ?? '';
    } else if (e.round === 2) {
      map[key].round2Rating = e.score ?? '';
      map[key].round2Description = e.description ?? '';
    } else if (e.round === 3) {
      map[key].round3Rating = e.score ?? '';
      map[key].round3Description = e.description ?? '';
    }
  });
  return Object.values(map);
}

const ViewResults = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvals = async () => {
      try {
        setLoading(true);
        // Update this endpoint if a new one is created
        const res = await axios.get('/api/evaluations/all');
        setEvaluations(res.data.data || []);
        setRows(processEvaluations(res.data.data || []));
      } catch (err) {
        setError('Failed to fetch evaluations.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvals();
  }, []);

  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',');
    const csvRows = rows.map(row =>
      columns.map(col => '"' + String(row[col.key] ?? '').replace(/"/g, '""') + '"').join(',')
    );
    const csv = [headers, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hackathon_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem', background: '#fff', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Hackathon Results</h2>
      <button onClick={exportToCSV} style={{ marginBottom: '1rem', padding: '0.5rem 1.2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
        Export Results
      </button>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f3f4f6', zIndex: 1 }}>
              <tr>
                {columns.map(col => (
                  <th key={col.key} style={{ padding: '0.75rem', borderBottom: '2px solid #e5e7eb', textAlign: 'left', fontWeight: 'bold', background: '#f3f4f6', position: 'sticky', top: 0 }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>No results found.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '0.7rem', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{row[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewResults;
