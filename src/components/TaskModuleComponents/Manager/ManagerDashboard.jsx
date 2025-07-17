// // // import React, { useState, useEffect, useCallback } from 'react';
// // // import { ChevronDown, Calendar, Users, Clock, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
// // // import axios from 'axios';
// // // import { useAuth } from '../../context/AuthContext';

// // // const ManagerDashboard = () => {
// // //   const currentDate = new Date();
// // //   const currentYear = currentDate.getFullYear();
// // //   const currentMonth = currentDate.getMonth();
// // //   const currentWeek = Math.ceil(currentDate.getDate() / 7);

// // //   const [selectedTeam, setSelectedTeam] = useState('All Teams');
// // //   const [viewType, setViewType] = useState('Weekly');
// // //   const [monthlyViewPage, setMonthlyViewPage] = useState(0);
// // //   const [selectedYear, setSelectedYear] = useState(currentYear);
// // //   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
// // //   const [selectedWeek, setSelectedWeek] = useState(currentWeek);
// // //   const [weeklyData, setWeeklyData] = useState([]);
// // //   const [monthlyData, setMonthlyData] = useState([]);
// // //   const [yearlyData, setYearlyData] = useState([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [error, setError] = useState(null);

// // //   const { acquireToken, isAuthenticated, isLoading } = useAuth();

// // //   const teams = ['All Teams', 'Development', 'Design', 'Marketing', 'Sales'];
// // //   const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
// // //   const months = [
// // //     'January', 'February', 'March', 'April', 'May', 'June',
// // //     'July', 'August', 'September', 'October', 'November', 'December'
// // //   ];

// // //   const API_BASE_URL = 'http://localhost:5181/api/ManagerDashboard';

// // //   // Function to make authenticated API requests
// // //   const makeAuthenticatedRequest = async (url, method = 'GET', data = null) => {
// // //     try {
// // //       const token = await acquireToken('api');
// // //       if (!token) {
// // //         throw new Error('Failed to acquire authentication token');
// // //       }

// // //       const config = {
// // //         method,
// // //         url,
// // //         headers: {
// // //           'Authorization': `Bearer ${token}`,
// // //           'Content-Type': 'application/json'
// // //         }
// // //       };

// // //       if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
// // //         config.data = data;
// // //       }

// // //       const response = await axios(config);

// // //       // Check Content-Type to ensure JSON response
// // //       const contentType = response.headers['content-type'];
// // //       if (!contentType || !contentType.includes('application/json')) {
// // //         throw new Error('Received non-JSON response from server');
// // //       }

// // //       return response.data;
// // //     } catch (error) {
// // //       if (error.response?.status === 401) {
// // //         throw new Error('Authentication failed. Please try logging in again.');
// // //       }
// // //       throw error.response?.data?.message || error.message || 'An unexpected error occurred';
// // //     }
// // //   };

// // //   const fetchData = useCallback(async () => {
// // //     if (!isAuthenticated || isLoading) {
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     setError(null);

// // //     try {
// // //       let data;
// // //       if (viewType === 'Weekly') {
// // //         data = await makeAuthenticatedRequest(
// // //           `${API_BASE_URL}/weekly?year=${selectedYear}&month=${selectedMonth}&week=${selectedWeek}&team=${encodeURIComponent(selectedTeam)}`
// // //         );
// // //         setWeeklyData(data || []);
// // //         setMonthlyData([]);
// // //         setYearlyData([]);
// // //       } else if (viewType === 'Monthly') {
// // //         data = await makeAuthenticatedRequest(
// // //           `${API_BASE_URL}/monthly?year=${selectedYear}&month=${selectedMonth}&team=${encodeURIComponent(selectedTeam)}`
// // //         );
// // //         setMonthlyData(data || []);
// // //         setWeeklyData([]);
// // //         setYearlyData([]);
// // //       } else if (viewType === 'Yearly') {
// // //         data = await makeAuthenticatedRequest(
// // //           `${API_BASE_URL}/yearly?year=${selectedYear}&team=${encodeURIComponent(selectedTeam)}`
// // //         );
// // //         setYearlyData(data || []);
// // //         setWeeklyData([]);
// // //         setMonthlyData([]);
// // //       }
// // //     } catch (err) {
// // //       setError(err.message);
// // //       console.error('Error fetching data:', err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [viewType, selectedYear, selectedMonth, selectedWeek, selectedTeam, isAuthenticated, isLoading]);

// // //   useEffect(() => {
// // //     const debounce = setTimeout(() => {
// // //       fetchData();
// // //     }, 300);

// // //     return () => clearTimeout(debounce);
// // //   }, [fetchData]);

// // //   const getWeeksInMonth = (year, month) => {
// // //     const daysInMonth = new Date(year, month + 1, 0).getDate();
// // //     return Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => i + 1);
// // //   };

// // //   const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// // //   const calculateMonthlyTotals = () => {
// // //     if (!yearlyData.length) return {};
// // //     return months.reduce((acc, _, index) => {
// // //       const monthKey = months[index].toLowerCase().slice(0, 3);
// // //       const total = yearlyData.reduce((sum, row) => sum + (row[monthKey] || 0), 0);
// // //       return { ...acc, [monthKey]: total };
// // //     }, {});
// // //   };

// // //   const monthlyTotals = calculateMonthlyTotals();

// // //   const CustomDropdown = ({ value, options, onChange, icon: Icon }) => {
// // //     const [isOpen, setIsOpen] = useState(false);

// // //     return (
// // //       <div className="relative">
// // //         <button
// // //           onClick={() => setIsOpen(!isOpen)}
// // //           className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 min-w-[150px] transition-colors"
// // //         >
// // //           {Icon && <Icon size={16} className="text-gray-500" />}
// // //           <span className="text-sm font-medium text-gray-700">{value}</span>
// // //           <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
// // //         </button>
// // //         {isOpen && (
// // //           <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
// // //             {options.map((option) => (
// // //               <button
// // //                 key={option}
// // //                 onClick={() => {
// // //                   onChange(option);
// // //                   setIsOpen(false);
// // //                 }}
// // //                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
// // //               >
// // //                 {option}
// // //               </button>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>
// // //     );
// // //   };

// // //   const WeeklyView = () => (
// // //     <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// // //       {loading ? (
// // //         <div className="flex justify-center py-6">
// // //           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
// // //         </div>
// // //       ) : error ? (
// // //         <div className="text-center py-6 text-red-600">
// // //           Error: {error}. Please check your authentication or try again later.
// // //         </div>
// // //       ) : weeklyData.length === 0 ? (
// // //         <div className="text-center py-6 text-gray-600">No data available for the selected period.</div>
// // //       ) : (
// // //         <div className="overflow-x-auto">
// // //           <table className="w-full">
// // //             <thead>
// // //               <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200">
// // //                 <th className="text-left py-3 px-4 font-medium text-violet-800">Name</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Mon</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Tue</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Wed</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Thu</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Fri</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Sat</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Sun</th>
// // //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Total</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {weeklyData.map((row, index) => (
// // //                 <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-violet-25'}>
// // //                   <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
// // //                   <td className="text-center py-3 px-4">
// // //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.mon > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                       {row.mon}
// // //                     </span>
// // //                   </td>
// // //                   <td className="text-center py-3 px-4">
// // //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.tue > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                       {row.tue}
// // //                     </span>
// // //                   </td>
// // //                   <td className="text-center py-3 px-4">
// // //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.wed > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                       {row.wed}
// // //                     </span>
// // //                   </td>
// // //                   <td className="text-center py-3 px-4">
// // //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.thu > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                       {row.thu}
// // //                     </span>
// // //                   </td>
// // //                   <td className="text-center py-3 px-4">
// // //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.fri > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                       {row.fri}
// // //                     </span>
// // //                   </td>
// // //                   <td className="text-center py-3 px-4">
// // //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.sat > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                       {row.sat}
// // //                     </span>
// // //                   </td>
// // //                   <td className="text-center py-3 px-4">
// // //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.sun > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                       {row.sun}
// // //                     </span>
// // //                   </td>
// // //                   <td className="text-center py-3 px-4 font-semibold text-violet-600">{row.total}</td>
// // //                 </tr>
// // //               ))}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );

