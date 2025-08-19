import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../common-components/LoadingSpinner';
import ErrorMessage from '../../common-components/ErrorMessage';
import EmptyState from '../../common-components/EmptyState';
import { getDaysInMonth } from './utils';
import { decryptString } from '../../services/decrypt';
import { fetchEncryptionKeys } from '../../services/apiClient';

const MonthlyView = ({
  monthlyData,
  searchQuery,
  loading,
  error,
  selectedYear,
  selectedMonth,
  monthlyViewPage,
  setMonthlyViewPage,
}) => {
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);
  const [keyError, setKeyError] = useState(null);

  // Fetch encryption keys
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        console.log('MonthlyView - Starting to fetch encryption keys...');
        const keys = await fetchEncryptionKeys();
        console.log('MonthlyView - Keys fetched:', keys);
        if (keys?.aesKey && keys?.aesIV) {
          setAesKey(keys.aesKey);
          setAesIV(keys.aesIV);
        } else {
          throw new Error('Invalid keys structure');
        }
      } catch (err) {
        console.error('MonthlyView - Failed to fetch encryption keys:', err);
        setKeyError(err.message);
      }
    };
    fetchKeys();
  }, []);

  // Helper function to decrypt names safely
  const getDecryptedName = (encryptedName, rowIndex) => {
    if (!encryptedName) {
      console.log(`MonthlyView - No name for row ${rowIndex}`);
      return 'Unnamed';
    }
    if (!aesKey || !aesIV || keyError) {
      console.log(`MonthlyView - Using encrypted name for row ${rowIndex} due to missing keys or error:`, keyError);
      return encryptedName;
    }
    try {
      const decrypted = (decryptString(encryptedName, aesKey, aesIV) || 'Unnamed').replace(' (Quadrant Technologies)', '');
      console.log(`MonthlyView - Decrypted name for row ${rowIndex}:`, decrypted);
      return decrypted;
    } catch (err) {
      console.error(`MonthlyView - Decryption failed for row ${rowIndex}:`, err);
      return encryptedName;
    }
  };

  // Cache decrypted names
  const decryptedNames = useMemo(() => {
    if (!monthlyData || !Array.isArray(monthlyData)) {
      console.log('MonthlyView - monthlyData is invalid or empty:', monthlyData);
      return [];
    }
    return monthlyData.map((row, idx) => ({
      ...row,
      decryptedName: getDecryptedName(row.name || '', idx),
    }));
  }, [monthlyData, aesKey, aesIV, keyError]);

  // Memoized filtered data
  const filteredMonthlyData = useMemo(() => {
    if (!decryptedNames) return [];
    const filtered = decryptedNames.filter((row, idx) => {
      const matches = !searchQuery || row.decryptedName.toLowerCase().includes(searchQuery.toLowerCase());
      console.log(`MonthlyView - Row ${idx}:`, { name: row.decryptedName, matches, searchQuery });
      return matches;
    });
    console.log('MonthlyView - filteredMonthlyData:', filtered);
    return filtered;
  }, [decryptedNames, searchQuery]);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysPerPage = 16;
  const totalPages = Math.ceil(daysInMonth / daysPerPage);
  const startDay = monthlyViewPage * daysPerPage + 1;
  const endDay = Math.min((monthlyViewPage + 1) * daysPerPage, daysInMonth);
  const daysToShow = Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);

  // Helper function to check if a day is weekend
  const isWeekend = (year, month, day) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  // Helper function to format day values
  const formatDayValue = (hours, year, month, day) => {
    if (hours === 0 && isWeekend(year, month, day)) {
      return 'W';
    }
    return hours;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-6 py-4 bg-gradient-to-r from-violet-600 to-violet-700 flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg">
          Days {startDay}-{endDay} of {daysInMonth}
        </h3>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setMonthlyViewPage(Math.max(0, monthlyViewPage - 1))}
            disabled={monthlyViewPage === 0}
            className="p-2 rounded-lg text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={18} />
          </motion.button>
          <span className="text-white text-sm font-medium px-3 py-1 bg-white/20 rounded-lg">
            {monthlyViewPage + 1} of {totalPages}
          </span>
          <motion.button
            onClick={() => setMonthlyViewPage(Math.min(totalPages - 1, monthlyViewPage + 1))}
            disabled={monthlyViewPage === totalPages - 1}
            className="p-2 rounded-lg text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : keyError ? (
        <ErrorMessage message={`Failed to load user names: ${keyError}. Search may be limited.`} />
      ) : filteredMonthlyData.length === 0 ? (
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
                <th className="sticky left-0 bg-gradient-to-r from-violet-50 to-violet-100 py-4 px-6 text-left font-semibold text-violet-800 z-20 min-w-[150px] shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                  Name
                </th>
                {daysToShow.map(day => {
                  const dayIsWeekend = isWeekend(selectedYear, selectedMonth, day);
                  return (
                    <th
                      key={day}
                      className={`text-center py-3 px-2 font-semibold text-sm min-w-[40px] ${
                        dayIsWeekend ? 'text-orange-600 bg-orange-50' : 'text-violet-800'
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
                <th className="text-center py-3 px-4 font-semibold text-violet-800 bg-violet-100 min-w-[60px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMonthlyData.map((row, idx) => {
                const monthTotal = row.days ? row.days.reduce((sum, hours) => sum + (Number(hours) || 0), 0) : 0;
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
                    {daysToShow.map(day => {
                      const hours = row.days && row.days.length >= day ? row.days[day - 1] : 0;
                      const dayIsWeekend = isWeekend(selectedYear, selectedMonth, day);
                      const displayValue = formatDayValue(hours, selectedYear, selectedMonth, day);
                      const isZeroWeekend = dayIsWeekend && hours === 0;

                      return (
                        <td key={day} className="text-center py-3 px-2">
                          <motion.span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                              isZeroWeekend
                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                : hours > 0
                                ? 'bg-violet-500 text-white shadow-sm hover:bg-violet-600'
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
                    <td className="text-center py-3 px-4 font-bold text-violet-700 bg-violet-50">
                      {monthTotal}
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

export default MonthlyView;