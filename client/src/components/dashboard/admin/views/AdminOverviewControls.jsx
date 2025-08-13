
import React, { useEffect, useState } from 'react';
import { configAPI, problemAPI } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';

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
  const { isSuperadmin, isAdmin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    configAPI.getConfig().then(res => setConfig(res.data));
  }, []);

  const handleToggle = async (key) => {
    setError('');
    try {
      const updatedValue = !config[key];
      await configAPI.updateConfig({ [key]: updatedValue });
      const res = await configAPI.getConfig();
      setConfig(res.data);
    } catch (err) {
      setError('You do not have permission to toggle this setting.');
    }
  };

  const canToggle = isSuperadmin || isAdmin;

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
        <div title={canToggle ? '' : 'Only admin or superadmin can toggle voting.'}>
          <ToggleSwitch
            checked={config.votingEnabled}
            onChange={canToggle ? () => handleToggle('votingEnabled') : undefined}
            label="Voting"
            enabledMsg="Enabled: Voting is open"
            disabledMsg="Disabled: Voting is closed"
          />
        </div>
      </div>
      {error && <div className="text-red-600 font-medium mt-2">{error}</div>}
    </div>
  );
};

export default AdminOverviewControls;