// // //   const MonthlyView = () => {
// // //     const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
// // //     const daysPerPage = 16;
// // //     const totalPages = Math.ceil(daysInMonth / daysPerPage);
// // //     const startDay = monthlyViewPage * daysPerPage + 1;
// // //     const endDay = Math.min((monthlyViewPage + 1) * daysPerPage, daysInMonth);
// // //     const daysToShow = Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);

// // //     return (
// // //       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// // //         <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700 rounded-t-xl flex items-center justify-between">
// // //           <h3 className="text-white font-medium">
// // //             Days {startDay}-{endDay} of {daysInMonth}
// // //           </h3>
// // //           <div className="flex items-center gap-2">
// // //             <button
// // //               onClick={() => setMonthlyViewPage(Math.max(0, monthlyViewPage - 1))}
// // //               disabled={monthlyViewPage === 0}
// // //               className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// // //             >
// // //               <ChevronLeft size={16} />
// // //             </button>
// // //             <span className="text-white text-sm px-2">
// // //               {monthlyViewPage + 1} of {totalPages}
// // //             </span>
// // //             <button
// // //               onClick={() => setMonthlyViewPage(Math.min(totalPages - 1, monthlyViewPage + 1))}
// // //               disabled={monthlyViewPage === totalPages - 1}
// // //               className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// // //             >
// // //               <ChevronRight size={16} />
// // //             </button>
// // //           </div>
// // //         </div>
// // //         {loading ? (
// // //           <div className="flex justify-center py-6">
// // //             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
// // //           </div>
// // //         ) : error ? (
// // //           <div className="text-center py-6 text-red-600">
// // //             Error: {error}. Please check your authentication or try again later.
// // //           </div>
// // //         ) : monthlyData.length === 0 ? (
// // //           <div className="text-center py-6 text-gray-600">No data available for the selected period.</div>
// // //         ) : (
// // //           <div className="overflow-x-auto">
// // //             <table className="w-full">
// // //               <thead>
// // //                 <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200">
// // //                   <th className="text-left py-3 px-4 font-medium text-violet-800">Name</th>
// // //                   {daysToShow.map((day) => (
// // //                     <th key={day} className="text-center py-2 px-1 font-medium text-violet-800 text-xs min-w-[35px]">
// // //                       {day}
// // //                     </th>
// // //                   ))}
// // //                 </tr>
// // //               </thead>
// // //               <tbody>
// // //                 {monthlyData.map((row, index) => (
// // //                   <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-violet-25'}>
// // //                     <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
// // //                     {daysToShow.map((day) => {
// // //                       const hours = row.days[day - 1] || 0;
// // //                       return (
// // //                         <td key={day} className="text-center py-2 px-1">
// // //                           <span className={`inline-block w-7 h-7 rounded-lg text-xs leading-7 font-medium ${hours > 0 ? 'bg-violet-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
// // //                             {hours}
// // //                           </span>
// // //                         </td>
// // //                       );
// // //                     })}
// // //                   </tr>
// // //                 ))}
// // //               </tbody>
// // //             </table>
// // //           </div>
// // //         )}
// // //       </div>
// // //     );
// // //   };

// // //   const YearlyView = () => (
// // //     <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// // //       {loading ? (
// // //         <div className="flex justify-center py-6">
// // //           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
// // //         </div>
// // //       ) : error ? (
// // //         <div className="text-center py-6 text-red-600">
// // //           Error: {error}. Please check your authentication or try again later.
// // //         </div>
// // //       ) : yearlyData.length === 0 ? (
// // //         <div className="text-center py-6 text-gray-600">No data available for the selected period.</div>
// // //       ) : (
// // //         <div className="overflow-x-auto">
// // //           <table className="w-full">
// // //             <thead>
// // //               <tr className="bg-gradient-to-r from-violet-600 to-violet-700 text-white">
// // //                 <th className="text-left py-4 px-4 font-medium">Name</th>
// // //                 {months.map((month) => (
// // //                   <th key={month} className="text-center py-4 px-3 font-medium min-w-[80px]">
// // //                     {month}
// // //                   </th>
// // //                 ))}
// // //                 <th className="text-center py-4 px-4 font-medium">Total</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b-2 border-violet-200">
// // //                 <td className="py-3 px-4 font-semibold text-violet-700">Total Working Hours</td>
// // //                 {months.map((month) => {
// // //                   const monthKey = month.toLowerCase().slice(0, 3);
// // //                   return (
// // //                     <td key={month} className="text-center py-3 px-3 font-semibold text-violet-600">
// // //                       {monthlyTotals[monthKey] || 0}
// // //                     </td>
// // //                   );
// // //                 })}
// // //                 <td className="text-center py-3 px-4 font-bold text-violet-700">
// // //                   {Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0)}
// // //                 </td>
// // //               </tr>
// // //               {yearlyData.map((row, index) => (
// // //                 <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-violet-25'}>
// // //                   <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.jan}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.feb}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.mar}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.apr}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.may}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.jun}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.jul}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.aug}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.sep}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.oct}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.nov}</td>
// // //                   <td className="text-center py-3 px-3 text-gray-700">{row.dec}</td>
// // //                   <td className="text-center py-3 px-4 font-semibold text-violet-600">
// // //                     {Object.values(row).slice(1, 13).reduce((sum, val) => sum + (val || 0), 0)}
// // //                   </td>
// // //                 </tr>
// // //               ))}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );

// // //   const handlePerformanceMetrics = () => {
// // //     alert('Performance Metrics feature is not implemented yet.');
// // //   };

// // //   const renderCurrentView = () => {
// // //     switch (viewType) {
// // //       case 'Weekly':
// // //         return <WeeklyView />;
// // //       case 'Monthly':
// // //         return <MonthlyView />;
// // //       case 'Yearly':
// // //         return <YearlyView />;
// // //       default:
// // //         return <WeeklyView />;
// // //     }
// // //   };

// // //   const getCurrentPeriodSelector = () => {
// // //     switch (viewType) {
// // //       case 'Weekly':
// // //         return (
// // //           <div className="flex items-center gap-2">
// // //             <CustomDropdown
// // //               value={selectedYear}
// // //               options={years}
// // //               onChange={(year) => {
// // //                 setSelectedYear(parseInt(year));
// // //                 const maxWeeks = getWeeksInMonth(parseInt(year), selectedMonth);
// // //                 if (selectedWeek > maxWeeks.length) {
// // //                   setSelectedWeek(1);
// // //                 }
// // //               }}
// // //               icon={Calendar}
// // //             />
// // //             <CustomDropdown
// // //               value={months[selectedMonth]}
// // //               options={months}
// // //               onChange={(month) => {
// // //                 const monthIndex = months.indexOf(month);
// // //                 setSelectedMonth(monthIndex);
// // //                 setMonthlyViewPage(0);
// // //                 const maxWeeks = getWeeksInMonth(selectedYear, monthIndex);
// // //                 if (selectedWeek > maxWeeks.length) {
// // //                   setSelectedWeek(1);
// // //                 }
// // //               }}
// // //               icon={Calendar}
// // //             />
// // //             <CustomDropdown
// // //               value={`Week ${selectedWeek}`}
// // //               options={getWeeksInMonth(selectedYear, selectedMonth).map((w) => `Week ${w}`)}
// // //               onChange={(week) => setSelectedWeek(parseInt(week.split(' ')[1]))}
// // //               icon={Calendar}
// // //             />
// // //           </div>
// // //         );
// // //       case 'Monthly':
// // //         return (
// // //           <div className="flex items-center gap-2">
// // //             <CustomDropdown
// // //               value={selectedYear}
// // //               options={years}
// // //               onChange={(year) => {
// // //                 setSelectedYear(parseInt(year));
// // //                 setMonthlyViewPage(0);
// // //               }}
// // //               icon={Calendar}
// // //             />
// // //             <CustomDropdown
// // //               value={months[selectedMonth]}
// // //               options={months}
// // //               onChange={(month) => {
// // //                 setSelectedMonth(months.indexOf(month));
// // //                 setMonthlyViewPage(0);
// // //               }}
// // //               icon={Calendar}
// // //             />
// // //           </div>
// // //         );
// // //       case 'Yearly':
// // //         return (
// // //           <CustomDropdown
// // //             value={selectedYear}
// // //             options={years}
// // //             onChange={(year) => setSelectedYear(parseInt(year))}
// // //             icon={Calendar}
// // //           />
// // //         );
// // //       default:
// // //         return null;
// // //     }
// // //   };

