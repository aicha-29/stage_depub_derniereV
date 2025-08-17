// components/messaging/UserList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserList.css'

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = "http://localhost:5001";
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/messages/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <div 
          key={user._id} 
          className="user-item"
          onClick={() => onSelectUser(user)}
        >
          <img 
            src={`${BASE_URL}/public/`+user.profilePhoto || '../../assets/images/default-avatar.png'} 
            alt={user.name}
          />
          <div className="user-info">
            <h4>{user.name}</h4>
            <p>{user.position} ({user.role})</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;