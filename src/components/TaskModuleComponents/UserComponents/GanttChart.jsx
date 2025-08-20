


// import React, { useState, useEffect, useRef } from 'react';
// import { ChevronLeft, ChevronRight, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
// import Button from '../../common-components/Button';
// import apiClient, { setupAxiosInterceptors } from '../../services/apiClient';
// import { useAuth } from '../../context/AuthContext';

// const GanttChart = ({ tasks: propTasks }) => {
//   const { acquireToken, isAuthenticated, isInitialized, isLoading, user } = useAuth();
//   const [viewMode, setViewMode] = useState('month');
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [number, setNumber] = useState(new Date().getMonth() + 1); // Initialize to current month (1-12)
//   const [visibleTasks, setVisibleTasks] = useState([]);
//   const [tasks, setTasks] = useState(propTasks || []);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const scrollContainerRef = useRef(null);

//   useEffect(() => {
//     setupAxiosInterceptors(acquireToken);
//   }, [acquireToken]);

//   // Calculate number based on currentDate and viewMode
//   useEffect(() => {
//     let newNumber;
//     if (viewMode === 'week') {
//       const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
//       const firstMonday = startOfYear.getDay() === 1 ? startOfYear : new Date(startOfYear.setDate(startOfYear.getDate() + (8 - startOfYear.getDay())));
//       const diffDays = Math.floor((currentDate - firstMonday) / (1000 * 60 * 60 * 24));
//       newNumber = Math.max(1, Math.min(53, Math.floor(diffDays / 7) + 1)); // 1-53
//     } else if (viewMode === 'month') {
//       newNumber = currentDate.getMonth() + 1; // 1-12
//     } else if (viewMode === 'quarter') {
//       newNumber = Math.floor(currentDate.getMonth() / 3) + 1; // 1-4
//     }
//     setNumber(newNumber);
//   }, [viewMode, currentDate]);

//   // Handle viewMode change and set number based on currentDate
//   const handleViewModeChange = (mode) => {
//     let newNumber;
//     if (mode === 'week') {
//       const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
//       const firstMonday = startOfYear.getDay() === 1 ? startOfYear : new Date(startOfYear.setDate(startOfYear.getDate() + (8 - startOfYear.getDay())));
//       const diffDays = Math.floor((currentDate - firstMonday) / (1000 * 60 * 60 * 24));
//       newNumber = Math.max(1, Math.min(53, Math.floor(diffDays / 7) + 1));
//     } else if (mode === 'month') {
//       newNumber = currentDate.getMonth() + 1; // 1-12
//     } else if (mode === 'quarter') {
//       newNumber = Math.floor(currentDate.getMonth() / 3) + 1; // 1-4
//     }
//     setNumber(newNumber);
//     setViewMode(mode);
//   };

//   const fetchTasks = async () => {
//     if (!user?.id) {
//       setError('User ID not available');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await apiClient.get('/ManagerDashboard/filtered', {
//         params: {
//           userId: user.id,
//           viewMode,
//           number,
//           currentDate: currentDate.toISOString(),
//         },
//       });
//       const apiTasks = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
//       const mergedTasks = [
//         ...apiTasks,
//         ...(propTasks || []).filter((pt) => !apiTasks.some((at) => at.id === pt.id)),
//       ];
//       setTasks(mergedTasks);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       setError(`Failed to fetch tasks: ${error.response?.data?.message || error.message}`);
//       if (propTasks) {
//         setTasks(propTasks);
//       } else {
//         setTasks([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isAuthenticated && isInitialized && user?.id) {
//       fetchTasks();
//     }
//   }, [isAuthenticated, isInitialized, user?.id, viewMode, number, currentDate]);

//   const getDates = () => {
//     const dates = [];
//     const year = currentDate.getFullYear();

//     if (viewMode === 'week') {
//       let startDate = new Date(year, 0, 1);
//       if (startDate.getDay() !== 1) {
//         startDate.setDate(startDate.getDate() + (8 - startDate.getDay()));
//       }
//       startDate.setDate(startDate.getDate() + (number - 1) * 7);
//       const endDate = new Date(startDate);
//       endDate.setDate(endDate.getDate() + 6);
//       if (endDate.getFullYear() > year) {
//         endDate.setFullYear(year, 11, 31);
//       }
//       for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//         dates.push(new Date(d));
//       }
//     } else if (viewMode === 'month') {
//       const startDate = new Date(year, number - 1, 1);
//       const endDate = new Date(year, number, 0);
//       for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//         dates.push(new Date(d));
//       }
//     } else if (viewMode === 'quarter') {
//       const quarterStartMonth = (number - 1) * 3;
//       const startDate = new Date(year, quarterStartMonth, 1);
//       const endDate = new Date(year, quarterStartMonth + 3, 0);
//       for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//         dates.push(new Date(d));
//       }
//     }

