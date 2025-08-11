
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DependencyRequestForm from '../UserComponents/DependencyRequestsForm';
import AddTaskModal from './AddTaskModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { fetchEncryptionKeys } from '../../services/apiClient';
import { decryptString } from '../../services/decrypt';
import { Calendar, Clock, User, AlertCircle, ArrowLeft, Inbox, Send, CheckCircle, Search, Link2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../common-components/Button';
import TaskLinkDropdown from '../../TaskModuleComponents/UserComponents/TaskLinkDropdown';
 
const DependencyRequests = () => {
  const [activeTab, setActiveTab] = useState('incoming');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser] = useState('john.doe');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { isAuthenticated, isLoading: authLoading, user, acquireToken } = useAuth();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dependencyId, setDependencyId] = useState(0);
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);
  const [keyError, setKeyError] = useState(null);
  const [incomingSearch, setIncomingSearch] = useState('');
  const [outgoingSearch, setOutgoingSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRequestIndex, setModalRequestIndex] = useState(0);
  const [isRejecting, setIsRejecting] = useState(false);
  const navigate = useNavigate();
 
  const getAuthHeaders = async () => {
    try {
      const token = await acquireToken('api');
      if (!token) {
        throw new Error('Token acquisition failed or required interaction');
      }
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
    } catch (error) {
      console.error('Error acquiring token:', error);
      throw error;
    }
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
        setLoading(true);
        if (!user?.id) {
          console.error('User ID missing');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = await getAuthHeaders();
        const incomerequests = await axios.get(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/Income/${user.id}`, config);
        console.log('Incoming requests response:', incomerequests.data);
        const sortedRequests = incomerequests.data.sort((a, b) => {
          const statusOrder = { pending: 1, approved: 2, rejected: 3, accepted: 4 };
          const statusDiff = statusOrder[a.status?.toLowerCase()] - statusOrder[b.status?.toLowerCase()];
          if (statusDiff !== 0) return statusDiff;
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority?.toLowerCase()] - priorityOrder[b.priority?.toLowerCase()];
        });
        setIncomingRequests(sortedRequests);
      } catch (error) {
        console.error('Error fetching incoming requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = await getAuthHeaders();
        const response = await axios.get(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/${user.id}`, config);
        console.log('Outgoing requests response:', response.data);
        const sortedRequests = response.data.sort((a, b) => {
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority?.toLowerCase()] - priorityOrder[b.priority?.toLowerCase()];
        });
        setOutgoingRequests(sortedRequests);
      } catch (error) {
        console.error('Error fetching outgoing requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);
 
  const handleStatusUpdate = async (request, e) => {
    e.stopPropagation();
    if (isRejecting) return;
    setIsRejecting(true);
    try {
      const config = await getAuthHeaders();
      console.log('Rejecting dependency for task ID:', request.dependencyTaskId, 'Request:', request);
      await axios.post(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Dependency/RejectDependency/${request.dependencyTaskId}`, {}, config);
      console.log(`Dependency ${request.dependencyTaskId} rejected successfully`);
 
      // Optimistically update the state
      setIncomingRequests(prev => prev.map(req =>
        req.dependencyTaskId === request.dependencyTaskId
          ? { ...req, status: 'rejected' }
          : req
      ));
 
      // Fetch latest data
      const incomerequests = await axios.get(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/Income/${user.id}`, config);
      const sortedRequests = incomerequests.data.sort((a, b) => {
        const statusOrder = { pending: 1, approved: 2, rejected: 3, accepted: 4 };
        const statusDiff = statusOrder[a.status?.toLowerCase()] - statusOrder[b.status?.toLowerCase()];
        if (statusDiff !== 0) return statusDiff;
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority?.toLowerCase()] - priorityOrder[b.priority?.toLowerCase()];
      });
      setIncomingRequests(sortedRequests);
      alert('Request rejected successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error rejecting dependency:', error, 'Response:', error.response?.data);
      const errorMessage = error.response?.status === 500
        ? `Server error occurred (JSON Exception). Please check if dependency ID ${request.dependencyTaskId} is valid or contact support.`
        : error.response?.data?.message || error.message || 'Unable to reject request. Please try again.';
      alert(`Failed to reject request: ${errorMessage}`);
 
      // Revert optimistic update
      try {
        const config = await getAuthHeaders();
        const incomerequests = await axios.get(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/Income/${user.id}`, config);
        const sortedRequests = incomerequests.data.sort((a, b) => {
          const statusOrder = { pending: 1, approved: 2, rejected: 3, accepted: 4 };
          const statusDiff = statusOrder[a.status?.toLowerCase()] - statusOrder[b.status?.toLowerCase()];
          if (statusDiff !== 0) return statusDiff;
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority?.toLowerCase()] - priorityOrder[b.priority?.toLowerCase()];
        });
        setIncomingRequests(sortedRequests);
      } catch (fetchError) {
        console.error('Error refetching requests after failed rejection:', fetchError);
        alert('Failed to refresh requests. Please reload the page.');
      }
    } finally {
      setIsRejecting(false);
    }
  };
 
  const handleCreateTask = (request, e) => {
    e.stopPropagation();
    setDependencyId(request.dependencyTaskId);
    setSelectedRequest(request);
    setIsAddTaskModalOpen(true);
    setIsModalOpen(false);
  };
 
  const handleAddTaskModalClose = () => {
    setIsAddTaskModalOpen(false);
    setSelectedRequest(null);
  };
 
  const handleTaskAdded = async () => {
    if (selectedRequest) {
      try {
        const config = await getAuthHeaders();
        await axios.put(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/${selectedRequest.id}`, { status: 'approved' }, config);
        const incomerequests = await axios.get(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/Income/${user.id}`, config);
        const sortedRequests = incomerequests.data.sort((a, b) => {
          const statusOrder = { pending: 1, approved: 2, rejected: 3, accepted: 4 };
          const statusDiff = statusOrder[a.status?.toLowerCase()] - statusOrder[b.status?.toLowerCase()];
          if (statusDiff !== 0) return statusDiff;
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority?.toLowerCase()] - priorityOrder[b.priority?.toLowerCase()];
        });
        setIncomingRequests(sortedRequests);
        alert('Request status updated to approved');
      } catch (error) {
        console.error('Error updating request status:', error);
        alert('Request has been Accepted');
      }
    }
    handleAddTaskModalClose();
  };
 
  const handleLinkToExistingTask = async (request, task) => {
    try {
      const config = await getAuthHeaders();
      const taskId = typeof task === 'string' ? task : task.id;
      console.log(`Linking request ${request.dependencyTaskId} to task ${task}`);
      await axios.patch(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task/link/${task}/${request.dependencyTaskId}`, config);
      alert(`Successfully linked to task #${taskId}`);
      const incomerequests = await axios.get(`https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/Income/${user.id}`, config);
      const sortedRequests = incomerequests.data.sort((a, b) => {
        const statusOrder = { pending: 1, approved: 2, rejected: 3, accepted: 4 };
        const statusDiff = statusOrder[a.status?.toLowerCase()] - statusOrder[b.status?.toLowerCase()];
        if (statusDiff !== 0) return statusDiff;
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority?.toLowerCase()] - priorityOrder[b.priority?.toLowerCase()];
      });
      setIncomingRequests(sortedRequests);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error linking task:', error);
      alert('Failed to link task: ' + (error.response?.data?.message || error.message || 'Please try again.'));
    }
  };
 
  const handleCreateNewRequest = () => {
    setIsFormOpen(true);
  };
 
  const handleFormClose = () => {
    setIsFormOpen(false);
  };
 
  const handleFormSave = (taskId, stepId, newRequest) => {
    setOutgoingRequests(prev => [{
      id: Date.now(),
      taskName: newRequest.notes,
      requestedTask: newRequest.notes,
      description: newRequest.notes,
      priority: 'medium',
      status: 'pending',
      targetUser: newRequest.assignedTo,
      createdAt: new Date().toISOString(),
      estimatedImpact: 'To be determined',
      fromEmail: user.email || 'unknown@example.com',
      toEmail: newRequest.assignedToEmail || 'unknown@example.com'
    }, ...prev]);
    alert('Dependency request sent successfully!');
  };
 
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };
 
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'accepted': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };
 
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      case 'accepted': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };
 
  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      console.warn('Invalid or missing dateString:', dateString);
      return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date parsed from:', dateString);
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
 
  const cleanName = (name) => {
    return name.replace(/\(Quadrant Technologies\)/g, '').trim();
  };
 
  const filterRequests = (requests, searchTerm) => {
    let filtered = requests;
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleanName(decryptString(request.name, aesKey, aesIV)).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status.toLowerCase() === filterStatus);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter(request => request.priority.toLowerCase() === filterPriority);
    }
    return filtered;
  };
 
  const handleCardClick = (request, index) => {
    setSelectedRequest(request);
    setModalRequestIndex(index);
    setIsModalOpen(true);
  };
 
  const handlePrevRequest = (e) => {
    e.stopPropagation();
    setModalRequestIndex(prev => (prev > 0 ? prev - 1 : filteredRequests.length - 1));
    setSelectedRequest(filteredRequests[modalRequestIndex > 0 ? modalRequestIndex - 1 : filteredRequests.length - 1]);
  };
 
  const handleNextRequest = (e) => {
    e.stopPropagation();
    setModalRequestIndex(prev => (prev < filteredRequests.length - 1 ? prev + 1 : 0));
    setSelectedRequest(filteredRequests[modalRequestIndex < filteredRequests.length - 1 ? modalRequestIndex + 1 : 0]);
  };
 
  const RequestModal = ({ request, type, onClose, onPrev, onNext }) => {
  const isIncoming = type === 'incoming';
 
  const handleActionClick = (e) => {
    e.stopPropagation();
  };
 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 transition-colors"
          aria-label="Close modal"
        >
          <XCircle className="w-6 h-6" />
        </button>
 
        {/* Navigation Buttons */}
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 bg-white rounded-full p-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
          disabled={isRejecting}
          aria-label="Previous request"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 bg-white rounded-full p-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
          disabled={isRejecting}
          aria-label="Next request"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
 
        {/* Modal Content */}
        <div className="p-6 sm:p-8 pl-16 sm:pl-20 pr-12 sm:pr-14">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 truncate" title={request.taskName || 'Untitled Request'}>
            {request.taskName || 'Untitled Request'}
          </h3>
 
          <div className="space-y-6">
            {/* User Information */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-medium">
                {isIncoming ? `From: ${cleanName(decryptString(request.name, aesKey, aesIV)) || 'Unknown'}` : `To: ${cleanName(decryptString(request.name, aesKey, aesIV)) || 'Unknown'}`}
              </span>
            </div>
 
            {/* Date and Impact */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>{formatDate(request.createdAt || request.requestedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>{request.estimatedImpact || 'N/A'}</span>
              </div>
            </div>
 
            {/* Priority and Status */}
            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(request.priority)}`}>
                {request.priority?.toUpperCase() || 'N/A'}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                {request.status?.toUpperCase() || 'N/A'}
              </span>
            </div>
 
            {/* Task Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Requested Task:</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{request.requestedTask || 'No task details provided'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description:</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{request.description || 'No description available'}</p>
              </div>
            </div>
 
            {/* Action Buttons for Incoming Requests */}
            {isIncoming && request.status?.toLowerCase() === 'pending' && (
              <div className="flex flex-wrap gap-3 pt-4" onClick={handleActionClick}>
                <button
                  onClick={(e) => handleCreateTask(request, e)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRejecting}
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>
                <TaskLinkDropdown
                  request={request}
                  handleLinkToExistingTask={handleLinkToExistingTask}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRejecting}
                />
                <button
                  onClick={(e) => handleStatusUpdate(request, e)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRejecting}
                >
                  {isRejecting ? (
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
  const RequestCard = ({ request, type, index }) => {
    const isIncoming = type === 'incoming';
 
    return (
      <div
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden cursor-pointer min-h-[150px] min-w-[300px] max-w-[400px]"
        onClick={() => handleCardClick(request, index)}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1" title={request.taskName}>
                {request.taskName || 'Untitled Request'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <User className="w-4 h-4" />
                <span>{isIncoming ? `From: ${cleanName(decryptString(request.name, aesKey, aesIV)) || 'Unknown'}` : `To: ${cleanName(decryptString(request.name, aesKey, aesIV)) || 'Unknown'}`}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                {request.priority?.toUpperCase() || 'N/A'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                {request.status?.toUpperCase() || 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(request.createdAt || request.requestedDate)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {request.estimatedImpact || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  const EmptyState = ({ type }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      {type === 'incoming' ? (
        <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      ) : (
        <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {type === 'incoming' ? 'No incoming requests' : 'No outgoing requests'}
      </h3>
      <p className="text-gray-600 mb-6">
        {type === 'incoming'
          ? "You don't have any dependency requests at the moment."
          : "You haven't sent any dependency requests yet."
        }
      </p>
    </div>
  );
 
  const currentRequests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;
  const currentSearch = activeTab === 'incoming' ? incomingSearch : outgoingSearch;
  const filteredRequests = filterRequests(currentRequests, currentSearch);
  const pendingCount = filteredRequests.filter(r => r.status?.toLowerCase() === 'pending').length;
 
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dependency Requests</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setIsNavigating(true);
                navigate('/admin');
              }}
              disabled={isNavigating}
              className={`flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isNavigating ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Navigating...
                </span>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </>
              )}
            </Button>
          </div>
        </div>
 
        <div className="w-full flex flex-col gap-4 mb-8 px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('incoming')}
                className={`min-w-[200px] flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  activeTab === 'incoming'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Inbox className="w-4 h-4" />
                Incoming ({filterRequests(incomingRequests, incomingSearch).length})
              </button>
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`min-w-[200px] flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  activeTab === 'outgoing'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Send className="w-4 h-4" />
                My Requests ({filterRequests(outgoingRequests, outgoingSearch).length})
              </button>
            </div>
 
            <div className="flex flex-wrap flex-grow justify-end items-center gap-4">
              <div className="relative flex-grow min-w-[250px] max-w-[400px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={currentSearch}
                  onChange={(e) => {
                    if (activeTab === 'incoming') {
                      setIncomingSearch(e.target.value);
                    } else {
                      setOutgoingSearch(e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
 
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="min-w-[180px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
 
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="min-w-[180px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredRequests.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Inbox className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
 
          <div className="bg-green-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>
 
          <div className="bg-yellow-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-red-600">
                  {filteredRequests.filter(r => r.status?.toLowerCase() === 'rejected').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
 
          <div className="bg-pink-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-semibold text-red-600">
                  {filteredRequests.filter(r => r.priority?.toLowerCase() === 'high').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>
 
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div>
            {filteredRequests.length === 0 ? (
              <EmptyState type={activeTab} />
            ) : (
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                  {filteredRequests.map((request, index) => (
                    <RequestCard key={request.id} request={request} type={activeTab} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
 
        {isModalOpen && selectedRequest && (
          <RequestModal
            request={selectedRequest}
            type={activeTab}
            onClose={() => setIsModalOpen(false)}
            onPrev={handlePrevRequest}
            onNext={handleNextRequest}
          />
        )}
 
        {isFormOpen && (
          <DependencyRequestForm
            taskId={null}
            stepId={null}
            taskList={[]}
            onClose={handleFormClose}
            onSave={handleFormSave}
          />
        )}
 
        {isAddTaskModalOpen && (
          <AddTaskModal
            isOpen={isAddTaskModalOpen}
            onClose={handleAddTaskModalClose}
            onAddTask={handleTaskAdded}
            taskToEdit={null}
            dependencyTaskId={dependencyId}
          />
        )}
      </div>
    </div>
  );
};
 
export default DependencyRequests;