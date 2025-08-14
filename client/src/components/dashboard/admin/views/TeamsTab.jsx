import React, { useState, useEffect } from 'react';
import { teamAPI, userAPI, problemAPI } from '../../../../services/api';
import LoadingSpinner from '../../../common/LoadingSpinner';

const TeamsTab = ({ onShowModal }) => {
  const [teams, setTeams] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTeams, setSelectedTeams] = useState([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      
      // Load problem statements first
      const problemsResponse = await problemAPI.getAll();
      const problems = problemsResponse.data?.problems || problemsResponse.data?.data?.problems || [];
      setProblemStatements(problems);
      
      // Create a map for quick lookup
      const problemsMap = problems.reduce((acc, problem) => {
        acc[problem._id] = problem.title;
        return acc;
      }, {});
      
      const response = await teamAPI.getAllTeams();
      const teamsData = response.data.data.teams || [];
      
      // Enrich teams with additional details
      const enrichedTeams = teamsData.map((team) => {
        // Get problem statement title instead of ID
        let problemStatementTitle = 'Not selected';
        if (team.problemStatement) {
          if (typeof team.problemStatement === 'object' && team.problemStatement.title) {
            // Problem statement is already populated with full object
            problemStatementTitle = team.problemStatement.title;
          } else if (typeof team.problemStatement === 'string') {
            // Problem statement is just an ID, look it up
            problemStatementTitle = problemsMap[team.problemStatement] || team.problemStatement;
          }
        }
        
        // Transform members to extract user data
        const transformedMembers = team.members?.map(member => {
          if (member.user) {
            // Member has nested user object
            return {
              ...member.user,
              role: member.role,
              joinedAt: member.joinedAt
            };
          }
          // Member is already in the correct format
          return member;
        }) || [];
        
        return {
          ...team,
          memberCount: transformedMembers.length,
          problemStatement: problemStatementTitle,
          problemStatementId: typeof team.problemStatement === 'object' ? team.problemStatement._id : team.problemStatement,
          members: transformedMembers
        };
      });
      
      setTeams(enrichedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      onShowModal?.('Error', 'Failed to load teams data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeams.length === filteredTeams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(filteredTeams.map(team => team._id));
    }
  };

  const exportToPDF = async () => {
    try {
      const teamsToExport = selectedTeams.length > 0 
        ? teams.filter(team => selectedTeams.includes(team._id))
        : filteredTeams;

      // Create PDF content
      const pdfContent = generatePDFContent(teamsToExport);
      
      // For now, we'll create a simple HTML version that can be printed as PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.print();
      
      onShowModal?.('Success', 'PDF export initiated. Please use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      onShowModal?.('Error', 'Failed to export to PDF');
    }
  };

  const exportToExcel = async () => {
    try {
      const teamsToExport = selectedTeams.length > 0 
        ? teams.filter(team => selectedTeams.includes(team._id))
        : filteredTeams;

      const csvContent = generateCSVContent(teamsToExport);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `teams_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onShowModal?.('Success', 'Teams data exported to CSV successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      onShowModal?.('Error', 'Failed to export to Excel');
    }
  };

  const generatePDFContent = (teamsData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Teams Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .stat-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .team-members { font-size: 0.9em; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hackathon Teams Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h3>${teamsData.length}</h3>
            <p>Total Teams</p>
          </div>
          <div class="stat-card">
            <h3>${teamsData.reduce((sum, team) => sum + team.memberCount, 0)}</h3>
            <p>Total Participants</p>
          </div>
          <div class="stat-card">
            <h3>${(teamsData.reduce((sum, team) => sum + team.memberCount, 0) / teamsData.length || 0).toFixed(1)}</h3>
            <p>Avg Team Size</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Members</th>
              <th>Problem Statement</th>
              <th>Created Date</th>
              <th>Team Members</th>
            </tr>
          </thead>
          <tbody>
            ${teamsData.map(team => `
              <tr>
                <td><strong>${team.name || 'Unnamed Team'}</strong></td>
                <td>${team.memberCount}</td>
                <td>${team.problemStatement}</td>
                <td>${new Date(team.createdAt).toLocaleDateString()}</td>
                <td class="team-members">
                  ${team.members?.map(member => member.name || member.email).join(', ') || 'No members'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const generateCSVContent = (teamsData) => {
    const headers = ['Team Name', 'Member Count', 'Problem Statement', 'Created Date', 'Team Leader', 'Members'];
    const rows = teamsData.map(team => [
      team.name || 'Unnamed Team',
      team.memberCount,
      team.problemStatement,
      new Date(team.createdAt).toLocaleDateString(),
      team.leader?.name || team.leader?.email || 'No leader',
      team.members?.map(member => member.name || member.email).join('; ') || 'No members'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  };

  const filteredTeams = teams.filter(team => {
    const searchLower = searchTerm.toLowerCase();
    return (
      team.name?.toLowerCase().includes(searchLower) ||
      team.problemStatement?.toLowerCase().includes(searchLower) ||
      team.members?.some(member => 
        member.name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower)
      )
    );
  });

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'memberCount') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else if (sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams Management</h2>
          <p className="text-gray-600">Manage and view all hackathon teams</p>
        </div>
        <button
          onClick={loadTeams}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-3xl font-bold text-gray-900">{teams.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-3xl font-bold text-gray-900">{teams.reduce((sum, team) => sum + team.memberCount, 0)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Team Size</p>
              <p className="text-3xl font-bold text-gray-900">
                {teams.length > 0 ? (teams.reduce((sum, team) => sum + team.memberCount, 0) / teams.length).toFixed(1) : 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Teams with PS</p>
              <p className="text-3xl font-bold text-gray-900">
                {teams.filter(team => team.problemStatement && team.problemStatement !== 'Not selected').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search teams, problem statements, or members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        {selectedTeams.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {selectedTeams.length} team(s) selected for export
            </p>
          </div>
        )}
      </div>

      {/* Teams Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Team Name
                    {sortBy === 'name' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('memberCount')}
                >
                  <div className="flex items-center gap-1">
                    Members
                    {sortBy === 'memberCount' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem Statement</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortBy === 'createdAt' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Members</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTeams.map((team) => (
                <tr key={team._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team._id)}
                      onChange={() => handleSelectTeam(team._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {team.name || 'Unnamed Team'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {team._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {team.problemStatement}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {team.members && team.members.length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {team.members.map((member, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-gray-600">
                                  {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700 truncate">
                                {member.name || member.email}
                              </span>
                              {member.role === 'leader' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Leader
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No members</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedTeams.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No teams have been created yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsTab;