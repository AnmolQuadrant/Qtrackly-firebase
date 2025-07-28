import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import apiClient, { setupAxiosInterceptors } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import GanttChart from './GanttChart';

const TaskFetcher = ({ viewMode = 'month', year, month, week, quarter }) => {
  const { acquireToken, isAuthenticated, isInitialized, isLoading, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setupAxiosInterceptors(acquireToken);
  }, [acquireToken]);

  const fetchTasks = async () => {
    if (!user?.id) {
      setError('User ID not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let allTasks = [];
      let page = 1;
      const pageSize = 100;

      // Fetch all tasks with pagination
      while (true) {
        const response = await apiClient.get(`/Task?userId=${user.id}&page=${page}&size=${pageSize}`);
        const tasks = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
        allTasks = [...allTasks, ...tasks];
        console.log(`Fetched ${tasks.length} tasks from page ${page}, total: ${allTasks.length}`);
        if (tasks.length < pageSize) break;
        page++;
      }

      // Filter tasks based on viewMode and parameters
      const filteredTasks = filterTasks(allTasks, viewMode, year, month, week, quarter);
      console.log(`Filtered ${filteredTasks.length} tasks for ${viewMode} view`);
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(`Failed to fetch tasks: ${error.response?.data?.message || error.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
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

      // Convert to IST
      date = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      return date;
    } catch (e) {
      console.error('Error parsing date:', dateInput, e);
      return null;
    }
  };

  const filterTasks = (tasks, viewMode, year, month, week, quarter) => {
    if (!tasks || tasks.length === 0) return [];

    const ist = 'Asia/Kolkata';
    let startDate, endDate;

    if (viewMode === 'month') {
      if (!year || !month || month < 1 || month > 12) {
        console.warn('Invalid month parameters', { year, month });
        return tasks;
      }
      startDate = new Date(year, month - 1, 1);
      startDate = new Date(startDate.toLocaleString('en-US', { timeZone: ist }));
      endDate = new Date(year, month, 0);
      endDate = new Date(endDate.toLocaleString('en-US', { timeZone: ist }));
    } else if (viewMode === 'week') {
      if (!year || !month || !week || month < 1 || month > 12 || week < 1 || week > 5) {
        console.warn('Invalid week parameters', { year, month, week });
        return tasks;
      }
      const firstDayOfMonth = new Date(year, month - 1, 1);
      startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() + (week - 1) * 7);
      startDate = new Date(startDate.toLocaleString('en-US', { timeZone: ist }));
      if (startDate.getMonth() !== month - 1) {
        startDate = new Date(year, month, 0);
      }
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate = new Date(endDate.toLocaleString('en-US', { timeZone: ist }));
      const lastDayOfMonth = new Date(year, month, 0);
      if (endDate > lastDayOfMonth) {
        endDate = lastDayOfMonth;
      }
    } else if (viewMode === 'quarter') {
      if (!year || !quarter || quarter < 1 || quarter > 4) {
        console.warn('Invalid quarter parameters', { year, quarter });
        return tasks;
      }
      const quarterStartMonth = (quarter - 1) * 3;
      startDate = new Date(year, quarterStartMonth, 1);
      startDate = new Date(startDate.toLocaleString('en-US', { timeZone: ist }));
      endDate = new Date(year, quarterStartMonth + 3, 0);
      endDate = new Date(endDate.toLocaleString('en-US', { timeZone: ist }));
    } else {
      console.warn(`Unsupported viewMode: ${viewMode}`);
      return tasks;
    }

    const filteredTasks = tasks.filter((task) => {
      const taskStart = parseDate(task.startDate || task.start_date || task.startDateTime || task.createdAt);
      const taskEnd = parseDate(task.dueDate || task.endDate || task.due_date || task.end_date || task.deadline);

      if (!taskStart || !taskEnd) {
        console.warn(`Skipping task with invalid dates: ${task.taskName || task.title || task.id || 'Unknown'}`, {
          start: task.startDate || task.start_date || task.startDateTime || task.createdAt,
          end: task.dueDate || task.endDate || task.due_date || task.end_date || task.deadline
        });
        return false;
      }

      // Log tasks starting on the 17th for debugging
      if (taskStart.getDate() === 17) {
        console.log(`Found task starting on 17th: ${task.taskName || task.title || task.id}`, {
          startDate: taskStart.toISOString(),
          endDate: taskEnd.toISOString(),
          viewMode,
          viewStart: startDate.toISOString(),
          viewEnd: endDate.toISOString()
        });
      }

      const overlaps = taskStart <= endDate && taskEnd >= startDate;
      if (taskStart.getDate() === 17 && !overlaps) {
        console.log(`Task on 17th excluded in ${viewMode} view: ${task.taskName || task.title || task.id}`);
      }
      return overlaps;
    });

    return filteredTasks;
  };

  useEffect(() => {
    if (isAuthenticated && isInitialized && user?.id) {
      fetchTasks();
    }
  }, [isAuthenticated, isInitialized, user?.id, viewMode, year, month, week, quarter]);

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg font-medium">Please log in to view tasks.</p>
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
    <div>
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
      <GanttChart tasks={tasks} />
    </div>
  );
};

export default TaskFetcher;