// // //   // Show loading state while authenticating
// // //   if (isLoading) {
// // //     return (
// // //       <div className="p-6 bg-gray-50 min-h-screen">
// // //         <div className="bg-white rounded-lg shadow p-8 text-center">
// // //           <div className="text-gray-500 mb-2">Loading...</div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   // Show login prompt if not authenticated
// // //   if (!isAuthenticated) {
// // //     return (
// // //       <div className="p-6 bg-gray-50 min-h-screen">
// // //         <div className="bg-white rounded-lg shadow p-8 text-center">
// // //           <div className="text-gray-500 mb-2">Please log in to view the dashboard</div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gray-100 p-6">
// // //       <div className="max-w-7xl mx-auto">
// // //         <div className="mb-6">
// // //           <h1 className="text-3xl font-bold text-gray-900 mb-4">Manager Dashboard</h1>
// // //           <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
// // //             <div className="flex items-center gap-2">
// // //               <span className="text-sm font-medium text-gray-700">Team:</span>
// // //               <CustomDropdown
// // //                 value={selectedTeam}
// // //                 options={teams}
// // //                 onChange={setSelectedTeam}
// // //                 icon={Users}
// // //               />
// // //             </div>
// // //             <div className="flex items-center gap-2">
// // //               <span className="text-sm font-medium text-gray-700">Time Period:</span>
// // //               <CustomDropdown
// // //                 value={viewType}
// // //                 options={['Weekly', 'Monthly', 'Yearly']}
// // //                 onChange={(type) => {
// // //                   setViewType(type);
// // //                   setMonthlyViewPage(0);
// // //                 }}
// // //                 icon={Clock}
// // //               />
// // //             </div>
// // //             <div className="flex items-center gap-2">
// // //               <span className="text-sm font-medium text-gray-700">
// // //                 {viewType === 'Weekly' ? 'Week:' : viewType === 'Monthly' ? 'Month:' : 'Year:'}
// // //               </span>
// // //               {getCurrentPeriodSelector()}
// // //             </div>
// // //           </div>
// // //         </div>
// // //         <div className="space-y-6">
// // //           <div>
// // //             <div className="flex items-center justify-between mb-4">
// // //               <h2 className="text-xl font-semibold text-gray-900">
// // //                 Timesheets - {viewType} View
// // //                 <span className="text-sm font-normal text-gray-500 ml-2">
// // //                   {viewType === 'Weekly'
// // //                     ? `${months[selectedMonth]} ${selectedYear}, Week ${selectedWeek}`
// // //                     : viewType === 'Monthly'
// // //                     ? `${months[selectedMonth]} ${selectedYear}`
// // //                     : `${selectedYear}`}
// // //                 </span>
// // //               </h2>
// // //               <button
// // //                 onClick={handlePerformanceMetrics}
// // //                 className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
// // //               >
// // //                 <BarChart3 size={16} />
// // //                 Performance Metrics
// // //               </button>
// // //             </div>
// // //             {renderCurrentView()}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ManagerDashboard;

// // import React, { useState, useEffect, useCallback } from 'react';
// // import { ChevronDown, Calendar, Users, Clock, ChevronLeft, ChevronRight, BarChart3, X } from 'lucide-react';
// // import axios from 'axios';
// // import { useAuth } from '../../context/AuthContext';

// // const ManagerDashboard = () => {
// //   const currentDate = new Date();
// //   const currentYear = currentDate.getFullYear();
// //   const currentMonth = currentDate.getMonth();
// //   const currentWeek = Math.ceil(currentDate.getDate() / 7);

// //   const [selectedTeam, setSelectedTeam] = useState('All Teams');
// //   const [viewType, setViewType] = useState('Weekly');
// //   const [monthlyViewPage, setMonthlyViewPage] = useState(0);
// //   const [selectedYear, setSelectedYear] = useState(currentYear);
// //   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
// //   const [selectedWeek, setSelectedWeek] = useState(currentWeek);
// //   const [weeklyData, setWeeklyData] = useState([]);
// //   const [monthlyData, setMonthlyData] = useState([]);
// //   const [yearlyData, setYearlyData] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [showMetricsModal, setShowMetricsModal] = useState(false); // State for modal visibility

// //   const { acquireToken, isAuthenticated, isLoading } = useAuth();

// //   const teams = ['All Teams', 'Development', 'Design', 'Marketing', 'Sales'];
// //   const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
// //   const months = [
// //     'January', 'February', 'March', 'April', 'May', 'June',
// //     'July', 'August', 'September', 'October', 'November', 'December'
// //   ];

// //   const API_BASE_URL = 'http://localhost:5181/api/ManagerDashboard';

// //   // Function to make authenticated API requests
// //   const makeAuthenticatedRequest = async (url, method = 'GET', data = null) => {
// //     try {
// //       const token = await acquireToken('api');
// //       if (!token) {
// //         throw new Error('Failed to acquire authentication token');
// //       }

// //       const config = {
// //         method,
// //         url,
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       };

// //       if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
// //         config.data = data;
// //       }

// //       const response = await axios(config);

// //       const contentType = response.headers['content-type'];
// //       if (!contentType || !contentType.includes('application/json')) {
// //         throw new Error('Received non-JSON response from server');
// //       }

// //       return response.data;
// //     } catch (error) {
// //       if (error.response?.status === 401) {
// //         throw new Error('Authentication failed. Please try logging in again.');
// //       }
// //       throw error.response?.data?.message || error.message || 'An unexpected error occurred';
// //     }
// //   };

// //   const fetchData = useCallback(async () => {
// //     if (!isAuthenticated || isLoading) {
// //       return;
// //     }

// //     setLoading(true);
// //     setError(null);

// //     try {
// //       let data;
// //       if (viewType === 'Weekly') {
// //         data = await makeAuthenticatedRequest(
// //           `${API_BASE_URL}/weekly?year=${selectedYear}&month=${selectedMonth}&week=${selectedWeek}&team=${encodeURIComponent(selectedTeam)}`
// //         );
// //         setWeeklyData(data || []);
// //         setMonthlyData([]);
// //         setYearlyData([]);
// //       } else if (viewType === 'Monthly') {
// //         data = await makeAuthenticatedRequest(
// //           `${API_BASE_URL}/monthly?year=${selectedYear}&month=${selectedMonth}&team=${encodeURIComponent(selectedTeam)}`
// //         );
// //         setMonthlyData(data || []);
// //         setWeeklyData([]);
// //         setYearlyData([]);
// //       } else if (viewType === 'Yearly') {
// //         data = await makeAuthenticatedRequest(
// //           `${API_BASE_URL}/yearly?year=${selectedYear}&team=${encodeURIComponent(selectedTeam)}`
// //         );
// //         setYearlyData(data || []);
// //         setWeeklyData([]);
// //         setMonthlyData([]);
// //       }
// //     } catch (err) {
// //       setError(err.message);
// //       console.error('Error fetching data:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [viewType, selectedYear, selectedMonth, selectedWeek, selectedTeam, isAuthenticated, isLoading]);

// //   useEffect(() => {
// //     const debounce = setTimeout(() => {
// //       fetchData();
// //     }, 300);

// //     return () => clearTimeout(debounce);
// //   }, [fetchData]);

// //   const getWeeksInMonth = (year, month) => {
// //     const daysInMonth = new Date(year, month + 1, 0).getDate();
// //     return Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => i + 1);
// //   };

// //   const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// //   const calculateMonthlyTotals = () => {
// //     if (!yearlyData.length) return {};
// //     return months.reduce((acc, _, index) => {
// //       const monthKey = months[index].toLowerCase().slice(0, 3);
// //       const total = yearlyData.reduce((sum, row) => sum + (row[monthKey] || 0), 0);
// //       return { ...acc, [monthKey]: total };
// //     }, {});
// //   };

// //   const monthlyTotals = calculateMonthlyTotals();

