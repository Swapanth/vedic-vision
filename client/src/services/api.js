import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login attempt
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  registerAdmin: (adminData) => api.post('/auth/register-admin', adminData),
};

// Task API
export const taskAPI = {
  getAllTasks: (params) => api.get('/tasks', { params }),
  getActiveTasks: () => api.get('/tasks/active'),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  toggleTaskStatus: (id) => api.patch(`/tasks/${id}/toggle-status`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getTaskSubmissions: (id) => api.get(`/tasks/${id}/submissions`),
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (data) => api.post('/attendance', data),
  markAttendanceForUsers: (data) => api.post('/attendance/mark-for-users', data),
  getMyAttendance: (params) => api.get('/attendance/my-attendance', { params }),
  canMarkAttendance: () => api.get('/attendance/can-mark'),
  getAllAttendance: (params) => api.get('/attendance', { params }),
  getTodayAttendance: () => api.get('/attendance/today'),
  getAttendanceStats: () => api.get('/attendance/stats'),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
};

// Submission API
export const submissionAPI = {
  submitTask: (taskId, formData) => {
    return api.post('/submissions', formData);
  },
  getMySubmissions: (params) => api.get('/submissions/my-submissions', { params }),
  getAllSubmissions: (params) => api.get('/submissions', { params }),
  getPendingSubmissions: () => api.get('/submissions/pending'),
  getSubmissionById: (id) => api.get(`/submissions/${id}`),
  gradeSubmission: (id, data) => api.post(`/submissions/${id}/grade`, data),
  updateGrade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  deleteSubmission: (id) => api.delete(`/submissions/${id}`),
};

// Announcement API
export const announcementAPI = {
  getAllAnnouncements: (params) => api.get('/announcements', { params }),
  getActiveAnnouncements: () => api.get('/announcements/active'),
  getAnnouncementById: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (announcementData) => api.post('/announcements', announcementData),
  updateAnnouncement: (id, announcementData) => api.put(`/announcements/${id}`, announcementData),
  toggleAnnouncementStatus: (id) => api.patch(`/announcements/${id}/toggle-status`),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
  getUnreadCount: () => api.get('/announcements/unread-count'),
  markAsRead: (id) => api.post(`/announcements/${id}/mark-read`),
  getReadStatistics: (id) => api.get(`/announcements/${id}/read-stats`),
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  getMyMentor: () => api.get('/users/my-mentor'),
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
  // Mentor assignment methods
  assignParticipantsToMentor: (data) => api.post('/users/assign-participants', data),
  removeParticipantsFromMentor: (data) => api.post('/users/remove-participants', data),
  getAllMentorsWithParticipants: () => api.get('/users/mentors'),
  getMentorParticipants: () => api.get('/users/my-participants'),
  // Helper method to get all participants (handles pagination internally)
  getAllParticipants: async () => {
    let allParticipants = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await api.get('/users', { 
        params: { 
          role: 'participant', 
          limit: 100, 
          page: page 
        } 
      });
      
      const participants = response.data.data.users || [];
      allParticipants = [...allParticipants, ...participants];
      
      const pagination = response.data.data.pagination;
      hasMore = pagination && pagination.hasNextPage;
      page++;
    }
    
    return { data: { data: { users: allParticipants } } };
  },
};

// Export API
export const exportAPI = {
  exportAttendance: (params) => api.get('/export/attendance', { params }),
  exportSubmissions: (params) => api.get('/export/submissions', { params }),
  exportScores: (params) => api.get('/export/scores', { params }),
};

// Team API
export const teamAPI = {
  getAllTeams: (params) => api.get('/teams', { params }),
  getTeamById: (id) => api.get(`/teams/${id}`),
  getMyTeam: () => api.get('/teams/my-team'),
  getAvailableUsers: (params) => api.get('/teams/available-users', { params }),
  createTeam: (teamData) => api.post('/teams', teamData),
  updateTeam: (id, teamData) => api.put(`/teams/${id}`, teamData),
  joinTeam: (id) => api.post(`/teams/${id}/join`),
  leaveTeam: (id) => api.post(`/teams/${id}/leave`),
  removeMember: (id, memberId) => api.delete(`/teams/${id}/members/${memberId}`),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
};

// Vote API
export const voteAPI = {
  getAllTeamsWithRatings: (params) => api.get('/votes/teams-with-ratings', { params }),
  submitVote: (teamId, voteData) => api.post(`/votes/teams/${teamId}/vote`, voteData),
  getTeamVotes: (teamId) => api.get(`/votes/teams/${teamId}/votes`),
  checkUserVote: (teamId) => api.get(`/votes/teams/${teamId}/check-vote`),
  getUserVotingHistory: () => api.get('/votes/my-votes'),
  updateVote: (teamId, voteData) => api.put(`/votes/teams/${teamId}/vote`, voteData),
  deleteVote: (teamId) => api.delete(`/votes/teams/${teamId}/vote`),
};

export default api; 