//     return dates;
//   };

//   const formatDate = (date, format = 'day') => {
//     if (format === 'month') {
//       return date.toLocaleString('default', { month: 'short' });
//     } else if (format === 'full') {
//       return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
//     } else if (format === 'weekday') {
//       return date.toLocaleString('default', { weekday: 'short' });
//     } else {
//       return date.getDate();
//     }
//   };

//   const isToday = (date) => {
//     const today = new Date();
//     return (
//       date.getDate() === today.getDate() &&
//       date.getMonth() === today.getMonth() &&
//       date.getFullYear() === today.getFullYear()
//     );
//   };

//   const isWeekend = (date) => {
//     const day = date.getDay();
//     return day === 0 || day === 6;
//   };

//   const navigateTimeline = (direction) => {
//     let newNumber = number;
//     let newDate = new Date(currentDate);
//     if (viewMode === 'week') {
//       newNumber = direction === 'next' ? Math.min(number + 1, 53) : Math.max(number - 1, 1);
//       newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
//     } else if (viewMode === 'month') {
//       newNumber = direction === 'next' ? Math.min(number + 1, 12) : Math.max(number - 1, 1);
//       newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
//     } else if (viewMode === 'quarter') {
//       newNumber = direction === 'next' ? Math.min(number + 1, 4) : Math.max(number - 1, 1);
//       newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
//     }
//     setNumber(newNumber);
//     setCurrentDate(newDate);
//   };

//   const handleNumberChange = (e) => {
//     const value = parseInt(e.target.value);
//     if (!isNaN(value)) {
//       if (viewMode === 'week' && value >= 1 && value <= 53) {
//         setNumber(value);
//         const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
//         const firstMonday = startOfYear.getDay() === 1 ? startOfYear : new Date(startOfYear.setDate(startOfYear.getDate() + (8 - startOfYear.getDay())));
//         const newDate = new Date(firstMonday);
//         newDate.setDate(newDate.getDate() + (value - 1) * 7);
//         setCurrentDate(newDate);
//       } else if (viewMode === 'month' && value >= 1 && value <= 12) {
//         setNumber(value);
//         setCurrentDate(new Date(currentDate.getFullYear(), value - 1, 1));
//       } else if (viewMode === 'quarter' && value >= 1 && value <= 4) {
//         setNumber(value);
//         setCurrentDate(new Date(currentDate.getFullYear(), (value - 1) * 3, 1));
//       }
//     }
//   };

//   const parseDate = (dateInput) => {
//     if (!dateInput) {
//       console.warn('No date input provided');
//       return null;
//     }

//     try {
//       let date;
//       if (typeof dateInput === 'string') {
//         date = new Date(dateInput);
//       } else if (dateInput instanceof Date) {
//         date = new Date(dateInput);
//       } else {
//         console.warn(`Invalid date input type: ${typeof dateInput}`, dateInput);
//         return null;
//       }

//       if (isNaN(date.getTime())) {
//         console.warn(`Failed to parse date: ${dateInput}`);
//         return null;
//       }

//       return date;
//     } catch (e) {
//       console.error('Error parsing date:', dateInput, e);
//       return null;
//     }
//   };

//   useEffect(() => {
//     if (!tasks || tasks.length === 0) {
//       setVisibleTasks([]);
//       return;
//     }

//     const dates = getDates();
//     if (dates.length === 0) return;

//     const firstDate = dates[0];
//     const lastDate = dates[dates.length - 1];

//     const processedTasks = tasks.map((task, index) => {
//       try {
//         const startDateField = task.startDate || task.start_date || task.startDateTime || task.createdAt;
//         const endDateField = task.dueDate || task.endDate || task.due_date || task.end_date || task.deadline;

//         const taskStart = parseDate(startDateField);
//         const taskEnd = parseDate(endDateField);

//         if (!taskStart || !taskEnd) {
//           console.warn(`Task "${task.taskName || task.title || `Task ${index}`}" has invalid dates:`, {
//             start: startDateField,
//             end: endDateField,
//           });
//           return null;
//         }

