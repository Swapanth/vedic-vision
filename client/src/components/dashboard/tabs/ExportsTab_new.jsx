import React from 'react';

const ExportsTab = ({ onExportData }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Exports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onExportData('attendance')}
          className="bg-[#272757] hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="font-medium">Export Attendance</div>
          <div className="text-sm opacity-90">Download attendance records as CSV</div>
        </button>
        <button
          onClick={() => onExportData('scores')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
        >
          <div className="text-2xl mb-2">🏆</div>
          <div className="font-medium">Export Scores</div>
          <div className="text-sm opacity-90">Download final scores as CSV</div>
        </button>
      </div>
    </div>
  );
};

export default ExportsTab;
