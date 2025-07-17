// import React, { useState, useEffect } from 'react';
// import { fetchEncryptionKeys, fetchUsers } from './apiClient';
// import { decryptUser } from './decrypt';
// import UserContext from '../context/UserContext';
// import DependencyRequestForm from '../TaskModuleComponents/UserComponents/DependencyRequestsForm';

// const Keys = () => {
//   const [users, setUsers] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {

//     const loadData = async () => {
//       try {
//        //await console.log(fetchEncryptionKeys());
//         // Fetch encryption keys
//         const { aesKey,aesIV} = await fetchEncryptionKeys();

       
//         // Fetch users
//         const encryptedUsers = await fetchUsers();
        
//         // Decrypt users
//         const decryptedUsers = encryptedUsers.map(user => {
//           //console.log(AESKey+" "+AESIV);
//           return decryptUser(user, aesKey, aesIV)
//         }
//         );
//         //console.log(decryptedUsers);
//         setUsers(decryptedUsers);
//         //console.log(users);
//       } catch (err) {
//         setError('Failed to load users or keys');
//         //console.error(err);
//       }
//     };

//     loadData();
//   }, []);

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     // <div>
//     //   <h2>User List</h2>
//     //   {users.length === 0 ? (
//     //     <p>Loading...</p>
//     //   ) : (
        
//     //     <ul>
//     //       {
//     //       users.map(user => (
//     //         <li key={user.userId}>
//     //           <p>ID: {user.userId}</p>
//     //           <p>Name: {user.name || 'Decryption failed'}</p>
//     //           <p>Email: {user.email || 'Decryption failed'}</p>
//     //           <p>Roles: {user.roles.join(', ') || 'None'}</p>
//     //           <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>
//     //           <p>Created At: {new Date(user.createdAt).toLocaleString()}</p>
//     //         </li>
//     //       ))}
//     //     </ul>
//     //   )}
//     // </div>
//     <UserContext.Provider value={{ users, setUsers }}>
//       <DependencyRequestForm />
//     </UserContext.Provider>
//   );
// };


// export default Keys;

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