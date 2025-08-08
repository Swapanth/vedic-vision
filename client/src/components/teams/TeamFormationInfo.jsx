import React, { useEffect, useState } from 'react';
import { configAPI } from '../../services/api';


const TeamFormationInfo = ({ children }) => {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await configAPI.getConfig();
        if (isMounted) setEnabled(res.data.teamFormationEnabled);
      } catch {}
    };
    fetchConfig();
    const interval = setInterval(fetchConfig, 5000); // Poll every 5 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!enabled) {
    return <div className="p-4 bg-yellow-100 rounded text-yellow-800 font-semibold text-center">Team formation will be available soon.</div>;
  }
  return <>{children}</>;
};

export default TeamFormationInfo;