//         if (taskEnd < firstDate || taskStart > lastDate) {
//           return null;
//         }

//         const msPerUnit = 1000 * 60 * 60 * 24; // Always daily units for week, month, quarter
//         const totalUnits = Math.ceil((lastDate - firstDate) / msPerUnit) + 1;

//         const startUnits = Math.floor((taskStart - firstDate) / msPerUnit);
//         const endUnits = Math.floor((taskEnd - firstDate) / msPerUnit);

//         const left = Math.max(0, startUnits);
//         const right = Math.min(totalUnits - 1, endUnits);
//         const width = Math.max(1, right - left + 1);

//         let color = 'bg-gray-300';
//         const status = (task.status || '').toLowerCase();
//         const now = new Date();

//         if (status === 'completed' || status === 'done' || status === 'finished') {
//           color = 'bg-green-500';
//         } else if (status === 'in-progress' || status === 'In Progress' || status === 'active') {
//           color = 'bg-yellow-500';
//         } else if (status === 'overdue' || (now > taskEnd && status !== 'completed')) {
//           color = 'bg-red-500';
//         } else if (status === 'blocked' || status === 'on-hold') {
//           color = 'bg-gray-500';
//         }

//         return {
//           id: task.id || `task-${index}`,
//           name: task.taskName || task.title || `Task ${index + 1}`,
//           description: task.description || '',
//           assignedTo: task.assignedTo || task.assigned_to || task.assignee,
//           status: task.status || 'not-started',
//           priority: task.priority || 'medium',
//           startDate: taskStart,
//           dueDate: taskEnd,
//           left,
//           width,
//           color,
//           originalTask: task,
//         };
//       } catch (e) {
//         console.error('Error processing task:', task, e);
//         return null;
//       }
//     }).filter(Boolean);

//     setVisibleTasks(processedTasks);

//     if (scrollContainerRef.current && !loading) {
//       setTimeout(() => {
//         const today = new Date();
//         const todayIndex = dates.findIndex(
//           (date) =>
//             date.getDate() === today.getDate() &&
//             date.getMonth() === today.getMonth() &&
//             date.getFullYear() === today.getFullYear()
//         );

//         if (todayIndex >= 0) {
//           const cellWidth = viewMode === 'week' ? window.innerWidth / 7 : 40;
//           const containerWidth = scrollContainerRef.current.clientWidth;
//           const scrollPosition = Math.max(0, todayIndex * cellWidth - containerWidth / 2);
//           scrollContainerRef.current.scrollLeft = scrollPosition;
//         }
//       }, 100);
//     }
//   }, [tasks, currentDate, viewMode, number, loading]);

//   const getCurrentPeriodText = () => {
//     const year = currentDate.getFullYear();
//     if (viewMode === 'week') {
//       let startDate = new Date(year, 0, 1);
//       if (startDate.getDay() !== 1) {
//         startDate.setDate(startDate.getDate() + (8 - startDate.getDay()));
//       }
//       startDate.setDate(startDate.getDate() + (number - 1) * 7);
//       const endDate = new Date(startDate);
//       endDate.setDate(endDate.getDate() + 6);
//       if (endDate.getFullYear() > year) {
//         endDate.setFullYear(year, 11, 31);
//       }
//       return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
//     } else if (viewMode === 'month') {
//       return new Date(year, number - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
//     } else if (viewMode === 'quarter') {
//       return `Q${number} ${year}`;
//     }
//   };

//   const cellWidth = viewMode === 'week' ? Math.max(20, window.innerWidth / 7) : 40;

//   if (!isAuthenticated) {
//     return (
//       <div className="py-12 text-center text-gray-500">
//         <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
//         <p className="text-lg font-medium">Please log in to view the Gantt chart.</p>
//       </div>
//     );
//   }

//   if (isLoading || !isInitialized) {
//     return (
//       <div className="py-12 text-center text-gray-500">
//         <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-spin" />
//         <p className="text-lg font-medium">Loading authentication...</p>
//       </div>
//     );
//   }

//   const dates = getDates();

//   return (
//     <div className="bg-white rounded-lg shadow p-4 mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-800">Task Timeline</h2>
//           <p className="text-sm text-gray-600">{getCurrentPeriodText()}</p>
//         </div>

