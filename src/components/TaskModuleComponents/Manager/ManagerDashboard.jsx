
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Search, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomDropdown, { DropdownProvider } from '../../common-components/CustomDropdown';
import LoadingSpinner from '../../common-components/LoadingSpinner';
import PerformanceView from './PerformanceView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import YearlyView from './YearlyView';
import { makeAuthenticatedRequest } from './utils';
//import { toast } from 'react-toastify';

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

  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('All Sub-Departments');
  const [selectedManager, setSelectedManager] = useState('All Managers');
  const [viewType, setViewType] = useState('Weekly');
  const [monthlyViewPage, setMonthlyViewPage] = useState(0);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredTasksByPeriod, setFilteredTasksByPeriod] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState(['All Departments']);
  const [subDepartments, setSubDepartments] = useState(['All Sub-Departments']);
  const [managers, setManagers] = useState(['All Managers']);
  const [activeTab, setActiveTab] = useState('timesheets'); // Default to timesheets

  const { acquireToken, isAuthenticated, isLoading } = useAuth();

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const TASKS_URL = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task/alltaskforPerformance';
  const USER_ALL_URL = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/all';

  // Week options for the selected month
  const weekOptions = Array.from(
    { length: getWeeksInMonth(selectedYear, selectedMonth) },
    (_, i) => `Week ${i + 1}`
  );

  // Fetch filter options from /api/User/all
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
        console.log('Filter options fetched:', data);

        const uniqueDepartments = ['All Departments', ...new Set(data.map((user) => user.department).filter(Boolean))];
        const uniqueManagers = ['All Managers', ...new Set(data.map((user) => user.manager).filter(Boolean))];
        const uniqueSubDepartments = ['All Sub-Departments', ...new Set(data.map((user) => user.subDepartment).filter(Boolean))];

        setDepartments(uniqueDepartments);
        setManagers(uniqueManagers);
        setSubDepartments(uniqueSubDepartments);
      } catch (err) {
        console.error('Error fetching filter options:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.message);
        toast.error(`Failed to fetch filter options: ${err.message}`);
      }
    };

    fetchFilterOptions();
  }, [isAuthenticated, isLoading, acquireToken]);

  // Update sub-departments when department changes
  useEffect(() => {
    const fetchSubDepartments = async () => {
      if (selectedDepartment === 'All Departments') {
        setSubDepartments(['All Sub-Departments', ...new Set((await makeAuthenticatedRequest(
          USER_ALL_URL,
          'GET',
          null,
          acquireToken
        )).map((user) => user.subDepartment).filter(Boolean))]);
        setSelectedSubDepartment('All Sub-Departments');
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
        console.error('Error fetching sub-departments:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.message);
        toast.error(`Failed to fetch sub-departments: ${err.message}`);
      }
    };

    fetchSubDepartments();
  }, [selectedDepartment, acquireToken]);

  // Fetch timesheet data
  const fetchTimesheetData = async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/ManagerDashboard';
      let data;
      const queryParams = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth + 1,
        ...(viewType === 'Weekly' && { week: selectedWeek }),
        ...(selectedDepartment !== 'All Departments' && { department: selectedDepartment }),
        ...(selectedSubDepartment !== 'All Sub-Departments' && { subDepartment: selectedSubDepartment }),
        ...(selectedManager !== 'All Managers' && { manager: selectedManager }),
      }).toString();

      if (viewType === 'Weekly') {
        console.log('Fetching weekly data with params:', queryParams);
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/weekly?${queryParams}`,
          'GET',
          null,
          acquireToken
        );
        console.log('weeklyData fetched:', data);
        setWeeklyData(data || []);
        setMonthlyData([]);
        setYearlyData([]);
      } else if (viewType === 'Monthly') {
        console.log('Fetching monthly data with params:', queryParams);
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/monthly?${queryParams}`,
          'GET',
          null,
          acquireToken
        );
        console.log('monthlyData fetched:', data);
        setMonthlyData(data || []);
        setWeeklyData([]);
        setYearlyData([]);
      } else if (viewType === 'Yearly') {
        console.log('Fetching yearly data with params:', queryParams);
        data = await makeAuthenticatedRequest(
          `${API_BASE_URL}/yearly?${queryParams}`,
          'GET',
          null,
          acquireToken
        );
        console.log('yearlyData fetched:', data);
        setYearlyData(data || []);
        setWeeklyData([]);
        setMonthlyData([]);
      }
    } catch (err) {
      console.error('Error fetching timesheet data:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.message);
      toast.error(`Failed to fetch timesheet data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance data for metrics and charts
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

      console.log('Fetching performance data with query:', queryParams);

      const usersUrl = `${USER_ALL_URL}?${queryParams}`;
      const allUsers = await makeAuthenticatedRequest(usersUrl, 'GET', null, acquireToken);
      const newUserMap = allUsers.reduce((acc, user) => {
        acc[user.userId] = user.name;
        return acc;
      }, {});
      console.log('Fetched users:', allUsers);

      const tasksUrl = `${TASKS_URL}?${queryParams}`;
      const tasksData = await makeAuthenticatedRequest(tasksUrl, 'GET', null, acquireToken);
      console.log('Fetched tasks:', tasksData);

      setUserMap(newUserMap);
      setFilteredTasksByPeriod(tasksData || []);

      // Calculate performance metrics
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
      console.log('Performance data calculated:', performanceData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching performance data:', err);
      toast.error(`Failed to fetch performance data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, acquireToken, selectedYear, selectedMonth, selectedWeek, selectedDepartment, selectedSubDepartment, selectedManager, searchQuery]);

  // Fetch data when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      console.log('Triggering data fetch');
      if (activeTab === 'timesheets') {
        fetchTimesheetData();
      } else {
        fetchPerformanceData();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [viewType, selectedYear, selectedMonth, selectedWeek, selectedDepartment, selectedSubDepartment, selectedManager, isAuthenticated, isLoading, activeTab, fetchPerformanceData]);

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
    switch (activeTab) {
      case 'timesheets':
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
      case 'metrics':
        return (
          <PerformanceView
            viewType={viewType}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedWeek={viewType === 'Weekly' ? selectedWeek : null}
            searchQuery={searchQuery}
            months={months}
            selectedDepartment={selectedDepartment}
            selectedSubDepartment={selectedSubDepartment}
            selectedManager={selectedManager}
            showCharts={false}
          />
        );
      case 'charts':
        return (
          <PerformanceView
            viewType={viewType}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedWeek={viewType === 'Weekly' ? selectedWeek : null}
            searchQuery={searchQuery}
            months={months}
            selectedDepartment={selectedDepartment}
            selectedSubDepartment={selectedSubDepartment}
            selectedManager={selectedManager}
            showCharts={true}
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
              onChange={(val) => {
                setSelectedMonth(months.indexOf(val));
                setSelectedWeek(1);
              }}
              icon={CalendarIcon}
              className="min-w-[120px]"
            />
            <CustomDropdown
              value={`Week ${selectedWeek}`}
              options={weekOptions}
              onChange={(val) => {
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
              onChange={(val) => {
                setSelectedYear(parseInt(val, 10));
                setMonthlyViewPage(0);
              }}
              icon={CalendarIcon}
            />
            <CustomDropdown
              value={months[selectedMonth]}
              options={months}
              onChange={(val) => {
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
            onChange={(val) => setSelectedYear(parseInt(val, 10))}
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
    <DropdownProvider>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto p-6">
          {/* Filter Section */}
          <motion.div
            className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 items-end">
              {/* Department Filter */}
              <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="text-violet-600" size={16} />
                  <span className="text-sm font-semibold text-gray-700">Department</span>
                </div>
                <CustomDropdown
                  value={selectedDepartment}
                  options={departments}
                  onChange={setSelectedDepartment}
                  icon={Users}
                  className="w-full"
                />
              </motion.div>

              {/* Sub-Department Filter */}
              <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="text-violet-600" size={16} />
                  <span className="text-sm font-semibold text-gray-700">Sub-Department</span>
                </div>
                <CustomDropdown
                  value={selectedSubDepartment}
                  options={subDepartments}
                  onChange={setSelectedSubDepartment}
                  icon={Users}
                  className="w-full"
                />
              </motion.div>

              {/* Manager Filter */}
              <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="text-violet-600" size={16} />
                  <span className="text-sm font-semibold text-gray-700">Manager</span>
                </div>
                <CustomDropdown
                  value={selectedManager}
                  options={managers}
                  onChange={setSelectedManager}
                  icon={Users}
                  className="w-full"
                />
              </motion.div>

              {/* Report View Filter */}
              <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="text-violet-600" size={16} />
                  <span className="text-sm font-semibold text-gray-700">Report View</span>
                </div>
                <CustomDropdown
                  value={viewType}
                  options={['Weekly', 'Monthly', 'Yearly']}
                  onChange={handleViewTypeChange}
                  icon={Clock}
                  className="w-full"
                />
              </motion.div>

              {/* Period Selector */}
              <motion.div
                className="flex flex-col gap-2 xl:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="text-violet-600" size={16} />
                   <span className="text-sm font-semibold text-gray-700">Period</span>
                </div>
                <div className="flex gap-2">
                  {getCurrentPeriodSelector()}
                </div>
              </motion.div>

              {/* Search Input */}
              <motion.div
                className="flex flex-col gap-2 xl:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <div className="flex items-center gap-2">
                  <Search className="text-violet-600" size={16} />
                  <span className="text-sm font-semibold text-gray-700">Search</span>
                </div>
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

          {/* Navigation Tabs */}
          <motion.div
            className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex space-x-4">
              {[
                { id: 'timesheets', label: 'Timesheets' },
                { id: 'metrics', label: 'Performance Metrics' },
                { id: 'charts', label: 'Charts' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-violet-600 text-violet-600'
                      : 'text-gray-600 hover:text-violet-600'
                  } transition-colors`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-label={`Switch to ${tab.label} view`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Section */}
          <div className="space-y-6">
            
            {renderCurrentView()}
          </div>
        </div>
      </motion.div>
    </DropdownProvider>
  );
};

export default ManagerDashboard;