// //   // Calculate performance metrics for Weekly view
// //   const calculateWeeklyMetrics = () => {
// //     if (!weeklyData.length) return { totalHours: 0, averageHours: 0, activeMembers: 0 };

// //     const totalHours = weeklyData.reduce((sum, row) => sum + (row.total || 0), 0);
// //     const activeMembers = weeklyData.filter(row => row.total > 0).length;
// //     const averageHours = activeMembers > 0 ? (totalHours / activeMembers).toFixed(1) : 0;

// //     return { totalHours, averageHours, activeMembers };
// //   };

// //   // Calculate performance metrics for Monthly view
// //   const calculateMonthlyMetrics = () => {
// //     if (!monthlyData.length) return { totalHours: 0, averageHoursPerDay: 0, activeMembers: 0 };

// //     const totalHours = monthlyData.reduce((sum, row) => 
// //       row.days.reduce((daySum, hours) => daySum + (hours || 0), 0), 0);
// //     const activeMembers = monthlyData.filter(row => 
// //       row.days.some(hours => hours > 0)).length;
// //     const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
// //     const averageHoursPerDay = activeMembers > 0 ? (totalHours / daysInMonth / activeMembers).toFixed(1) : 0;

// //     return { totalHours, averageHoursPerDay, activeMembers };
// //   };

// //   // Calculate performance metrics for Yearly view
// //   const calculateYearlyMetrics = () => {
// //     if (!yearlyData.length) return { totalHours: 0, averageHoursPerMonth: 0, activeMembers: 0 };

// //     const totalHours = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
// //     const activeMembers = yearlyData.filter(row => 
// //       Object.values(row).slice(1, 13).some(hours => hours > 0)).length;
// //     const averageHoursPerMonth = activeMembers > 0 ? (totalHours / 12 / activeMembers).toFixed(1) : 0;

// //     return { totalHours, averageHoursPerMonth, activeMembers };
// //   };

// //   const weeklyMetrics = calculateWeeklyMetrics();
// //   const monthlyMetrics = calculateMonthlyMetrics();
// //   const yearlyMetrics = calculateYearlyMetrics();

// //   const CustomDropdown = ({ value, options, onChange, icon: Icon }) => {
// //     const [isOpen, setIsOpen] = useState(false);

// //     return (
// //       <div className="relative">
// //         <button
// //           onClick={() => setIsOpen(!isOpen)}
// //           className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 min-w-[150px] transition-colors"
// //         >
// //           {Icon && <Icon size={16} className="text-gray-500" />}
// //           <span className="text-sm font-medium text-gray-700">{value}</span>
// //           <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
// //         </button>
// //         {isOpen && (
// //           <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
// //             {options.map((option) => (
// //               <button
// //                 key={option}
// //                 onClick={() => {
// //                   onChange(option);
// //                   setIsOpen(false);
// //                 }}
// //                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
// //               >
// //                 {option}
// //               </button>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   const WeeklyView = () => (
// //     <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// //       {loading ? (
// //         <div className="flex justify-center py-6">
// //           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
// //         </div>
// //       ) : error ? (
// //         <div className="text-center py-6 text-red-600">
// //           Error: {error}. Please check your authentication or try again later.
// //         </div>
// //       ) : weeklyData.length === 0 ? (
// //         <div className="text-center py-6 text-gray-600">No data available for the selected period.</div>
// //       ) : (
// //         <div className="overflow-x-auto">
// //           <table className="w-full">
// //             <thead>
// //               <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200">
// //                 <th className="text-left py-3 px-4 font-medium text-violet-800">Name</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Mon</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Tue</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Wed</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Thu</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Fri</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Sat</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Sun</th>
// //                 <th className="text-center py-3 px-4 font-medium text-violet-800">Total</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {weeklyData.map((row, index) => (
// //                 <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-violet-25'}>
// //                   <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
// //                   <td className="text-center py-3 px-4">
// //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.mon > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                       {row.mon}
// //                     </span>
// //                   </td>
// //                   <td className="text-center py-3 px-4">
// //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.tue > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                       {row.tue}
// //                     </span>
// //                   </td>
// //                   <td className="text-center py-3 px-4">
// //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.wed > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                       {row.wed}
// //                     </span>
// //                   </td>
// //                   <td className="text-center py-3 px-4">
// //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.thu > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                       {row.thu}
// //                     </span>
// //                   </td>
// //                   <td className="text-center py-3 px-4">
// //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.fri > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                       {row.fri}
// //                     </span>
// //                   </td>
// //                   <td className="text-center py-3 px-4">
// //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.sat > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                       {row.sat}
// //                     </span>
// //                   </td>
// //                   <td className="text-center py-3 px-4">
// //                     <span className={`inline-block w-8 h-8 rounded-lg text-sm leading-8 font-medium ${row.sun > 0 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                       {row.sun}
// //                     </span>
// //                   </td>
// //                   <td className="text-center py-3 px-4 font-semibold text-violet-600">{row.total}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );

// //   const MonthlyView = () => {
// //     const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
// //     const daysPerPage = 16;
// //     const totalPages = Math.ceil(daysInMonth / daysPerPage);
// //     const startDay = monthlyViewPage * daysPerPage + 1;
// //     const endDay = Math.min((monthlyViewPage + 1) * daysPerPage, daysInMonth);
// //     const daysToShow = Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);

