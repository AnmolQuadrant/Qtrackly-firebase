// import React from 'react';
// import { useState,useEffect } from 'react';
// import { motion } from 'framer-motion';
// import LoadingSpinner from '../../common-components/LoadingSpinner';
// import ErrorMessage from '../../common-components/ErrorMessage';
// import EmptyState from '../../common-components/EmptyState';
//  import { decryptString } from '../../services/decrypt';
//  import { fetchEncryptionKeys } from '../../services/apiClient';
// const WeeklyView = ({ weeklyData, searchQuery, loading, error }) => {
//   const filteredWeeklyData = weeklyData.filter(row =>
//     !searchQuery || row.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );
//   const [aesKey, setAesKey] = useState(null);
//   const [aesIV, setAesIV] = useState(null);
//   const [keyError, setKeyError] = useState(null);
  
//   // Updated fetchData function
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         console.log('Starting to fetch encryption keys...');
        
//         // Fetch encryption keys first
//         try {
//           const keys = await fetchEncryptionKeys();
//           console.log('Keys fetched:', keys);
          
//           if (keys && keys.aesKey && keys.aesIV) {
//             setAesKey(keys.aesKey);
//             setAesIV(keys.aesIV);
//           } else {
//             throw new Error('Invalid keys structure');
//           }
//         } catch (keyError) {
//           console.error('Failed to fetch encryption keys:', keyError);
//           setKeyError(keyError.message);
//           // You can still continue with the rest of the data fetching
//           // or return early if keys are critical
//         }
      
//       } catch (error) {
//         console.error('Error in fetchData:', error);
 
//       }
//     };
  
//     fetchData();
//   }, []); 
//   return (
//     <motion.div
//       className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
//       initial={{ opacity: 0, scale: 0.98 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       {loading ? (
//         <LoadingSpinner />
//       ) : error ? (
//         <ErrorMessage message={error} />
//       ) : filteredWeeklyData.length === 0 ? (
//         <EmptyState />
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200">
//                 <th className="sticky left-0 bg-gradient-to-r from-violet-50 to-violet-100 py-4 px-6 text-left font-semibold text-violet-800 z-10">Name</th>
//                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total'].map(day => (
//                   <th key={day} className="text-center py-4 px-4 font-semibold text-violet-800">{day}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredWeeklyData.map((row, idx) => (
//                 <motion.tr
//                   key={row.name + idx}
//                   className={`${idx % 2 === 0 ? 'bg-white' : 'bg-violet-25'} hover:bg-violet-50 transition-colors`}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.3, delay: idx * 0.05 }}
//                 >
//                   <td className="sticky left-0 bg-inherit py-4 px-6 font-medium text-gray-900 z-0">{decryptString(row.name,aesKey,aesIV)}</td>
//                   {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(dayKey => (
//                     <td key={dayKey} className="text-center py-4 px-4">
//                       <motion.span
//                         className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${row[dayKey] > 0 ? 'bg-violet-600 text-white shadow-sm hover:bg-violet-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                       >
//                         {row[dayKey]}
//                       </motion.span>
//                     </td>
//                   ))}
//                   <td className="text-center py-4 px-4 font-bold text-violet-700 bg-violet-50">{row.total}</td>
//                 </motion.tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </motion.div>
//   );
// };
 
// export default WeeklyView;


import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../common-components/LoadingSpinner';
import ErrorMessage from '../../common-components/ErrorMessage';
import EmptyState from '../../common-components/EmptyState';
import { decryptString } from '../../services/decrypt';
import { fetchEncryptionKeys } from '../../services/apiClient';
 
