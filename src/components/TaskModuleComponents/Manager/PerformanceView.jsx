import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../common-components/LoadingSpinner';
import ErrorMessage from '../../common-components/ErrorMessage';
import { makeAuthenticatedRequest } from './utils';
import { BarChart2, Clock, CheckCircle, AlertTriangle, Percent, Clock4, Truck } from 'lucide-react';
import { fetchEncryptionKeys } from '../../services/apiClient';
import { decryptString } from '../../services/decrypt';
 
const PerformanceView = ({ viewType, selectedYear, selectedMonth, selectedWeek, searchQuery, months }) => {
  const [tasks, setTasks] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMenuUserId, setActionMenuUserId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackUser, setFeedbackUser] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const feedbackInputRef = useRef(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);
  const [keyError, setKeyError] = useState(null);
 
  const { acquireToken, isAuthenticated, isLoading, user } = useAuth();
  const managerId = user?.id; // Use 'id' instead of 'userId' based on user object structure
  const TASKS_URL = 'http://localhost:5181/api/Task/alltaskforPerformance';
  const USER_ALL_URL = 'http://localhost:5181/api/User/all';
  const FEEDBACK_API_URL = 'http://localhost:5181/api/Feedback';
  const BROADCAST_FEEDBACK_API_URL = 'http://localhost:5181/api/Feedback/broadcast';
 console.log(managerId);
  // Debug: Log the user object to monitor changes
  useEffect(() => {
    console.log('Auth user object:', user);
  }, [user]);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch encryption keys...');
        try {
          const keys = await fetchEncryptionKeys();
          console.log('Keys fetched:', keys);
          if (keys && keys.aesKey && keys.aesIV) {
            setAesKey(keys.aesKey);
            setAesIV(keys.aesIV);
          } else {
            throw new Error('Invalid keys structure');
          }
        } catch (keyError) {
          console.error('Failed to fetch encryption keys:', keyError);
          setKeyError(keyError.message);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };
 
    fetchData();
  }, []);
 
  const fetchPerformanceData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setPerformanceLoading(true);
    setPerformanceError(null);
    try {
      const allUsers = await makeAuthenticatedRequest(USER_ALL_URL, 'GET', null, acquireToken);
      const newUserMap = allUsers.reduce((acc, user) => {
        acc[user.userId] = user.name;
        return acc;
      }, {});
      const tasksData = await makeAuthenticatedRequest(TASKS_URL, 'GET', null, acquireToken);
      setUserMap(newUserMap);
      setTasks(tasksData || []);
    } catch (err) {
      setPerformanceError(err.message);
      console.error('Error fetching performance data:', err);
    } finally {
      setPerformanceLoading(false);
    }
  }, [isAuthenticated, isLoading, acquireToken]);
 
  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);
 
  useEffect(() => {
    if (showFeedbackModal && feedbackInputRef.current) {
      feedbackInputRef.current.focus();
    }
  }, [showFeedbackModal]);
 
  const getFilteredTasks = () => {
    if (!tasks || tasks.length === 0) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.createdDate || task.dueDate);
      const taskYear = taskDate.getFullYear();
      const taskMonth = taskDate.getMonth();
      if (taskYear !== selectedYear) return false;
      switch (viewType) {
        case 'Weekly':
          if (taskMonth !== selectedMonth) return false;
          const taskWeek = Math.ceil(taskDate.getDate() / 7);
          return taskWeek === selectedWeek;
        case 'Monthly':
          return taskMonth === selectedMonth;
        case 'Yearly':
          return true;
        default:
          return true;
      }
    });
  };
 
  const filteredTasksByPeriod = getFilteredTasks();
 
  const calculatePerformanceMetrics = useMemo(() => {
    if (!filteredTasksByPeriod.length) return [];
    const performanceMap = {};
    filteredTasksByPeriod.forEach(task => {
      const userId = task.createdBy;
      if (!performanceMap[userId]) {
        performanceMap[userId] = {
          userId,
          name: decryptString(userMap[userId], aesKey, aesIV) || `User ${userId.slice(0, 8)}`,
          estimatedHours: 0,
          actualHours: 0,
          onTime: 0,
          totalTasks: 0,
          overdue: 0,
        };
      }
      const userPerf = performanceMap[userId];
      userPerf.estimatedHours += task.estimatedHours || 0;
      userPerf.actualHours += task.completedHours || 0;
      userPerf.totalTasks += 1;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const isOverdue = task.status !== 'Completed' && dueDate < today;
      if (isOverdue) userPerf.overdue += 1;
      else userPerf.onTime += 1;
    });
 
    return Object.values(performanceMap)
      .filter(user => !searchQuery || user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(user => {
        const onTimePercentage = user.totalTasks ? (user.onTime / user.totalTasks) * 100 : 0;
        const avgTaskTime = user.totalTasks ? (user.actualHours / user.totalTasks) : 0;
        const variance = user.actualHours - user.estimatedHours;
        return {
          userId: user.userId,
          name: user.name,
          onTimePercentage: onTimePercentage.toFixed(0),
          avgTaskTime: avgTaskTime.toFixed(1),
          estimatedHours: user.estimatedHours,
          actualHours: user.actualHours,
          variance,
          overdue: user.overdue,
          totalTasks: user.totalTasks,
        };
      });
  }, [filteredTasksByPeriod, userMap, searchQuery, aesKey, aesIV]);
 
  const performanceData = useMemo(() => {
    let baseData = calculatePerformanceMetrics;
    switch (performanceFilter) {
      case 'all':
        return baseData;
      case 'flagged-any':
        return baseData.filter(row => row.overdue > 0 || row.variance > 0);
      case 'flagged-overdue':
        return baseData.filter(row => row.overdue > 0);
      case 'flagged-underlogged':
        return baseData.filter(row => row.variance < 0);
      case 'non-flagged':
        return baseData.filter(row => row.overdue === 0 && row.variance <= 0);
      default:
        return baseData;
    }
  }, [calculatePerformanceMetrics, performanceFilter]);
 
  const calculateKPIs = () => {
    let tasksToAnalyze = filteredTasksByPeriod;
    if (selectedUser) {
      tasksToAnalyze = filteredTasksByPeriod.filter(t => t.createdBy === selectedUser.userId);
    }
    if (!tasksToAnalyze.length) {
      return {
        totalEstimatedHours: 0,
        totalActualHours: 0,
        totalTasks: 0,
        completedTasks: 0,
        onTimeTasks: 0,
        hoursVariance: 0,
        hoursVariancePercentage: 0,
        onTimePercentage: 0,
        avgTaskTimeDays: 0,
        onTimeDelivery: 0,
      };
    }
    const totalEstimatedHours = tasksToAnalyze.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActualHours = tasksToAnalyze.reduce((sum, t) => sum + (t.completedHours || 0), 0);
    const totalTasks = tasksToAnalyze.length;
    const completedTasks = tasksToAnalyze.filter(t => t.status === 'Completed').length;
    const onTimeTasks = tasksToAnalyze.filter(task => {
      const dueDate = new Date(task.dueDate);
      const updatedAt = new Date(task.updatedAt || task.dueDate);
      return task.status === 'Completed' && updatedAt <= dueDate;
    }).length;
    const hoursVariance = totalActualHours - totalEstimatedHours;
    const hoursVariancePercentage = totalEstimatedHours > 0 ? ((hoursVariance / totalEstimatedHours) * 100).toFixed(1) : 0;
    const onTimePercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const avgTaskTimeDays = completedTasks > 0 ? (totalActualHours / completedTasks) : 0;
    const onTimeDelivery = completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0;
    return {
      totalEstimatedHours,
      totalActualHours,
      totalTasks,
      completedTasks,
      onTimeTasks,
      hoursVariance,
      hoursVariancePercentage,
      onTimePercentage,
      avgTaskTimeDays,
      onTimeDelivery,
    };
  };
 
  const kpis = calculateKPIs();
 
  const getPeriodDescription = () => {
    switch (viewType) {
      case 'Weekly':
        return `${months[selectedMonth]} ${selectedYear}, Week ${selectedWeek}`;
      case 'Monthly':
        return `${months[selectedMonth]} ${selectedYear}`;
      case 'Yearly':
        return `${selectedYear}`;
      default:
        return '';
    }
  };
 
  const handleUserClick = (user) => {
    if (selectedUser?.userId === user.userId) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
    setActionMenuUserId(null);
  };
 
  const toggleActionMenu = (userId, e) => {
    e.stopPropagation();
    if (actionMenuUserId === userId) {
      setActionMenuUserId(null);
    } else {
      setActionMenuUserId(userId);
    }
  };
 
  const openSendFeedback = (user, e) => {
    e.stopPropagation();
    setActionMenuUserId(null);
    setFeedbackUser(user);
    setFeedbackMessage('');
    setShowFeedbackModal(true);
  };
 
  const sendCustomFeedback = async () => {
    if (!feedbackMessage.trim()) {
      alert('Please enter feedback message');
      return;
    }
    if (!managerId) {
      console.error('Manager ID is not available:', { user });
      alert('Cannot send feedback: Manager authentication is not properly set up');
      return;
    }
    try {
      const token = await acquireToken('api');
      if (!token) throw new Error('Failed to get authentication token');
      const feedbackPayload = {
        userId: feedbackUser.userId,
        managerId,
        message: feedbackMessage,
        isRead: false,
        sentAt: new Date().toISOString(),
        year: selectedYear,
        month: selectedMonth + 1,
        week: viewType === 'Weekly' ? selectedWeek : null,
        viewType,
      };
      await axios.post(FEEDBACK_API_URL, feedbackPayload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      alert('Feedback sent successfully.');
      setShowFeedbackModal(false);
      setFeedbackMessage('');
      setFeedbackUser(null);
    } catch (e) {
      alert('Failed to send feedback: ' + (e.message || e));
    }
  };
 
  const toggleFilterMenu = () => {
    setFilterMenuOpen(prev => !prev);
  };
 
  const handleFilterChange = (newFilter) => {
    setPerformanceFilter(newFilter);
    setFilterMenuOpen(false);
  };
 
  const filterDisplayNames = {
    all: 'All Users',
    'flagged-any': 'Flagged Users - Any',
    'flagged-overdue': 'Flagged Users - Tasks Overdue',
    'flagged-underlogged': 'Flagged Users - Under Logged',
    'non-flagged': 'Non Flagged Users',
  };
 
  const getFilteredUserIds = () => {
    return performanceData.map(u => u.userId);
  };
 
  const sendBroadcastNotification = async () => {
    if (!broadcastMessage.trim()) {
      alert('Please enter a broadcast message');
      return;
    }
    const userIdsToNotify = getFilteredUserIds();
    if (userIdsToNotify.length === 0) {
      alert('No users to notify with the current filter.');
      return;
    }
    if (!managerId) {
      console.error('Manager ID is not available:', { user });
      alert('Cannot send notification: Manager authentication is not properly set up');
      return;
    }
    setBroadcastSending(true);
    try {
      const token = await acquireToken('api');
      if (!token) throw new Error('Failed to get authentication token');
      const payload = {
        userIds: userIdsToNotify,
        managerId,
        message: broadcastMessage,
        isRead: false,
        sentAt: new Date().toISOString(),
        year: selectedYear,
        month: selectedMonth + 1,
        week: viewType === 'Weekly' ? selectedWeek : null,
        viewType,
      };
      await axios.post(BROADCAST_FEEDBACK_API_URL, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      alert(`Notification sent to ${userIdsToNotify.length} user(s) successfully.`);
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    } catch (err) {
      console.error('Broadcast send error:', err);
      alert('Failed to send broadcast notification: ' + (err.message || err));
    } finally {
      setBroadcastSending(false);
    }
  };
 
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="mb-6 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedUser ? `Performance Metrics for ${selectedUser.name}` : 'Overall Performance Metrics (All Users)'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Period: {getPeriodDescription()}</p>
        </div>
 
        <div className="flex items-center space-x-4 relative">
          <button
            type="button"
            onClick={toggleFilterMenu}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-haspopup="true"
            aria-expanded={filterMenuOpen}
          >
            <span>{filterDisplayNames[performanceFilter]}</span>
            <svg
              className="ml-2 h-4 w-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8l4 4 4-4" />
            </svg>
          </button>
 
          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            disabled={!managerId || (performanceFilter === 'all' && performanceData.length === 0)}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Notification
          </button>
 
          <AnimatePresence>
            {filterMenuOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="filter-menu-button"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className={`flex items-center gap-2 w-full px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors ${
                    performanceFilter === 'all' ? 'font-semibold' : 'font-normal'
                  }`}
                  onClick={() => handleFilterChange('all')}
                  role="menuitem"
                  type="button"
                >
                  <BarChart2 className="w-5 h-5" />
                  All Users
                </button>
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <div className="px-4 py-1 font-semibold text-gray-700">Flagged Users</div>
                  <button
                    className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 ${performanceFilter === 'flagged-any' ? 'bg-gray-100 font-semibold' : ''}`}
                    onClick={() => handleFilterChange('flagged-any')}
                    role="menuitem"
                    type="button"
                  >
                    <input
                      type="radio"
                      readOnly
                      checked={performanceFilter === 'flagged-any'}
                      className="mr-2"
                    />
                    Any
                  </button>
                  <button
                    className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 ${performanceFilter === 'flagged-overdue' ? 'bg-gray-100 font-semibold' : ''}`}
                    onClick={() => handleFilterChange('flagged-overdue')}
                    role="menuitem"
                    type="button"
                  >
                    <input
                      type="radio"
                      readOnly
                      checked={performanceFilter === 'flagged-overdue'}
                      className="mr-2"
                    />
                    Tasks Overdue
                  </button>
                  <button
                    className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 ${performanceFilter === 'flagged-underlogged' ? 'bg-gray-100 font-semibold' : ''}`}
                    onClick={() => handleFilterChange('flagged-underlogged')}
                    role="menuitem"
                    type="button"
                  >
                    <input
                      type="radio"
                      readOnly
                      checked={performanceFilter === 'flagged-underlogged'}
                      className="mr-2"
                    />
                    Under Logged
                  </button>
                </div>
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 ${performanceFilter === 'non-flagged' ? 'bg-gray-100 font-semibold' : ''}`}
                    onClick={() => handleFilterChange('non-flagged')}
                    role="menuitem"
                    type="button"
                  >
                    <input
                      type="radio"
                      readOnly
                      checked={performanceFilter === 'non-flagged'}
                      className="mr-2"
                    />
                    Non Flagged Users
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
 
      {filteredTasksByPeriod.length === 0 ? (
        <motion.div
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-yellow-800 font-medium">No tasks found for the selected period</p>
          <p className="text-yellow-600 text-sm mt-1">
            Try selecting a different time period or check if tasks exist for {getPeriodDescription()}
          </p>
        </motion.div>
      ) : (
        <>
          {/* KPIs */}
          <motion.div
            className="flex justify-center flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {[
              {
                label: 'Total Estimated Hours',
                value: kpis.totalEstimatedHours.toFixed(1),
                bg: 'bg-blue-50',
                color: 'text-blue-700',
                icon: (<div className='flex items-center justify-center'><Clock className="h-8 w-8" /></div>),
              },
              {
                label: 'Total Completed Hours',
                value: kpis.totalActualHours.toFixed(1),
                bg: 'bg-emerald-50',
                color: 'text-green-700',
                icon: (<div className='flex items-center justify-center'><CheckCircle className="h-8 w-8" /></div>),
              },
              {
                label: 'Total Variance Hours',
                value: `${kpis.hoursVariance < 0 ? '' : '+'}${kpis.hoursVariance.toFixed(1)}`,
                bg: 'bg-indigo-50',
                color: kpis.hoursVariance < 0 ? 'text-green-600' : 'text-red-600',
                subtext: `${kpis.hoursVariancePercentage}% variance`,
                icon: (<div className='flex items-center justify-center'><AlertTriangle className="h-8 w-8" /></div>),
              },
              {
                label: 'Task Completed %',
                value: `${kpis.onTimePercentage.toFixed(0)}%`,
                bg: 'bg-purple-50',
                color: 'text-purple-700',
                subtext: `${kpis.completedTasks} of ${kpis.totalTasks} tasks`,
                icon: (
                  <div className='flex items-center justify-center'>
                    <Percent className="h-8 w-8" />
                  </div>),
              },
              {
                label: 'Avg Task Time',
                value: `${kpis.avgTaskTimeDays.toFixed(1)} Hrs`,
                bg: 'bg-zinc-50',
                color: 'text-gray-900',
                icon: (
                  <div className='flex items-center justify-center'>
                    <Clock4 className="h-8 w-8" />
                  </div>),
              },
              {
                label: 'On-Time Delivery',
                value: `${kpis.onTimeDelivery.toFixed(0)}%`,
                bg: 'bg-emerald-50',
                color: 'text-green-700',
                subtext: `${kpis.onTimeTasks} of ${kpis.totalTasks} tasks`,
                icon: (
                  <div className='flex items-center justify-center'>
                    <Truck className="h-8 w-8" />
                  </div>),
              },
            ].map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                className={`p-4 rounded-lg shadow-sm border border-gray-200 text-center flex-1 min-w-[180px] ${kpi.bg} hover:shadow-md transition-shadow`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`mb-2 ${kpi.color}`}>{kpi.icon}</div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color || 'text-gray-900'}`}>{kpi.value}</p>
                {kpi.subtext && <p className="text-sm text-gray-500">{kpi.subtext}</p>}
              </motion.div>
            ))}
          </motion.div>
 
          {/* Performance Table */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {performanceLoading ? (
              <LoadingSpinner />
            ) : performanceError || keyError ? (
              <ErrorMessage message={performanceError || keyError} />
            ) : performanceData.length === 0 ? (
              <motion.div
                className="text-center py-8 text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p>No performance data available for the selected period & filter</p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-6 text-center font-semibold text-gray-700">Name</th>
                      <th className="py-3 px-6 text-center font-semibold text-gray-700">Completed Task</th>
                      <th className="py-3 px-6 text-center font-semibold text-gray-700">Avg Task Time</th>
                      <th className="py-3 px-6 text-center font-semibold text-gray-700">Estimated Hours</th>
                      <th className="py-3 px-6 text-center font-semibold text-gray-700">Actual Hours</th>
                      <th className="py-3 px-6 text-center font-semibold text-gray-700">Variance</th>
                      <th className="py-3 px-6 text-center font-semibold text-gray-700">Overdue Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((row, idx) => {
                      const hasRedFlag = row.overdue > 0 || row.variance > 0;
                      return (
                        <motion.tr
                          key={row.userId}
                          onClick={() => handleUserClick(row)}
                          className={`cursor-pointer ${
                            selectedUser?.userId === row.userId
                              ? 'bg-violet-50 border-l-4 border-violet-500'
                              : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-gray-25'
                          } hover:bg-violet-100 transition-colors relative`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <td className="py-3 px-6 font-medium text-gray-900">{row.name}</td>
                          <td className="py-3 px-6 text-center text-gray-700">{row.onTimePercentage}%</td>
                          <td className="py-3 px-6 text-center text-gray-700">{row.avgTaskTime}</td>
                          <td className="py-3 px-6 text-center text-gray-700">{row.estimatedHours}</td>
                          <td className="py-3 px-6 text-center text-gray-700">{row.actualHours}</td>
                          <td
                            className={`py-3 px-6 text-center font-medium ${
                              row.variance < 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {row.variance < 0 ? '' : '+'}
                            {row.variance}
                          </td>
                          <td className="py-3 px-6 text-center relative">
                            <span className="flex items-center justify-center relative group cursor-default">
                              {!hasRedFlag ? (
                                <>
                                  {row.overdue > 0 ? row.overdue : 0}
                                  <svg
                                    className="h-5 w-5 text-green-500 ml-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <motion.div
                                    className="absolute bottom-full mb-2 px-3 py-1 rounded bg-green-600 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 max-w-xs"
                                    transition={{ duration: 0.2 }}
                                  >
                                    All tasks on time
                                  </motion.div>
                                </>
                              ) : (
                                <>
                                  {row.overdue > 0 ? row.overdue : 0}
                                  <button
                                    onClick={(e) => toggleActionMenu(row.userId, e)}
                                    className="h-5 w-5 text-red-500 ml-1 focus:outline-none"
                                    aria-label="Open actions"
                                    disabled={!managerId}
                                  >
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18m0-6h10l2-3-2-3H3z" />
                                    </svg>
                                  </button>
                                  <motion.div
                                    className="absolute bottom-full mb-2 px-3 py-1 rounded bg-red-600 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 max-w-xs text-left"
                                    transition={{ duration: 0.2 }}
                                  >
                                    {row.overdue > 0 && row.variance > 0 && (
                                      <>User has overdue tasks and exceeded estimated hours by {row.variance} hours.</>
                                    )}
                                    {row.overdue > 0 && row.variance <= 0 && <>User has overdue tasks.</>}
                                    {row.overdue === 0 && row.variance > 0 && <>User exceeded the estimated hours by {row.variance} hours.</>}
                                  </motion.div>
                                </>
                              )}
                            </span>
                            <AnimatePresence>
                              {actionMenuUserId === row.userId && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <motion.button
                                    onClick={(e) => openSendFeedback(row, e)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    type="button"
                                    whileHover={{ backgroundColor: '#f3f4f6' }}
                                  >
                                    Send Custom Feedback
                                  </motion.button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
 
          {/* Custom feedback modal */}
          <AnimatePresence>
            {showFeedbackModal && feedbackUser && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold mb-4">Send Custom Feedback</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">To</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                      value={feedbackUser.name}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Message</label>
                    <textarea
                      ref={feedbackInputRef}
                      rows="5"
                      className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-violet-500"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Enter your feedback..."
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <motion.button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      onClick={() => setShowFeedbackModal(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={sendCustomFeedback}
                      disabled={!managerId}
                      whileHover={{ scale: managerId ? 1.05 : 1 }}
                      whileTap={{ scale: managerId ? 0.95 : 1 }}
                    >
                      Send
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
 
          {/* Broadcast notification modal */}
          <AnimatePresence>
            {showBroadcastModal && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowBroadcastModal(false)}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-semibold mb-4">Send Notification to Filtered Users</h2>
                  <p className="mb-4 text-gray-700">
                    This will send the notification to all users filtered by: <strong>{filterDisplayNames[performanceFilter]}</strong>.
                    Total users: <strong>{getFilteredUserIds().length}</strong>
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Message</label>
                    <textarea
                      rows="5"
                      className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-violet-500"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Enter your notification message..."
                      disabled={broadcastSending}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <motion.button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      onClick={() => setShowBroadcastModal(false)}
                      disabled={broadcastSending}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className={`px-4 py-2 rounded text-white ${broadcastSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      onClick={sendBroadcastNotification}
                      disabled={broadcastSending || !managerId}
                      whileHover={{ scale: (broadcastSending || !managerId) ? 1 : 1.05 }}
                      whileTap={{ scale: (broadcastSending || !managerId) ? 1 : 0.95 }}
                    >
                      {broadcastSending ? 'Sending...' : 'Send'}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};
 
export default PerformanceView;