// //     return (
// //       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// //         <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700 rounded-t-xl flex items-center justify-between">
// //           <h3 className="text-white font-medium">
// //             Days {startDay}-{endDay} of {daysInMonth}
// //           </h3>
// //           <div className="flex items-center gap-2">
// //             <button
// //               onClick={() => setMonthlyViewPage(Math.max(0, monthlyViewPage - 1))}
// //               disabled={monthlyViewPage === 0}
// //               className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //             >
// //               <ChevronLeft size={16} />
// //             </button>
// //             <span className="text-white text-sm px-2">
// //               {monthlyViewPage + 1} of {totalPages}
// //             </span>
// //             <button
// //               onClick={() => setMonthlyViewPage(Math.min(totalPages - 1, monthlyViewPage + 1))}
// //               disabled={monthlyViewPage === totalPages - 1}
// //               className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //             >
// //               <ChevronRight size={16} />
// //             </button>
// //           </div>
// //         </div>
// //         {loading ? (
// //           <div className="flex justify-center py-6">
// //             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
// //           </div>
// //         ) : error ? (
// //           <div className="text-center py-6 text-red-600">
// //             Error: {error}. Please check your authentication or try again later.
// //           </div>
// //         ) : monthlyData.length === 0 ? (
// //           <div className="text-center py-6 text-gray-600">No data available for the selected period.</div>
// //         ) : (
// //           <div className="overflow-x-auto">
// //             <table className="w-full">
// //               <thead>
// //                 <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200">
// //                   <th className="text-left py-3 px-4 font-medium text-violet-800">Name</th>
// //                   {daysToShow.map((day) => (
// //                     <th key={day} className="text-center py-2 px-1 font-medium text-violet-800 text-xs min-w-[35px]">
// //                       {day}
// //                     </th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {monthlyData.map((row, index) => (
// //                   <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-violet-25'}>
// //                     <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
// //                     {daysToShow.map((day) => {
// //                       const hours = row.days[day - 1] || 0;
// //                       return (
// //                         <td key={day} className="text-center py-2 px-1">
// //                           <span className={`inline-block w-7 h-7 rounded-lg text-xs leading-7 font-medium ${hours > 0 ? 'bg-violet-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
// //                             {hours}
// //                           </span>
// //                         </td>
// //                       );
// //                     })}
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   const YearlyView = () => (
// //     <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// //       {loading ? (
// //         <div className="flex justify-center py-6">
// //           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
// //         </div>
// //       ) : error ? (
// //         <div className="text-center py-6 text-red-600">
// //           Error: {error}. Please check your authentication or try again later.
// //         </div>
// //       ) : yearlyData.length === 0 ? (
// //         <div className="text-center py-6 text-gray-600">No data available for the selected period.</div>
// //       ) : (
// //         <div className="overflow-x-auto">
// //           <table className="w-full">
// //             <thead>
// //               <tr className="bg-gradient-to-r from-violet-600 to-violet-700 text-white">
// //                 <th className="text-left py-4 px-4 font-medium">Name</th>
// //                 {months.map((month) => (
// //                   <th key={month} className="text-center py-4 px-3 font-medium min-w-[80px]">
// //                     {month}
// //                   </th>
// //                 ))}
// //                 <th className="text-center py-4 px-4 font-medium">Total</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b-2 border-violet-200">
// //                 <td className="py-3 px-4 font-semibold text-violet-700">Total Working Hours</td>
// //                 {months.map((month) => {
// //                   const monthKey = month.toLowerCase().slice(0, 3);
// //                   return (
// //                     <td key={month} className="text-center py-3 px-3 font-semibold text-violet-600">
// //                       {monthlyTotals[monthKey] || 0}
// //                     </td>
// //                   );
// //                 })}
// //                 <td className="text-center py-3 px-4 font-bold text-violet-700">
// //                   {Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0)}
// //                 </td>
// //               </tr>
// //               {getYearlyDataRows()}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );

// //   const getYearlyDataRows = () => {
// //     if (!yearlyData.length) return null;
// //     return yearlyData.map((row, index) => (
// //       <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-violet-25'}>
// //         <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.jan}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.feb}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.mar}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.apr}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.may}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.jun}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.jul}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.aug}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.sep}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.oct}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.nov}</td>
// //         <td className="text-center py-3 px-3 text-gray-700">{row.dec}</td>
// //         <td className="text-center py-3 px-4 font-semibold text-violet-600">
// //           {Object.values(row).slice(1, 13).reduce((sum, val) => sum + (val || 0), 0)}
// //         </td>
// //       </tr>
// //     ));
// //   };

// //   // Performance Metrics Modal Component
// //   const PerformanceMetricsModal = () => (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //       <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
// //         <div className="flex justify-between items-center mb-6">
// //           <h2 className="text-2xl font-semibold text-gray-900">Performance Metrics</h2>
// //           <button
// //             onClick={() => setShowMetricsModal(false)}
// //             className="text-gray-600 hover:text-gray-800"
// //           >
// //             <X size={24} />
// //           </button>
// //         </div>

// //         {/* Weekly Metrics */}
// //         <div className="mb-6">
// //           <h3 className="text-lg font-medium text-violet-800 mb-3">
// //             Weekly Metrics ({months[selectedMonth]} {selectedYear}, Week {selectedWeek})
// //           </h3>
// //           {weeklyData.length === 0 ? (
// //             <p className="text-gray-600">No weekly data available.</p>
// //           ) : (
// //             <div className="space-y-2">
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Total Hours Worked:</span> {weeklyMetrics.totalHours} hours
// //               </p>
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Average Hours per Member:</span> {weeklyMetrics.averageHours} hours
// //               </p>
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Active Team Members:</span> {weeklyMetrics.activeMembers}
// //               </p>
// //             </div>
// //           )}
// //         </div>

// //         {/* Monthly Metrics */}
// //         <div className="mb-6">
// //           <h3 className="text-lg font-medium text-violet-800 mb-3">
// //             Monthly Metrics ({months[selectedMonth]} {selectedYear})
// //           </h3>
// //           {monthlyData.length === 0 ? (
// //             <p className="text-gray-600">No monthly data available.</p>
// //           ) : (
// //             <div className="space-y-2">
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Total Hours Worked:</span> {monthlyMetrics.totalHours} hours
// //               </p>
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Average Hours per Day per Member:</span> {monthlyMetrics.averageHoursPerDay} hours
// //               </p>
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Active Team Members:</span> {monthlyMetrics.activeMembers}
// //               </p>
// //             </div>
// //           )}
// //         </div>

// //         {/* Yearly Metrics */}
// //         <div>
// //           <h3 className="text-lg font-medium text-violet-800 mb-3">
// //             Yearly Metrics ({selectedYear})
// //           </h3>
// //           {yearlyData.length === 0 ? (
// //             <p className="text-gray-600">No yearly data available.</p>
// //           ) : (
// //             <div className="space-y-2">
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Total Hours Worked:</span> {yearlyMetrics.totalHours} hours
// //               </p>
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Average Hours per Month per Member:</span> {yearlyMetrics.averageHoursPerMonth} hours
// //               </p>
// //               <p className="text-gray-700">
// //                 <span className="font-medium">Active Team Members:</span> {yearlyMetrics.activeMembers}
// //               </p>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );

// //   const handlePerformanceMetrics = () => {
// //     setShowMetricsModal(true);
// //   };

// //   const renderCurrentView = () => {
// //     switch (viewType) {
// //       case 'Weekly':
// //         return <WeeklyView />;
// //       case 'Monthly':
// //         return <MonthlyView />;
// //       case 'Yearly':
// //         return <YearlyView />;
// //       default:
// //         return <WeeklyView />;
// //     }
// //   };

// //   const getCurrentPeriodSelector = () => {
// //     switch (viewType) {
// //       case 'Weekly':
// //         return (
// //           <div className="flex items-center gap-2">
// //             <CustomDropdown
// //               value={selectedYear}
// //               options={years}
// //               onChange={(year) => {
// //                 setSelectedYear(parseInt(year));
// //                 const maxWeeks = getWeeksInMonth(parseInt(year), selectedMonth);
// //                 if (selectedWeek > maxWeeks.length) {
// //                   setSelectedWeek(1);
// //                 }
// //               }}
// //               icon={Calendar}
// //             />
// //             <CustomDropdown
// //               value={months[selectedMonth]}
// //               options={months}
// //               onChange={(month) => {
// //                 const monthIndex = months.indexOf(month);
// //                 setSelectedMonth(monthIndex);
// //                 setMonthlyViewPage(0);
// //                 const maxWeeks = getWeeksInMonth(selectedYear, monthIndex);
// //                 if (selectedWeek > maxWeeks.length) {
// //                   setSelectedWeek(1);
// //                 }
// //               }}
// //               icon={Calendar}
// //             />
// //             <CustomDropdown
// //               value={`Week ${selectedWeek}`}
// //               options={getWeeksInMonth(selectedYear, selectedMonth).map((w) => `Week ${w}`)}
// //               onChange={(week) => setSelectedWeek(parseInt(week.split(' ')[1]))}
// //               icon={Calendar}
// //             />
// //           </div>
// //         );
// //       case 'Monthly':
// //         return (
// //           <div className="flex items-center gap-2">
// //             <CustomDropdown
// //               value={selectedYear}
// //               options={years}
// //               onChange={(year) => {
// //                 setSelectedYear(parseInt(year));
// //                 setMonthlyViewPage(0);
// //               }}
// //               icon={Calendar}
// //             />
// //             <CustomDropdown
// //               value={months[selectedMonth]}
// //               options={months}
// //               onChange={(month) => {
// //                 setSelectedMonth(months.indexOf(month));
// //                 setMonthlyViewPage(0);
// //               }}
// //               icon={Calendar}
// //             />
// //           </div>
// //         );
// //       case 'Yearly':
// //         return (
// //           <CustomDropdown
// //             value={selectedYear}
// //             options={years}
// //             onChange={(year) => setSelectedYear(parseInt(year))}
// //             icon={Calendar}
// //           />
// //         );
// //       default:
// //         return null;
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="p-6 bg-gray-50 min-h-screen">
// //         <div className="bg-white rounded-lg shadow p-8 text-center">
// //           <div className="text-gray-500 mb-2">Loading...</div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!isAuthenticated) {
// //     return (
// //       <div className="p-6 bg-gray-50 min-h-screen">
// //         <div className="bg-white rounded-lg shadow p-8 text-center">
// //           <div className="text-gray-500 mb-2">Please log in to view the dashboard</div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-100 p-6">
// //       <div className="max-w-7xl mx-auto">
// //         <div className="mb-6">
// //           <h1 className="text-3xl font-bold text-gray-900 mb-4">Manager Dashboard</h1>
// //           <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
// //             <div className="flex items-center gap-2">
// //               <span className="text-sm font-medium text-gray-700">Team:</span>
// //               <CustomDropdown
// //                 value={selectedTeam}
// //                 options={teams}
// //                 onChange={setSelectedTeam}
// //                 icon={Users}
// //               />
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <span className="text-sm font-medium text-gray-700">Time Period:</span>
// //               <CustomDropdown
// //                 value={viewType}
// //                 options={['Weekly', 'Monthly', 'Yearly']}
// //                 onChange={(type) => {
// //                   setViewType(type);
// //                   setMonthlyViewPage(0);
// //                 }}
// //                 icon={Clock}
// //               />
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <span className="text-sm font-medium text-gray-700">
// //                 {viewType === 'Weekly' ? 'Week:' : viewType === 'Monthly' ? 'Month:' : 'Year:'}
// //               </span>
// //               {getCurrentPeriodSelector()}
// //             </div>
// //           </div>
// //         </div>
// //         <div className="space-y-6">
// //           <div>
// //             <div className="flex items-center justify-between mb-4">
// //               <h2 className="text-xl font-semibold text-gray-900">
// //                 Timesheets - {viewType} View
// //                 <span className="text-sm font-normal text-gray-500 ml-2">
// //                   {viewType === 'Weekly'
// //                     ? `${months[selectedMonth]} ${selectedYear}, Week ${selectedWeek}`
// //                     : viewType === 'Monthly'
// //                     ? `${months[selectedMonth]} ${selectedYear}`
// //                     : `${selectedYear}`}
// //                 </span>
// //               </h2>
// //               <button
// //                 onClick={handlePerformanceMetrics}
// //                 className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
// //               >
// //                 <BarChart3 size={16} />
// //                 Performance Metrics
// //               </button>
// //             </div>
// //             {renderCurrentView()}
// //           </div>
// //         </div>
// //       </div>
// //       {showMetricsModal && <PerformanceMetricsModal />}
// //     </div>
// //   );
// // };

// // export default ManagerDashboard;

// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Users, Clock, Search, BarChart3, Download, Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import CustomDropdown from '../../common-components/CustomDropdown';
// import LoadingSpinner from '../../common-components/LoadingSpinner';
// import PerformanceView from './PerformanceView';
// import WeeklyView from './WeeklyView';
// import YearlyView from './YearlyView';
// import MonthlyView from './Monthlyview';
// import { makeAuthenticatedRequest, exportData } from './utils';
// import { fetchEncryptionKeys } from '../../services/apiClient';
//  import { decryptString } from '../../services/decrypt';
// // Utility to calculate the date range for a given week
// const getWeekDateRange = (year, month, week) => {
//   const startDay = (week - 1) * 7 + 1; // e.g., Week 1 starts on day 1, Week 2 on day 8
//   const startDate = new Date(year, month, startDay);
 
//   // Calculate the end date (6 days after the start date, or the last day of the month)
//   const endDate = new Date(year, month, startDay + 6);
//   const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
//   if (endDate.getDate() > lastDayOfMonth) {
//     endDate.setDate(lastDayOfMonth);
//   }
 
//   // Format dates as "Month Day"
//   const options = { month: 'short', day: 'numeric' };
//   const startStr = startDate.toLocaleDateString('en-US', options);
//   const endStr = endDate.toLocaleDateString('en-US', options);
 
//   return `${startStr} - ${endStr}, ${year}`;
// };
 
// // Utility to get the week number from a date
// const getWeekNumber = (date) => {
//   const dayOfMonth = date.getDate();
//   return Math.ceil(dayOfMonth / 7); // e.g., days 1-7 are Week 1, days 8-14 are Week 2, etc.
// };
 
// // Custom Date Input Component
// const CustomDateInput = ({ value, onChange, className = "" }) => {
//   const formatDateForInput = (date) => {
//     if (!date) return '';
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };
 
