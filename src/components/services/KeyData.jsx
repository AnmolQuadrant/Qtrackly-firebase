

// Keys.jsx - Simplified version (no longer manages users)
import React from 'react';
import { useUsers } from '../context/UserContext';

const Keys = () => {
  const { users, loading, error } = useUsers();

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>User List</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.userId}>
              <p>ID: {user.userId}</p>
              <p>Name: {user.name || 'Decryption failed'}</p>
              <p>Email: {user.email || 'Decryption failed'}</p>
              <p>Roles: {user.roles?.join(', ') || 'None'}</p>
              <p>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
              <p>Created At: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Keys;