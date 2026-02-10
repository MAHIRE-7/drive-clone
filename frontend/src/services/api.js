import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile')
};

export const files = {
  upload: (formData) => API.post('/files/upload', formData),
  getAll: (folderId) => API.get('/files', { params: { folderId } }),
  download: (id) => API.get(`/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => API.delete(`/files/${id}`),
  share: (id, email) => API.post(`/files/${id}/share`, { email }),
  getShared: () => API.get('/files/shared')
};

export const folders = {
  create: (data) => API.post('/folders', data),
  getAll: (parentId) => API.get('/folders', { params: { parentId } }),
  delete: (id) => API.delete(`/folders/${id}`)
};
