import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../common-components/LoadingSpinner';
import ErrorMessage from '../../common-components/ErrorMessage';
import EmptyState from '../../common-components/EmptyState';
import { decryptString } from '../../services/decrypt';
import { fetchEncryptionKeys } from '../../services/apiClient';

const YearlyView = ({ yearlyData, searchQuery, loading, error, months }) => {
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);
  const [keyError, setKeyError] = useState(null);

  // Fetch encryption keys
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        console.log('YearlyView - Starting to fetch encryption keys...');
        const keys = await fetchEncryptionKeys();
        console.log('YearlyView - Keys fetched:', keys);
        if (keys?.aesKey && keys?.aesIV) {
          setAesKey(keys.aesKey);
          setAesIV(keys.aesIV);
        } else {
          throw new Error('Invalid keys structure');
        }
      } catch (err) {
        console.error('YearlyView - Failed to fetch encryption keys:', err);
        setKeyError(err.message);
      }
    };
    fetchKeys();
  }, []);

  // Helper function to decrypt names safely
  const getDecryptedName = (encryptedName, rowIndex) => {
    if (!encryptedName) {
      console.log(`YearlyView - No name for row ${rowIndex}`);
      return 'Unnamed';
    }
    if (!aesKey || !aesIV || keyError) {
      console.log(`YearlyView - Using encrypted name for row ${rowIndex} due to missing keys or error:`, keyError);
      return encryptedName;
    }
    try {
      const decrypted = (decryptString(encryptedName, aesKey, aesIV) || 'Unnamed').replace(' (Quadrant Technologies)', '');
      console.log(`YearlyView - Decrypted name for row ${rowIndex}:`, decrypted);
      return decrypted;
    } catch (err) {
      console.error(`YearlyView - Decryption failed for row ${rowIndex}:`, err);
      return encryptedName;
    }
  };

  // Cache decrypted names
  const decryptedNames = useMemo(() => {
    if (!yearlyData || !Array.isArray(yearlyData)) {
      console.log('YearlyView - yearlyData is invalid or empty:', yearlyData);
      return [];
    }
    return yearlyData.map((row, idx) => ({
      ...row,
      decryptedName: getDecryptedName(row.name || '', idx),
    }));
  }, [yearlyData, aesKey, aesIV, keyError]);

  // Memoized filtered data
  const filteredYearlyData = useMemo(() => {
    if (!decryptedNames) return [];
    const filtered = decryptedNames.filter((row, idx) => {
      const matches = !searchQuery || row.decryptedName.toLowerCase().includes(searchQuery.toLowerCase());
      console.log(`YearlyView - Row ${idx}:`, { name: row.decryptedName, matches, searchQuery });
      return matches;
    });
    console.log('YearlyView - filteredYearlyData:', filtered);
    return filtered;
  }, [decryptedNames, searchQuery]);

  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const calculateMonthlyTotals = useMemo(() => {
    if (!yearlyData.length) return {};
    return months.reduce((acc, _, idx) => {
      const key = months[idx].toLowerCase().trim().slice(0, 3);
      const total = yearlyData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
      return { ...acc, [key]: total };
    }, {});
  }, [yearlyData, months]);

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
      ) : filteredYearlyData.length === 0 ? (
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
              <tr className="bg-gradient-to-r from-violet-600 to-violet-700 text-white">
                <th className="sticky left-0 bg-gradient-to-r from-violet-600 to-violet-700 py-4 px-6 text-left font-semibold z-20 min-w-[150px] shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                  Name
                </th>
                {months.map(m => (
                  <th
                    key={m}
                    className="text-center py-4 px-3 font-semibold min-w-[70px] text-sm"
                  >
                    {m.slice(0, 3)}
                  </th>
                ))}
                <th className="text-center py-4 px-4 font-semibold bg-violet-800 min-w-[80px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <motion.tr
                className="bg-gradient-to-r from-violet-50 to-violet-100 border-b-2 border-violet-200 font-semibold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <td className="sticky left-0 bg-gradient-to-r from-violet-50 to-violet-100 py-4 px-6 font-bold text-violet-700 z-20 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                  Total Working Hours
                </td>
                {monthKeys.map(mk => (
                  <td
                    key={mk}
                    className="text-center py-4 px-3 font-bold text-violet-600"
                  >
                    {calculateMonthlyTotals[mk] || 0}
                  </td>
                ))}
                <td className="text-center py-4 px-4 font-bold text-violet-700 bg-violet-100">
                  {Object.values(calculateMonthlyTotals).reduce((sum, v) => sum + v, 0)}
                </td>
              </motion.tr>
              {filteredYearlyData.map((row, idx) => {
                const total = monthKeys.reduce((sum, mk) => sum + (Number(row[mk]) || 0), 0);
                return (
                  <motion.tr
                    key={row.uid || row.name + idx}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-violet-25'} hover:bg-violet-50 transition-colors`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <td className="sticky left-0 bg-inherit py-4 px-6 font-medium text-gray-900 z-20 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                      {row.decryptedName}
                    </td>
                    {monthKeys.map(mk => (
                      <td
                        key={mk}
                        className="text-center py-4 px-3 text-gray-700 font-medium"
                      >
                        {row[mk] || 0}
                      </td>
                    ))}
                    <td className="text-center py-4 px-4 font-bold text-violet-600 bg-violet-50">
                      {total}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default YearlyView;