

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, FileText, MessageSquare, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { submitDependencyRequest } from '../../services/apiClient';
import { fetchEncryptionKeys } from '../../services/apiClient';


const DependencyRequestForm = ({ taskId, stepId, taskList, onClose, onSave }) => {
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const { isAuthenticated, isLoading: authLoading, user, login } = useAuth();
  const { aesKey, aesIV } = fetchEncryptionKeys();
  
  const [formData, setFormData] = useState({
    taskName: '',
    targetUser: '',
    requestedTask: '',
    description: '',
    priority: 'medium',
    estimatedImpact: '',
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const dropdownRef = useRef(null);


  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter users for suggestions
  useEffect(() => {
    if (!searchQuery.trim() || !isAuthenticated || authLoading || usersLoading || !users.length) {
      setSuggestions([]);
      setShowDropdown(false);
      setUserNotFound(false);
      setIsValidUser(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredUsers = users.filter(
      user =>
        user.email?.toLowerCase().includes(query) ||
        (user.name && user.name.toLowerCase().includes(query))
    );
    
    console.debug('Filtered suggestions:', filteredUsers);
    setSuggestions(filteredUsers);
    setShowDropdown(filteredUsers.length > 0);
    
    // Check if the current search query exactly matches any user
    const exactMatch = users.find(
      user => 
        user.email?.toLowerCase() === query ||
        (user.name && user.name.toLowerCase() === query)
    );
    
    setIsValidUser(!!exactMatch);
    
    // Show "User not found" only if user has typed something and there are no suggestions
    // and the input is not empty and user has finished typing (after a short delay)
    if (searchQuery.trim() && filteredUsers.length === 0) {
      const timer = setTimeout(() => {
        setUserNotFound(true);
      }, 500); // Small delay to avoid showing message while user is still typing
      
      return () => clearTimeout(timer);
    } else {
      setUserNotFound(false);
    }
  }, [searchQuery, isAuthenticated, authLoading, usersLoading, users]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.taskName.trim()) newErrors.taskName = 'Task name is required';
    if (!formData.targetUser.trim()) newErrors.targetUser = 'Target user is required';
    if (!formData.requestedTask.trim()) newErrors.requestedTask = 'Requested task name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Add user validation
    if (formData.targetUser.trim() && !isValidUser) {
      newErrors.targetUser = 'Please select a valid user from the suggestions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Prevent submission if user is not valid
    if (!isValidUser && formData.targetUser.trim()) {
      setErrors({ ...errors, targetUser: 'Please select a valid user from the suggestions' });
      return;
    }
    
    if (!validateForm()) return;

    setServerError(null);
    const payload = {
      TaskName: formData.taskName,
      TargetUser: formData.targetUser,
      RequestedTask: formData.requestedTask,
      Description: formData.description,
      Priority: formData.priority,
      EstimatedImpact: formData.estimatedImpact || null,
      UserId: user?.id,
      TaskId:taskId
    };

    try {
      const response = await submitDependencyRequest(payload);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          taskName: '',
          targetUser: '',
          requestedTask: '',
          description: '',
          priority: 'medium',
          estimatedImpact: '',
        });
        setSearchQuery('');
        setSuggestions([]);
        setErrors({});
        setUserNotFound(false);
        setIsValidUser(false);
        onSave?.(taskId, stepId, {
          dependsOnTaskId: taskId,
          assignedTo: formData.targetUser,
          notes: formData.description,
        });
        onClose?.();
      }, 2000);
    } catch (error) {
      setServerError(
        error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : error.response?.data?.message || 'An error occurred while sending the request.'
      );
      console.error('Error submitting request:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 401) {
        setTimeout(() => login(), 2000);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      taskName: '',
      targetUser: '',
      requestedTask: '',
      description: '',
      priority: 'medium',
      estimatedImpact: '',
    });
    setSearchQuery('');
    setSuggestions([]);
    setErrors({});
    setServerError(null);
    setShowDropdown(false);
    setUserNotFound(false);
    setIsValidUser(false);
  };

  const handleSelectSuggestion = (user) => {
    setFormData({ ...formData, targetUser: user.email });
    setSearchQuery(user.email);
    setShowDropdown(false);
    setUserNotFound(false);
    setIsValidUser(true);
    setErrors({ ...errors, targetUser: '' });
  };

  const handleTargetUserChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData({ ...formData, targetUser: value });
    
    // Clear user not found message when user starts typing again
    if (userNotFound) {
      setUserNotFound(false);
    }
    
    // Clear validation error when user starts typing
    if (errors.targetUser) {
      setErrors({ ...errors, targetUser: '' });
    }
  };

  const inputClasses = (fieldName) => `
    w-full px-3 py-2 rounded-lg border transition-all duration-200
    ${errors[fieldName]
      ? 'border-red-400 focus:border-red-500'
      : 'border-gray-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-200'
    }
    focus:outline-none placeholder-gray-400 bg-white
  `;

  // Loading state
  if (authLoading || usersLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative p-6 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative p-6 text-center">
          <div className="text-gray-500 mb-4">Please log in to access this form.</div>
          <button
            onClick={() => login()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Users error state
  if (usersError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative p-6 text-center">
          <div className="text-red-500 mb-4">Error loading users: {usersError}</div>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Sent</h2>
            <p className="text-gray-600 text-sm mb-6">Your request has been sent successfully.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-800">Dependency Request</h1>
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {serverError && (
                <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-red-700 text-sm">{serverError}</p>
                </div>
              )}
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FileText className="w-4 h-4 mr-2 text-purple-600" />
                  Task Name
                </label>
                <input
                  type="text"
                  value={formData.taskName}
                  onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                  className={inputClasses('taskName')}
                  placeholder="e.g., Frontend User Dashboard"
                />
                {errors.taskName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.taskName}
                  </p>
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 mr-2 text-purple-600" />
                  Target User
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleTargetUserChange}
                  onFocus={() => setShowDropdown(suggestions.length > 0)}
                  className={inputClasses('targetUser')}
                  placeholder="e.g., jane.smith@company.com"
                />
                {showDropdown && suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((user, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(user)}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
                      >
                        <span className="font-medium">{user.name || 'Unknown'}</span> ({user.email})
                      </li>
                    ))}
                  </ul>
                )}
                {userNotFound && searchQuery.trim() && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    User not found. Please select from the suggestions.
                  </p>
                )}
                {errors.targetUser && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.targetUser}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FileText className="w-4 h-4 mr-2 text-purple-600" />
                  Requested Task
                </label>
                <input
                  type="text"
                  value={formData.requestedTask}
                  onChange={(e) => setFormData({ ...formData, requestedTask: e.target.value })}
                  className={inputClasses('requestedTask')}
                  placeholder="e.g., User Authentication API"
                />
                {errors.requestedTask && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.requestedTask}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`px-3 py-2 rounded border text-sm font-medium transition-all duration-200 ${
                        formData.priority === priority
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputClasses('description')}
                  rows={3}
                  placeholder="Explain what you need and why..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                  Estimated Impact (Optional)
                </label>
                <textarea
                  value={formData.estimatedImpact}
                  onChange={(e) => setFormData({ ...formData, estimatedImpact: e.target.value })}
                  className={inputClasses('estimatedImpact')}
                  rows={2}
                  placeholder="How will this dependency affect your timeline?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={formData.targetUser.trim() && !isValidUser}
                  className={`flex-1 font-medium py-2 px-4 rounded transition-all duration-200 flex items-center justify-center ${
                    formData.targetUser.trim() && !isValidUser
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-all duration-200"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 bg-purple-50 border-l-4 border-purple-600 p-3 rounded">
                <p className="text-xs text-purple-700">
                  <strong>How it works:</strong> Your request will be sent to the target user who can
                  link it to an existing task, create a new task, or decline. You'll be notified of
                  their decision.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DependencyRequestForm;