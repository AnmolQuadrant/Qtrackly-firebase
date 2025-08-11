
// import React, { useState, useEffect, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
// import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, BarChart3, Activity, Target, Users, Calendar } from 'lucide-react';

// const PerformanceCharts = ({ 
//   performanceData = [], 
//   filteredTasksByPeriod = [], 
//   selectedUser = null, 
//   viewType = 'Weekly',
//   selectedYear = new Date().getFullYear(),
//   selectedMonth = new Date().getMonth(),
//   months = [],
//   selectedDepartment,
//   selectedSubDepartment,
//   selectedManager
// }) => {
//   const [activeChart, setActiveChart] = useState('overview');
//   const [chartFilter, setChartFilter] = useState('all'); // all, top5, bottom5

//   // Log input props to verify filters
//   useEffect(() => {
//     console.log('PerformanceCharts props:', {
//       performanceDataLength: performanceData.length,
//       filteredTasksByPeriodLength: filteredTasksByPeriod.length,
//       selectedDepartment,
//       selectedSubDepartment,
//       selectedManager,
//       viewType,
//       selectedYear,
//       selectedMonth,
//       selectedUser
//     });
//   }, [performanceData, filteredTasksByPeriod, selectedDepartment, selectedSubDepartment, selectedManager, viewType, selectedYear, selectedMonth, selectedUser]);

//   // Color schemes for charts
//   const colors = {
//     primary: '#7c3aed',
//     secondary: '#a855f7',
//     success: '#10b981',
//     warning: '#f59e0b',
//     danger: '#ef4444',
//     info: '#3b82f6',
//     gradient: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe', '#ede9fe']
//   };

//   // Chart data processing
//   const chartData = useMemo(() => {
//     if (!performanceData.length) return {};

//     // Filter data based on chartFilter
//     let dataToProcess = [...performanceData];
//     if (chartFilter === 'top5') {
//       dataToProcess = performanceData
//         .sort((a, b) => parseFloat(b.onTimePercentage) - parseFloat(a.onTimePercentage))
//         .slice(0, 5);
//     } else if (chartFilter === 'bottom5') {
//       dataToProcess = performanceData
//         .sort((a, b) => parseFloat(a.onTimePercentage) - parseFloat(b.onTimePercentage))
//         .slice(0, 5);
//     }

//     // Performance Overview Data
//     const overviewData = dataToProcess.map(user => ({
//       name: user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name,
//       fullName: user.name,
//       onTimePercentage: parseFloat(user.onTimePercentage),
//       avgTaskTime: parseFloat(user.avgTaskTime),
//       totalTasks: user.totalTasks,
//       overdueTasks: user.overdue,
//       variance: user.variance,
//       estimatedHours: user.estimatedHours,
//       actualHours: user.actualHours
//     }));

//     // Task Distribution Data
//     const taskDistribution = [
//       { name: 'Completed On Time', value: dataToProcess.reduce((sum, user) => sum + (user.totalTasks - user.overdue), 0), color: colors.success },
//       { name: 'Overdue Tasks', value: dataToProcess.reduce((sum, user) => sum + user.overdue, 0), color: colors.danger },
//     ];

//     // Hours Variance Data
//     const hoursVarianceData = dataToProcess.map(user => ({
//       name: user.name.length > 12 ? user.name.substring(0, 12) + '...' : user.name,
//       fullName: user.name,
//       estimated: user.estimatedHours,
//       actual: user.actualHours,
//       variance: user.variance
//     }));

//     // Performance Trend Data (simulated for demo - replace with actual trend data if available)
//     const performanceTrendData = Array.from({ length: 7 }, (_, i) => ({
//       day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
//       productivity: Math.floor(Math.random() * 40) + 60,
//       tasks: Math.floor(Math.random() * 10) + 5,
//       hours: Math.floor(Math.random() * 3) + 6
//     }));

