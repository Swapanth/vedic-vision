import React from 'react';
import { Navigate } from 'react-router-dom';

const HackathonEvaluationPage = () => {
  // Redirect to the judge overview page
  return <Navigate to="/judge/overview" replace />;
};

export default HackathonEvaluationPage;