//   const handleDateChange = (e) => {
//     const dateValue = e.target.value;
//     if (dateValue) {
//       const newDate = new Date(dateValue);
//       onChange(newDate);
//     }
//   };
 
//   return (
//     <div className={`flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 ${className}`}>
//       <CalendarIcon className="text-violet-600 flex-shrink-0" size={20} />
//       <input
//         type="date"
//         value={formatDateForInput(value)}
//         onChange={handleDateChange}
//         className="text-gray-700 focus:outline-none bg-transparent min-w-0 flex-1"
//         style={{ colorScheme: 'light' }}
//       />
//     </div>
//   );
// };
 
// const ManagerDashboard = () => {
//   const currentDate = new Date();
//   const currentYear = currentDate.getFullYear();
//   const currentMonth = currentDate.getMonth();
 
//   const [selectedTeam, setSelectedTeam] = useState('All Teams');
//   const [viewType, setViewType] = useState('Weekly');
//   const [monthlyViewPage, setMonthlyViewPage] = useState(0);
//   const [selectedDate, setSelectedDate] = useState(currentDate); // Single state for selected date in Weekly view
//   const [selectedYear, setSelectedYear] = useState(currentYear); // For Monthly and Yearly views
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth); // For Monthly view
//   const [weeklyData, setWeeklyData] = useState([]);
//   const [monthlyData, setMonthlyData] = useState([]);
//   const [yearlyData, setYearlyData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showPerformance, setShowPerformance] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
 
//   const { acquireToken, isAuthenticated, isLoading } = useAuth();
 
//   const teams = ['All Teams', 'Development', 'Design', 'Marketing', 'Sales'];
//   const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
//   const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
 
