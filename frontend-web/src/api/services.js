import client from './client';

// Auth endpoints
export const authAPI = {
  register: (username, email, password) =>
    client.post('/auth/register', { username, email, password }),
  login: (usernameOrEmail, password) =>
    client.post('/auth/login', { usernameOrEmail, password }),
  getCurrentUser: () =>
    client.get('/auth/me'),
  logout: () =>
    client.post('/auth/logout')
};

// Video endpoints
export const videoAPI = {
  createVideo: (data) =>
    client.post('/videos', data),
  getVideo: (videoId) =>
    client.get(`/videos/${videoId}`),
  listVideos: (page = 0, size = 10, sortBy = 'createdAt') =>
    client.get('/videos', { params: { page, size, sortBy } }),
  updateVideo: (videoId, data) =>
    client.put(`/videos/${videoId}`, data),
  deleteVideo: (videoId) =>
    client.delete(`/videos/${videoId}`),
  attachUpload: (videoId, uploadId) =>
    client.post(`/videos/${videoId}/attach-upload`, { uploadId })
};

// Upload endpoints
export const uploadAPI = {
  uploadVideo: (file, videoId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (videoId) {
      formData.append('videoId', videoId);
    }
    return client.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Streaming endpoint helper - the video element will request ranges automatically
const STREAM_BASE_URL = import.meta.env.VITE_STREAM_BASE_URL || (function() {
  try {
    return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '') + '/stream';
  } catch (e) {
    return 'http://localhost:8086/stream';
  }
})();

export const streamingAPI = {
  getStreamUrl: (videoId) => `${STREAM_BASE_URL}/${videoId}`
};