//         <div className="flex items-center space-x-4">
//           <div className="flex bg-gray-100 rounded-md p-1">
//             {['week', 'month', 'quarter'].map((mode) => (
//               <button
//                 key={mode}
//                 className={`px-3 py-1 text-sm rounded-md capitalize ${
//                   viewMode === mode ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
//                 }`}
//                 onClick={() => handleViewModeChange(mode)}
//               >
//                 {mode}
//               </button>
//             ))}
//           </div>

//           <div className="flex items-center space-x-2">
//             <input
//               type="number"
//               value={number}
//               onChange={handleNumberChange}
//               className="w-16 p-1 border rounded text-sm"
//               min="1"
//               max={viewMode === 'week' ? 53 : viewMode === 'month' ? 12 : 4}
//               placeholder={viewMode === 'week' ? 'Week' : viewMode === 'month' ? 'Month' : 'Quarter'}
//             />
//             <Button variant="outline" className="p-1 h-8 w-8" onClick={() => navigateTimeline('prev')} title="Previous period">
//               <ChevronLeft className="w-4 h-4" />
//             </Button>
//             <Button variant="outline" className="p-1 h-8 w-8" onClick={() => setCurrentDate(new Date())} title="Go to today">
//               <span>Today</span>
//             </Button>
//             <Button variant="outline" className="p-1 h-8 w-8" onClick={() => navigateTimeline('next')} title="Next period">
//               <ChevronRight className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
//           <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
//           <span className="text-sm text-red-700">{error}</span>
//         </div>
//       )}

//       {loading && (
//         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
//           <RefreshCw className="w-4 h-4 text-blue-500 mr-2 animate-spin" />
//           <span className="text-sm text-blue-700">Loading tasks...</span>
//         </div>
//       )}

//       <div className="overflow-hidden border border-gray-200 rounded-md">
//         <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}>
//           <div className="flex border-b border-gray-200 sticky top-0 bg-gray-100 z-10" style={{ minWidth: `${dates.length * cellWidth}px` }}>
//             <div className="flex" style={{ minWidth: `${dates.length * cellWidth}px` }}>
//               {dates.map((date, index) => {
//                 const prevDate = index > 0 ? dates[index - 1] : null;
//                 const showMonth = index === 0 || (prevDate && date.getMonth() !== prevDate.getMonth());

//                 return (
//                   <div
//                     key={index}
//                     className={`flex flex-col items-center justify-center border-r border-gray-200 ${
//                       isWeekend(date) ? 'bg-gray-50' : ''
//                     } ${isToday(date) ? 'bg-blue-50 border-blue-200' : ''}`}
//                     style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
//                   >
//                     {showMonth && (
//                       <div className="text-xs text-gray-600 font-medium w-full text-center border-b border-gray-200 py-1">
//                         {formatDate(date, 'month')} {date.getFullYear()}
//                       </div>
//                     )}
//                     <div className="flex flex-col items-center py-2 px-1">
//                       <span className={`text-xs ${isToday(date) ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
//                         {formatDate(date, 'day')}
//                       </span>
//                       <span className="text-xs text-gray-500">{formatDate(date, 'weekday')}</span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div>
//             {visibleTasks.length > 0 ? (
//               visibleTasks.map((task, taskIndex) => (
//                 <div key={task.id} className="flex border-b border-gray-200 hover:bg-gray-50 group">
//                   <div className="flex relative" style={{ height: '80px' }}>
//                     {dates.map((date, dateIndex) => (
//                       <div
//                         key={dateIndex}
//                         className={`border-r border-gray-200 ${isWeekend(date) ? 'bg-gray-50' : ''} ${isToday(date) ? 'bg-blue-50' : ''}`}
//                         style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
//                       />
//                     ))}

//                     <div
//                       className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded-md ${task.color} 
//                         shadow-sm flex items-center px-2 group-hover:shadow-md transition-shadow
//                         ${task.width * cellWidth > 100 ? 'justify-start' : 'justify-center'}`}
//                       style={{
//                         left: `${task.left * cellWidth + 2}px`,
//                         width: `${Math.max(20, task.width * cellWidth - 4)}px`,
//                       }}
//                       title={`${task.name}\nDescription: ${task.description}\nStart: ${formatDate(task.startDate, 'full')}\nEnd: ${formatDate(
//                         task.dueDate,
//                         'full'
//                       )}\nStatus: ${task.status}`}
//                     >
//                       {task.width * cellWidth > 20 && (
//                         <span className="text-gray-800 text-xs truncate font-medium">{task.name}</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : !loading ? (
//               <div className="py-12 text-center text-gray-500">
//                 <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
//                 <p className="text-lg font-medium">No tasks found</p>
//                 <p className="text-sm">No tasks are scheduled in this time period</p>
//               </div>
//             ) : null}
//           </div>
//         </div>
//       </div>

//       <div className="mt-4 flex justify-between items-center">
//         <div className="flex items-center space-x-6 text-xs">
//           <div className="flex items-center">
//             <div className="w-3 h-3 bg-gray-300 rounded-sm mr-1" />
//             <span>Not Started</span>
//           </div>
//           <div className="flex items-center">
//             <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-1" />
//             <span>In Progress</span>
//           </div>
//           <div className="flex items-center">
//             <div className="w-3 h-3 bg-green-500 rounded-sm mr-1" />
//             <span>Completed</span>
//           </div>
//           <div className="flex items-center">
//             <div className="w-3 h-3 bg-red-500 rounded-sm mr-1" />
//             <span>Overdue</span>
//           </div>
//         </div>

//         <div className="text-sm text-gray-600">
//           Showing {visibleTasks.length} of {tasks.length} tasks
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GanttChart;

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../../common-components/Button';
import apiClient, { setupAxiosInterceptors } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../../common-components/SearchBar'; // Adjust the import path as needed

const GanttChart = ({ tasks: propTasks }) => {
  const { acquireToken, isAuthenticated, isInitialized, isLoading, user } = useAuth();
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [number, setNumber] = useState(new Date().getMonth() + 1);
  const [visibleTasks, setVisibleTasks] = useState([]);
  const [tasks, setTasks] = useState(propTasks || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasksCount, setFilteredTasksCount] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setupAxiosInterceptors(acquireToken);
  }, [acquireToken]);

  useEffect(() => {
    let newNumber;
    if (viewMode === 'week') {
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const firstMonday = startOfYear.getDay() === 1 ? startOfYear : new Date(startOfYear.setDate(startOfYear.getDate() + (8 - startOfYear.getDay())));
      const diffDays = Math.floor((currentDate - firstMonday) / (1000 * 60 * 60 * 24));
      newNumber = Math.max(1, Math.min(53, Math.floor(diffDays / 7) + 1));
    } else if (viewMode === 'month') {
      newNumber = currentDate.getMonth() + 1;
    } else if (viewMode === 'quarter') {
      newNumber = Math.floor(currentDate.getMonth() / 3) + 1;
    }
    setNumber(newNumber);
  }, [viewMode, currentDate]);

  const handleViewModeChange = (mode) => {
    let newNumber;
    if (mode === 'week') {
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const firstMonday = startOfYear.getDay() === 1 ? startOfYear : new Date(startOfYear.setDate(startOfYear.getDate() + (8 - startOfYear.getDay())));
      const diffDays = Math.floor((currentDate - firstMonday) / (1000 * 60 * 60 * 24));
      newNumber = Math.max(1, Math.min(53, Math.floor(diffDays / 7) + 1));
    } else if (mode === 'month') {
      newNumber = currentDate.getMonth() + 1;
    } else if (mode === 'quarter') {
      newNumber = Math.floor(currentDate.getMonth() / 3) + 1;
    }
    setNumber(newNumber);
    setViewMode(mode);
  };

  const fetchTasks = async () => {
    if (!user?.id) {
      setError('User ID not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/ManagerDashboard/filtered', {
        params: {
          userId: user.id,
          viewMode,
          number,
          currentDate: currentDate.toISOString(),
        },
      });
      const apiTasks = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
      const mergedTasks = [
        ...apiTasks,
        ...(propTasks || []).filter((pt) => !apiTasks.some((at) => at.id === pt.id)),
      ];
      setTasks(mergedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(`Failed to fetch tasks: ${error.response?.data?.message || error.message}`);
      if (propTasks) {
        setTasks(propTasks);
      } else {
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isInitialized && user?.id) {
      fetchTasks();
    }
  }, [isAuthenticated, isInitialized, user?.id, viewMode, number, currentDate]);

  const getDates = () => {
    const dates = [];
    const year = currentDate.getFullYear();

    if (viewMode === 'week') {
      let startDate = new Date(year, 0, 1);
      if (startDate.getDay() !== 1) {
        startDate.setDate(startDate.getDate() + (8 - startDate.getDay()));
      }
      startDate.setDate(startDate.getDate() + (number - 1) * 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      if (endDate.getFullYear() > year) {
        endDate.setFullYear(year, 11, 31);
      }
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    } else if (viewMode === 'month') {
      const startDate = new Date(year, number - 1, 1);
      const endDate = new Date(year, number, 0);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    } else if (viewMode === 'quarter') {
      const quarterStartMonth = (number - 1) * 3;
      const startDate = new Date(year, quarterStartMonth, 1);
      const endDate = new Date(year, quarterStartMonth + 3, 0);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    }

    return dates;
  };

  const formatDate = (date, format = 'day') => {
    if (format === 'month') {
      return date.toLocaleString('default', { month: 'short' });
    } else if (format === 'full') {
      return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (format === 'weekday') {
      return date.toLocaleString('default', { weekday: 'short' });
    } else {
      return date.getDate();
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const navigateTimeline = (direction) => {
    let newNumber = number;
    let newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newNumber = direction === 'next' ? Math.min(number + 1, 53) : Math.max(number - 1, 1);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newNumber = direction === 'next' ? Math.min(number + 1, 12) : Math.max(number - 1, 1);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'quarter') {
      newNumber = direction === 'next' ? Math.min(number + 1, 4) : Math.max(number - 1, 1);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
    }
    setNumber(newNumber);
    setCurrentDate(newDate);
  };

  const handleNumberChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (viewMode === 'week' && value >= 1 && value <= 53) {
        setNumber(value);
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        const firstMonday = startOfYear.getDay() === 1 ? startOfYear : new Date(startOfYear.setDate(startOfYear.getDate() + (8 - startOfYear.getDay())));
        const newDate = new Date(firstMonday);
        newDate.setDate(newDate.getDate() + (value - 1) * 7);
        setCurrentDate(newDate);
      } else if (viewMode === 'month' && value >= 1 && value <= 12) {
        setNumber(value);
        setCurrentDate(new Date(currentDate.getFullYear(), value - 1, 1));
      } else if (viewMode === 'quarter' && value >= 1 && value <= 4) {
        setNumber(value);
        setCurrentDate(new Date(currentDate.getFullYear(), (value - 1) * 3, 1));
      }
    }
  };

  const parseDate = (dateInput) => {
    if (!dateInput) {
      console.warn('No date input provided');
      return null;
    }

    try {
      let date;
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = new Date(dateInput);
      } else {
        console.warn(`Invalid date input type: ${typeof dateInput}`, dateInput);
        return null;
      }

      if (isNaN(date.getTime())) {
        console.warn(`Failed to parse date: ${dateInput}`);
        return null;
      }

      return date;
    } catch (e) {
      console.error('Error parsing date:', dateInput, e);
      return null;
    }
  };

  // Enhanced search function with better filtering
  const filterTasksBySearch = (tasksToFilter, query) => {
    if (!query || query.trim() === '') {
      return tasksToFilter;
    }

    const searchLower = query.toLowerCase().trim();
    
    return tasksToFilter.filter((task) => {
      // Create a comprehensive search string from all relevant task properties
      const searchableText = [
        task.taskName,
        task.title,
        task.name,
        task.description,
        task.assignedTo,
        task.assigned_to,
        task.assignee,
        task.status,
        task.priority,
        task.project,
        task.projectName,
        task.category
      ]
      .filter(field => field && typeof field === 'string') // Only include non-empty strings
      .join(' ')
      .toLowerCase();

      const matches = searchableText.includes(searchLower);
      
      // Debug logging (remove in production)
      if (query.length > 0) {
        console.log(`Task: ${task.taskName || task.title || 'Unnamed'}, Searchable: "${searchableText}", Query: "${searchLower}", Matches: ${matches}`);
      }
      
      return matches;
    });
  };

  // Handle search query changes with debouncing
  const handleSearch = (query) => {
    console.log('Search query updated:', query);
    setSearchQuery(query);
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  useEffect(() => {
    console.log('Processing tasks. Total tasks:', tasks.length, 'Search query:', searchQuery);
    
    if (!tasks || tasks.length === 0) {
      setVisibleTasks([]);
      setFilteredTasksCount(0);
      return;
    }

    const dates = getDates();
    if (dates.length === 0) return;

    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    // First filter by search query
    const searchFilteredTasks = filterTasksBySearch(tasks, searchQuery);
    console.log('Tasks after search filter:', searchFilteredTasks.length);
    
    const processedTasks = searchFilteredTasks
      .map((task, index) => {
        try {
          const startDateField = task.startDate || task.start_date || task.startDateTime || task.createdAt;
          const endDateField = task.dueDate || task.endDate || task.due_date || task.end_date || task.deadline;

          const taskStart = parseDate(startDateField);
          const taskEnd = parseDate(endDateField);

          if (!taskStart || !taskEnd) {
            console.warn(`Task "${task.taskName || task.title || `Task ${index}`}" has invalid dates:`, {
              start: startDateField,
              end: endDateField,
            });
            return null;
          }

          // Check if task overlaps with current date range
          if (taskEnd < firstDate || taskStart > lastDate) {
            return null;
          }

          const msPerUnit = 1000 * 60 * 60 * 24;
          const totalUnits = Math.ceil((lastDate - firstDate) / msPerUnit) + 1;

          const startUnits = Math.floor((taskStart - firstDate) / msPerUnit);
          const endUnits = Math.floor((taskEnd - firstDate) / msPerUnit);

          const left = Math.max(0, startUnits);
          const right = Math.min(totalUnits - 1, endUnits);
          const width = Math.max(1, right - left + 1);

          let color = 'bg-gray-300';
          const status = (task.status || '').toLowerCase();
          const now = new Date();

          if (status === 'completed' || status === 'done' || status === 'finished') {
            color = 'bg-green-500';
          } else if (status === 'in-progress' || status === 'in progress' || status === 'active') {
            color = 'bg-yellow-500';
          } else if (status === 'overdue' || (now > taskEnd && !['completed', 'done', 'finished'].includes(status))) {
            color = 'bg-red-500';
          } else if (status === 'blocked' || status === 'on-hold' || status === 'on hold') {
            color = 'bg-gray-500';
          }

          return {
            id: task.id || `task-${index}`,
            name: task.taskName || task.title || `Task ${index + 1}`,
            description: task.description || '',
            assignedTo: task.assignedTo || task.assigned_to || task.assignee,
            status: task.status || 'not-started',
            priority: task.priority || 'medium',
            startDate: taskStart,
            dueDate: taskEnd,
            left,
            width,
            color,
            originalTask: task,
          };
        } catch (e) {
          console.error('Error processing task:', task, e);
          return null;
        }
      })
      .filter(Boolean);

    console.log('Final visible tasks:', processedTasks.length);
    setVisibleTasks(processedTasks);
    setFilteredTasksCount(searchFilteredTasks.length);

    // Auto-scroll to today
    if (scrollContainerRef.current && !loading) {
      setTimeout(() => {
        const today = new Date();
        const todayIndex = dates.findIndex(
          (date) =>
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );

        if (todayIndex >= 0) {
          const cellWidth = viewMode === 'week' ? window.innerWidth / 7 : 40;
          const containerWidth = scrollContainerRef.current.clientWidth;
          const scrollPosition = Math.max(0, todayIndex * cellWidth - containerWidth / 2);
          scrollContainerRef.current.scrollLeft = scrollPosition;
        }
      }, 100);
    }
  }, [tasks, currentDate, viewMode, number, loading, searchQuery]);

  const getCurrentPeriodText = () => {
    const year = currentDate.getFullYear();
    if (viewMode === 'week') {
      let startDate = new Date(year, 0, 1);
      if (startDate.getDay() !== 1) {
        startDate.setDate(startDate.getDate() + (8 - startDate.getDay()));
      }
      startDate.setDate(startDate.getDate() + (number - 1) * 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      if (endDate.getFullYear() > year) {
        endDate.setFullYear(year, 11, 31);
      }
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    } else if (viewMode === 'month') {
      return new Date(year, number - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'quarter') {
      return `Q${number} ${year}`;
    }
  };

  const cellWidth = viewMode === 'week' ? Math.max(20, window.innerWidth / 7) : 40;

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg font-medium">Please log in to view the Gantt chart.</p>
      </div>
    );
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="py-12 text-center text-gray-500">
        <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-spin" />
        <p className="text-lg font-medium">Loading authentication...</p>
      </div>
    );
  }

  const dates = getDates();

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Task Timeline</h2>
          <p className="text-sm text-gray-600">{getCurrentPeriodText()}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search tasks..."
              className="w-64"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="flex bg-gray-100 rounded-md p-1">
            {['week', 'month', 'quarter'].map((mode) => (
              <button
                key={mode}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  viewMode === mode ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => handleViewModeChange(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={number}
              onChange={handleNumberChange}
              className="w-16 p-1 border rounded text-sm"
              min="1"
              max={viewMode === 'week' ? 53 : viewMode === 'month' ? 12 : 4}
              placeholder={viewMode === 'week' ? 'Week' : viewMode === 'month' ? 'Month' : 'Quarter'}
            />
            <Button variant="outline" className="p-1 h-8 w-8" onClick={() => navigateTimeline('prev')} title="Previous period">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="p-1 h-8 w-8" onClick={() => setCurrentDate(new Date())} title="Go to today">
              <span className="text-xs">Today</span>
            </Button>
            <Button variant="outline" className="p-1 h-8 w-8" onClick={() => navigateTimeline('next')} title="Next period">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
          <RefreshCw className="w-4 h-4 text-blue-500 mr-2 animate-spin" />
          <span className="text-sm text-blue-700">Loading tasks...</span>
        </div>
      )}

      {searchQuery && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm text-blue-700">
            Search results for "{searchQuery}": {visibleTasks.length} tasks found in current view 
            {filteredTasksCount !== tasks.length && ` (${filteredTasksCount} total matches)`}
          </span>
          <button 
            onClick={clearSearch}
            className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-gray-200 rounded-md">
        <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}>
          <div className="flex border-b border-gray-200 sticky top-0 bg-gray-100 z-10" style={{ minWidth: `${dates.length * cellWidth}px` }}>
            <div className="flex" style={{ minWidth: `${dates.length * cellWidth}px` }}>
              {dates.map((date, index) => {
                const prevDate = index > 0 ? dates[index - 1] : null;
                const showMonth = index === 0 || (prevDate && date.getMonth() !== prevDate.getMonth());

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center border-r border-gray-200 ${
                      isWeekend(date) ? 'bg-gray-50' : ''
                    } ${isToday(date) ? 'bg-blue-50 border-blue-200' : ''}`}
                    style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                  >
                    {showMonth && (
                      <div className="text-xs text-gray-600 font-medium w-full text-center border-b border-gray-200 py-1">
                        {formatDate(date, 'month')} {date.getFullYear()}
                      </div>
                    )}
                    <div className="flex flex-col items-center py-2 px-1">
                      <span className={`text-xs ${isToday(date) ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                        {formatDate(date, 'day')}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(date, 'weekday')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task, taskIndex) => (
                <div key={task.id} className="flex border-b border-gray-200 hover:bg-gray-50 group">
                  <div className="flex relative" style={{ height: '80px' }}>
                    {dates.map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className={`border-r border-gray-200 ${isWeekend(date) ? 'bg-gray-50' : ''} ${isToday(date) ? 'bg-blue-50' : ''}`}
                        style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                      />
                    ))}

                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded-md ${task.color} 
                        shadow-sm flex items-center px-2 group-hover:shadow-md transition-shadow
                        ${task.width * cellWidth > 100 ? 'justify-start' : 'justify-center'}`}
                      style={{
                        left: `${task.left * cellWidth + 2}px`,
                        width: `${Math.max(20, task.width * cellWidth - 4)}px`,
                      }}
                      title={`${task.name}\nDescription: ${task.description}\nAssigned To: ${task.assignedTo || 'Unassigned'}\nStart: ${formatDate(task.startDate, 'full')}\nEnd: ${formatDate(
                        task.dueDate,
                        'full'
                      )}\nStatus: ${task.status}\nPriority: ${task.priority}`}
                    >
                      {task.width * cellWidth > 20 && (
                        <span className="text-white text-xs truncate font-medium">{task.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : !loading ? (
              <div className="py-12 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">
                  {searchQuery ? `No tasks found matching "${searchQuery}"` : 'No tasks found'}
                </p>
                <p className="text-sm">
                  {searchQuery 
                    ? 'Try adjusting your search terms or clear the search to see all tasks'
                    : 'No tasks are scheduled in this time period'
                  }
                </p>
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-sm mr-1" />
            <span>Not Started</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-1" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-1" />
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-1" />
            <span>Overdue</span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {searchQuery ? (
            <>Showing {visibleTasks.length} of {filteredTasksCount} matching tasks ({tasks.length} total)</>
          ) : (
            <>Showing {visibleTasks.length} of {tasks.length} tasks</>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;