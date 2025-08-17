import React from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useMessaging } from '../../context/MessagingContext';
import './MessageList.css';

const MessageList = ({ messages, currentUserId }) => {
  const { markMessageAsRead } = useMessaging();
  const BASE_URL = "http://localhost:5001";

  const handleMessageClick = async (message) => {
    if (message.sender._id !== currentUserId && !message.read) {
      await markMessageAsRead(message._id);
    }
  };

  return (
    <div className="message-list">
      {messages.map(message => (
        <div 
          key={message._id} 
          className={`message ${message.sender._id === currentUserId ? 'sent' : 'received'} ${message.read ? 'read' : 'unread'}`}
          onClick={() => handleMessageClick(message)}
        >
          <div className="message-content">
            {message.content}
          </div>
          <div className="message-meta">
            <span className="message-time">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
            {message.sender._id !== currentUserId && !message.read && (
              <span className="read-indicator">●</span>
            )}
            {message.sender._id === currentUserId && (
              <span className="read-status">
                {message.read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      sender: PropTypes.shape({
        _id: PropTypes.string.isRequired,
      }).isRequired,
      recipient: PropTypes.shape({
        _id: PropTypes.string.isRequired,
      }).isRequired,
      read: PropTypes.bool.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ).isRequired,
  currentUserId: PropTypes.string.isRequired
};

export default MessageList;