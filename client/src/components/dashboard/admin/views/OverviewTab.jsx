import React, { useState, useEffect } from 'react';
import { userAPI, teamAPI, attendanceAPI } from '../../../../services/api';
import AdminOverviewControls from './AdminOverviewControls';

const OverviewTab = ({ users, tasks, attendance, mentors }) => {
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [teamStats, setTeamStats] = useState({ totalTeams: 0, participantsInTeams: 0, participantsWithoutTeams: 0 });
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);

      // Get all participants
      const participantsRes = await userAPI.getAllParticipants();
      const allParticipants = participantsRes.data.data.users || [];
      setTotalParticipants(allParticipants.length);

      // Get team statistics
      const teamsRes = await teamAPI.getAllTeams();
      const allTeams = teamsRes.data.data.teams || [];

      let participantsInTeams = 0;
      allTeams.forEach(team => {
        if (team.members && team.members.length > 0) {
          participantsInTeams += team.members.length;
        }
      });

      setTeamStats({
        totalTeams: allTeams.length,
        participantsInTeams,
        participantsWithoutTeams: allParticipants.length - participantsInTeams
      });

      // Get attendance statistics for 12 days
      const attendanceRes = await attendanceAPI.getAttendanceStats();
      if (attendanceRes.data.data) {
        setAttendanceStats(attendanceRes.data.data);
      } else {
        // Fallback: calculate day-wise attendance from raw data
        calculateDayWiseAttendance(attendance, allParticipants.length);
      }

    } catch (error) {
      console.error('Error loading overview data:', error);
      // Fallback calculations
      setTotalParticipants(users.length);
      calculateDayWiseAttendance(attendance, users.length);
    } finally {
      setLoading(false);
    }
  };

  const calculateDayWiseAttendance = (attendanceData, totalParticipants) => {
    const dayWiseStats = [];

    for (let day = 1; day <= 12; day++) {
      const dayAttendance = attendanceData.filter(a => {
        const attendanceDate = new Date(a.date);
        const dayNumber = Math.ceil((attendanceDate - new Date('2025-01-01')) / (1000 * 60 * 60 * 24)) + 1;
        return dayNumber === day;
      });

      dayWiseStats.push({
        day: `Day ${day}`,
        present: dayAttendance.length,
        absent: totalParticipants - dayAttendance.length,
        date: new Date(new Date('2025-01-01').getTime() + (day - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }

    setAttendanceStats(dayWiseStats);
  };

  const todayAttendance = attendance.filter(a =>
    new Date(a.date).toDateString() === new Date().toDateString()
  ).length;

  const activeTasks = tasks.filter(t => t.isActive).length;
  const activeMentors = mentors ? mentors.filter(m => m.isActive).length : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hackathon Overview</h2>
        <p className="text-gray-600">Complete dashboard statistics and controls</p>
      </div>

      <AdminOverviewControls />

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-3xl font-bold text-gray-900">{totalParticipants}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{activeTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Mentors</p>
              <p className="text-3xl font-bold text-gray-900">{activeMentors}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
              <p className="text-3xl font-bold text-gray-900">{todayAttendance}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Formation Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{teamStats.totalTeams}</div>
            <div className="text-sm text-gray-600">Total Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{teamStats.participantsInTeams}</div>
            <div className="text-sm text-gray-600">Participants in Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{teamStats.participantsWithoutTeams}</div>
            <div className="text-sm text-gray-600">Participants without Teams</div>
          </div>
        </div>
      </div>

      {/* Day-wise Attendance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Day-wise Attendance (12 Days)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(attendanceStats) && attendanceStats.map((stat, index) => {
                const attendanceRate = totalParticipants > 0 ? ((stat.present / totalParticipants) * 100).toFixed(1) : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.day}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{stat.present}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{stat.absent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{attendanceRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!Array.isArray(attendanceStats) || attendanceStats.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No attendance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab; 