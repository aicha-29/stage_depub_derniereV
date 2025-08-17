import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = "http://localhost:5001";

const MessagingContext = createContext();


export const MessagingProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const userId=user?._id;
  const updateConversations = (newMessage) => {
    setConversations(prev => {
      const otherUserId = newMessage.sender._id === user._id 
        ? newMessage.recipient._id 
        : newMessage.sender._id;
      
      const existingConvIndex = prev.findIndex(c => c.user._id === otherUserId);
      
      if (existingConvIndex >= 0) {
        const updated = [...prev];
        updated[existingConvIndex] = {
          ...updated[existingConvIndex],
          lastMessage: newMessage,
          unreadCount: newMessage.sender._id !== user._id && !newMessage.read
            ? (updated[existingConvIndex].unreadCount || 0) + 1
            : updated[existingConvIndex].unreadCount
        };
        
        return updated.sort((a, b) => 
          new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
      } else {
        const otherUser = newMessage.sender._id === user._id 
          ? newMessage.recipient
          : newMessage.sender;
        
        return [
          {
            user: {
              _id: otherUser._id,
              name: otherUser.name,
              role: otherUser.role,
              position: otherUser.position,
              profilePhoto: otherUser.profilePhoto
            },
            lastMessage: newMessage,
            unreadCount: newMessage.sender._id !== user._id && !newMessage.read ? 1 : 0
          },
          ...prev
        ];
      }
    });

    // Update unread count
    if (newMessage.recipient._id === user._id && !newMessage.read) {
      setUnreadCount(prev => prev + 1);
    }
  };
const deleteConversation = async (userId) => {
  try {
    await axios.delete(`${BASE_URL}/api/messages/conversation/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Mise à jour optimiste
    setConversations(prev => prev.filter(conv => conv.user._id !== userId));
    
    if (activeConversation?._id === userId) {
      setActiveConversation(null);
      setMessages([]);
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    toast.error('Failed to delete conversation');
  }
};

const markMessageAsRead = async (messageId) => {
  if (!socket || !messageId) return;
  
  try {
    const response = await axios.put(
      `${BASE_URL}/api/messages/mark-single-read/${messageId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updatedMessage = response.data;

    // Mise à jour optimiste
    setMessages(prev => 
      prev.map(msg => 
        msg._id === messageId ? { ...msg, read: true } : msg
      )
    );
    
    // Ne pas émettre de socket ici pour éviter les doublons
    // Le serveur s'en charge déjà
  } catch (error) {
    console.error('Error marking message as read:', error);
    toast.error('Failed to mark message as read');
  }
};
useEffect(() => {
  // Recalculer unreadCount à partir des conversations
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0
  );
  setUnreadCount(totalUnread);
}, [conversations]);

  useEffect(() => {
    if (user && token) {
      const socketInstance = getSocket(token, user._id);
      setSocket(socketInstance);

       const conversationDeletedHandler = ({ userId }) => {
      setConversations(prev => prev.filter(conv => conv.user._id !== userId));
      
      if (activeConversation?._id === userId) {
        setActiveConversation(null);
        setMessages([]);
      }
    };

      const messageHandler = (message) => {
        if (activeConversation && 
            (message.sender._id === activeConversation._id || 
             message.recipient._id === activeConversation._id)) {
          setMessages(prev => [...prev, message]);
        }
        
        updateConversations(message);
         if(userId==message.recipient._id)
          toast.info('nouvel message');
      };

      const messagesMarkedAsReadHandler = ({ senderId, messages }) => {
      // Mettre à jour les messages
      setMessages(prev => 
        prev.map(msg => 
          msg.sender._id === senderId ? { ...msg, read: true } : msg
        )
      );
      
      // Mettre à jour les conversations
      setConversations(prev => 
        prev.map(conv => {
          if (conv.user._id === senderId) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                read: true
              },
              unreadCount: 0
            };
          }
          return conv;
        })
      );
    };

   const messageReadHandler = (updatedMessage) => {
  // Ne pas appeler markMessageAsRead ici pour éviter les boucles
  setMessages(prev => 
    prev.map(msg => 
      msg._id === updatedMessage._id ? updatedMessage : msg
    )
  );
  
  setConversations(prev => 
    prev.map(conv => {
      if (conv.user._id === updatedMessage.sender._id) {
        const newUnreadCount = updatedMessage.read 
          ? Math.max(0, (conv.unreadCount || 0) - 1)
          : conv.unreadCount;
        
        return {
          ...conv,
          lastMessage: updatedMessage,
          unreadCount: newUnreadCount
        };
      }
      return conv;
    })
  );
  
  if (updatedMessage.recipient._id === user._id && updatedMessage.read) {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }
};
      socketInstance.on('conversationDeleted', conversationDeletedHandler);
      socketInstance.on('newMessage', messageHandler);
      socketInstance.on('messageRead', messageReadHandler);
      socketInstance.on('messagesMarkedAsRead', messagesMarkedAsReadHandler);

      return () => {
            socketInstance.off('conversationDeleted', conversationDeletedHandler);
          socketInstance.off('messagesMarkedAsRead', messagesMarkedAsReadHandler);
        socketInstance.off('newMessage', messageHandler);
        socketInstance.off('messageRead', messageReadHandler);
      };
    }
  }, [user, token, activeConversation]);

  const startNewConversation = (user) => {
    setActiveConversation(user);
    setMessages([]);
  };

  return (
    <MessagingContext.Provider value={{
      deleteConversation,
      conversations,
      activeConversation,
      messages,
      unreadCount,
      socket,
      setActiveConversation,
      setMessages,
      setConversations,
      setUnreadCount,
      startNewConversation,
      updateConversations,
      markMessageAsRead
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => useContext(MessagingContext);