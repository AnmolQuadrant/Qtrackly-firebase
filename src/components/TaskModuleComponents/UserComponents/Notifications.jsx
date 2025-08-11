
import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { X, User, MessageCircle, Clock, CheckCircle2, Eye, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { subDays } from 'date-fns';

function Notifications({ socketUrl = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net', feedbackEndpoint = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Feedback', userEndpoint = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User' }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const [managerNames, setManagerNames] = useState({});
  const [managerNameLoading, setManagerNameLoading] = useState({});
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
  const [authPending, setAuthPending] = useState(true);
  const notificationPanelRef = useRef(null);
  const socketRef = useRef(null);
  const { acquireToken, isAuthenticated, user, isLoading } = useAuth();

  const saveNotificationSettings = (settings) => {
    setNotificationSettings(settings);
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

  const loadNotificationsFromStorage = () => {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  };

  const saveNotificationsToStorage = (notifications) => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const loadNotificationHistoryFromStorage = () => {
    const stored = localStorage.getItem('notificationHistory');
    return stored ? JSON.parse(stored) : [];
  };

  const saveNotificationHistoryToStorage = (history) => {
    localStorage.setItem('notificationHistory', JSON.stringify(history));
  };

  const makeAuthenticatedRequest = async (url, method = 'GET', data = null) => {
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

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Authenticated request failed:', { url, method, error: error.message, status: error.response?.status, responseData: error.response?.data });
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please try logging in again.');
      }
      throw error;
    }
  };

  const fetchManagerName = async (managerId) => {
    if (!managerId || typeof managerId !== 'string' || managerId.trim() === '') {
      console.warn(`Invalid managerId: ${managerId}`);
      return 'Unknown Manager';
    }
    if (managerNames[managerId]) {
      console.log(`Returning cached manager name for ID ${managerId}: ${managerNames[managerId]}`);
      return managerNames[managerId];
    }

    setManagerNameLoading((prev) => ({ ...prev, [managerId]: true }));
    try {
      console.log(`Fetching manager name for ID: ${managerId}, URL: ${userEndpoint}/${managerId}`);
      const response = await makeAuthenticatedRequest(`${userEndpoint}/${managerId}`);
      console.log(`Manager name response for ID ${managerId}:`, response);
      const name = response?.name || response?.fullName || 'Unknown Manager';
      setManagerNames((prev) => ({ ...prev, [managerId]: name }));
      return name;
    } catch (error) {
      console.error(`Error fetching manager name for ID ${managerId}:`, error, { response: error.response?.data });
      setManagerNames((prev) => ({ ...prev, [managerId]: 'Unknown Manager' }));
      return 'Unknown Manager';
    } finally {
      setManagerNameLoading((prev) => ({ ...prev, [managerId]: false }));
    }
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id) {
      console.warn('Skipping fetchNotifications: not authenticated or missing user ID', {
        isAuthenticated,
        userId: user?.id,
      });
      return false;
    }
    setNotificationLoading(true);
    setNotificationError(null);
    try {
      console.log(`Fetching notifications for user ID: ${user.id}, URL: ${feedbackEndpoint}/${user.id}`);
      const response = await makeAuthenticatedRequest(`${feedbackEndpoint}/${user.id}`);
      console.log('Raw notifications response:', response.data);
      if (!Array.isArray(response)) {
        throw new Error(`Invalid response format: expected array, got ${typeof response}`);
      }
      if (response.length === 0) {
        console.warn('No notifications returned from API for user ID:', user.id);
      }
      const fifteenDaysAgo = subDays(new Date(), 60);
      console.log('Filtering notifications newer than:', fifteenDaysAgo.toISOString());
      const notificationsWithNames = await Promise.all(
        response.map(async (notification) => {
          console.log('Processing notification:', { id: notification.id, sentAt: notification.sentAt, managerId: notification.managerId });
          try {
            const sentAtDate = new Date(notification.sentAt);
            if (isNaN(sentAtDate)) {
              console.error('Invalid SentAt date for notification:', notification.id, notification.sentAt);
              return null;
            }
            return {
              ...notification,
              managerName: await fetchManagerName(notification.managerId),
              isRead: notification.isRead || false,
              sentAt: sentAtDate.toISOString(),
            };
          } catch (error) {
            console.error('Error processing notification:', notification.id, error);
            return null;
          }
        })
      );
      const validNotifications = notificationsWithNames
        .filter((n) => n !== null)
        .filter((n) => new Date(n.sentAt) >= fifteenDaysAgo);
      console.log('Filtered notifications (within 60 days):', validNotifications);
      const sortedNotifications = validNotifications.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
      setNotifications(sortedNotifications.filter((n) => !n.isRead));
      setNotificationHistory(sortedNotifications);
      setUnreadCount(sortedNotifications.filter((n) => !n.isRead).length);
      setToastNotifications(sortedNotifications.filter((n) => !n.isRead).slice(0, 3));
      saveNotificationsToStorage(sortedNotifications);
      saveNotificationHistoryToStorage(sortedNotifications);
      return true;
    } catch (error) {
      console.error('Error fetching notifications:', error, {
        userId: user?.id,
        endpoint: `${feedbackEndpoint}/${user.id}`,
        response: error.response?.data,
        status: error.response?.status,
      });
      setNotificationError('Unable to load notifications. Please check your connection or log in again.');
      setNotifications(loadNotificationsFromStorage());
      setNotificationHistory(loadNotificationHistoryFromStorage());
      setUnreadCount(loadNotificationsFromStorage().filter((n) => !n.isRead).length);
      setToastNotifications(loadNotificationsFromStorage().filter((n) => !n.isRead).slice(0, 3));
      return false;
    } finally {
      setNotificationLoading(false);
    }
  };

  const playNotificationSound = () => {
    if (!notificationSettings.soundEnabled) return;
    const audio = new Audio('/assets/notification-sound.wav');
    audio.play().catch((err) => console.warn('Audio play failed:', err));
  };

  const initSocket = async () => {
    if (socketRef.current?.state === HubConnectionState.Connected) return true;
    if (!isAuthenticated || !user?.id) {
      console.warn('Skipping initSocket: not authenticated or missing user ID', {
        isAuthenticated,
        userId: user?.id,
      });
      return false;
    }

    const maxRetries = 5;
    const baseDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} to initialize SignalR connection`);
        const token = await acquireToken('api');
        if (!token) {
          throw new Error('Failed to acquire authentication token');
        }

        socketRef.current = new HubConnectionBuilder()
          .withUrl(`${socketUrl}/feedbackHub`, {
            accessTokenFactory: () => token,
          })
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect([0, 2000, 10000, 30000])
          .build();

        socketRef.current.on('newFeedback', async (notification) => {
          console.log('Received new feedback via SignalR:', notification);
          const managerName = await fetchManagerName(notification.managerId);
          const newNotification = {
            ...notification,
            managerName,
            isRead: false,
            sentAt: new Date(notification.sentAt).toISOString(),
          };
          setNotifications((prev) => {
            const updated = [newNotification, ...prev.filter((n) => n.id !== newNotification.id)];
            saveNotificationsToStorage(updated);
            return updated;
          });
          setNotificationHistory((prev) => {
            const updated = [newNotification, ...prev.filter((n) => n.id !== newNotification.id)];
            saveNotificationHistoryToStorage(updated);
            return updated;
          });
          setUnreadCount((prev) => prev + 1);
          setToastNotifications((prev) => {
            const updated = [newNotification, ...prev.filter((n) => n.id !== newNotification.id).slice(0, 2)];
            return updated.filter((n) => !n.isRead);
          });
          setNewNotificationPulse(true);
          setTimeout(() => setNewNotificationPulse(false), 2000);
          playNotificationSound();
        });

        socketRef.current.on('bulkFeedback', async (feedbacks) => {
          console.log('Received bulk feedback via SignalR:', feedbacks);
          const notificationsWithNames = await Promise.all(
            feedbacks
              .filter((fb) => fb.userId === user.id)
              .map(async (notification) => {
                console.log('Processing bulk feedback:', notification);
                return {
                  ...notification,
                  managerName: await fetchManagerName(notification.managerId),
                  isRead: notification.isRead || false,
                  sentAt: new Date(notification.sentAt).toISOString(),
                };
              })
          );
          setNotifications((prev) => {
            const updated = [
              ...notificationsWithNames,
              ...prev.filter((n) => !notificationsWithNames.some((newN) => newN.id === n.id)),
            ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
            saveNotificationsToStorage(updated);
            return updated;
          });
          setNotificationHistory((prev) => {
            const updated = [
              ...notificationsWithNames,
              ...prev.filter((n) => !notificationsWithNames.some((newN) => newN.id === n.id)),
            ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
            saveNotificationHistoryToStorage(updated);
            return updated;
          });
          setUnreadCount((prev) => prev + notificationsWithNames.filter((n) => !n.isRead).length);
          setToastNotifications((prev) => {
            const updated = [
              ...notificationsWithNames.filter((n) => !n.isRead).slice(0, 3 - prev.length),
              ...prev,
            ].slice(0, 3);
            return updated.filter((n) => !n.isRead);
          });
          setNewNotificationPulse(true);
          setTimeout(() => setNewNotificationPulse(false), 2000);
          playNotificationSound();
        });

        socketRef.current.onclose(() => {
          console.warn('SignalR disconnected');
          setNotificationError('Real-time updates are unavailable. Notifications will update periodically.');
        });

        socketRef.current.onreconnected(async () => {
          console.log('SignalR reconnected');
          await socketRef.current.invoke('JoinUser', user.id);
          setNotificationError(null);
        });

        await socketRef.current.start();
        await socketRef.current.invoke('JoinUser', user.id);
        console.log('SignalR connection established successfully');
        return true;
      } catch (error) {
        console.error(`Attempt ${attempt} failed to initialize SignalR:`, error);
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error('All retries failed to initialize SignalR connection');
          setNotificationError('Real-time updates are unavailable. Notifications will update periodically.');
          return false;
        }
      }
    }
  };

  useEffect(() => {
    console.log('Auth state check:', { isLoading, isAuthenticated, userId: user?.id });
    if (isLoading) {
      setAuthPending(true);
      return;
    }
    if (!isAuthenticated || !user?.id) {
      setAuthPending(false);
      setNotificationError('Please log in to view notifications.');
      return;
    }

    setAuthPending(false);
    const initialize = async () => {
      setNotificationLoading(true);
      try {
        const notificationsFetched = await fetchNotifications();
        if (notificationsFetched) {
          await initSocket();
        } else {
          console.warn('Notifications fetch failed, skipping socket initialization');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setNotificationError('Failed to initialize notifications. Please try again.');
      } finally {
        setNotificationLoading(false);
      }
    };

    initialize();

    const notificationInterval = setInterval(async () => {
      if (isAuthenticated && user?.id) {
        await fetchNotifications();
      }
    }, notificationError ? 30000 : 60000);

    return () => {
      if (socketRef.current) {
        socketRef.current.stop();
        socketRef.current = null;
      }
      clearInterval(notificationInterval);
    };
  }, [isLoading, isAuthenticated, user?.id, notificationError]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle notifications"]') &&
        !event.target.closest('.settings-modal') &&
        !event.target.closest('.notification-modal')
      ) {
        setShowNotifications(false);
        setShowHistory(false);
        setIsNotificationModalOpen(false);
        setIsSettingsModalOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowHistory(false);
        setIsNotificationModalOpen(false);
        setIsSettingsModalOpen(false);
      }
    };

    if (showNotifications || isNotificationModalOpen || isSettingsModalOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showNotifications, isNotificationModalOpen, isSettingsModalOpen]);

  useEffect(() => {
    if (toastNotifications.length === 0) return;

    const timers = toastNotifications.map((notification, index) => {
      if (notification.isRead || notification.paused) return null;
      return setTimeout(() => {
        setToastNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, notificationSettings.toastDuration + index * 500);
    });

    return () => timers.forEach((timer) => timer && clearTimeout(timer));
  }, [toastNotifications, notificationSettings]);

  useEffect(() => {
    if (showNotifications && !showHistory && notifications.length === 0 && unreadCount === 0 && removingNotifications.size === 0) {
      const timer = setTimeout(() => setShowNotifications(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [notifications, unreadCount, showNotifications, removingNotifications, showHistory]);

  return (
    <>
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
      {authPending && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-purple-500 border-t-transparent" />
              <p className="text-sm text-gray-600">Authenticating...</p>
            </div>
          </div>
        </div>
      )}
      {notificationError && !authPending && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg max-w-md">
          {notificationError}
          <button
            onClick={async () => {
              setNotificationError(null);
              setNotificationLoading(true);
              const notificationsFetched = await fetchNotifications();
              if (notificationsFetched) {
                await initSocket();
              }
              setNotificationLoading(false);
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
                <span className="font-medium">
                  From: {managerNameLoading[selectedNotification.managerId] ? 'Loading...' : selectedNotification.managerName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Sent: {new Date(selectedNotification.sentAt).toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedNotification.message}</p>
              </div>
            </div>
            {selectedNotification.taskId && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    console.log(`Navigate to task ${selectedNotification.taskId}`);
                    setIsNotificationModalOpen(false);
                    setShowNotifications(false);
                    setShowHistory(false);
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
              setToastNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, paused: true } : n))
              );
            }}
            onMouseLeave={() => {
              setToastNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, paused: false } : n))
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
                    <span className="font-medium">
                      {managerNameLoading[notification.managerId] ? 'Loading...' : notification.managerName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(notification.sentAt).toLocaleString()}</span>
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
                      onClick={async () => {
                        try {
                          const token = await acquireToken('api');
                          await axios.patch(`${feedbackEndpoint}/markRead/${notification.id}`, {}, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                          setNotificationHistory((prev) =>
                            prev.map((n) =>
                              n.id === notification.id ? { ...n, isRead: true } : n
                            )
                          );
                          setUnreadCount((prev) => prev - 1);
                          setToastNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                          saveNotificationsToStorage(notifications.filter((n) => n.id !== notification.id));
                          saveNotificationHistoryToStorage(
                            notificationHistory.map((n) =>
                              n.id === notification.id ? { ...n, isRead: true } : n
                            )
                          );
                        } catch (error) {
                          console.error('Error marking notification as read:', error);
                          setNotificationError('Failed to mark notification as read.');
                        }
                        setRemovingNotifications((prev) => {
                          const newSet = new Set(prev);
                          newSet.add(notification.id);
                          return newSet;
                        });
                        setTimeout(() => {
                          setRemovingNotifications((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(notification.id);
                            return newSet;
                          });
                        }, 600);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )
                }
              </div>
              <button
                onClick={async () => {
                  try {
                    const token = await acquireToken('api');
                    await axios.patch(`${feedbackEndpoint}/markRead/${notification.id}`, {}, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                    setNotificationHistory((prev) =>
                      prev.map((n) =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                      )
                    );
                    setUnreadCount((prev) => prev - 1);
                    setToastNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                    saveNotificationsToStorage(notifications.filter((n) => n.id !== notification.id));
                    saveNotificationHistoryToStorage(
                      notificationHistory.map((n) =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                      )
                    );
                  } catch (error) {
                    console.error('Error marking notification as read:', error);
                    setNotificationError('Failed to mark notification as read.');
                  }
                  setRemovingNotifications((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(notification.id);
                    return newSet;
                  });
                  setTimeout(() => {
                    setRemovingNotifications((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(notification.id);
                      return newSet;
                    });
                  }, 600);
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {!authPending && showNotifications && (
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
                    onClick={async () => {
                      try {
                        const token = await acquireToken('api');
                        await axios.patch(`${feedbackEndpoint}/markAllRead/${user.id}`, {}, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setNotifications([]);
                        setNotificationHistory((prev) =>
                          prev.map((n) => ({ ...n, isRead: true }))
                        );
                        setUnreadCount(0);
                        setToastNotifications([]);
                        saveNotificationsToStorage([]);
                        saveNotificationHistoryToStorage(notificationHistory.map((n) => ({ ...n, isRead: true })));
                      } catch (error) {
                        console.error('Error marking all notifications as read:', error);
                        setNotificationError('Failed to mark notifications as read.');
                      }
                    }}
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
                        setNotificationLoading(true);
                        const notificationsFetched = await fetchNotifications();
                        if (notificationsFetched) {
                          await initSocket();
                        }
                        setNotificationLoading(false);
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
                      {showHistory ? 'No notification history available' : 'No new notifications'}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {(showHistory ? notificationHistory : notifications).map((notification) => (
                      <div
                        key={notification.id}
                        className={`relative p-4 rounded-lg border transition-all duration-300 ${
                          notification.isRead
                            ? 'border-gray-200 bg-white'
                            : 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                        } ${removingNotifications.has(notification.id) ? 'opacity-0 translate-y-4' : ''}`}
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
                                  <span>{managerNameLoading[notification.managerId] ? 'Loading...' : notification.managerName}</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{notification.message}</p>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(notification.sentAt).toLocaleString()}</span>
                            </div>
                            {!notification.isRead && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedNotification(notification);
                                    setIsNotificationModalOpen(true);
                                  }}
                                  className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = await acquireToken('api');
                                      await axios.patch(`${feedbackEndpoint}/markRead/${notification.id}`, {}, {
                                        headers: { Authorization: `Bearer ${token}` },
                                      });
                                      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                                      setNotificationHistory((prev) =>
                                        prev.map((n) =>
                                          n.id === notification.id ? { ...n, isRead: true } : n
                                        )
                                      );
                                      setUnreadCount((prev) => prev - 1);
                                      setToastNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                                      saveNotificationsToStorage(notifications.filter((n) => n.id !== notification.id));
                                      saveNotificationHistoryToStorage(
                                        notificationHistory.map((n) =>
                                          n.id === notification.id ? { ...n, isRead: true } : n
                                        )
                                      );
                                    } catch (error) {
                                      console.error('Error marking notification as read:', error);
                                      setNotificationError('Failed to mark notification as read.');
                                    }
                                    setRemovingNotifications((prev) => {
                                      const newSet = new Set(prev);
                                      newSet.add(notification.id);
                                      return newSet;
                                    });
                                    setTimeout(() => {
                                      setRemovingNotifications((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.delete(notification.id);
                                        return newSet;
                                      });
                                    }, 600);
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
                  onClick={async () => {
                    setNotificationError(null);
                    setNotificationLoading(true);
                    const notificationsFetched = await fetchNotifications();
                    if (notificationsFetched) {
                      await initSocket();
                    }
                    setNotificationLoading(false);
                  }}
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
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (authPending) {
              setNotificationError('Authentication is still in progress. Please wait.');
              return;
            }
            if (!isAuthenticated || !user?.id) {
              setNotificationError('Please log in to view notifications.');
              return;
            }
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
    </>
  );
}

export default Notifications;