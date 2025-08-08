import React, { useState, useEffect } from 'react';
import { userAPI } from '../../../services/api';
import LoadingSpinner from '../../common/LoadingSpinner';

const MentorAssignmentTab = ({ onShowModal }) => {
  const [mentors, setMentors] = useState([]);
  const [unassignedParticipants, setUnassignedParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  useEffect(() => {
    loadAssignmentData();
  }, []);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      const [mentorsRes, participantsRes] = await Promise.all([
        userAPI.getAllMentorsWithParticipants(),
        userAPI.getAllParticipants()
      ]);

      const mentorsData = mentorsRes.data.data.mentors || [];
      const allParticipants = participantsRes.data.data.users || [];
      
      // Find unassigned participants
      const assignedParticipantIds = new Set();
      mentorsData.forEach(mentor => {
        mentor.assignedParticipants.forEach(participant => {
          assignedParticipantIds.add(participant._id);
        });
      });

      const unassigned = allParticipants.filter(participant => 
        !assignedParticipantIds.has(participant._id)
      );

      setMentors(mentorsData);
      setUnassignedParticipants(unassigned);
    } catch (error) {
      console.error('Error loading assignment data:', error);
      onShowModal?.('Error', 'Failed to load mentor assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignParticipants = async () => {
    if (!selectedMentor || selectedParticipants.length === 0) {
      onShowModal?.('Error', 'Please select a mentor and at least one participant');
      return;
    }

    try {
      setAssignmentLoading(true);
      await userAPI.assignParticipantsToMentor({
        mentorId: selectedMentor._id,
        participantIds: selectedParticipants
      });

      onShowModal?.('Success', `Successfully assigned ${selectedParticipants.length} participants to ${selectedMentor.name}`);
      setShowAssignmentModal(false);
      setSelectedMentor(null);
      setSelectedParticipants([]);
      loadAssignmentData();
    } catch (error) {
      console.error('Error assigning participants:', error);
      onShowModal?.('Error', 'Failed to assign participants: ' + (error.response?.data?.message || error.message));
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleRemoveParticipant = async (mentorId, participantId, participantName) => {
    if (window.confirm(`Are you sure you want to remove ${participantName} from this mentor?`)) {
      try {
        await userAPI.removeParticipantsFromMentor({
          mentorId,
          participantIds: [participantId]
        });
        
        onShowModal?.('Success', `Successfully removed ${participantName} from mentor`);
        loadAssignmentData();
      } catch (error) {
        console.error('Error removing participant:', error);
        onShowModal?.('Error', 'Failed to remove participant: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleParticipantSelection = (participantId) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mentor Assignment</h2>
        {unassignedParticipants.length > 0 && (
          <button
            onClick={() => setShowAssignmentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Assign Participants
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{mentors.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentors.reduce((total, mentor) => total + mentor.assignedParticipants.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unassigned Participants</p>
              <p className="text-2xl font-bold text-gray-900">{unassignedParticipants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unassigned Participants Alert */}
      {unassignedParticipants.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Unassigned Participants
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>There are {unassignedParticipants.length} participants without assigned mentors.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentors with Assignments */}
      <div className="space-y-6">
        {mentors.map(mentor => (
          <div key={mentor._id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {mentor.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{mentor.name}</h3>
                    <p className="text-sm text-gray-500">{mentor.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {mentor.assignedParticipants.length} participants
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {mentor.assignedParticipants.length === 0 ? (
                <p className="text-gray-500 text-sm">No participants assigned yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mentor.assignedParticipants.map(participant => (
                    <div key={participant._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium text-sm">
                            {participant.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                          <p className="text-xs text-gray-500">{participant.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveParticipant(mentor._id, participant._id, participant.name)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove participant"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-3/4 overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Participants to Mentor</h3>
              
              {/* Mentor Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Mentor
                </label>
                <select
                  value={selectedMentor?._id || ''}
                  onChange={(e) => {
                    const mentor = mentors.find(m => m._id === e.target.value);
                    setSelectedMentor(mentor);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a mentor...</option>
                  {mentors.map(mentor => (
                    <option key={mentor._id} value={mentor._id}>
                      {mentor.name} ({mentor.assignedParticipants.length} assigned)
                    </option>
                  ))}
                </select>
              </div>

              {/* Participant Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Participants ({selectedParticipants.length} selected)
                </label>
                <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                  {unassignedParticipants.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No unassigned participants available
                    </div>
                  ) : (
                    <div className="p-2">
                      {unassignedParticipants.map(participant => (
                        <label key={participant._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(participant._id)}
                            onChange={() => handleParticipantSelection(participant._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">
                                {participant.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                              <p className="text-xs text-gray-500">{participant.email}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedMentor(null);
                    setSelectedParticipants([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignParticipants}
                  disabled={assignmentLoading || !selectedMentor || selectedParticipants.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {assignmentLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  Assign Participants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAssignmentTab;
