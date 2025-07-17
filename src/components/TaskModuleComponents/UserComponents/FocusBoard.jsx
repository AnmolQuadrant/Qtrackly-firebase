
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Button from '../../common-components/Button';
import { useAuth} from '../../context/AuthContext';// Import useAuth
import apiClient, { setupAxiosInterceptors } from '../../services/apiClient';  // Import apiClient
import { useUsers } from '../../context/UserContext';
 
import axios from 'axios';
const FocusBoard = ({ onBack }) => {
  const { user,acquireToken, isAuthenticated, isInitialized, isLoading } = useAuth();
    const { users, loading: usersLoading, error: usersError } = useUsers();
   // Use auth context
  const [expandedSections, setExpandedSections] = useState({
    todaysFocus: false,
    overdue: false,
    waiting: false,
    dependent: false
  });
  const [taskStats, setTaskStats] = useState({
    toDo: 0,
    inProgress: 0,
    completed: 0,
    waiting: 0,
    overdue: 0
  });
  const [todaysFocus, setTodaysFocus] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [waitingTasks, setWaitingTasks] = useState([]);
  const [dependencyTasks, setDependencyTasks] = useState([]);
  const [dependentTasks, setDependentTasks] = useState([]);
 
  const [error, setError] = useState(null);
 
  // Set up axios interceptor
  useEffect(() => {
    setupAxiosInterceptors(acquireToken);
  }, [acquireToken]);
 
  useEffect(() => {
    const fetchFocusBoardData = async () => {
      if (!isAuthenticated || !isInitialized) return;
 
      try {
        // Fetch Task Stats
        const statsResponse = await apiClient.get('/FocusBoard/TaskStats');
        console.log(statsResponse.data);
        setTaskStats(statsResponse.data);
 
        // Fetch Today's Focus
        const todaysFocusResponse = await apiClient.get('/FocusBoard/TodaysFocus');
        setTodaysFocus(todaysFocusResponse.data);
 
        // Fetch Overdue Tasks
        const overdueResponse = await apiClient.get('/FocusBoard/Overdue');
        setOverdueTasks(overdueResponse.data);
 
        // Fetch Waiting Tasks
        const waitingResponse = await apiClient.get('/FocusBoard/Waiting');
        setWaitingTasks(waitingResponse.data);
 
        // Fetch Dependency Tasks
        const dependencyResponse = await apiClient.get(`/FocusBoard/${user.id}`);
        setDependencyTasks(dependencyResponse.data);
        // console.log(dependencyResponse.data);
        // console.log(user);
 
        // Fetch Dependent Tasks
        const dependentResponse = await apiClient.get(`/FocusBoard/DependentTasks/${user.id}`);
        setDependentTasks(dependentResponse.data);
        console.log(dependentResponse.data);
        console.log(user);
 
        setError(null);
      } catch (err) {
        console.error('Error fetching focus board data:', err);
        setError('Failed to load focus board data: ' + (err.response?.data?.message || err.message));
      }
    };
 
    fetchFocusBoardData();
  }, [isAuthenticated, isInitialized]);
 
  const calculateDaysLate = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
 
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
 
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
      case 'Not Started': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Waiting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
 
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
 
  const TaskItem = ({
    task,
    isOverdue = false,
    bgClass = "bg-gray-50 border-gray-100",
    textClass = "text-gray-500"
  }) => {
    return (
      <div className={`border rounded-lg p-4 ${bgClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <span className="font-medium">{task.taskName}</span>
           
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
           
            {task.assignedTo && (
              <span className="flex items-center text-xs text-gray-600">
                <User className="w-3 h-3 mr-1" />
                {task.assignedTo}
              </span>
            )}
          </div>
         
          <div className={`text-sm ${textClass} flex items-center font-medium`}>
            <Clock className="w-4 h-4 mr-1" />
            <div className="text-right">
              <div>{task.dueDate}</div>
              {isOverdue && task.dueDate !== 'Today' && (
                <div className="text-xs text-red-600 font-semibold">
                  {calculateDaysLate(task.dueDate)} days late
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  const TaskSection = ({
    title,
    icon,
    tasks,
    sectionKey,
    bgClass = "bg-gray-50 border-gray-100",
    textClass = "text-gray-500",
    isOverdue = false
  }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {tasks.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {tasks.length}
              </span>
            )}
          </div>
        </div>
       
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">No {title.toLowerCase()} at the moment</div>
          </div>
        ) : (
          <div
            className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6'
            }}
          >
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isOverdue={isOverdue}
                bgClass={bgClass}
                textClass={textClass}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
 
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center">
        <div className="max-w-7xl mx-auto">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Please log in to view the Focus Board.</p>
        </div>
      </div>
    );
  }
 
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="w-12 h-12 mx-auto mb-3 border-4 border-gray-300 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-lg font-medium">Loading authentication...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Focus Board</h1>
          <Button onClick={onBack} className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Go Back to Home
          </Button>
        </div>
       
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
       
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Task Status Overview</h2>
          </div>
         
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-800">{taskStats.toDo}</div>
              <div className="text-blue-600 text-sm font-medium">TO DO</div>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-violet-800">{taskStats.inProgress}</div>
              <div className="text-violet-600 text-sm font-medium">In Progress</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-800">{taskStats.completed}</div>
              <div className="text-green-600 text-sm font-medium">Completed</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-800">{taskStats.waiting}</div>
              <div className="text-yellow-600 text-sm font-medium">Waiting</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-800">{taskStats.overdue}</div>
              <div className="text-red-600 text-sm font-medium">Overdue</div>
            </div>
          </div>
        </div>
 
        <div className="grid grid-cols-2 gap-8 mb-8">
          <TaskSection
            title="Today's Focus"
            icon={<Calendar className="w-5 h-5 text-violet-600 mr-2" />}
            tasks={todaysFocus}
            sectionKey="todaysFocus"
          />
 
          <TaskSection
            title="Tasks Overdue"
            icon={<AlertCircle className="w-5 h-5 text-red-600 mr-2" />}
            tasks={overdueTasks}
            sectionKey="overdue"
            bgClass="bg-red-50 border-red-100"
            textClass="text-red-600"
            isOverdue={true}
          />
        </div>
 
        <div className="grid grid-cols-2 gap-8">
          <TaskSection
            title="Your Tasks Waiting on Dependencies"
            icon={<Clock className="w-5 h-5 text-yellow-600 mr-2" />}
            tasks={dependencyTasks}
            sectionKey="waiting"
          />
 
          <TaskSection
            title="Tasks Dependent on Your Tasks"
            icon={<User className="w-5 h-5 text-violet-600 mr-2" />}
            tasks={dependentTasks}
            sectionKey="dependent"
            bgClass="bg-violet-50 border-violet-100"
            textClass="text-violet-700"
          />
        </div>
      </div>
 
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};
 
export default FocusBoard;
 