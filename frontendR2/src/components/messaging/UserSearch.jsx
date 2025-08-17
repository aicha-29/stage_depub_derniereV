import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './UserSearch.css';

const UserSearch = ({ onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const token = localStorage.getItem('token');
  const BASE_URL = "http://localhost:5001";

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const res = await axios.get(`${BASE_URL}/api/messages/search-users`, {
        params: { query },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setResults(res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search users');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setQuery('');
  };

  return (
    <div className="user-search">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Recherche par nom , role ..."
        />
        <button onClick={handleSearch} className="search-button">
          <FaSearch />
        </button>
        {(results.length > 0 || query) && (
          <button onClick={handleClearResults} className="clear-button">
            <FaTimes />
          </button>
        )}
      </div>
      
      {isSearching && <div className="search-loading">Searching...</div>}
      
      {results.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <span>Search Results</span>
            <button onClick={handleClearResults} className="close-results">
              Close
            </button>
          </div>
          {results.map(user => (
            <div 
              key={user._id} 
              className="search-result-item"
              onClick={() => onSelectUser(user._id)}
            >
              <img 
                src={user.profilePhoto ? `${BASE_URL}/public/${user.profilePhoto}` : '/default-avatar.png'} 
                alt={user.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>{user.position} ({user.role})</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;