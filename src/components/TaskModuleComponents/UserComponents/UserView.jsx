import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import Button from '../../common-components/Button';
import SearchBar from '../../common-components/SearchBar';
import { BadgePlus, X, FilterIcon, CalendarRange, List, Kanban, GitBranch, Bell, User, MessageCircle, Clock, CheckCircle2, Eye } from 'lucide-react';
import TaskList from './TaskList';
import AddTaskModal from './AddTaskModal';
import FilterModal from './FilterModal';
import GanttChart from './GanttChart';
import FocusBoard from './FocusBoard';
import DependencyRequests from './DependencyRequests';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { parseISO, addHours, subDays } from 'date-fns';
import { decryptString } from '../../services/decrypt';
import { fetchEncryptionKeys } from '../../services/apiClient';

function UserView() {
  const navigate = useNavigate();
  const [taskList, setTaskList] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [activeFilters, setActiveFilters] = useState({
    priority: '',
    status: '',
    startDate: '',
    dueDate: '',
    assignedTo: '',
    hasSubtasks: null,
    searchTerm: ''
  });
  const [filterCount, setFilterCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const tasksPerPage = 5;
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [queuedNotifications, setQueuedNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const [managerNames, setManagerNames] = useState({});
  const [removingNotifications, setRemovingNotifications] = useState(new Set());
  const [toastNotifications, setToastNotifications] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [newNotificationPulse, setNewNotificationPulse] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { soundEnabled: true, toastDuration: 5000 };
  });
  // Encryption states
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);
  const [keyError, setKeyError] = useState(null);
  const [isKeysFetched, setIsKeysFetched] = useState(false);

  const filterButtonRef = useRef(null);
  const notificationPanelRef = useRef(null);
  const socketRef = useRef(null);

  const { acquireToken, isAuthenticated, isLoading, user } = useAuth();

  const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
  const SUBTASK_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/SubTask';
  const FEEDBACK_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Feedback';
  const USER_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/user1';
  const ENCRYPTION_KEYS_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Encryption/keys';
  const SOCKET_URL = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net';

  // Save notification settings
  const saveNotificationSettings = (settings) => {
    setNotificationSettings(settings);
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

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
            console.log('Keys set successfully');
          } else {
            throw new Error('Invalid keys structure');
          }
        } catch (keyError) {
          console.error('Failed to fetch encryption keys:', keyError);
          setKeyError(keyError.message);
        }
        
        if (!user?.id) {
          console.error('User ID missing');
          
          return;
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        
      }
    };
    fetchData();
  }, [user?.id]);

  const makeAuthenticatedRequest = async (url, method = 'GET', data = null, params = null) => {
    try {
      const token = await acquireToken('api');
      if (!token) throw new Error('Failed to acquire authentication token');

      const config = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = data;
      }

      if (params) {
        config.params = Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== null && value !== '' && value !== undefined)
        );
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Error in request to ${url}:`, error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please try logging in again.');
      }
      throw error;
    }
  };

  const fetchManagerName = async (managerId) => {
    if (!managerId) {
      console.warn('No managerId provided');
      return 'Unknown Managerss';
    }

    if (managerNames[managerId]) {
      console.log('Using cached manager name for ID:', managerId, managerNames[managerId]);
      return managerNames[managerId];
    }

    if (!isKeysFetched) {
      console.warn('Encryption keys not fetched, isKeysFetched:', isKeysFetched, 'keyError:', keyError);
      return keyError ? 'Unknown Manager' : 'Fetching...';
    }

    try {
      const response = await makeAuthenticatedRequest(`${USER_ENDPOINT}/${managerId}`);
      console.log('Manager API response:', JSON.stringify(response, null, 2));

      // Helper to extract name from various formats
      const extractName = (data) => {
        if (!data) return null;
        if (typeof data === 'string') return data;
        if (typeof data === 'object') {
          return (
            data.fullName ||
            data.name ||
            data.Name ||
            data.username ||
            (data.first && data.last ? `${data.first} ${data.last}` : null)
          );
        }
        return null;
      };

      let encryptedName;
      if (Array.isArray(response)) {
        console.log('Response is an array, checking first element:', response[0]);
        encryptedName = extractName(response[0]);
      } else {
        encryptedName = extractName(response);
      }

      if (!encryptedName) {
        console.error('No name field found in response:', response);
        throw new Error('No name field in response');
      }

      console.log('Encrypted name:', encryptedName);
      const name = decryptString(encryptedName, aesKey, aesIV);
      console.log('Decrypted name:', name);

      setManagerNames((prev) => ({ ...prev, [managerId]: name }));
      return name;
    } catch (error) {
      console.error(`Error fetching/decrypting manager name for ID ${managerId}:`, error);
      setManagerNames((prev) => ({ ...prev, [managerId]: 'Unknown Manager' }));
      return 'Unknown Manager';
    }
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id || !isKeysFetched) return;

    setNotificationLoading(true);
    setNotificationError(null);
    try {
      const response = await makeAuthenticatedRequest(`${FEEDBACK_ENDPOINT}/${user.id}`);
      
      if (!Array.isArray(response)) {
        throw new Error('Invalid response format: expected array');
      }
      console.log('Notifications response:', response);
      const fifteenDaysAgo = subDays(new Date(), 60);
      const notificationsWithNames = await Promise.all(
        response.map(async (notification) => {
          console.log('Processing notification with managerId:', notification.managerId);
          const sentAtDate = new Date(notification.sentAt);
          if (isNaN(sentAtDate)) return null;
          return {
            ...notification,
            managerName: await fetchManagerName(notification.managerId),
            isRead: notification.isRead || false,
            sentAt: sentAtDate.toISOString(),
          };
        })
      );
      const validNotifications = notificationsWithNames
        .filter(n => n !== null)
        .filter(n => new Date(n.sentAt) >= fifteenDaysAgo);
      const sortedNotifications = validNotifications.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
      setNotifications(sortedNotifications.filter(n => !n.isRead));
      setNotificationHistory(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
      setToastNotifications(sortedNotifications.filter(n => !n.isRead).slice(0, 3));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotificationError('Unable to load notifications. Please check your connection and try again.');
      setNotifications([]);
      setNotificationHistory([]);
      setUnreadCount(0);
      setToastNotifications([]);
    }
    setNotificationLoading(false);
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isNaN(date)) return 'Invalid date';
      const dateInIST = addHours(date, 5.5);
      const now = new Date();
      const diffInHours = (now - dateInIST) / (1000 * 60 * 60);

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      return dateInIST.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(dateInIST.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
      });
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Invalid date';
    }
  };

  const playNotificationSound = () => {
    if (!notificationSettings.soundEnabled) return;
    const audio = new Audio('dist/assets/notification-sound.wav');
    audio.play().catch(err => console.warn('Audio play failed:', err));
  };

  const scrollToTask = (taskId) => {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      taskElement.classList.add('bg-yellow-100');
      setTimeout(() => taskElement.classList.remove('bg-yellow-100'), 2000);
    }
  };

  const initSocket = async () => {
    if (socketRef.current?.state === HubConnectionState.Connected) return;

    const maxRetries = 5;
    const baseDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const token = await acquireToken('api');
        if (!token) throw new Error('Failed to acquire authentication token');

        socketRef.current = new HubConnectionBuilder()
          .withUrl(`${SOCKET_URL}/feedbackHub`, {
            accessTokenFactory: () => token,
          })
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect([0, 2000, 10000, 30000])
          .build();

        socketRef.current.on('newFeedback', async (notification) => {
          if (!isKeysFetched) {
            setQueuedNotifications(prev => [...prev, notification]);
            return;
          }
          const fifteenDaysAgo = subDays(new Date(), 60);
          const notificationDate = new Date(notification.sentAt);
          if (notificationDate < fifteenDaysAgo) return;

          const managerName = await fetchManagerName(notification.managerId);
          const newNotification = {
            ...notification,
            managerName,
            isRead: false,
            sentAt: notificationDate.toISOString(),
          };
          setNotifications(prev => {
            const updated = [newNotification, ...prev.filter(n => n.id !== newNotification.id)];
            return updated;
          });
          setNotificationHistory(prev => {
            const updated = [newNotification, ...prev.filter(n => n.id !== newNotification.id)];
            return updated.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
          });
          setUnreadCount(prev => prev + 1);
          setToastNotifications(prev => {
            const updated = [newNotification, ...prev.filter(n => n.id !== newNotification.id).slice(0, 2)];
            return updated.filter(n => !n.isRead);
          });
          setNewNotificationPulse(true);
          setTimeout(() => setNewNotificationPulse(false), 2000);
          playNotificationSound();
        });

        socketRef.current.on('bulkFeedback', async (feedbacks) => {
          if (!isKeysFetched) {
            setQueuedNotifications(prev => [...prev, ...feedbacks.filter(fb => fb.userId === user.id)]);
            return;
          }
          const fifteenDaysAgo = subDays(new Date(), 60);
          const notificationsWithNames = await Promise.all(
            feedbacks
              .filter(fb => fb.userId === user.id && new Date(fb.sentAt) >= fifteenDaysAgo)
              .map(async (notification) => ({
                ...notification,
                managerName: await fetchManagerName(notification.managerId),
                isRead: notification.isRead || false,
                sentAt: new Date(notification.sentAt).toISOString(),
              }))
          );
          setNotifications(prev => {
            const updated = [
              ...notificationsWithNames,
              ...prev.filter(n => !notificationsWithNames.some(newN => newN.id === n.id)),
            ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
            return updated.filter(n => !n.isRead);
          });
          setNotificationHistory(prev => {
            const updated = [
              ...notificationsWithNames,
              ...prev.filter(n => !notificationsWithNames.some(newN => newN.id === n.id)),
            ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
            return updated;
          });
          setUnreadCount(prev => prev + notificationsWithNames.filter(n => !n.isRead).length);
          setToastNotifications(prev => {
            const updated = [
              ...notificationsWithNames.filter(n => !n.isRead).slice(0, 3 - prev.length),
              ...prev,
            ].slice(0, 3);
            return updated.filter(n => !n.isRead);
          });
          setNewNotificationPulse(true);
          setTimeout(() => setNewNotificationPulse(false), 2000);
          playNotificationSound();
        });

        socketRef.current.onclose(() => {
          setNotificationError('Real-time updates are unavailable. Notifications will update periodically.');
        });

        socketRef.current.onreconnected(async () => {
          await socketRef.current.invoke('JoinUser', user.id);
          setNotificationError(null);
        });

        await socketRef.current.start();
        await socketRef.current.invoke('JoinUser', user.id);
        return;
      } catch (error) {
        console.error(`Attempt ${attempt} failed to initialize SignalR:`, error);
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          setNotificationError('Real-time updates are unavailable. Notifications will update periodically.');
        }
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (!notification) return prev;
        const updated = prev.filter(n => n.id !== notificationId);
        setNotificationHistory(prevHistory => {
          const updatedHistory = [
            { ...notification, isRead: true },
            ...prevHistory.filter(n => n.id !== notificationId),
          ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
          return updatedHistory;
        });
        return updated;
      });
      setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setRemovingNotifications(prev => new Set(prev).add(notificationId));

      await makeAuthenticatedRequest(`${FEEDBACK_ENDPOINT}/${notificationId}/read`, 'PUT');

      setTimeout(() => {
        setRemovingNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 600);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotificationError('Failed to mark notification as read. Please try again.');
      await fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications([]);
      setNotificationHistory(prev => prev.map(n => ({ ...n, isRead: true })));
      setToastNotifications([]);
      setUnreadCount(0);
      setRemovingNotifications(new Set(notifications.map(n => n.id)));

      await makeAuthenticatedRequest(`${FEEDBACK_ENDPOINT}/user/${user.id}/read-all`, 'PUT');

      setTimeout(() => {
        setRemovingNotifications(new Set());
        setShowNotifications(false);
      }, 600);
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotificationError('Failed to mark all notifications as read. Please try again.');
      await fetchNotifications();
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      console.warn('Skipping initialization: not authenticated or missing user ID');
      return;
    }

    const initialize = async () => {
      setNotificationLoading(true);
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          console.log(`Attempt ${attempt} to fetch encryption keys from: ${ENCRYPTION_KEYS_ENDPOINT}`);
          const token = await acquireToken('api');
          if (!token) {
            throw new Error('Failed to acquire authentication token');
          }
          const response = await axios.get(ENCRYPTION_KEYS_ENDPOINT, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('Encryption keys response:', response.data);
          if (response.data?.aesKey && response.data?.aesIV) {
            setAesKey(response.data.aesKey);
            setAesIV(response.data.aesIV);
            setKeyError(null);
            setIsKeysFetched(true);
            break;
          } else {
            throw new Error('Invalid keys structure: missing aesKey or aesIV');
          }
        } catch (err) {
          console.error(`Attempt ${attempt} failed to fetch encryption keys:`, {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          setKeyError('Failed to fetch encryption keys');
          if (attempt < 5) {
            const delay = 2000 * Math.pow(2, attempt - 1);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error('All retries failed to fetch encryption keys.');
            setKeyError('Unable to fetch encryption keys. Notifications may display incomplete information.');
          }
        }
      }

      if (isKeysFetched) await fetchNotifications();
      await initSocket();
      setNotificationLoading(false);
    };

    initialize();

    const notificationInterval = setInterval(async () => {
      if (isKeysFetched) await fetchNotifications();
    }, notificationError ? 30000 : 60000);

    return () => {
      if (socketRef.current) {
        socketRef.current.stop();
        socketRef.current = null;
      }
      clearInterval(notificationInterval);
    };
  }, [isAuthenticated, user?.id, isKeysFetched, notificationError]);

  useEffect(() => {
    if (isKeysFetched && queuedNotifications.length > 0) {
      const processQueued = async () => {
        const fifteenDaysAgo = subDays(new Date(), 60);
        const notificationsWithNames = await Promise.all(
          queuedNotifications
            .filter(n => new Date(n.sentAt) >= fifteenDaysAgo)
            .map(async (notification) => ({
              ...notification,
              managerName: await fetchManagerName(notification.managerId),
              isRead: notification.isRead || false,
              sentAt: new Date(notification.sentAt).toISOString(),
            }))
        );
        setNotifications(prev => {
          const updated = [
            ...notificationsWithNames,
            ...prev.filter(n => !notificationsWithNames.some(newN => newN.id === n.id)),
          ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
          return updated.filter(n => !n.isRead);
        });
        setNotificationHistory(prev => {
          const updated = [
            ...notificationsWithNames,
            ...prev.filter(n => !notificationsWithNames.some(newN => newN.id === n.id)),
          ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
          return updated;
        });
        setUnreadCount(prev => prev + notificationsWithNames.filter(n => !n.isRead).length);
        setToastNotifications(prev => {
          const updated = [
            ...notificationsWithNames.filter(n => !n.isRead).slice(0, 3 - prev.length),
            ...prev,
          ].slice(0, 3);
          return updated.filter(n => !n.isRead);
        });
        setNewNotificationPulse(true);
        setTimeout(() => setNewNotificationPulse(false), 2000);
        playNotificationSound();
        setQueuedNotifications([]);
      };
      processQueued();
    }
  }, [isKeysFetched, queuedNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle notifications"]') &&
        !event.target.closest('.settings-modal') &&
        !event.target.closest('.notification-modal') &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
        setShowHistory(false);
        setIsNotificationModalOpen(false);
        setIsSettingsModalOpen(false);
        setShowFilter(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowHistory(false);
        setIsNotificationModalOpen(false);
        setIsSettingsModalOpen(false);
        setShowFilter(false);
      }
    };

    if (showNotifications || isNotificationModalOpen || isSettingsModalOpen || showFilter) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showNotifications, isNotificationModalOpen, isSettingsModalOpen, showFilter]);

  useEffect(() => {
    if (toastNotifications.length === 0) return;

    const timers = toastNotifications.map((notification, index) => {
      if (notification.isRead || notification.paused) return null;
      return setTimeout(() => {
        setToastNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, notificationSettings.toastDuration + index * 500);
    });

    return () => timers.forEach(timer => timer && clearTimeout(timer));
  }, [toastNotifications, notificationSettings]);

  useEffect(() => {
    if (showNotifications && !showHistory && notifications.length > 0 && unreadCount === 0 && removingNotifications.size === 0) {
      const timer = setTimeout(() => setShowNotifications(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [notifications, unreadCount, showNotifications, removingNotifications, showHistory]);

  // Helper function to format date for API
  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    } catch (e) {
      console.error('Invalid date format:', dateStr);
      return null;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading || !user?.id) {
      console.warn('Skipping fetchTasksAndSubtasks: not authenticated, loading, or missing user ID', {
        isAuthenticated,
        isLoading,
        userId: user?.id
      });
      return;
    }

    const fetchTasksAndSubtasks = async () => {
      try {
        const filterParams = {
          pageNumber: currentPage,
          pageSize: tasksPerPage,
          priority: activeFilters.priority || null,
          status: activeFilters.status || null,
          startDate: formatToDDMMYYYY(activeFilters.startDate) || null,
          dueDate: formatToDDMMYYYY(activeFilters.dueDate) || null,
          searchTerm: searchQuery.trim() || activeFilters.searchTerm.trim() || null,
          assignedTo: activeFilters.assignedTo || null,
          hasSubtasks: activeFilters.hasSubtasks || null,
        };

        console.log('Fetching tasks with params:', filterParams);

        const response = await makeAuthenticatedRequest(
          `${API_ENDPOINT}/GetAllTasks`,
          'GET',
          null,
          filterParams
        );

        // Validate response structure
        if (!response || !response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format: data is missing or not an array');
        }

        if (!response.pagination) {
          console.warn('Pagination data missing in response, using default pagination');
          response.pagination = {
            totalCount: response.data.length,
            pageNumber: currentPage,
            pageSize: tasksPerPage,
            totalPages: Math.ceil(response.data.length / tasksPerPage),
            hasPreviousPage: currentPage > 1,
            hasNextPage: response.data.length === tasksPerPage
          };
        }

        let processedTasks = response.data.map((task, index) => {
          if (!task) {
            console.warn(`Task at index ${index} is null or undefined`);
            return null;
          }
          return {
            ...task,
            id: task.id || task.Id || task.taskId || task.TaskId || `temp-${Math.random()}`,
            taskName: task.taskName || task.TaskName || '',
            steps: [],
            subTasksCount: task.subTasksCount || 0,
          };
        }).filter(task => task !== null);

        let subtasks = [];
        try {
          const subtaskData = await makeAuthenticatedRequest(SUBTASK_ENDPOINT);
          if (!Array.isArray(subtaskData)) {
            console.warn('Subtask data is not an array:', subtaskData);
          } else {
            subtasks = subtaskData
              .map((subtask, index) => {
                if (!subtask || typeof subtask !== 'object') {
                  console.warn(`Subtask at index ${index} is invalid:`, subtask);
                  return null;
                }
                return {
                  id: (subtask.Id || subtask.id || subtask.subtaskId || subtask.subTaskId || `temp-${Math.random()}`).toString(),
                  name: subtask.SubTaskName || subtask.subTaskName || subtask.subtaskName || subtask.sub_task_name || '',
                  description: subtask.Description || subtask.description || subtask.subTaskDescription || '',
                  startDate: (subtask.StartDate || subtask.startDate || subtask.start_date)?.split('T')[0] || '',
                  dueDate: (subtask.DueDate || subtask.dueDate || subtask.due_date)?.split('T')[0] || '',
                  status: subtask.Status || subtask.status || subtask.subTaskStatus || 'Not Started',
                  estimatedHours: parseFloat(subtask.EstimatedHours || subtask.estimatedHours || subtask.estimated_hours || 0),
                  completedHours: parseFloat(subtask.CompletedHours || subtask.completedHours || subtask.completed_hours || 0),
                  completed: (subtask.Status || subtask.status || subtask.subTaskStatus) === 'Completed',
                  priority: subtask.Priority || subtask.priority || 'Medium',
                  taskId: subtask.TaskItemId || subtask.taskItemId || subtask.taskId || subtask.task_item_id || null,
                };
              })
              .filter(subtask => subtask !== null);
          }
        } catch (subtaskError) {
          console.warn('Subtask endpoint failed, continuing with tasks only:', subtaskError.message);
        }

        processedTasks = processedTasks.map((task, index) => {
          if (!task) {
            console.warn(`Processed task at index ${index} is null`);
            return null;
          }
          const taskSteps = subtasks.filter((subtask) => subtask?.taskId && subtask.taskId.toString() === task.id.toString());
          return {
            ...task,
            steps: taskSteps,
            subTasksCount: taskSteps.length,
            estimatedHours: taskSteps.reduce((total, step) => total + (parseFloat(step.estimatedHours) || 0), 0) || task.estimatedHours || 0,
            completedHours: taskSteps.reduce((total, step) => total + (parseFloat(step.completedHours) || 0), 0) || task.completedHours || 0,
            status: taskSteps.length > 0 && taskSteps.every((step) => step.status === 'Completed') ? 'Completed' : task.status || 'Not Started',
          };
        }).filter(task => task !== null);

        if (processedTasks.length === 0) {
          console.warn('No valid tasks after processing');
        }

        setTaskList(processedTasks);
        setFilteredTasks(processedTasks);
        setPaginationData(response.pagination);
      } catch (error) {
        console.error('Error fetching tasks:', error, {
          currentPage,
          filterParams: {
            pageNumber: currentPage,
            pageSize: tasksPerPage,
            priority: activeFilters.priority,
            status: activeFilters.status,
            startDate: activeFilters.startDate,
            dueDate: activeFilters.dueDate,
            searchTerm: searchQuery || activeFilters.searchTerm,
            assignedTo: activeFilters.assignedTo,
            hasSubtasks: activeFilters.hasSubtasks,
          }
        });
        alert(`Failed to load tasks for page ${currentPage}: ${error.message || 'Please try again.'}`);
        setTaskList([]);
        setFilteredTasks([]);
        setPaginationData({
          totalCount: 0,
          pageNumber: 1,
          pageSize: tasksPerPage,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        });
      }
    };

    fetchTasksAndSubtasks();
  }, [refreshTrigger, isAuthenticated, isLoading, user?.id, currentPage, searchQuery]);

  const parseDDMMYYYY = (dateStr) => {
    if (!dateStr) return null;
    try {
      const [day, month, year] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      console.error('Invalid date format:', dateStr);
      return null;
    }
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setTaskToEdit(null);
  };

  const handleCreateTask = async (newTask) => {
    try {
      setTaskList((prev) => [newTask, ...prev]);
      setFilteredTasks((prev) => [newTask, ...prev]);
      setCurrentPage(1);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error handling new task:', error);
      alert('Failed to add task: ' + (error.message || 'Please try again.'));
    }
  };

  const handleOnSearch = (query) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    setActiveFilters((prev) => ({ ...prev, searchTerm: trimmedQuery }));
    setCurrentPage(1);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFilterChange = ({ tasks, filters }) => {
    const mergedFilters = { ...activeFilters, ...filters };
    setActiveFilters(mergedFilters);
    setFilteredTasks(tasks || []);
    setCurrentPage(1);
    const count = Object.values(mergedFilters).filter((value) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)).length;
    setFilterCount(count);
  };

  const handleClearFilters = () => {
    const emptyFilters = { priority: '', status: '', startDate: '', dueDate: '', assignedTo: '', hasSubtasks: null, searchTerm: '' };
    setActiveFilters(emptyFilters);
    setFilterCount(0);
    setSearchQuery('');
    setCurrentPage(1);
    setRefreshTrigger((prev) => prev + 1);
    setShowFilter(false);
  };

  const toggleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const toggleDependencyRequests = () => {
    navigate('/admin/dependency');
  };

  const openEditTaskModal = (task) => {
    setTaskToEdit(task);
    setIsAddModalOpen(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prepareTasksForGantt = (tasks) => {
    return tasks
      .filter(task => task && task.id)
      .map((task) => {
        if (!task.startDate || !task.dueDate) {
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          return {
            ...task,
            startDate: task.startDate || today.toISOString().split('T')[0],
            dueDate: task.dueDate || nextWeek.toISOString().split('T')[0],
          };
        }
        return task;
      });
  };

  const ganttReadyTasks = prepareTasksForGantt(filteredTasks);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">Please log in to view tasks</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out;
          }
        `}
      </style>
      {keyError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
          {keyError}
        </div>
      )}
      {notificationError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
          {notificationError}
          <button
            onClick={async () => {
              setNotificationError(null);
              await initSocket();
              if (isKeysFetched) await fetchNotifications();
            }}
            className="ml-4 text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Retry Now
          </button>
        </div>
      )}
      {isNotificationModalOpen && selectedNotification && (
        <div className="notification-modal fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-md animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Notification Details</h3>
              <button
                onClick={() => {
                  markAsRead(selectedNotification.id);
                  setIsNotificationModalOpen(false);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-purple-600" />
                <span className="font-medium">From: {selectedNotification.managerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Sent: {formatDate(selectedNotification.sentAt)}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedNotification.message}</p>
              </div>
            </div>
            {selectedNotification.taskId && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    scrollToTask(selectedNotification.taskId);
                    markAsRead(selectedNotification.id);
                    setIsNotificationModalOpen(false);
                    setShowNotifications(false);
                    setShowHistory(false);
                    setViewMode('list');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  aria-label="Go to task"
                >
                  Go to Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {isSettingsModalOpen && (
        <div className="settings-modal fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={notificationSettings.soundEnabled}
                  onChange={(e) =>
                    saveNotificationSettings({
                      ...notificationSettings,
                      soundEnabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-purple-600"
                />
                Enable Notification Sound
              </label>
              <div className="mt-4">
                <label className="text-sm text-gray-600">Toast Duration</label>
                <select
                  value={notificationSettings.toastDuration}
                  onChange={(e) =>
                    saveNotificationSettings({
                      ...notificationSettings,
                      toastDuration: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg p-1.5 text-sm"
                >
                  <option value={3000}>3 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {toastNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`relative bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-sm transform transition-all duration-300 ease-in-out ${
              removingNotifications.has(notification.id)
                ? 'opacity-0 translate-x-full'
                : 'opacity-100 translate-x-0'
            } hover:shadow-xl group animate-slide-in-right`}
            style={{ marginBottom: `${index * 0.75}rem` }}
            onMouseEnter={() => {
              setToastNotifications(prev =>
                prev.map(n =>
                  n.id === notification.id ? { ...n, paused: true } : n
                )
              );
            }}
            onMouseLeave={() => {
              setToastNotifications(prev =>
                prev.map(n =>
                  n.id === notification.id ? { ...n, paused: false } : n
                )
              );
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-purple-100'}`}>
                <MessageCircle className={`w-5 h-5 ${notification.isRead ? 'text-gray-600' : 'text-purple-600'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{notification.managerName}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(notification.sentAt)}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{notification.message}</p>
                {!notification.isRead && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedNotification(notification);
                        setIsNotificationModalOpen(true);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => markAsRead(notification.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {showNotifications && (
        <div className="fixed inset-0 z-[50]">
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setShowNotifications(false);
              setShowHistory(false);
            }}
          />
          <div
            ref={notificationPanelRef}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 bg-purple-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      {showHistory ? 'Notification History' : 'Notifications'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setShowHistory(false);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
                      aria-label="Close notifications"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {showHistory
                    ? `${notificationHistory.length} total`
                    : `${notifications.length} total, ${unreadCount} unread`}
                </p>
              </div>
              <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                >
                  {showHistory ? (
                    <>
                      <Bell className="h-4 w-4" />
                      Back to Notifications
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View History
                    </>
                  )}
                </button>
                {!showHistory && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {notificationLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-4" />
                    <p className="text-sm font-medium">Loading notifications...</p>
                  </div>
                ) : notificationError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <X className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm text-red-600 mb-4">{notificationError}</p>
                    <button
                      onClick={async () => {
                        setNotificationError(null);
                        await initSocket();
                        if (isKeysFetched) await fetchNotifications();
                      }}
                      className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                    >
                      Retry Now
                    </button>
                  </div>
                ) : (showHistory ? notificationHistory : notifications).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Bell className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {showHistory ? 'No notification history' : 'No notifications to show'}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {(showHistory ? notificationHistory : notifications).map((notification) => (
                      <div
                        key={notification.id}
                        className={`relative p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                          notification.isRead
                            ? 'border-gray-200 bg-white'
                            : 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                        } ${removingNotifications.has(notification.id) ? 'opacity-0 translate-y-4' : ''}`}
                        onClick={() => {
                          setSelectedNotification(notification);
                          setIsNotificationModalOpen(true);
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        {!notification.isRead && (
                          <span className="absolute top-2 right-2 h-2 w-2 bg-purple-600 rounded-full animate-pulse" />
                        )}
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-purple-100'}`}>
                            <MessageCircle className={`w-4 h-4 ${notification.isRead ? 'text-gray-600' : 'text-purple-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                  <User className="w-3 h-3" />
                                  <span>{notification.managerName}</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{notification.message}</p>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(notification.sentAt)}</span>
                            </div>
                            {!showHistory && !notification.isRead && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNotification(notification);
                                    setIsNotificationModalOpen(true);
                                  }}
                                  className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                >
                                  Dismiss
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={fetchNotifications}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {viewMode !== 'focus' && viewMode !== 'dependencies' && (
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-4">
          <div className="flex gap-3 flex-shrink-0 order-last md:order-first">
            <button
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              onClick={() => toggleViewMode('list')}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${viewMode === 'gantt' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              onClick={() => toggleViewMode('gantt')}
            >
              <CalendarRange className="w-4 h-4" />
              Timeline
            </button>
          </div>
          <div className="flex-grow min-w-[200px] md:max-w-md">
            <SearchBar placeholder="Search tasks by name or description..." onSearch={handleOnSearch} className="w-full" />
          </div>
          <div className="flex gap-3 flex-shrink-0 items-center justify-end flex-wrap">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications((prev) => !prev);
                  setShowHistory(false);
                }}
                className={`relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-colors ${newNotificationPulse ? 'animate-pulse' : ''}`}
                aria-label="Toggle notifications"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <Button onClick={() => toggleViewMode('focus')} className="flex items-center gap-1.5 whitespace-nowrap">
              <Kanban className="w-4 h-4" />
              Focus Board
            </Button>
            <Button onClick={toggleDependencyRequests} className="flex items-center gap-1.5 whitespace-nowrap">
              <GitBranch className="w-4 h-4" />
              Dependency Requests
            </Button>
            <div className="relative">
              <Button
                ref={filterButtonRef}
                onClick={() => {
                  if (filterCount > 0) {
                    handleClearFilters();
                  } else {
                    toggleFilter();
                  }
                }}
                className="flex items-center gap-1.5 min-w-[110px] justify-center whitespace-nowrap"
                style={{ transition: 'width 0.2s ease' }}
              >
                {filterCount > 0 ? (
                  <>
                    <FilterIcon className="w-4 h-4" />
                    Clear Filter
                    <span className="bg-white text-purple-600 text-xs px-1.5 py-0.5 rounded-full border border-current">{filterCount}</span>
                  </>
                ) : (
                  <>
                    <FilterIcon className="w-4 h-4" />
                    Filter
                  </>
                )}
              </Button>
              {showFilter && <FilterModal onFilterChange={handleFilterChange} onClose={() => setShowFilter(false)} />}
            </div>
            <Button onClick={handleAddTask} className="flex items-center gap-1.5 whitespace-nowrap">
              <BadgePlus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>
      )}
      {viewMode === 'dependencies' && <DependencyRequests />}
      {viewMode === 'focus' && <FocusBoard tasks={filteredTasks} onBack={() => toggleViewMode('list')} />}
      {viewMode === 'gantt' && <GanttChart tasks={ganttReadyTasks} />}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onAddTask={handleCreateTask}
        taskToEdit={taskToEdit}
        makeAuthenticatedRequest={makeAuthenticatedRequest}
        dependencyTaskId={0}
      />
      {viewMode === 'list' && taskList.length > 0 && filteredTasks.length > 0 && (
        <TaskList
          taskList={filteredTasks}
          setTaskList={setTaskList}
          openEditTaskModal={openEditTaskModal}
          onTaskUpdate={() => setRefreshTrigger((prev) => prev + 1)}
          makeAuthenticatedRequest={makeAuthenticatedRequest}
          paginationData={paginationData}
          onPageChange={handlePageChange}
        />
      )}
      {viewMode === 'list' && taskList.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">No tasks available</div>
        </div>
      )}
      {viewMode === 'list' && taskList.length > 0 && filteredTasks.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500 mb-2">No tasks match your current filters or search query</div>
          {(filterCount > 0 || searchQuery) && (
            <Button onClick={handleClearFilters} className="mt-2">
              Clear All Filters and Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default UserView;