//     // Radar Chart Data for selected user or overall
//     const radarData = selectedUser ? [
//       { subject: 'On-Time Delivery', A: parseFloat(selectedUser.onTimePercentage), fullMark: 100 },
//       { subject: 'Task Efficiency', A: Math.min(100, (selectedUser.estimatedHours / Math.max(selectedUser.actualHours, 1)) * 100), fullMark: 100 },
//       { subject: 'Workload', A: Math.min(100, (selectedUser.totalTasks / 20) * 100), fullMark: 100 },
//       { subject: 'Quality Score', A: Math.floor(Math.random() * 30) + 70, fullMark: 100 },
//       { subject: 'Consistency', A: Math.floor(Math.random() * 25) + 75, fullMark: 100 }
//     ] : [
//       { subject: 'Overall On-Time', A: Math.round(dataToProcess.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / dataToProcess.length), fullMark: 100 },
//       { subject: 'Avg Efficiency', A: Math.round(dataToProcess.reduce((sum, user) => sum + Math.min(100, (user.estimatedHours / Math.max(user.actualHours, 1)) * 100), 0) / dataToProcess.length), fullMark: 100 },
//       { subject: 'Team Workload', A: Math.round(dataToProcess.reduce((sum, user) => sum + Math.min(100, (user.totalTasks / 20) * 100), 0) / dataToProcess.length), fullMark: 100 },
//       { subject: 'Quality Score', A: Math.floor(Math.random() * 20) + 80, fullMark: 100 },
//       { subject: 'Team Consistency', A: Math.floor(Math.random() * 15) + 85, fullMark: 100 }
//     ];

//     const chartDataResult = {
//       overview: overviewData,
//       taskDistribution,
//       hoursVariance: hoursVarianceData,
//       performanceTrend: performanceTrendData,
//       radar: radarData
//     };

//     console.log('Chart data computed:', chartDataResult);
//     return chartDataResult;
//   }, [performanceData, chartFilter, selectedUser, colors]);

//   // Custom tooltip components
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
//           <p className="text-gray-800 font-medium">{label}</p>
//           {payload.map((entry, index) => (
//             <p key={index} style={{ color: entry.color }} className="text-sm">
//               {entry.name}: {entry.value}
//               {entry.name.includes('Percentage') && '%'}
//               {entry.name.includes('Hours') && ' hrs'}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   const chartTypes = [
//     { id: 'overview', name: 'Performance Overview', icon: BarChart3 },
//     { id: 'tasks', name: 'Task Distribution', icon: Activity },
//     { id: 'hours', name: 'Hours Analysis', icon: Clock },
//     { id: 'trends', name: 'Performance Trends', icon: TrendingUp },
//     { id: 'radar', name: 'Skills Radar', icon: Target }
//   ];

//   const filterOptions = [
//     { id: 'all', name: 'All Users' },
//     { id: 'top5', name: 'Top 5 Performers' },
//     { id: 'bottom5', name: 'Bottom 5 Performers' }
//   ];

//   const renderChart = () => {
//     switch (activeChart) {
//       case 'overview':
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart data={chartData.overview} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis 
//                 dataKey="name" 
//                 stroke="#6b7280" 
//                 angle={-45}
//                 textAnchor="end"
//                 height={80}
//                 fontSize={12}
//               />
//               <YAxis stroke="#6b7280" />
//               <Tooltip content={<CustomTooltip />} />
//               <Bar dataKey="onTimePercentage" fill={colors.primary} name="On-Time %" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="totalTasks" fill={colors.secondary} name="Total Tasks" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         );

