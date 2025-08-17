// components/messaging/MessagingPanel.js
import React, { useState, useEffect } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import axios from 'axios';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import UserList from './UserList';
import UserSearch from './UserSearch';
import { toast } from 'react-toastify';
import './MessagingPanel.css';

const MessagingPanel = () => {
  const { 
    conversations, 
    activeConversation, 
    messages, 
    setActiveConversation, 
    setMessages,
    setConversations,
    socket
  } = useMessaging();
  
  const BASE_URL = "http://localhost:5001";
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/messages/conversations`, getAuthHeaders());
        setConversations(res.data);
      } catch (error) {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleSelectConversation = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/messages/conversation/${userId}`, getAuthHeaders());
      setMessages(res.data);
      
      await axios.put(`${BASE_URL}/api/messages/mark-as-read/${userId}`, {}, getAuthHeaders());
      
      const conv = conversations.find(c => c.user._id === userId);
      setActiveConversation(conv?.user || null);
      setShowUserList(false);
    } catch (error) {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      const message = {
        recipientId: activeConversation._id,
        content: newMessage
      };
      
      await axios.post(`${BASE_URL}/api/messages`, message, getAuthHeaders());
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSelectUser = (user) => {
    setActiveConversation(user);
    setMessages([]);
    setShowUserList(false);
  };

  return (
    <div className="messaging-panel">
      <div className="conversation-sidebar">
        <UserSearch onSelectUser={handleSelectConversation} />
        <button 
          className="new-conversation-btn"
          onClick={() => setShowUserList(!showUserList)}
        >
          {showUserList ? 'Voir les conversations' : 'Nouvelle conversation'}
        </button>
        
        {showUserList ? (
          <UserList onSelectUser={handleSelectUser} />
        ) : (
          <ConversationList 
            conversations={conversations} 
            onSelectConversation={handleSelectConversation}
          />
        )}
      </div>
      
      <div className="message-area">
        {activeConversation ? (
          <>
            <div className="message-header">
  <div className="header-user-info">
    <img 
      src={activeConversation?.profilePhoto && activeConversation.profilePhoto !== 'default-avatar.png'
        ? `${BASE_URL}/public/${activeConversation.profilePhoto}`
        : '../../assets/images/default-avatar.png'} 
      alt={activeConversation?.name}
      className="chat-user-avatar"
      onError={(e) => {
        e.target.onerror = null; 
        e.target.src = '/default-avatar.png';
      }}
    />
    <div className="header-user-details">
      <h3>{activeConversation?.name}</h3>
      <span>{activeConversation?.position} ({activeConversation?.role})</span>
    </div>
  </div>
</div>
            <MessageList messages={messages} currentUserId={user._id} />
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="ecrire un message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="select-conversation">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPanel;