import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../../common-components/Button';
// Import useAuth
import apiClient, { setupAxiosInterceptors } from '../../services/apiClient'; // Import apiClient
import { useAuth } from '../../context/AuthContext';

const GanttChart = ({ tasks: propTasks }) => {
  const { acquireToken, isAuthenticated, isInitialized, isLoading } = useAuth(); // Use auth context
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visibleTasks, setVisibleTasks] = useState([]);
  const [tasks, setTasks] = useState(propTasks || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  // Set up axios interceptor
  useEffect(() => {
    setupAxiosInterceptors(acquireToken);
  }, [acquireToken]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/Task');
      const apiTasks = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
      const mergedTasks = [
        ...apiTasks,
        ...(propTasks || []).filter(pt => !apiTasks.some(at => at.id === pt.id))
      ];
      setTasks(mergedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(`Failed to fetch tasks: ${error.response?.data?.message || error.message}`);
      if (propTasks) {
        setTasks(propTasks); // Use propTasks if API fails
      } else {
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      fetchTasks();
    }
  }, [isAuthenticated, isInitialized]);

  const getDates = () => {
    const dates = [];
    let startDate = new Date(currentDate);
    
    if (viewMode === 'hour') {
      startDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < 24; i++) {
        const date = new Date(startDate);
        date.setHours(date.getHours() + i);
        dates.push(date);
      }
    } else if (viewMode === 'week') {
      const day = startDate.getDay();
      const daysSinceMonday = day === 0 ? 6 : day - 1;
      startDate.setDate(startDate.getDate() - daysSinceMonday);
      for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
    } else if (viewMode === 'month') {
      startDate.setDate(1);
      const prevMonthDays = 15;
      const prevStart = new Date(startDate);
      prevStart.setDate(prevStart.getDate() - prevMonthDays);
      for (let i = 0; i < 90; i++) {
        const date = new Date(prevStart);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
    } else if (viewMode === 'quarter') {
      const quarterStartMonth = Math.floor(startDate.getMonth() / 3) * 3;
      startDate = new Date(startDate.getFullYear(), quarterStartMonth, 1);
      for (let i = 0; i < 180; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
    }
    
    return dates;
  };

  const formatDate = (date, format = 'day') => {
    if (format === 'hour') {
      return date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (format === 'month') {
      return date.toLocaleString('default', { month: 'short' });
    } else if (format === 'full') {
      return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (format === 'weekday') {
      return date.toLocaleString('default', { weekday: 'short' });
    } else {
      return date.getDate();
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const navigateTimeline = (direction) => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'hour') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'quarter') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
    }
    
    setCurrentDate(newDate);
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

  useEffect(() => {
    if (!propTasks || propTasks.length === 0) {
      setVisibleTasks([]);
      return;
    }
    
    const dates = getDates();
    if (dates.length === 0) return;
    
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    const processedTasks = propTasks.map((task, index) => {
      try {
        const startDateField = task.startDate || task.start_date || task.startDateTime || task.createdAt;
        const endDateField = task.endDate || task.dueDate || task.due_date || task.end_date || task.deadline;
        
        const taskStart = parseDate(startDateField);
        const taskEnd = parseDate(endDateField);
        
        if (!taskStart || !taskEnd) {
          console.warn(`Task "${task.taskName || task.title || `Task ${index}`}" has invalid dates:`, {
            start: startDateField,
            end: endDateField
          });
          return null;
        }
        
        let adjustedStart = taskStart;
        let adjustedEnd = taskEnd;
        if (viewMode === 'hour') {
          const currentDayStart = new Date(currentDate);
          currentDayStart.setHours(0, 0, 0, 0);
          const currentDayEnd = new Date(currentDayStart);
          currentDayEnd.setHours(23, 59, 59, 999);
          
          if (taskEnd < currentDayStart || taskStart > currentDayEnd) {
            return null;
          }
          
          adjustedStart = taskStart < currentDayStart ? currentDayStart : taskStart;
          adjustedEnd = taskEnd > currentDayEnd ? currentDayEnd : taskEnd;
        } else {
          if (taskEnd < firstDate || taskStart > lastDate) {
            return null;
          }
        }
        
        const msPerUnit = viewMode === 'hour' ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24;
        const totalUnits = Math.ceil((lastDate - firstDate) / msPerUnit) + 1;
        
        const startUnits = Math.floor((adjustedStart - firstDate) / msPerUnit);
        const endUnits = Math.floor((adjustedEnd - firstDate) / msPerUnit);
        
        const left = Math.max(0, startUnits);
        const right = Math.min(totalUnits - 1, endUnits);
        const width = Math.max(1, right - left + 1);
        
        let color = 'bg-gray-300';
        const status = (task.status || '').toLowerCase();
        const now = new Date();
        
        if (status === 'completed' || status === 'done' || status === 'finished') {
          color = 'bg-green-500';
        } else if (status === 'in-progress' || status === 'In Progress' || status === 'active') {
          color = 'bg-yellow-500';
        } else if (status === 'overdue' || (now > taskEnd && status !== 'completed')) {
          color = 'bg-red-500';
        } else if (status === 'blocked' || status === 'on-hold') {
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
          originalTask: task
        };
      } catch (e) {
        console.error('Error processing task:', task, e);
        return null;
      }
    }).filter(Boolean);
    
    setVisibleTasks(processedTasks);
    
    if (scrollContainerRef.current && !loading) {
      setTimeout(() => {
        const today = new Date();
        const todayIndex = dates.findIndex(date => 
          date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() && 
          date.getFullYear() === today.getFullYear()
        );
        
        if (todayIndex >= 0) {
          const cellWidth = viewMode === 'hour' ? window.innerWidth / 24 : viewMode === 'week' ? window.innerWidth / 14 : 40;
          const containerWidth = scrollContainerRef.current.clientWidth;
          const scrollPosition = Math.max(0, todayIndex * cellWidth - containerWidth / 2);
          scrollContainerRef.current.scrollLeft = scrollPosition;
        }
      }, 100);
    }
  }, [propTasks, currentDate, viewMode, loading]);

  const getCurrentPeriodText = () => {
    const date = currentDate;
    if (viewMode === 'hour') {
      return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const daysSinceMonday = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    } else if (viewMode === 'month') {
      return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'quarter') {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    }
  };

  const dates = getDates();
  const cellWidth = viewMode === 'hour'
    ? Math.max(20, window.innerWidth / 24)
    : viewMode === 'week'
    ? Math.max(20, window.innerWidth / 14)
    : 40;

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

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Task Timeline</h2>
          <p className="text-sm text-gray-600">{getCurrentPeriodText()}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-md p-1">
            {['hour', 'week', 'month', 'quarter'].map(mode => (
              <button 
                key={mode}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  viewMode === mode ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="p-1 h-8 w-8"
              onClick={() => navigateTimeline('prev')}
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="p-1 h-8 w-8"
              onClick={() => setCurrentDate(new Date())}
              title="Go to today"
            >
              <span> Today</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-1 h-8 w-8"
              onClick={() => navigateTimeline('next')}
              title="Next period"
            >
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
      
      <div className="overflow-hidden border border-gray-200 rounded-md">
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-auto"
          style={{ 
            maxHeight: 'calc(100vh - 300px)', 
            minHeight: '400px'
          }}
        >
          <div className="flex border-b border-gray-200 sticky top-0 bg-gray-100 z-10" style={{ minWidth: `${dates.length * cellWidth}px` }}>
            <div className="flex" style={{ minWidth: `${dates.length * cellWidth}px` }}>
              {dates.map((date, index) => {
                const prevDate = index > 0 ? dates[index - 1] : null;
                const showMonth = index === 0 || (prevDate && date.getMonth() !== prevDate.getMonth());
                
                return (
                  <div 
                    key={index} 
                    className={`flex flex-col items-center justify-center border-r border-gray-200 
                      ${isWeekend(date) ? 'bg-gray-50' : ''} 
                      ${isToday(date) ? 'bg-blue-50 border-blue-200' : ''}`}
                    style={{ 
                      width: `${cellWidth}px`, 
                      minWidth: `${cellWidth}px` 
                    }}
                  >
                    {showMonth && viewMode !== 'hour' && (
                      <div className="text-xs text-gray-600 font-medium w-full text-center border-b border-gray-200 py-1">
                        {formatDate(date, 'month')} {date.getFullYear()}
                      </div>
                    )}
                    <div className="flex flex-col items-center py-2 px-1">
                      <span className={`text-xs ${isToday(date) ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                        {formatDate(date, viewMode === 'hour' ? 'hour' : 'day')}
                      </span>
                      {viewMode !== 'hour' && (
                        <span className="text-xs text-gray-500">
                          {formatDate(date, 'weekday')}
                        </span>
                      )}
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
                        className={`border-r border-gray-200 
                          ${isWeekend(date) ? 'bg-gray-50' : ''} 
                          ${isToday(date) ? 'bg-blue-50' : ''}`}
                        style={{ 
                          width: `${cellWidth}px`, 
                          minWidth: `${cellWidth}px` 
                        }}
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
                      title={`${task.name}\nDescription: ${task.description}\nStart: ${formatDate(task.startDate, 'full')}\nEnd: ${formatDate(task.dueDate, 'full')}\nStatus: ${task.status}`}
                    >
                      {task.width * cellWidth > 20 && (
                        <span className="text-gray-800 text-xs truncate font-medium">
                          {task.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : !loading ? (
              <div className="py-12 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-sm">No tasks are scheduled in this time period</p>
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
          Showing {visibleTasks.length} of {tasks.length} tasks
        </div>
      </div>
    </div>
  );
};

export default GanttChart;