//       case 'tasks':
//         return (
//           <div className="flex flex-col items-center">
//             <ResponsiveContainer width="100%" height={350}>
//               <PieChart>
//                 <Pie
//                   data={chartData.taskDistribution}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={120}
//                   innerRadius={60}
//                   paddingAngle={5}
//                 >
//                   {chartData.taskDistribution.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="flex gap-4 mt-4">
//               {chartData.taskDistribution.map((entry, index) => (
//                 <div key={index} className="flex items-center gap-2">
//                   <div 
//                     className="w-4 h-4 rounded-full" 
//                     style={{ backgroundColor: entry.color }}
//                   />
//                   <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//       case 'hours':
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart data={chartData.hoursVariance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis 
//                 dataKey="name" 
//                 stroke="#6b7280" 
//                 angle={-45}
//                 textAnchor="end"
//                 height={80}
//                 fontSize={12}
//               />
//               <YAxis stroke="#6b7280" />
//               <Tooltip content={<CustomTooltip />} />
//               <Bar dataKey="estimated" fill={colors.info} name="Estimated Hours" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="actual" fill={colors.warning} name="Actual Hours" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         );

//       case 'trends':
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <AreaChart data={chartData.performanceTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
//               <defs>
//                 <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
//                   <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis dataKey="day" stroke="#6b7280" />
//               <YAxis stroke="#6b7280" />
//               <Tooltip content={<CustomTooltip />} />
//               <Area 
//                 type="monotone" 
//                 dataKey="productivity" 
//                 stroke={colors.primary} 
//                 fillOpacity={1} 
//                 fill="url(#colorProductivity)" 
//                 name="Productivity %"
//               />
//               <Line type="monotone" dataKey="tasks" stroke={colors.success} name="Tasks Completed" strokeWidth={3} />
//             </AreaChart>
//           </ResponsiveContainer>
//         );

//       case 'radar':
//         return (
//           <div className="flex flex-col items-center">
//             <h4 className="text-lg font-semibold mb-4 text-gray-800">
//               {selectedUser ? `${selectedUser.name} - Skills Assessment` : 'Team Performance Radar'}
//             </h4>
//             <ResponsiveContainer width="100%" height={400}>
//               <RadarChart data={chartData.radar} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
//                 <PolarGrid stroke="#e5e7eb" />
//                 <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
//                 <PolarRadiusAxis 
//                   angle={90} 
//                   domain={[0, 100]} 
//                   tick={{ fontSize: 10, fill: '#9ca3af' }}
//                   tickCount={6}
//                 />
//                 <Radar
//                   name="Score"
//                   dataKey="A"
//                   stroke={colors.primary}
//                   fill={colors.primary}
//                   fillOpacity={0.3}
//                   strokeWidth={2}
//                 />
//                 <Tooltip />
//               </RadarChart>
//             </ResponsiveContainer>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   if (!performanceData.length) {
//     return (
//       <motion.div
//         className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <BarChart3 className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
//         <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Performance Data Available</h3>
//         <p className="text-yellow-600">
//           Performance charts will appear here once data is available for the selected period and filters.
//         </p>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       className="space-y-6"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Chart Controls */}
//       <motion.div
//         className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//       >
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div className="flex flex-wrap gap-2">
//             {chartTypes.map((chart) => {
//               const Icon = chart.icon;
//               return (
//                 <motion.button
//                   key={chart.id}
//                   onClick={() => setActiveChart(chart.id)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     activeChart === chart.id
//                       ? 'bg-violet-600 text-white shadow-sm'
//                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                   }`}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <Icon size={16} />
//                   {chart.name}
//                 </motion.button>
//               );
//             })}
//           </div>

//           {activeChart !== 'radar' && (
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-600">Filter:</span>
//               <select
//                 value={chartFilter}
//                 onChange={(e) => setChartFilter(e.target.value)}
//                 className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
//               >
//                 {filterOptions.map((option) => (
//                   <option key={option.id} value={option.id}>
//                     {option.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//         </div>
//       </motion.div>

//       {/* Performance Summary Cards */}
//       <motion.div
//         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ staggerChildren: 0.1 }}
//       >
//         {[
//           {
//             title: 'Average Performance',
//             value: `${Math.round(performanceData.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / performanceData.length)}%`,
//             icon: TrendingUp,
//             color: 'text-green-600',
//             bg: 'bg-green-50'
//           },
//           {
//             title: 'Total Tasks',
//             value: performanceData.reduce((sum, user) => sum + user.totalTasks, 0),
//             icon: CheckCircle,
//             color: 'text-blue-600',
//             bg: 'bg-blue-50'
//           },
//           {
//             title: 'Overdue Tasks',
//             value: performanceData.reduce((sum, user) => sum + user.overdue, 0),
//             icon: AlertTriangle,
//             color: 'text-red-600',
//             bg: 'bg-red-50'
//           },
//           {
//             title: 'Active Users',
//             value: performanceData.length,
//             icon: Users,
//             color: 'text-purple-600',
//             bg: 'bg-purple-50'
//           }
//         ].map((stat, idx) => {
//           const Icon = stat.icon;
//           return (
//             <motion.div
//               key={stat.title}
//               className={`${stat.bg} rounded-lg p-4 border border-gray-200`}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: idx * 0.1 }}
//               whileHover={{ scale: 1.02 }}
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                   <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//                 </div>
//                 <Icon className={`h-8 w-8 ${stat.color}`} />
//               </div>
//             </motion.div>
//           );
//         })}
//       </motion.div>

//       {/* Main Chart Area */}
//       <motion.div
//         className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
//         initial={{ opacity: 0, scale: 0.98 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="mb-6">
//           <h3 className="text-xl font-semibold text-gray-800 mb-2">
//             {chartTypes.find(c => c.id === activeChart)?.name}
//           </h3>
//           <p className="text-sm text-gray-600">
//             {selectedUser 
//               ? `Performance data for ${selectedUser.name}`
//               : `Performance data for ${viewType} view${selectedDepartment !== 'All Departments' ? `, Department: ${selectedDepartment}` : ''}${selectedSubDepartment !== 'All Sub-Departments' ? `, Sub-Department: ${selectedSubDepartment}` : ''}${selectedManager !== 'All Managers' ? `, Manager: ${selectedManager}` : ''}`}
//           </p>
//         </div>

//         <div className="min-h-[400px]">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={activeChart}
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {renderChart()}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </motion.div>

//       {/* Chart Insights */}
//       <motion.div
//         className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//       >
//         <h4 className="text-lg font-semibold text-violet-800 mb-3 flex items-center gap-2">
//           <Activity className="h-5 w-5" />
//           Key Insights
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//           <div className="space-y-2">
//             <p className="text-violet-700">
//               <strong>Top Performer:</strong> {performanceData.length > 0 && 
//                 performanceData.reduce((prev, current) => 
//                   parseFloat(prev.onTimePercentage) > parseFloat(current.onTimePercentage) ? prev : current
//                 ).name
//               }
//             </p>
//             <p className="text-violet-700">
//               <strong>Average Completion Rate:</strong> {
//                 Math.round(performanceData.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / performanceData.length)
//               }%
//             </p>
//           </div>
//           <div className="space-y-2">
//             <p className="text-violet-700">
//               <strong>Total Hours Logged:</strong> {
//                 performanceData.reduce((sum, user) => sum + user.actualHours, 0)
//               } hours
//             </p>
//             <p className="text-violet-700">
//               <strong>Efficiency Score:</strong> {
//                 Math.round((performanceData.reduce((sum, user) => sum + user.estimatedHours, 0) / 
//                 Math.max(performanceData.reduce((sum, user) => sum + user.actualHours, 0), 1)) * 100)
//               }%
//             </p>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default PerformanceCharts;

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, BarChart3, Activity, Target, Users, Calendar } from 'lucide-react';

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
  selectedManager
}) => {
  const [activeChart, setActiveChart] = useState('overview');
  const [chartFilter, setChartFilter] = useState('all'); // all, top5, bottom5

  // Log input props to verify filters
  useEffect(() => {
    console.log('PerformanceCharts props:', {
      performanceDataLength: performanceData.length,
      filteredTasksByPeriodLength: filteredTasksByPeriod.length,
      selectedDepartment,
      selectedSubDepartment,
      selectedManager,
      viewType,
      selectedYear,
      selectedMonth,
      selectedUser
    });
  }, [performanceData, filteredTasksByPeriod, selectedDepartment, selectedSubDepartment, selectedManager, viewType, selectedYear, selectedMonth, selectedUser]);

  // Color schemes for charts
  const colors = {
    primary: '#7c3aed',
    secondary: '#a855f7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gradient: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe', '#ede9fe']
  };

  // Chart data processing
  const chartData = useMemo(() => {
    if (!performanceData.length) return {};

    // Filter data based on chartFilter
    let dataToProcess = [...performanceData];
    if (chartFilter === 'top5') {
      dataToProcess = performanceData
        .sort((a, b) => parseFloat(b.onTimePercentage) - parseFloat(a.onTimePercentage))
        .slice(0, 5);
    } else if (chartFilter === 'bottom5') {
      dataToProcess = performanceData
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

    // Task Distribution Data
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

    // Performance Trend Data (using filteredTasksByPeriod)
    const performanceTrendData = useMemo(() => {
      if (!filteredTasksByPeriod.length) {
        return Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          productivity: 0,
          tasks: 0,
          hours: 0
        }));
      }

      // Aggregate tasks by day
      const days = viewType === 'Weekly' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : months.map(m => m.name.slice(0, 3));

      const trendData = days.map((day, index) => {
        const tasksInPeriod = filteredTasksByPeriod.filter(task => {
          const taskDate = new Date(task.completionDate || task.dueDate);
          if (viewType === 'Weekly') {
            const dayIndex = taskDate.getDay();
            return dayIndex === ((index + 1) % 7); // Map to correct day
          } else {
            return taskDate.getMonth() === index && taskDate.getFullYear() === selectedYear;
          }
        });

        const totalTasks = tasksInPeriod.length;
        const completedTasks = tasksInPeriod.filter(task => task.status === 'completed').length;
        const productivity = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const hours = tasksInPeriod.reduce((sum, task) => sum + (task.actualHours || 0), 0);

        return {
          day,
          productivity: Math.round(productivity),
          tasks: totalTasks,
          hours: Math.round(hours * 10) / 10
        };
      });

      return trendData;
    }, [filteredTasksByPeriod, viewType, selectedYear]);

    // Radar Chart Data for selected user or overall
    const radarData = selectedUser ? [
      { subject: 'On-Time Delivery', A: parseFloat(selectedUser.onTimePercentage), fullMark: 100 },
      { subject: 'Task Efficiency', A: Math.min(100, (selectedUser.estimatedHours / Math.max(selectedUser.actualHours, 1)) * 100), fullMark: 100 },
      { subject: 'Workload', A: Math.min(100, (selectedUser.totalTasks / 20) * 100), fullMark: 100 },
      { subject: 'Quality Score', A: Math.floor(Math.random() * 30) + 70, fullMark: 100 },
      { subject: 'Consistency', A: Math.floor(Math.random() * 25) + 75, fullMark: 100 }
    ] : [
      { subject: 'Overall On-Time', A: Math.round(dataToProcess.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / dataToProcess.length), fullMark: 100 },
      { subject: 'Avg Efficiency', A: Math.round(dataToProcess.reduce((sum, user) => sum + Math.min(100, (user.estimatedHours / Math.max(user.actualHours, 1)) * 100), 0) / dataToProcess.length), fullMark: 100 },
      { subject: 'Team Workload', A: Math.round(dataToProcess.reduce((sum, user) => sum + Math.min(100, (user.totalTasks / 20) * 100), 0) / dataToProcess.length), fullMark: 100 },
      { subject: 'Quality Score', A: Math.floor(Math.random() * 20) + 80, fullMark: 100 },
      { subject: 'Team Consistency', A: Math.floor(Math.random() * 15) + 85, fullMark: 100 }
    ];

    const chartDataResult = {
      overview: overviewData,
      taskDistribution,
      hoursVariance: hoursVarianceData,
      performanceTrend: performanceTrendData,
      radar: radarData
    };

    console.log('Chart data computed:', chartDataResult);
    return chartDataResult;
  }, [performanceData, chartFilter, selectedUser, filteredTasksByPeriod, viewType, selectedYear, months, colors]);

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-800 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.name.includes('Percentage') || entry.name.includes('Productivity') ? '%' : ''}
              {entry.name.includes('Hours') ? ' hrs' : ''}
              {entry.name.includes('Tasks') && !entry.name.includes('Percentage') ? ' tasks' : ''}
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
    { id: 'trends', name: 'Performance Trends', icon: TrendingUp },
    { id: 'radar', name: 'Skills Radar', icon: Target }
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
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <Pie
                  data={chartData.taskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={5}
                >
                  {chartData.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4">
              {chartData.taskDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

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

      case 'trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData.performanceTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280" 
                fontSize={14}
                tick={{ fill: '#4b5563' }}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={14}
                tick={{ fill: '#4b5563' }}
                label={{ value: 'Metrics', angle: -90, position: 'insideLeft', style: { fill: '#4b5563' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="productivity" 
                stroke={colors.primary} 
                fillOpacity={1} 
                fill="url(#colorProductivity)" 
                name="Productivity %"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke={colors.success} 
                name="Tasks Completed" 
                strokeWidth={2}
                dot={{ r: 4, fill: colors.success }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke={colors.warning} 
                name="Hours Worked" 
                strokeWidth={2}
                dot={{ r: 4, fill: colors.warning }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">
              {selectedUser ? `${selectedUser.name} - Skills Assessment` : 'Team Performance Radar'}
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={chartData.radar} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickCount={6}
                />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  if (!performanceData.length) {
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {chartTypes.map((chart) => {
              const Icon = chart.icon;
              return (
                <motion.button
                  key={chart.id}
                  onClick={() => setActiveChart(chart.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          {activeChart !== 'radar' && (
            <div className="flex items-center gap-2">
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
          )}
        </div>
      </motion.div>

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
            value: `${Math.round(performanceData.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / performanceData.length)}%`,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50'
          },
          {
            title: 'Total Tasks',
            value: performanceData.reduce((sum, user) => sum + user.totalTasks, 0),
            icon: CheckCircle,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            title: 'Overdue Tasks',
            value: performanceData.reduce((sum, user) => sum + user.overdue, 0),
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50'
          },
          {
            title: 'Active Users',
            value: performanceData.length,
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
      <motion.div
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
              <strong>Top Performer:</strong> {performanceData.length > 0 && 
                performanceData.reduce((prev, current) => 
                  parseFloat(prev.onTimePercentage) > parseFloat(current.onTimePercentage) ? prev : current
                ).name
              }
            </p>
            <p className="text-violet-700">
              <strong>Average Completion Rate:</strong> {
                Math.round(performanceData.reduce((sum, user) => sum + parseFloat(user.onTimePercentage), 0) / performanceData.length)
              }%
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-violet-700">
              <strong>Total Hours Logged:</strong> {
                performanceData.reduce((sum, user) => sum + user.actualHours, 0)
              } hours
            </p>
            <p className="text-violet-700">
              <strong>Efficiency Score:</strong> {
                Math.round((performanceData.reduce((sum, user) => sum + user.estimatedHours, 0) / 
                Math.max(performanceData.reduce((sum, user) => sum + user.actualHours, 0), 1)) * 100)
              }%
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceCharts;