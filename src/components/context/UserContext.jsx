// UserContext.jsx - Enhanced version
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchEncryptionKeys, fetchUsers } from '../services/apiClient';
import { decryptUser } from '../services/decrypt';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch encryption keys
        const { aesKey, aesIV } = await fetchEncryptionKeys();
        //console.log(aesKey+" "+aesIV)
        // Fetch users
        const encryptedUsers = await fetchUsers();
        
        // Decrypt users
        const decryptedUsers = encryptedUsers.map(user => 
          decryptUser(user, aesKey, aesIV)
        );
        
        setUsers(decryptedUsers);
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Failed to load users or keys');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const contextValue = {
    users,
    setUsers,
    loading,
    error,
    refreshUsers: () => {
      // Allow manual refresh if needed
      setLoading(true);
      loadUsers();
    }
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export default UserContext;


