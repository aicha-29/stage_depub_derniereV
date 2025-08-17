import React, { useState } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useMessaging } from '../../context/MessagingContext';
import './ConversationList.css';

const ConversationList = ({ conversations, onSelectConversation }) => {
  const { deleteConversation } = useMessaging();
  const BASE_URL = "http://localhost:5001";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (userId, e) => {
    e.stopPropagation();
    setDeletingId(userId);
    try {
      await deleteConversation(userId);
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="conversation-list">
      {conversations.map(conv => {
        if (!conv.user || !conv.lastMessage) {
          console.warn('Conversation data malformed:', conv);
          return null;
        }

        return (
          <div 
            key={`conv-${conv.user._id}-${conv.lastMessage._id}`}
            className="conversation-item"
            onClick={() => conv.user._id && onSelectConversation(conv.user._id)}
          >
            <img 
              src={
                conv.user.profilePhoto 
                  ? `${BASE_URL}/public/${conv.user.profilePhoto}`
                  : '/default-avatar.png'
              } 
              alt={conv.user.name}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = '/default-avatar.png';
              }}
            />
            
            <div className="conversation-info">
              <div className="conversation-header">
                <h4>{conv.user.name || 'Unknown User'}</h4>
                {conv.lastMessage?.createdAt && (
                  <span className="message-time">
                    {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                  </span>
                )}
              </div>
              
              {conv.lastMessage?.content && (
                <p className="message-preview">
                  {conv.lastMessage.content.substring(0, 50)}
                  {conv.lastMessage.content.length > 50 ? '...' : ''}
                </p>
              )}
              
              <div className="conversation-footer">
                {conv.user.role && (
                  <span className="user-role">{conv.user.role}</span>
                )}
                {conv.user.position && (
                  <span className="user-position">{conv.user.position}</span>
                )}
                {conv.unreadCount > 0 && (
                  <span className="unread-count">{conv.unreadCount}</span>
                )}
              </div>
            </div>
            
            <div className="conversation-actions">
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(showDeleteConfirm === conv.user._id ? null : conv.user._id);
                }}
                disabled={deletingId === conv.user._id}
              >
                {deletingId === conv.user._id ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-trash"></i>
                )}
              </button>
              
              {showDeleteConfirm === conv.user._id && (
                <div 
                  className="delete-confirm" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <p>Supprimer cette conversation ?</p>
                  <div className="confirm-buttons">
                    <button 
                      className="confirm-yes"
                      onClick={(e) => handleDelete(conv.user._id, e)}
                    >
                      Oui
                    </button>
                    <button 
                      className="confirm-no"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Non
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        profilePhoto: PropTypes.string,
        role: PropTypes.string,
        position: PropTypes.string
      }).isRequired,
      lastMessage: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string,
        createdAt: PropTypes.string
      }).isRequired,
      unreadCount: PropTypes.number
    })
  ).isRequired,
  onSelectConversation: PropTypes.func.isRequired
};

export default ConversationList;