import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Mail, Phone, Star, Users, MessageCircle } from 'lucide-react';
import { hackathonAPI } from '../../../../services/api';

function HackathonMentorsView({ themeColors, assignedMentor, showSuccessModal }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadMentors();
  }, [currentPage, searchTerm]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response = await hackathonAPI.getMentors({
        page: currentPage,
        limit: 12,
        search: searchTerm
      });
      setMentors(response.data.data.mentors || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      console.error('Error loading mentors:', error);
      showSuccessModal('Error', 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadMentors();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
          Mentors
        </h2>
        <p style={{ color: themeColors.textSecondary }}>
          Connect with experienced mentors to guide you through the hackathon
        </p>
      </div>

      {/* Assigned Mentor */}
      {assignedMentor && (
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Your Assigned Mentor
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {assignedMentor.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold" style={{ color: themeColors.text }}>
                  {assignedMentor.name}
                </h4>
                <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: themeColors.textSecondary }}>
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{assignedMentor.email}</span>
                  </div>
                  {assignedMentor.mobile && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{assignedMentor.mobile}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              {assignedMentor.description && (
                <div className="mb-4">
                  <h5 className="font-medium mb-2" style={{ color: themeColors.text }}>
                    About
                  </h5>
                  <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                    {assignedMentor.description}
                  </p>
                </div>
              )}

              {assignedMentor.skills && assignedMentor.skills.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2" style={{ color: themeColors.text }}>
                    Skills & Expertise
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {assignedMentor.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-full"
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
          </div>

          <div className="mt-6 flex space-x-3">
            <a
              href={`mailto:${assignedMentor.email}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </a>
            {assignedMentor.mobile && (
              <a
                href={`tel:${assignedMentor.mobile}`}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search mentors by name, skills, or expertise..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* All Mentors */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
          All Mentors ({pagination.totalMentors || 0})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2" style={{ color: themeColors.textSecondary }}>Loading mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
          >
            <UserCheck className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.textSecondary }} />
            <p className="text-lg font-medium mb-2" style={{ color: themeColors.text }}>
              No mentors found
            </p>
            <p style={{ color: themeColors.textSecondary }}>
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className="rounded-xl p-6 border transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: themeColors.cardBg,
                    borderColor: themeColors.border
                  }}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {mentor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold" style={{ color: themeColors.text }}>
                        {mentor.name}
                      </h4>
                      <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                        {mentor.email}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Users className="w-3 h-3" style={{ color: themeColors.textSecondary }} />
                        <span className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {mentor.assignedParticipants} participants
                        </span>
                      </div>
                    </div>
                  </div>

                  {mentor.description && (
                    <p className="text-sm mb-4 line-clamp-3" style={{ color: themeColors.textSecondary }}>
                      {mentor.description}
                    </p>
                  )}

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {mentor.skills.slice(0, 3).map((skill, index) => (
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
                        {mentor.skills.length > 3 && (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: themeColors.hover,
                              color: themeColors.textSecondary
                            }}
                          >
                            +{mentor.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <a
                      href={`mailto:${mentor.email}`}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                    <button
                      className="flex items-center justify-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View Profile"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  style={{ borderColor: themeColors.border }}
                >
                  Previous
                </button>
                
                <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  style={{ borderColor: themeColors.border }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HackathonMentorsView;