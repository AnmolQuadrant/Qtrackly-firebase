

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Search, Calendar, AlertCircle, BarChart3, Activity, Settings, Filter, Bell, ChevronRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomDropdown from '../../common-components/CustomDropdown';
import LoadingSpinner from '../../common-components/LoadingSpinner';
import PerformanceView from './PerformanceView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import YearlyView from './YearlyView';
import { makeAuthenticatedRequest } from './utils';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p>{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('timesheets');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [monthlyViewPage, setMonthlyViewPage] = useState(0);

  // Filter State
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('All Sub-Departments');
  const [selectedManager, setSelectedManager] = useState('All Managers');
  const [viewType, setViewType] = useState('Weekly');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredTasksByPeriod, setFilteredTasksByPeriod] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter Options
  const [departments, setDepartments] = useState(['All Departments']);
  const [subDepartments, setSubDepartments] = useState(['All Sub-Departments']);
  const [managers, setManagers] = useState(['All Managers']);

  const { acquireToken, isAuthenticated, isLoading } = useAuth();

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const sidebarItems = [
    { id: 'timesheets', label: 'Timesheets', icon: Clock },
    { id: 'metrics', label: 'Performance Metrics', icon: BarChart3 },
    { id: 'charts', label: 'Analytics Charts', icon: Activity },
  ];

  const weekOptions = Array.from(
    { length: getWeeksInMonth(selectedYear, selectedMonth) },
    (_, i) => `Week ${i + 1}`
  );

  const TASKS_URL = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task/alltaskforPerformance';
  const USER_ALL_URL = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/all';

  // Reset monthly page when year or month changes
  useEffect(() => {
    setMonthlyViewPage(0);
  }, [selectedYear, selectedMonth]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!isAuthenticated || isLoading) return;
      try {
        const data = await makeAuthenticatedRequest(
          USER_ALL_URL,
          'GET',
          null,
          acquireToken
        );
        const uniqueDepartments = ['All Departments', ...new Set(data.map((user) => user.department).filter(Boolean))];
        const uniqueManagers = ['All Managers', ...new Set(data.map((user) => user.manager).filter(Boolean))];
        const uniqueSubDepartments = ['All Sub-Departments', ...new Set(data.map((user) => user.subDepartment).filter(Boolean))];

        setDepartments(uniqueDepartments);
        setManagers(uniqueManagers);
        setSubDepartments(uniqueSubDepartments);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setError(err.message);
      }
    };
    fetchFilterOptions();
  }, [isAuthenticated, isLoading, acquireToken]);

  // Update sub-departments when department changes
  useEffect(() => {
    const fetchSubDepartments = async () => {
      if (selectedDepartment === 'All Departments') {
        try {
          const data = await makeAuthenticatedRequest(
            USER_ALL_URL,
            'GET',
            null,
            acquireToken
          );
          setSubDepartments(['All Sub-Departments', ...new Set(data.map((user) => user.subDepartment).filter(Boolean))]);
          setSelectedSubDepartment('All Sub-Departments');
        } catch (err) {
          console.error('Error fetching sub-departments:', err);
          setError(err.message);
        }
        return;
      }
      try {
        const data = await makeAuthenticatedRequest(
          USER_ALL_URL,
          'GET',
          null,
          acquireToken
        );
        const filteredSubDepartments = ['All Sub-Departments', ...new Set(
          data
            .filter((user) => user.department === selectedDepartment)
            .map((user) => user.subDepartment)
            .filter(Boolean)
        )];
        setSubDepartments(filteredSubDepartments);
        if (!filteredSubDepartments.includes(selectedSubDepartment)) {
          setSelectedSubDepartment('All Sub-Departments');
        }
      } catch (err) {
        console.error('Error fetching sub-departments:', err);
        setError(err.message);
      }
    };
    fetchSubDepartments();
  }, [selectedDepartment, acquireToken]);

  // Fetch timesheet data
  const fetchTimesheetData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/ManagerDashboard';
      const baseParams = {
        year: selectedYear,
        month: selectedMonth + 1,
        ...(selectedDepartment !== 'All Departments' && { department: selectedDepartment }),
        ...(selectedSubDepartment !== 'All Sub-Departments' && { subDepartment: selectedSubDepartment }),
        ...(selectedManager !== 'All Managers' && { manager: selectedManager }),
      };

      let data;
      if (viewType === 'Weekly') {
        const queryParams = new URLSearchParams({
          ...baseParams,
          week: selectedWeek,
        }).toString();
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/weekly?${queryParams}`,
          'GET',
          null,
          acquireToken
        );
        setWeeklyData(data || []);
        setMonthlyData([]);
        setYearlyData([]);
      } else if (viewType === 'Monthly') {
        const queryParams = new URLSearchParams(baseParams).toString();
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/monthly?${queryParams}`,
          'GET',
          null,
          acquireToken
        );
        console.log('Monthly data fetched:', data); // Debug log
        setMonthlyData(data || []);
        setWeeklyData([]);
        setYearlyData([]);
      } else if (viewType === 'Yearly') {
        const queryParams = new URLSearchParams(baseParams).toString();
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/yearly?${queryParams}`,
          'GET',
          null,
          acquireToken
        );
        setYearlyData(data || []);
        setWeeklyData([]);
        setMonthlyData([]);
      }
    } catch (err) {
      console.error('Error fetching timesheet data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, acquireToken, selectedYear, selectedMonth, selectedWeek, selectedDepartment, selectedSubDepartment, selectedManager, viewType]);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth + 1,
        ...(viewType === 'Weekly' && { week: selectedWeek }),
        ...(selectedDepartment !== 'All Departments' && { department: selectedDepartment }),
        ...(selectedSubDepartment !== 'All Sub-Departments' && { subDepartment: selectedSubDepartment }),
        ...(selectedManager !== 'All Managers' && { manager: selectedManager }),
      }).toString();

      const usersUrl = `${USER_ALL_URL}?${queryParams}`;
      const allUsers = await makeAuthenticatedRequest(usersUrl, 'GET', null, acquireToken);
      const newUserMap = allUsers.reduce((acc, user) => {
        acc[user.userId] = user.name;
        return acc;
      }, {});
      const tasksUrl = `${TASKS_URL}?${queryParams}`;
      const tasksData = await makeAuthenticatedRequest(tasksUrl, 'GET', null, acquireToken);

      setUserMap(newUserMap);
      setFilteredTasksByPeriod(tasksData || []);

      const performanceMap = {};
      tasksData.forEach(task => {
        const userId = task.createdBy;
        if (!performanceMap[userId]) {
          performanceMap[userId] = {
            userId,
            name: newUserMap[userId] || `User ${userId.slice(0, 8)}`,
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

      const performanceData = Object.values(performanceMap)
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

      setPerformanceData(performanceData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, acquireToken, selectedYear, selectedMonth, selectedWeek, selectedDepartment, selectedSubDepartment, selectedManager, searchQuery]);

  // Fetch data when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (activeTab === 'timesheets') {
        fetchTimesheetData();
      } else {
        fetchPerformanceData();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [activeTab, fetchPerformanceData, fetchTimesheetData, viewType, selectedYear, selectedMonth, selectedWeek, selectedDepartment, selectedSubDepartment, selectedManager, isAuthenticated, isLoading]);

  // Calculate KPIs
  const calculateKPIs = () => {
    if (activeTab === 'timesheets') {
      let currentData = [];
      if (viewType === 'Weekly') currentData = weeklyData;
      else if (viewType === 'Monthly') currentData = monthlyData;
      else if (viewType === 'Yearly') currentData = yearlyData;

      const totalUsers = currentData.length;
      const totalHours = currentData.reduce((sum, user) => sum + (user.totalHours || user.total || 0), 0);

      return [
        { label: 'Total Users', value: totalUsers.toString(), change: '', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Hours', value: totalHours.toFixed(1), change: '', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Active Projects', value: '12', change: '+2', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending Tasks', value: '8', change: '-3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
      ];
    } else {
      const totalUsers = performanceData.length;
      const avgPerformance = performanceData.length
        ? (performanceData.reduce((sum, user) => sum + parseInt(user.onTimePercentage), 0) / performanceData.length).toFixed(0)
        : 0;
      const totalHours = performanceData.reduce((sum, user) => sum + user.actualHours, 0);
      const overdueTasks = performanceData.reduce((sum, user) => sum + user.overdue, 0);

      return [
        { label: 'Total Users', value: totalUsers.toString(), change: '', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg Performance', value: `${avgPerformance}%`, change: '', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Hours', value: totalHours.toFixed(1), change: '', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Overdue Tasks', value: overdueTasks.toString(), change: '', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
      ];
    }
  };
  const handleViewTypeChange = (newViewType) => {
    setViewType(newViewType);
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

  const performanceViewProps = useMemo(() => ({
    viewType,
    selectedYear,
    selectedMonth,
    selectedWeek: viewType === 'Weekly' ? selectedWeek : null,
    searchQuery,
    months,
    selectedDepartment,
    selectedSubDepartment,
    selectedManager,
    showCharts: activeTab === 'charts',
  }), [viewType, selectedYear, selectedMonth, selectedWeek, searchQuery, months, selectedDepartment, selectedSubDepartment, selectedManager, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'timesheets':
        switch (viewType) {
          case 'Weekly':
            return (
              <div className="space-y-6">
                <WeeklyView
                  weeklyData={weeklyData}
                  searchQuery={searchQuery}
                  loading={loading}
                  error={error}
                />
              </div>
            );
          case 'Monthly':
            return (
              <div className="space-y-6">
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
              </div>
            );
          case 'Yearly':
            return (
              <div className="space-y-6">
                <YearlyView
                  yearlyData={yearlyData}
                  searchQuery={searchQuery}
                  loading={loading}
                  error={error}
                  months={months}
                />
              </div>
            );
          default:
            return (
              <div className="space-y-6">
                <WeeklyView
                  weeklyData={weeklyData}
                  searchQuery={searchQuery}
                  loading={loading}
                  error={error}
                />
              </div>
            );
        }
      case 'metrics':
        return (
          <div className="space-y-6">
            <ErrorBoundary>
              <PerformanceView {...performanceViewProps} />
            </ErrorBoundary>
          </div>
        );
      case 'charts':
        return (
          <div className="space-y-6">
            <ErrorBoundary>
              <PerformanceView {...performanceViewProps} />
            </ErrorBoundary>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <WeeklyView
              weeklyData={weeklyData}
              searchQuery={searchQuery}
              loading={loading}
              error={error}
            />
          </div>
        );
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
        <LoadingSpinner />
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
            onClick={() => window.location.href = '/login'}
          >
            Sign In
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white border-r border-gray-200 shadow-sm flex flex-col"
      >
       <div className="p-6 border-b border-gray-200">
  <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
    <motion.div
      initial={false}
      animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 min-w-0 overflow-hidden"
    >
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <BarChart3 className="h-5 w-5 text-white" />
      </div>
      {sidebarOpen && (
        <div className="truncate">
          <h1 className="text-sm font-semibold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm text-gray-600">Performance Analytics</p>
        </div>
      )}
    </motion.div>
    <button
      onClick={() => {
        console.log('Toggle button clicked');
        setSidebarOpen(!sidebarOpen);
      }}
      className="p-3 rounded-lg hover:bg-gray-100 transition-colors z-10"
      aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
    >
      {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  </div>
</div>
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${activeTab === item.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </motion.button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <motion.button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left text-gray-600 hover:bg-gray-100"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings size={20} />
            {sidebarOpen && <span className="font-medium">Settings</span>}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <motion.div
          className="bg-white border-b border-gray-200 shadow-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {activeTab.replace('_', ' ')}
                </h2>
                <motion.button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={16} />
                  Filters
                  <ChevronRight
                    size={16}
                    className={`transform transition-transform ${filtersExpanded ? 'rotate-90' : ''}`}
                  />
                </motion.button>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Bell size={20} className="text-gray-600" />
                  {/* <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span> */}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {filtersExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-visible"
                >
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <CustomDropdown
                          value={selectedDepartment}
                          options={departments}
                          onChange={setSelectedDepartment}
                          icon={Users}
                          menuClassName="max-h-60 overflow-y-auto z-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Department</label>
                        <CustomDropdown
                          value={selectedSubDepartment}
                          options={subDepartments}
                          onChange={setSelectedSubDepartment}
                          icon={Users}
                          menuClassName="max-h-60 overflow-y-auto z-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                        <CustomDropdown
                          value={selectedManager}
                          options={managers}
                          onChange={setSelectedManager}
                          icon={Users}
                          menuClassName="max-h-60 overflow-y-auto z-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">View Type</label>
                        <CustomDropdown
                          value={viewType}
                          options={['Weekly', 'Monthly', 'Yearly']}
                          onChange={handleViewTypeChange}
                          icon={Clock}
                          menuClassName="max-h-60 overflow-y-auto z-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <CustomDropdown
                          value={selectedYear}
                          options={years}
                          onChange={setSelectedYear}
                          icon={Calendar}
                          menuClassName="max-h-60 overflow-y-auto z-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    {(viewType === 'Weekly' || viewType === 'Monthly') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                          <CustomDropdown
                            value={months[selectedMonth]}
                            options={months}
                            onChange={(val) => setSelectedMonth(months.indexOf(val))}
                            icon={Calendar}
                            menuClassName="max-h-60 overflow-y-auto z-50"
                          />
                        </div>
                        {viewType === 'Weekly' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                            <CustomDropdown
                              value={`Week ${selectedWeek}`}
                              options={weekOptions}
                              onChange={(val) => setSelectedWeek(parseInt(val.split(' ')[1]))}
                              icon={Calendar}
                              menuClassName="max-h-60 overflow-y-auto z-50"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

