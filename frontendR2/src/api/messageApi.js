import axios from 'axios';
import { getAuthHeader } from './authApi';

export const getConversations = async () => {
  const response = await axios.get('/api/messages/conversations', {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await axios.get(`/api/messages/conversations/${conversationId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const sendMessage = async (receiverId, content) => {
  const response = await axios.post('/api/messages/send', {
    receiverId,
    content
  }, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getUsersForMessaging = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.position) params.append('position', filters.position);

  const response = await axios.get(`/api/messages/users?${params.toString()}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get('/api/messages/unread-count', {
    headers: getAuthHeader()
  });
  return response.data.count;
};