const WeeklyView = ({ weeklyData, searchQuery, loading, error }) => {
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);
  const [keyError, setKeyError] = useState(null);
 
  // Fetch encryption keys
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        console.log('Starting to fetch encryption keys...');
        const keys = await fetchEncryptionKeys();
        console.log('Keys fetched:', keys);
        if (keys?.aesKey && keys?.aesIV) {
          setAesKey(keys.aesKey);
          setAesIV(keys.aesIV);
        } else {
          throw new Error('Invalid keys structure');
        }
      } catch (err) {
        console.error('Failed to fetch encryption keys:', err);
        setKeyError(err.message);
      }
    };
    fetchKeys();
  }, []);
 
  // Debug weeklyData and searchQuery
  useEffect(() => {
    console.log('WeeklyView - weeklyData:', weeklyData);
    console.log('WeeklyView - searchQuery:', searchQuery);
  }, [weeklyData, searchQuery]);
 
  // Helper function to decrypt names safely
  const getDecryptedName = (encryptedName, rowIndex) => {
    if (!encryptedName) {
      console.log(`No name for row ${rowIndex}`);
      return 'Unnamed';
    }
    if (!aesKey || !aesIV || keyError) {
      console.log(`Using encrypted name for row ${rowIndex} due to missing keys or error:`, keyError);
      return encryptedName;
    }
    try {
      const decrypted = decryptString(encryptedName, aesKey, aesIV) || 'Unnamed';
      console.log(`Decrypted name for row ${rowIndex}:`, decrypted);
      return decrypted;
    } catch (err) {
      console.error(`Decryption failed for row ${rowIndex}:`, err);
      return encryptedName;
    }
  };
 
  // Cache decrypted names
  const decryptedNames = useMemo(() => {
    if (!weeklyData || !Array.isArray(weeklyData)) {
      console.log('WeeklyView - weeklyData is invalid or empty:', weeklyData);
      return [];
    }
    return weeklyData.map((row, idx) => ({
      ...row,
      decryptedName: getDecryptedName(row.name || '', idx),
    }));
  }, [weeklyData, aesKey, aesIV, keyError]);
 
  // Memoized filtered data
  const filteredWeeklyData = useMemo(() => {
    if (!decryptedNames) return [];
    const filtered = decryptedNames.filter((row, idx) => {
      const matches = !searchQuery || row.decryptedName.toLowerCase().includes(searchQuery.toLowerCase());
      console.log(`WeeklyView - Row ${idx}:`, { name: row.decryptedName, matches, searchQuery });
      return matches;
    });
    console.log('WeeklyView - filteredWeeklyData:', filtered);
    return filtered;
  }, [decryptedNames, searchQuery]);
 
  // Helper function to format day values
  const formatDayValue = (value, dayKey) => {
    if ((dayKey === 'sat' || dayKey === 'sun') && value === 0) {
      return 'W';
    }
    return value || 0;
  };
 
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : keyError ? (
        <ErrorMessage message={`Failed to load user names: ${keyError}. Search may be limited.`} />
      ) : filteredWeeklyData.length === 0 ? (
        <EmptyState
          message={
            searchQuery
              ? `No users found matching "${searchQuery}"`
              : 'No data available for the selected period'
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200">
                <th className="sticky left-0 bg-gradient-to-r from-violet-50 to-violet-100 py-4 px-6 text-left font-semibold text-violet-800 z-10">
                  Name
                </th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total'].map(day => (
                  <th key={day} className="text-center py-4 px-4 font-semibold text-violet-800">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredWeeklyData.map((row, idx) => (
                <motion.tr
                  key={row.userId || row.name + idx}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-violet-25'} hover:bg-violet-50 transition-colors`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <td className="sticky left-0 bg-inherit py-4 px-6 font-medium text-gray-900 z-0">
                    {row.decryptedName}
                  </td>
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(dayKey => {
                    const displayValue = formatDayValue(row[dayKey], dayKey);
                    const isWeekend = dayKey === 'sat' || dayKey === 'sun';
                    const isZeroWeekend = isWeekend && row[dayKey] === 0;
 
                    return (
                      <td key={dayKey} className="text-center py-4 px-4">
                        <motion.span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                            isZeroWeekend
                              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                              : row[dayKey] > 0
                              ? 'bg-violet-600 text-white shadow-sm hover:bg-violet-700'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {displayValue}
                        </motion.span>
                      </td>
                    );
                  })}
                  <td className="text-center py-4 px-4 font-bold text-violet-700 bg-violet-50">
                    {row.total || 0}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
 
export default WeeklyView;
 