//   // Derive year, month, and week from selectedDate for Weekly view
//   const derivedYear = selectedDate.getFullYear();
//   const derivedMonth = selectedDate.getMonth();
//   const derivedWeek = getWeekNumber(selectedDate);
//  const [aesKey, setAesKey] = useState(null);
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
//   const fetchData = async () => {
//     if (!isAuthenticated || isLoading) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const API_BASE_URL = 'http://localhost:5181/api/ManagerDashboard';
//       let data;
//       if (viewType === 'Weekly') {
//         data = await makeAuthenticatedRequest(
//           `${API_BASE_URL}/weekly?year=${derivedYear}&month=${derivedMonth + 1}&week=${derivedWeek}&team=${encodeURIComponent(selectedTeam)}`,
//           'GET',
//           null,
//           acquireToken
//         );
//         setWeeklyData(data || []);
//         setMonthlyData([]);
//         setYearlyData([]);
//       } else if (viewType === 'Monthly') {
//         data = await makeAuthenticatedRequest(
//           `${API_BASE_URL}/monthly?year=${selectedYear}&month=${selectedMonth + 1}&team=${encodeURIComponent(selectedTeam)}`,
//           'GET',
//           null,
//           acquireToken
//         );
//         setMonthlyData(data || []);
//         setWeeklyData([]);
//         setYearlyData([]);
//       } else if (viewType === 'Yearly') {
//         data = await makeAuthenticatedRequest(
//           `${API_BASE_URL}/yearly?year=${selectedYear}&team=${encodeURIComponent(selectedTeam)}`,
//           'GET',
//           null,
//           acquireToken
//         );
//         setYearlyData(data || []);
//         setWeeklyData([]);
//         setMonthlyData([]);
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error('Error fetching data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   useEffect(() => {
//     const debounce = setTimeout(() => fetchData(), 300);
//     return () => clearTimeout(debounce);
//   }, [viewType, derivedYear, derivedMonth, derivedWeek, selectedYear, selectedMonth, selectedTeam, isAuthenticated, isLoading]);
 
//   const handlePerformanceMetrics = () => {
//     setShowPerformance(!showPerformance);
//     setSearchQuery('');
//   };
 
//   const handleViewTypeChange = (newViewType) => {
//     setViewType(newViewType);
//     setMonthlyViewPage(0);
   
//     // Reset states when switching views to ensure proper re-rendering
//     if (newViewType === 'Weekly') {
//       setSelectedDate(currentDate);
//     } else if (newViewType === 'Monthly') {
//       setSelectedYear(currentYear);
//       setSelectedMonth(currentMonth);
//     } else if (newViewType === 'Yearly') {
//       setSelectedYear(currentYear);
//     }
//   };
 
//   const renderCurrentView = () => {
//     if (showPerformance) {
//       return (
//         <PerformanceView
//           viewType={viewType}
//           selectedYear={viewType === 'Weekly' ? derivedYear : selectedYear}
//           selectedMonth={viewType === 'Weekly' ? derivedMonth : selectedMonth}
//           selectedWeek={viewType === 'Weekly' ? derivedWeek : null}
//           searchQuery={searchQuery}
//           months={months}
//         />
//       );
//     }
//     switch (viewType) {
//       case 'Weekly':
//         return <WeeklyView weeklyData={weeklyData} searchQuery={decryptString(searchQuery,aesKey,aesIV)} loading={loading} error={error} />;
//       case 'Monthly':
//         return (
//           <MonthlyView
//             monthlyData={monthlyData}
//             searchQuery={searchQuery}
//             loading={loading}
//             error={error}
//             selectedYear={selectedYear}
//             selectedMonth={selectedMonth}
//             monthlyViewPage={monthlyViewPage}
//             setMonthlyViewPage={setMonthlyViewPage}
//           />
//         );
//       case 'Yearly':
//         return <YearlyView yearlyData={yearlyData} searchQuery={searchQuery} loading={loading} error={error} months={months} />;
//       default:
//         return <WeeklyView weeklyData={weeklyData} searchQuery={searchQuery} loading={loading} error={error} />;
//     }
//   };
 
//   const getCurrentPeriodSelector = () => {
//     switch (viewType) {
//       case 'Weekly':
//         return (
//           <div className="flex items-center gap-2 flex-wrap">
//             <CustomDateInput
//               value={selectedDate}
//               onChange={setSelectedDate}
//               className="min-w-[180px]"
//             />
//           </div>
//         );
//       case 'Monthly':
//         return (
//           <div className="flex items-center gap-2 flex-wrap">
//             <CustomDropdown
//               value={selectedYear}
//               options={years}
//               onChange={val => {
//                 setSelectedYear(parseInt(val, 10));
//                 setMonthlyViewPage(0);
//               }}
//               icon={CalendarIcon}
//             />
//             <CustomDropdown
//               value={months[selectedMonth]}
//               options={months}
//               onChange={val => {
//                 setSelectedMonth(months.indexOf(val));
//                 setMonthlyViewPage(0);
//               }}
//               icon={CalendarIcon}
//             />
//           </div>
//         );
//       case 'Yearly':
//         return (
//           <CustomDropdown
//             value={selectedYear}
//             options={years}
//             onChange={val => setSelectedYear(parseInt(val, 10))}
//             icon={CalendarIcon}
//           />
//         );
//       default:
//         return null;
//     }
//   };
 
//   const getPeriodDescription = () => {
//     switch (viewType) {
//       case 'Weekly':
//         return getWeekDateRange(derivedYear, derivedMonth, derivedWeek);
//       case 'Monthly':
//         return `${months[selectedMonth]} ${selectedYear}`;
//       case 'Yearly':
//         return `${selectedYear}`;
//       default:
//         return '';
//     }
//   };
 
//   if (isLoading) {
//     return (
//       <motion.div
//         className="min-h-screen bg-gray-50 flex items-center justify-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Loader2 className="animate-spin h-10 w-10 text-violet-600" />
//         <span className="ml-3 text-gray-600">Loading dashboard...</span>
//       </motion.div>
//     );
//   }
 
//   if (!isAuthenticated) {
//     return (
//       <motion.div
//         className="min-h-screen bg-gray-50 flex items-center justify-center"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <motion.div
//           className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.4 }}
//         >
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
//           <p className="text-gray-600 mb-4">
//             Please log in to view the manager dashboard.
//           </p>
//           <motion.button
//             className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             Sign In
//           </motion.button>
//         </motion.div>
//       </motion.div>
//     );
//   }
 
//   return (
//     <motion.div
//       className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       <div className="max-w-7xl mx-auto p-6">
//         <motion.div
//           className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           <div className="flex flex-wrap gap-6 items-center">
//             <motion.div
//               className="flex items-center gap-3 min-w-[180px]"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.4, delay: 0.1 }}
//             >
//               <Users className="text-violet-600" size={20} />
//               <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Team:</span>
//               <CustomDropdown
//                 value={selectedTeam}
//                 options={teams}
//                 onChange={setSelectedTeam}
//                 icon={Users}
//               />
//             </motion.div>
//             <motion.div
//               className="flex items-center gap-3 min-w-[180px]"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.4, delay: 0.2 }}
//             >
//               <Clock className="text-violet-600" size={20} />
//               <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">View:</span>
//               <CustomDropdown
//                 value={viewType}
//                 options={['Weekly', 'Monthly', 'Yearly']}
//                 onChange={handleViewTypeChange}
//                 icon={Clock}
//               />
//             </motion.div>
//             <motion.div
//               className="flex items-center gap-3 min-w-[220px]"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.4, delay: 0.3 }}
//             >
//               <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Period:</span>
//               {getCurrentPeriodSelector()}
//             </motion.div>
//             <motion.div
//               className="flex items-center gap-3 flex-1 min-w-[200px]"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.4, delay: 0.4 }}
//             >
//               <Search className="text-violet-600" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by user name..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
//               />
//             </motion.div>
//           </div>
//         </motion.div>
 
//         <div className="space-y-6">
//           <motion.div
//             className="flex items-center justify-between"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//           >
//             <div>
//               <h2 className="text-2xl font-bold text-violet-900">
//                 {showPerformance ? 'Performance Metrics' : `Timesheets - ${viewType} View`}
//               </h2>
//               <p className="text-gray-600 mt-1">
//                 {showPerformance ? '' : getPeriodDescription()}
//               </p>
//             </div>
//             <div className="flex gap-3 flex-wrap">
//               {!showPerformance && (
//                 <motion.button
//                   onClick={() => exportData(viewType, weeklyData, monthlyData, yearlyData, selectedYear, selectedMonth, searchQuery)}
//                   disabled={loading || error != null}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   type="button"
//                   title="Export timesheet data as CSV"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <Download size={16} />
//                   Export CSV
//                 </motion.button>
//               )}
//               <motion.button
//                 onClick={handlePerformanceMetrics}
//                 className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
//                 type="button"
//                 title={showPerformance ? 'View timesheets' : 'View performance metrics'}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <BarChart3 size={16} />
//                 {showPerformance ? 'Timesheets' : 'Performance'}
//               </motion.button>
//             </div>
//           </motion.div>
//           {renderCurrentView()}
//         </div>
//       </div>
//     </motion.div>
//   );
// };
 
// export default ManagerDashboard;
 

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Search, BarChart3, Download, Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomDropdown from '../../common-components/CustomDropdown';
import LoadingSpinner from '../../common-components/LoadingSpinner';
import PerformanceView from './PerformanceView';
import WeeklyView from './WeeklyView';
import YearlyView from './YearlyView';
import MonthlyView from './MonthlyView';
import { makeAuthenticatedRequest, exportData } from './utils';
 
// Utility to calculate the number of weeks in a month
const getWeeksInMonth = (year, month) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.ceil(lastDay / 7);
};
 
// Utility to calculate the date range for a given week
const getWeekDateRange = (year, month, week) => {
  const startDay = (week - 1) * 7 + 1;
  const startDate = new Date(year, month, startDay);
  const endDate = new Date(year, month, startDay + 6);
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  if (endDate.getDate() > lastDayOfMonth) {
    endDate.setDate(lastDayOfMonth);
  }
  const options = { month: 'short', day: 'numeric' };
  const startStr = startDate.toLocaleDateString('en-US', options);
  const endStr = endDate.toLocaleDateString('en-US', options);
  return `${startStr} - ${endStr}, ${year}`;
};
 
