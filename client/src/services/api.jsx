import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Для форм с файлами 
export const apiForm = axios.create({
  baseURL: 'http://localhost:5000/api',
});

apiForm.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'multipart/form-data';
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getUser = () => api.get('/auth/user');
export const getItems = () => api.get('/items');
export const createItem = (data) => apiForm.post('/items', data); 
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const getMessages = (itemId) => api.get(`/messages/${itemId}`);
export const sendMessage = (data) => api.post('/messages', data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const deleteItemAdmin = (id) => api.delete(`/admin/items/${id}`);
export const getCategories = () => api.get('/categories'); 
export const getUnreadMessagesCount = () => api.get('/messages/unread/count');

export default api;