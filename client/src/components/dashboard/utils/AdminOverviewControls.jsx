
import React, { useEffect, useState } from 'react';
import { configAPI, problemAPI } from '../../../services/api';

const ToggleSwitch = ({ checked, onChange, label, enabledMsg, disabledMsg }) => (
  <div className="flex items-center gap-2">
    <span className="font-semibold text-gray-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
    </label>
    <span className={checked ? 'text-green-600 font-medium ml-2' : 'text-yellow-600 font-medium ml-2'}>
      {checked ? enabledMsg : disabledMsg}
    </span>
  </div>
);

const AdminOverviewControls = () => {
  const [config, setConfig] = useState({ teamFormationEnabled: true, votingEnabled: false });
  const [problems, setProblems] = useState([]);
  const [showProblems, setShowProblems] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [problemForm, setProblemForm] = useState({ title: '', description: '' });

  useEffect(() => {
    configAPI.getConfig().then(res => setConfig(res.data));
    problemAPI.getAll().then(res => setProblems(res.data));
  }, []);

  const handleToggle = async (key) => {
    const updated = { ...config, [key]: !config[key] };
    await configAPI.updateConfig({ [key]: updated[key] });
    setConfig(updated);
  };

  const handleShowProblems = () => setShowProblems(!showProblems);

  const handleEdit = (problem) => {
    setEditingProblem(problem._id);
    setProblemForm({ title: problem.title, description: problem.description });
  };

  const handleFormChange = (e) => {
    setProblemForm({ ...problemForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editingProblem) {
      await problemAPI.update(editingProblem, problemForm);
    } else {
      await problemAPI.create(problemForm);
    }
    setEditingProblem(null);
    setProblemForm({ title: '', description: '' });
    setProblems((await problemAPI.getAll()).data);
  };

  return (
    <div className="my-8">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <ToggleSwitch
          checked={config.teamFormationEnabled}
          onChange={() => handleToggle('teamFormationEnabled')}
          label="Team Formation"
          enabledMsg="Enabled: Participants can create/join teams"
          disabledMsg="Disabled: Team formation will be available soon"
        />
        <ToggleSwitch
          checked={config.votingEnabled}
          onChange={() => handleToggle('votingEnabled')}
          label="Voting"
          enabledMsg="Enabled: Voting is open"
          disabledMsg="Disabled: Voting is closed"
        />
        <button className="ml-0 md:ml-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-all" onClick={handleShowProblems}>
          {showProblems ? 'Hide Problem Statements' : 'Show Problem Statements'}
        </button>
      </div>
      {showProblems && (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-800">Problem Statements</h3>
            <span className="text-sm text-gray-500">{problems.length} total</span>
          </div>
          <div className="space-y-4 mb-6">
            {problems.map(p => (
              <div key={p._id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 border border-gray-200 rounded p-4">
                <div>
                  <div className="font-semibold text-gray-900 text-base">{p.title}</div>
                  <div className="text-gray-700 text-sm mt-1">{p.description}</div>
                </div>
                <button className="mt-2 md:mt-0 px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded shadow" onClick={() => handleEdit(p)}>Edit</button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <input className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/4" name="title" placeholder="Title" value={problemForm.title} onChange={handleFormChange} />
              <input className="border border-gray-300 rounded px-3 py-2 w-full md:w-2/4" name="description" placeholder="Description" value={problemForm.description} onChange={handleFormChange} />
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow" onClick={handleSave}>
                {editingProblem ? 'Update' : 'Add'}
              </button>
              {editingProblem && <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded shadow" onClick={() => { setEditingProblem(null); setProblemForm({ title: '', description: '' }); }}>Cancel</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverviewControls;
