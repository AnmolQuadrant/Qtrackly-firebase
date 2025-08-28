import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Activity, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { decryptString } from '../../services/decrypt'; // Import decryptString

const PerformanceCharts = ({ 
  performanceData = [], 
  filteredTasksByPeriod = [], 
  selectedUser = null, 
  viewType = 'Weekly',
  selectedYear = new Date().getFullYear(),
  selectedMonth = new Date().getMonth(),
  months = [],
  selectedDepartment,
  selectedSubDepartment,
  selectedManager,
  searchQuery = '',
  performanceFilter = 'all',
  userMap = {},
  aesKey = null,
  aesIV = null,
  calculatePerformanceMetrics = []
}) => {
  const [activeChart, setActiveChart] = useState('overview');
  const [chartFilter, setChartFilter] = useState('all'); // all, top5, bottom5

  // Apply the same filtering logic as in PerformanceView
  const filteredPerformanceData = useMemo(() => {
    if (!calculatePerformanceMetrics.length) return performanceData;

    // Apply search query filter
    let baseData = calculatePerformanceMetrics.filter(user => 
      !searchQuery || user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply performance filter
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
  }, [calculatePerformanceMetrics, searchQuery, performanceFilter, performanceData]);

  // Log input props to verify filters
  useEffect(() => {
    console.log('PerformanceCharts props:', {
      performanceDataLength: performanceData.length,
      filteredPerformanceDataLength: filteredPerformanceData.length,
      filteredTasksByPeriodLength: filteredTasksByPeriod.length,
      selectedDepartment,
      selectedSubDepartment,
      selectedManager,
      viewType,
      selectedYear,
      selectedMonth,
      selectedUser,
      searchQuery,
      performanceFilter
    });
  }, [performanceData, filteredPerformanceData, filteredTasksByPeriod, selectedDepartment, selectedSubDepartment, selectedManager, viewType, selectedYear, selectedMonth, selectedUser, searchQuery, performanceFilter]);

  // Color schemes for charts
  const colors = {
    primary: '#7c3aed',
    secondary: '#f50ae5ff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gradient: ['#a855f7', '#f59e0b', '#10b981', '#ddd6fe', '#ede9fe']
  };

  // Compute taskTypeDistribution based on filtered tasks and users
  const taskTypeDistribution = useMemo(() => {
    console.log('Computing taskTypeDistribution with:', {
      filteredTasksByPeriodLength: filteredTasksByPeriod.length,
      filteredPerformanceDataLength: filteredPerformanceData.length,
      searchQuery,
      performanceFilter
    });

    // Filter tasks based on the users that are currently visible (after search/filter)
    const visibleUserIds = filteredPerformanceData.map(user => user.userId);
    const relevantTasks = filteredTasksByPeriod.filter(task => visibleUserIds.includes(task.createdBy));
    
    console.log('Relevant tasks for task type distribution:', {
      visibleUserIds,
      relevantTasksLength: relevantTasks.length
    });

    if (relevantTasks.length && relevantTasks.some(task => task.type || task.status)) {
      const taskTypeCounts = relevantTasks.reduce((acc, task) => {
        const type = task.type || task.status || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      const result = Object.entries(taskTypeCounts).map(([name, value], index) => ({
        name,
        value,
        color: colors.gradient[index % colors.gradient.length]
      }));
      
      console.log('Task type distribution result:', result);
      return result;
    }
    
    // Fallback to completed/overdue classification
    const completedOnTime = relevantTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return !(task.status !== 'Completed' && dueDate < today);
    }).length;
    
    const overdue = relevantTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return task.status !== 'Completed' && dueDate < today;
    }).length;
    
    const fallbackResult = [
      { 
        name: 'Completed On Time', 
        value: completedOnTime, 
        color: colors.success 
      },
      { 
        name: 'Overdue', 
        value: overdue, 
        color: colors.danger 
      }
    ].filter(item => item.value > 0); // Only show categories with data
    
    console.log('Task type distribution fallback result:', fallbackResult);
    return fallbackResult;
  }, [filteredTasksByPeriod, filteredPerformanceData, colors, searchQuery, performanceFilter]);

  // Chart data processing - use filteredPerformanceData instead of performanceData
  const chartData = useMemo(() => {
    if (!filteredPerformanceData.length) return {};

    // Filter data based on chartFilter
    let dataToProcess = [...filteredPerformanceData];
    if (chartFilter === 'top5') {
      dataToProcess = filteredPerformanceData
        .sort((a, b) => parseFloat(b.onTimePercentage) - parseFloat(a.onTimePercentage))
        .slice(0, 5);
    } else if (chartFilter === 'bottom5') {
      dataToProcess = filteredPerformanceData
        .sort((a, b) => parseFloat(a.onTimePercentage) - parseFloat(b.onTimePercentage))
        .slice(0, 5);
    }

    // Performance Overview Data
    const overviewData = dataToProcess.map(user => ({
      name: user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name,
      fullName: user.name,
      onTimePercentage: parseFloat(user.onTimePercentage),
      avgTaskTime: parseFloat(user.avgTaskTime),
      totalTasks: user.totalTasks,
      overdueTasks: user.overdue,
      variance: user.variance,
      estimatedHours: user.estimatedHours,
      actualHours: user.actualHours
    }));

    // Task Distribution Data - based on filtered users
    const taskDistribution = [
      { name: 'Completed On Time', value: dataToProcess.reduce((sum, user) => sum + (user.totalTasks - user.overdue), 0), color: colors.success },
      { name: 'Overdue Tasks', value: dataToProcess.reduce((sum, user) => sum + user.overdue, 0), color: colors.danger },
    ];

    // Hours Variance Data
    const hoursVarianceData = dataToProcess.map(user => ({
      name: user.name.length > 12 ? user.name.substring(0, 12) + '...' : user.name,
      fullName: user.name,
      estimated: user.estimatedHours,
      actual: user.actualHours,
      variance: user.variance
    }));

    // User Workload Balance Data
    const workloadBalanceData = dataToProcess.map(user => ({
      name: user.name.length > 12 ? user.name.substring(0, 12) + '...' : user.name,
      fullName: user.name,
      tasks: user.totalTasks,
      hoursPerTask: user.actualHours / Math.max(user.totalTasks, 1)
    }));

    const chartDataResult = {
      overview: overviewData,
      taskDistribution,
      hoursVariance: hoursVarianceData,
      taskTypeDistribution,
      workloadBalance: workloadBalanceData
    };

    console.log('Chart data computed:', chartDataResult);
    return chartDataResult;
  }, [filteredPerformanceData, chartFilter, selectedUser, taskTypeDistribution, colors]);

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-800 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.name.includes('Percentage') && '%'}
              {entry.name.includes('Hours') && ' hrs'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTypes = [
    { id: 'overview', name: 'Performance Overview', icon: BarChart3 },
    { id: 'tasks', name: 'Task Distribution', icon: Activity },
    { id: 'hours', name: 'Hours Analysis', icon: Clock },
    { id: 'taskTypes', name: 'Task Type Distribution', icon: Activity },
    { id: 'workload', name: 'Workload Balance', icon: Users }
  ];

  const filterOptions = [
    { id: 'all', name: 'All Users' },
    { id: 'top5', name: 'Top 5 Performers' },
    { id: 'bottom5', name: 'Bottom 5 Performers' }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.overview} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="onTimePercentage" fill={colors.primary} name="On-Time %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalTasks" fill={colors.secondary} name="Total Tasks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        case 'tasks':
        return (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Pie Chart */}
            <div className="flex-shrink-0">
              <ResponsiveContainer width={400} height={350}>
                <PieChart>
                  <Pie
                    data={chartData.taskDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    innerRadius={70}
                    paddingAngle={5}
                    startAngle={90}
                    endAngle={450}
                  >
                    {chartData.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend and Stats */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-3">
                {chartData.taskDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg min-w-[250px]">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{entry.value}</span>
                      <div className="text-xs text-gray-500">
                        {((entry.value / chartData.taskDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Summary */}
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-800">
                    {chartData.taskDistribution.reduce((sum, item) => sum + item.value, 0)}
                  </div>
                  <div className="text-sm text-violet-600">Total Tasks</div>
                </div>
              </div>
            </div>
          </div>
        );


      // case 'tasks':
      //   return (
      //     <div className="flex flex-col items-center">
      //       <ResponsiveContainer width="100%" height={350}>
      //         <PieChart>
      //           <Pie
      //             data={chartData.taskDistribution}
      //             dataKey="value"
      //             nameKey="name"
      //             cx="50%"
      //             cy="50%"
      //             outerRadius={120}
      //             innerRadius={60}
      //             paddingAngle={5}
      //           >
      //             {chartData.taskDistribution.map((entry, index) => (
      //               <Cell key={`cell-${index}`} fill={entry.color} />
      //             ))}
      //           </Pie>
      //           <Tooltip />
      //         </PieChart>
      //       </ResponsiveContainer>
      //       <div className="flex gap-4 mt-4 flex-wrap justify-center">
      //         {chartData.taskDistribution.map((entry, index) => (
      //           <div key={index} className="flex items-center gap-2">
      //             <div 
      //               className="w-4 h-4 rounded-full" 
      //               style={{ backgroundColor: entry.color }}
      //             />
      //             <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
      //           </div>
      //         ))}
      //       </div>
      //     </div>
      //   );

      case 'hours':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.hoursVariance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="estimated" fill={colors.info} name="Estimated Hours" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill={colors.warning} name="Actual Hours" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      // case 'taskTypes':
      //   return (
      //     <div className="flex flex-col items-center">
      //       <ResponsiveContainer width="100%" height={350}>
      //         <PieChart>
      //           <Pie
      //             data={chartData.taskTypeDistribution}
      //             dataKey="value"
      //             nameKey="name"
      //             cx="50%"
      //             cy="50%"
      //             outerRadius={120}
      //             innerRadius={60}
      //             paddingAngle={5}
      //           >
      //             {chartData.taskTypeDistribution.map((entry, index) => (
      //               <Cell key={`cell-${index}`} fill={entry.color} />
      //             ))}
      //           </Pie>
      //           <Tooltip />
      //         </PieChart>
      //       </ResponsiveContainer>
      //       <div className="flex gap-4 mt-4 flex-wrap justify-center">
      //         {chartData.taskTypeDistribution.map((entry, index) => (
      //           <div key={index} className="flex items-center gap-2">
      //             <div 
      //               className="w-4 h-4 rounded-full" 
      //               style={{ backgroundColor: entry.color }}
      //             />
      //             <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
      //           </div>
      //         ))}
      //       </div>
      //     </div>
      //   );
      case 'taskTypes':
        return (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Pie Chart */}
            <div className="flex-shrink-0">
              <ResponsiveContainer width={400} height={350}>
                <PieChart>
                  <Pie
                    data={chartData.taskTypeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    innerRadius={70}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={450}
                  >
                    {chartData.taskTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend and Stats */}
            <div className="flex flex-col justify-center space-y-4 max-w-sm">
              <div className="space-y-3">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {chartData.taskTypeDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium text-gray-700 truncate" title={entry.name}>
                          {entry.name.length > 20 ? entry.name.substring(0, 20) + '...' : entry.name}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-bold text-gray-900">{entry.value}</span>
                        <div className="text-xs text-gray-500">
                          {((entry.value / chartData.taskTypeDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Total Summary */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {chartData.taskTypeDistribution.reduce((sum, item) => sum + item.value, 0)}
                  </div>
                  <div className="text-sm text-blue-600">Total Items</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'workload':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.workloadBalance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tasks" fill={colors.primary} name="Total Tasks" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hoursPerTask" fill={colors.warning} name="Hours per Task" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!filteredPerformanceData.length) {
    return (
      <motion.div
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BarChart3 className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Performance Data Available</h3>
        <p className="text-yellow-600">
          Performance charts will appear here once data is available for the selected period and filters.
          {searchQuery && <><br />Current search: "{searchQuery}"</>}
          {performanceFilter !== 'all' && <><br />Current filter: {performanceFilter}</>}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart Controls */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex flex-nowrap gap-2">
            {chartTypes.map((chart) => {
              const Icon = chart.icon;
              return (
                <motion.button
                  key={chart.id}
                  onClick={() => setActiveChart(chart.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeChart === chart.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={16} />
                  {chart.name}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-gray-600">Filter:</span>
            <select
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {filterOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Active Filters Display */}
      {(searchQuery || performanceFilter !== 'all') && (
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Search: "{searchQuery}"
              </span>
            )}
            {performanceFilter !== 'all' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Filter: {performanceFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            )}
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Showing: {filteredPerformanceData.length} users
            </span>
          </div>
        </motion.div>
      )}

      {/* Performance Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {[
          {
            title: 'Average Performance',
            value: filteredPerformanceData.length ? `${Math.round(filteredPerformanceData.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / filteredPerformanceData.length)}%` : '0%',
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50'
          },
          {
            title: 'Total Tasks',
            value: filteredPerformanceData.reduce((sum, user) => sum + user.totalTasks, 0),
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            title: 'Overdue Tasks',
            value: filteredPerformanceData.reduce((sum, user) => sum + user.overdue, 0),
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50'
          },
          {
            title: 'Active Users',
            value: filteredPerformanceData.length,
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
          }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className={`${stat.bg} rounded-lg p-4 border border-gray-200`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Chart Area */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {chartTypes.find(c => c.id === activeChart)?.name}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedUser 
              ? `Performance data for ${selectedUser.name}`
              : `Performance data for ${viewType} view${selectedDepartment !== 'All Departments' ? `, Department: ${selectedDepartment}` : ''}${selectedSubDepartment !== 'All Sub-Departments' ? `, Sub-Department: ${selectedSubDepartment}` : ''}${selectedManager !== 'All Managers' ? `, Manager: ${selectedManager}` : ''}`}
          </p>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderChart()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Chart Insights */}
      {/* <motion.div
        className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="text-lg font-semibold text-violet-800 mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-violet-700">
              <strong>Top Performer:</strong> {filteredPerformanceData.length > 0 && 
                filteredPerformanceData.reduce((prev, current) => 
                  parseFloat(prev.onTimePercentage) > parseFloat(current.onTimePercentage) ? prev : current
                ).name
              }
            </p>
            <p className="text-violet-700">
              <strong>Average Completion Rate:</strong> {
                filteredPerformanceData.length ? Math.round(filteredPerformanceData.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / filteredPerformanceData.length) : 0
              }%
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-violet-700">
              <strong>Total Hours Logged:</strong> {
                filteredPerformanceData.reduce((sum, user) => sum + user.actualHours, 0)
              } hours
            </p>
            <p className="text-violet-700">
              <strong>Efficiency Score:</strong> {
                filteredPerformanceData.length ? Math.round((filteredPerformanceData.reduce((sum, user) => sum + user.estimatedHours, 0) / 
                Math.max(filteredPerformanceData.reduce((sum, user) => sum + user.actualHours, 0), 1)) * 100) : 0
              }%
            </p>
          </div>
        </div>
      </motion.div> */}
    </motion.div>
  );
};

export default PerformanceCharts;