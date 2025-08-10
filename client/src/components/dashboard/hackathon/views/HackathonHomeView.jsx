import React from 'react';
import { Users, UserCheck, BookOpen, Trophy, ArrowRight, Calendar, Clock } from 'lucide-react';

function HackathonHomeView({ themeColors, dashboardData, setActiveTab, showSuccessModal, loadDashboardData }) {
  const { user, team, mentor, problemStatements, availableTeams, stats } = dashboardData;

  const quickStats = [
    {
      title: 'Team Status',
      value: team ? 'Joined' : 'Not Joined',
      icon: Users,
      color: team ? 'text-green-600' : 'text-orange-600',
      bgColor: team ? 'bg-green-50' : 'bg-orange-50',
      description: team ? `${team.name} (${team.memberCount}/${team.maxMembers} members)` : 'Join or create a team'
    },
    {
      title: 'Mentor',
      value: mentor ? 'Assigned' : 'Not Assigned',
      icon: UserCheck,
      color: mentor ? 'text-blue-600' : 'text-gray-600',
      bgColor: mentor ? 'bg-blue-50' : 'bg-gray-50',
      description: mentor ? mentor.name : 'Mentor will be assigned soon'
    },
    {
      title: 'Problem Statements',
      value: problemStatements.length,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Available challenges'
    },
    {
      title: 'Available Teams',
      value: availableTeams.length,
      icon: Trophy,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Teams you can join'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text }}>
              Welcome to the Hackathon! 🚀
            </h2>
            <p style={{ color: themeColors.textSecondary }}>
              Focus on collaboration, innovation, and problem-solving. No tasks or leaderboards here - just pure creativity!
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-xl p-6 border transition-all hover:shadow-lg"
              style={{
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.border
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${stat.bgColor}`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: themeColors.text }}>
                {stat.value}
              </h3>
              <p className="text-sm font-medium mb-2" style={{ color: themeColors.textSecondary }}>
                {stat.title}
              </p>
              <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Section */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Your Team
            </h3>
            <button
              onClick={() => setActiveTab('teams')}
              className="flex items-center space-x-2 text-sm font-medium transition-colors"
              style={{ color: themeColors.accent }}
            >
              <span>Manage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {team ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold" style={{ color: themeColors.text }}>
                  {team.name}
                </h4>
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: themeColors.blueBg,
                    color: themeColors.accent
                  }}
                >
                  {team.memberCount}/{team.maxMembers} members
                </span>
              </div>
              
              {team.problemStatement && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.hover }}>
                  <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                    Problem: {team.problemStatement.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                    {team.problemStatement.category}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium" style={{ color: themeColors.text }}>Team Members:</p>
                {team.members?.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                        {member.user.name}
                        {member.role === 'leader' && (
                          <span className="ml-2 text-xs text-yellow-600">👑 Leader</span>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                        {member.user.participantType === 'hackathon' ? 'Hackathon' : 'Bootcamp'} Participant
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.textSecondary }} />
              <p className="text-lg font-medium mb-2" style={{ color: themeColors.text }}>
                No Team Yet
              </p>
              <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                Join an existing team or create your own to get started
              </p>
              <button
                onClick={() => setActiveTab('teams')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Teams
              </button>
            </div>
          )}
        </div>

        {/* Mentor Section */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Your Mentor
            </h3>
            <button
              onClick={() => setActiveTab('mentors')}
              className="flex items-center space-x-2 text-sm font-medium transition-colors"
              style={{ color: themeColors.accent }}
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {mentor ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {mentor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: themeColors.text }}>
                    {mentor.name}
                  </h4>
                  <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                    {mentor.email}
                  </p>
                </div>
              </div>

              {mentor.description && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.hover }}>
                  <p className="text-sm" style={{ color: themeColors.text }}>
                    {mentor.description}
                  </p>
                </div>
              )}

              {mentor.skills && mentor.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: themeColors.blueBg,
                          color: themeColors.accent
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.textSecondary }} />
              <p className="text-lg font-medium mb-2" style={{ color: themeColors.text }}>
                No Mentor Assigned
              </p>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                A mentor will be assigned to guide you through the hackathon
              </p>
            </div>
          )}
        </div>
      </div>

    
    </div>
  );
}

export default HackathonHomeView;