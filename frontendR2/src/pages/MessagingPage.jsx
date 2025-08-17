import React, { useState } from 'react';
import MessageList from '../components/messaging/MessageList';
import MessageChat from '../components/messaging/MessageChat';
import UserList from '../components/messaging/UserList';

const MessagingPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(false);
    const token= localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSelectConversation = (conversationId, user) => {
    setSelectedConversation(conversationId);
    setSelectedUser(user);
    setShowUserList(false);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedConversation([user._id, user._id].sort().join('_'));
    setShowUserList(false);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r ${showUserList ? 'hidden md:block' : 'block'}`}>
        <div className="p-3 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Messages</h2>
          <button
            onClick={() => setShowUserList(true)}
            className="md:hidden text-blue-500 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <MessageList onSelectConversation={handleSelectConversation} />
      </div>

      {/* User List (Mobile) */}
      {showUserList && (
        <div className="w-full md:w-80 border-r md:hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Nouveau message</h2>
            <button
              onClick={() => setShowUserList(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <UserList onSelectUser={handleSelectUser} />
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Sélectionnez une conversation</h3>
              <p className="mt-1 text-gray-500">Ou commencez une nouvelle discussion</p>
              <button
                onClick={() => setShowUserList(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Nouveau message
              </button>
            </div>
          </div>
        ) : (
          <MessageChat 
            conversationId={selectedConversation} 
            receiver={selectedUser} 
          />
        )}
      </div>

      {/* User List (Desktop) */}
      <div className={`w-80 border-l hidden md:block ${showUserList ? 'block' : 'hidden'}`}>
        <div className="p-3 border-b">
          <h2 className="text-xl font-semibold">Nouveau message</h2>
        </div>
        <UserList onSelectUser={handleSelectUser} />
      </div>
    </div>
  );
};

export default MessagingPage;