const ManagerDashboard = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentWeek = Math.ceil(currentDate.getDate() / 7);
 
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [viewType, setViewType] = useState('Weekly');
  const [monthlyViewPage, setMonthlyViewPage] = useState(0);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
 
  const { acquireToken, isAuthenticated, isLoading } = useAuth();
 
  const teams = ['All Teams', 'Development', 'Design', 'Marketing', 'Sales'];
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
 
  // Generate week options for the selected month
  const weekOptions = Array.from(
    { length: getWeeksInMonth(selectedYear, selectedMonth) },
    (_, i) => `Week ${i + 1}`
  );
 
  // Debug period changes
  useEffect(() => {
    console.log('ManagerDashboard - Period changed:', {
      year: selectedYear,
      month: selectedMonth + 1,
      week: selectedWeek,
    });
  }, [selectedYear, selectedMonth, selectedWeek]);
 
  // Debug searchQuery updates
  useEffect(() => {
    console.log('ManagerDashboard - searchQuery:', searchQuery);
  }, [searchQuery]);
 
  // Fetch data for timesheet views
  const fetchData = async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = 'http://localhost:5181/api/ManagerDashboard';
      let data;
      if (viewType === 'Weekly') {
        console.log('ManagerDashboard - Fetching weekly data with params:', {
          year: selectedYear,
          month: selectedMonth + 1,
          week: selectedWeek,
          team: selectedTeam,
        });
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/weekly?year=${selectedYear}&month=${selectedMonth + 1}&week=${selectedWeek}&team=${encodeURIComponent(selectedTeam)}`,
          'GET',
          null,
          acquireToken
        );
        console.log('ManagerDashboard - weeklyData fetched:', data);
        setWeeklyData(data || []);
        setMonthlyData([]);
        setYearlyData([]);
      } else if (viewType === 'Monthly') {
        console.log('ManagerDashboard - Fetching monthly data with params:', {
          year: selectedYear,
          month: selectedMonth + 1,
          team: selectedTeam,
        });
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/monthly?year=${selectedYear}&month=${selectedMonth + 1}&team=${encodeURIComponent(selectedTeam)}`,
          'GET',
          null,
          acquireToken
        );
        console.log('ManagerDashboard - monthlyData fetched:', data);
        setMonthlyData(data || []);
        setWeeklyData([]);
        setYearlyData([]);
      } else if (viewType === 'Yearly') {
        console.log('ManagerDashboard - Fetching yearly data with params:', {
          year: selectedYear,
          team: selectedTeam,
        });
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/yearly?year=${selectedYear}&team=${encodeURIComponent(selectedTeam)}`,
          'GET',
          null,
          acquireToken
        );
        console.log('ManagerDashboard - yearlyData fetched:', data);
        setYearlyData(data || []);
        setWeeklyData([]);
        setMonthlyData([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('ManagerDashboard - Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    const debounce = setTimeout(() => {
      console.log('ManagerDashboard - Triggering fetchData');
      fetchData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [viewType, selectedYear, selectedMonth, selectedWeek, selectedTeam, isAuthenticated, isLoading]);
 
  // Handle performance button click with loading state
  const handlePerformanceMetrics = () => {
    setPerformanceLoading(true);
    setShowPerformance(!showPerformance);
    setSearchQuery('');
    // Simulate data fetching delay (replace with actual fetch if PerformanceView handles its own data)
    setTimeout(() => {
      setPerformanceLoading(false);
    }, 1000); // Adjust delay as needed or integrate with actual data fetching
  };
 
  const handleViewTypeChange = (newViewType) => {
    setViewType(newViewType);
    setMonthlyViewPage(0);
    if (newViewType === 'Weekly') {
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
      setSelectedWeek(currentWeek);
    } else if (newViewType === 'Monthly') {
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
    } else if (newViewType === 'Yearly') {
      setSelectedYear(currentYear);
    }
  };
 
  const renderCurrentView = () => {
    if (showPerformance) {
      if (performanceLoading) {
        return <LoadingSpinner message="Loading performance metrics..." />;
      }
      return (
        <PerformanceView
          viewType={viewType}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedWeek={viewType === 'Weekly' ? selectedWeek : null}
          searchQuery={searchQuery}
          months={months}
        />
      );
    }
    switch (viewType) {
      case 'Weekly':
        return (
          <WeeklyView
            weeklyData={weeklyData}
            searchQuery={searchQuery}
            loading={loading}
            error={error}
          />
        );
      case 'Monthly':
        return (
          <MonthlyView
            monthlyData={monthlyData}
            searchQuery={searchQuery}
            loading={loading}
            error={error}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            monthlyViewPage={monthlyViewPage}
            setMonthlyViewPage={setMonthlyViewPage}
          />
        );
      case 'Yearly':
        return (
          <YearlyView
            yearlyData={yearlyData}
            searchQuery={searchQuery}
            loading={loading}
            error={error}
            months={months}
          />
        );
      default:
        return (
          <WeeklyView
            weeklyData={weeklyData}
            searchQuery={searchQuery}
            loading={loading}
            error={error}
          />
        );
    }
  };
 
  const getCurrentPeriodSelector = () => {
    switch (viewType) {
      case 'Weekly':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <CustomDropdown
              value={months[selectedMonth]}
              options={months}
              onChange={val => {
                setSelectedMonth(months.indexOf(val));
                setSelectedWeek(1); // Reset to Week 1 when month changes
              }}
              icon={CalendarIcon}
              className="min-w-[120px]"
            />
            <CustomDropdown
              value={`Week ${selectedWeek}`}
              options={weekOptions}
              onChange={val => {
                const weekNum = parseInt(val.split(' ')[1], 10);
                setSelectedWeek(weekNum);
              }}
              icon={CalendarIcon}
              className="min-w-[100px]"
            />
          </div>
        );
      case 'Monthly':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <CustomDropdown
              value={selectedYear}
              options={years}
              onChange={val => {
                setSelectedYear(parseInt(val, 10));
                setMonthlyViewPage(0);
              }}
              icon={CalendarIcon}
            />
            <CustomDropdown
              value={months[selectedMonth]}
              options={months}
              onChange={val => {
                setSelectedMonth(months.indexOf(val));
                setMonthlyViewPage(0);
              }}
              icon={CalendarIcon}
            />
          </div>
        );
      case 'Yearly':
        return (
          <CustomDropdown
            value={selectedYear}
            options={years}
            onChange={val => setSelectedYear(parseInt(val, 10))}
            icon={CalendarIcon}
          />
        );
      default:
        return null;
    }
  };
 
  const getPeriodDescription = () => {
    switch (viewType) {
      case 'Weekly':
        return `${months[selectedMonth]} ${getWeekDateRange(selectedYear, selectedMonth, selectedWeek)}`;
      case 'Monthly':
        return `${months[selectedMonth]} ${selectedYear}`;
      case 'Yearly':
        return `${selectedYear}`;
      default:
        return '';
    }
  };
 
  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Loader2 className="animate-spin h-10 w-10 text-violet-600" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </motion.div>
    );
  }
 
  if (!isAuthenticated) {
    return (
      <motion.div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please log in to view the manager dashboard.
          </p>
          <motion.button
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }
 
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-wrap gap-6 items-center">
            <motion.div
              className="flex items-center gap-3 min-w-[180px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Users className="text-violet-600" size={20} />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Team:</span>
              <CustomDropdown
                value={selectedTeam}
                options={teams}
                onChange={setSelectedTeam}
                icon={Users}
              />
            </motion.div>
            <motion.div
              className="flex items-center gap-3 min-w-[180px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Clock className="text-violet-600" size={20} />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">View:</span>
              <CustomDropdown
                value={viewType}
                options={['Weekly', 'Monthly', 'Yearly']}
                onChange={handleViewTypeChange}
                icon={Clock}
              />
            </motion.div>
            <motion.div
              className="flex items-center gap-3 min-w-[220px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Period:</span>
              {getCurrentPeriodSelector()}
            </motion.div>
            <motion.div
              className="flex items-center gap-3 flex-1 min-w-[200px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Search className="text-violet-600" size={20} />
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </motion.div>
          </div>
        </motion.div>
 
        <div className="space-y-6">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h2 className="text-2xl font-bold text-violet-900">
                {showPerformance ? 'Performance Metrics' : `Timesheets - ${viewType} View`}
              </h2>
              <p className="text-gray-600 mt-1">
                {showPerformance ? '' : getPeriodDescription()}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {!showPerformance && (
                <motion.button
                  onClick={() => exportData(viewType, weeklyData, monthlyData, yearlyData, selectedYear, selectedMonth, searchQuery)}
                  disabled={loading || error != null}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  title="Export timesheet data as CSV"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={16} />
                  Export CSV
                </motion.button>
              )}
              <motion.button
                onClick={handlePerformanceMetrics}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                type="button"
                title={showPerformance ? 'View timesheets' : 'View performance metrics'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 size={16} />
                {showPerformance ? 'Timesheets' : 'Performance'}
              </motion.button>
            </div>
          </motion.div>
          {renderCurrentView()}
        </div>
      </div>
    </motion.div>
  );
};
 
export default ManagerDashboard;
 