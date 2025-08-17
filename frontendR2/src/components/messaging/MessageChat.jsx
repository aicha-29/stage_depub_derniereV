import React, { useState, useEffect } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import './MessageChat.css';
import axios from 'axios';
import MessageList from './MessageList';

const MessageChat = ({ receiver }) => {
  const { 
    messages, 
    setMessages, 
    socket, 
    setConversations,
    updateConversations,
    markMessageAsRead
  } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE_URL = "http://localhost:5001";
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

//   useEffect(() => {
//     if (receiver) {
//       const fetchMessages = async () => {
//         try {
//           setLoading(true);
//           const res = await axios.get(
//             `${BASE_URL}/api/messages/conversation/${receiver._id}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//           setMessages(res.data);
//         } catch (error) {
//           console.error('Error fetching messages:', error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchMessages();
//     }
//   }, [receiver, setMessages, token]);

useEffect(() => {
  if (receiver) {
    const fetchMessagesAndMarkAsRead = async () => {
      try {
        setLoading(true);
        
        // 1. Récupérer les messages
        const res = await axios.get(
          `${BASE_URL}/api/messages/conversation/${receiver._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // 2. Transformer les recipients si nécessaire
        const processedMessages = res.data.map(msg => ({
          ...msg,
          recipient: typeof msg.recipient === 'string' 
            ? { _id: msg.recipient }
            : msg.recipient
        }));
        
        setMessages(processedMessages);
        
        // 3. Marquer TOUS les messages comme lus
        await axios.put(
          `${BASE_URL}/api/messages/mark-as-read/${receiver._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // 4. Mettre à jour l'état local
        setMessages(prev => 
          prev.map(msg => 
            msg.recipient._id === user._id ? { ...msg, read: true } : msg
          )
        );
        
        // Cette mise à jour déclenchera automatiquement la mise à jour des conversations
        // via le socket ou le contexte
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessagesAndMarkAsRead();
  }
}, [receiver, setMessages, token, user._id]);
  useEffect(() => {
    const handleNewMessage = (message) => {
      if ((message.sender._id === receiver?._id && message.recipient._id === user._id) ||
          (message.sender._id === user._id && message.recipient._id === receiver?._id)) {
        setMessages(prev => [...prev, message]);
        updateConversations(message);
      }
    };

    if (socket && receiver) {
      socket.on('newMessage', handleNewMessage);
    }

    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
      }
    };
  }, [socket, receiver, user, setMessages, updateConversations]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !receiver) return;

    try {
      const message = {
        recipientId: receiver._id,
        content: newMessage
      };

      const response = await axios.post(`${BASE_URL}/api/messages`, message, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Optimistic update
      setMessages(prev => [...prev, response.data]);
      updateConversations(response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="message-chat">
      <div className="chat-header">
        <div className="header-user-info">
          <img 
            src={receiver?.profilePhoto && receiver.profilePhoto !== 'default-avatar.png'
            ? `${BASE_URL}/uploads/${receiver.profilePhoto}`
            : defaultPhoto} 
            alt={receiver?.name}
            onError={(e) => {
            e.target.onerror = null; 
            e.target.src = defaultPhoto;
            }}
                />
          <div>
            <h3>{receiver?.name}</h3>
            <p>{receiver?.position} ({receiver?.role})</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <MessageList messages={messages} currentUserId={user._id} />
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez un message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

export default MessageChat;