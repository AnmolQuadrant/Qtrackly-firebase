
import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function SubtaskModal({ taskId, editingStepId, stepForm, setStepForm, onClose, onSave }) {
  const { acquireToken } = useAuth();
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize stepForm for new subtasks
  useEffect(() => {
    if (!editingStepId) {
      setStepForm({
        name: '',
        description: '',
        startDate: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Not Started',
        estimatedHours: '1', // Default to 1
        todayEffort: '',
        completedHours: ''
      });
    }
    console.log('SubtaskModal opened with taskId:', taskId, 'stepForm:', stepForm);
  }, [editingStepId, setStepForm, taskId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString();
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);

    // Validation
    if (!stepForm.name?.trim()) {
      setError('Subtask Name is required');
      setIsSaving(false);
      return;
    }
    if (!editingStepId && !stepForm.dueDate) {
      setError('Due Date is required');
      setIsSaving(false);
      return;
    }
    if (editingStepId && !stepForm.date) {
      setError('Date is required');
      setIsSaving(false);
      return;
    }
    if (stepForm.todayEffort && parseFloat(stepForm.todayEffort) < 0) {
      setError("Today's Efforts cannot be negative");
      setIsSaving(false);
      return;
    }
    if (stepForm.estimatedHours && parseFloat(stepForm.estimatedHours) <= 0) { // Prevent 0
      setError('Estimated Hours must be greater than 0');
      setIsSaving(false);
      return;
    }
    if (!editingStepId && !stepForm.estimatedHours) {
      setError('Estimated Hours is required');
      setIsSaving(false);
      return;
    }
    if (stepForm.status === 'Not Started' && stepForm.completedHours && parseFloat(stepForm.completedHours) > 0) {
      setError('Subtasks with "Not Started" status cannot have completed hours');
      setIsSaving(false);
      return;
    }
    // Set default status and priority if undefined
    const validatedStatus = stepForm.status && ['Not Started', 'In Progress', 'Completed'].includes(stepForm.status)
      ? stepForm.status
      : 'Not Started';
    const validatedPriority = stepForm.priority && ['High', 'Medium', 'Low'].includes(stepForm.priority)
      ? stepForm.priority
      : 'Medium';
    const parsedTaskId = parseInt(taskId);
    if (!taskId || isNaN(parsedTaskId)) {
      console.error('Invalid taskId:', taskId);
      setError('Invalid task ID. Please ensure the task is properly selected.');
      setIsSaving(false);
      return;
    }

    try {
      const formattedSubtask = {
        subTaskName: stepForm.name.trim(),
        status: validatedStatus,
        description: stepForm.description || '',
        priority: validatedPriority,
        taskItemId: parsedTaskId,
        estimatedHours: parseFloat(stepForm.estimatedHours) || 1, // Default to 1
        workedHours: parseFloat(stepForm.todayEffort) || 0,
        ...(editingStepId
          ? { datetime: formatDate(stepForm.date) }
          : { startDate: formatDate(stepForm.startDate), dueDate: formatDate(stepForm.dueDate) })
      };

      console.log('Sending payload:', formattedSubtask);
      const token = await acquireToken('api');
      if (!token) {
        setError('Failed to get authentication token. Please try logging in again.');
        setIsSaving(false);
        return;
      }
      const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      };
      let newSubtaskId = editingStepId;
      if (editingStepId) {
        await axios.put(`http://localhost:5181/api/SubTask/${editingStepId}`, formattedSubtask, { headers });
      } else {
        const response = await axios.post('http://localhost:5181/api/SubTask', formattedSubtask, { headers });
        newSubtaskId = response.data.id;
      }

      setError(null);
      onSave(parsedTaskId, newSubtaskId, {
        ...stepForm,
        status: validatedStatus,
        priority: validatedPriority,
        estimatedHours: parseFloat(stepForm.estimatedHours) || 1, // Ensure saved value is valid
        dueDate: editingStepId ? stepForm.date : stepForm.dueDate
      });
      onClose();
    } catch (err) {
      console.error('Error saving subtask:', {
        endpoint: editingStepId ? `/api/SubTask/${editingStepId} (PUT)` : '/api/SubTask (POST)',
        error: err.response?.data,
        status: err.response?.status,
        message: err.message,
      });
      setError(
        err.response?.status === 401
          ? 'Authentication failed. Please log in again.'
          : err.response?.status === 403
          ? 'You do not have permission to perform this action.'
          : err.response?.status === 404
          ? 'Task or subtask not found. Please try again or contact support.'
          : err.response?.data?.message || 'Failed to save subtask. Please check the input data or server logs.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [stepForm, taskId, editingStepId, onSave, onClose, acquireToken, isSaving]);

  const statusOptions = stepForm.status === 'Not Started' 
    ? ['Not Started', 'In Progress', 'Completed']
    : ['In Progress', 'Completed'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-medium text-gray-800">
            {editingStepId ? 'Edit Subtask' : 'Add New Subtask'}
          </h5>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border ${!stepForm.name?.trim() && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none ${editingStepId ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-electric-violet'}`}
              value={stepForm.name || ''} 
              onChange={(e) => !editingStepId && setStepForm({ ...stepForm, name: e.target.value })}
              disabled={editingStepId || isSaving}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Description</label>
            <textarea
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editingStepId ? 'bg-gray-100 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-electric-violet'}`}
              value={stepForm.description || ''}
              onChange={(e) => !editingStepId && setStepForm({ ...stepForm, description: e.target.value })}
              disabled={editingStepId || isSaving}
            />
          </div>
          {!editingStepId ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border ${!stepForm.startDate && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-electric-violet`}
                  value={stepForm.startDate || ''}
                  onChange={(e) => setStepForm({ ...stepForm, startDate: e.target.value })}
                  disabled={isSaving}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border ${!stepForm.dueDate && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-electric-violet`}
                  value={stepForm.dueDate || ''}
                  onChange={(e) => setStepForm({ ...stepForm, dueDate: e.target.value })}
                  disabled={isSaving}
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-600">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border ${!stepForm.date && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-electric-violet`}
                value={stepForm.date || stepForm.dueDate || ''}
                onChange={(e) => setStepForm({ ...stepForm, date: e.target.value })}
                disabled={isSaving}
                required
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-electric-violet"
                value={stepForm.priority || 'Medium'}
                onChange={(e) => setStepForm({ ...stepForm, priority: e.target.value })}
                disabled={isSaving}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-electric-violet"
                value={stepForm.status || 'Not Started'}
                onChange={(e) => setStepForm({ ...stepForm, status: e.target.value })}
                disabled={isSaving}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">
                Estimated Hours <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                className={`w-full px-3 py-2 border ${!stepForm.estimatedHours && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none ${editingStepId ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-electric-violet'}`}
                value={stepForm.estimatedHours || ''}
                onChange={(e) => !editingStepId && setStepForm({ ...stepForm, estimatedHours: e.target.value })}
                disabled={editingStepId || isSaving}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Today's Efforts</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 border ${stepForm.todayEffort && parseFloat(stepForm.todayEffort) < 0 && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-electric-violet`}
                value={stepForm.todayEffort || ''}
                onChange={(e) => setStepForm({ ...stepForm, todayEffort: e.target.value })}
                disabled={isSaving}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">Completed Hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              className={`w-full px-3 py-2 border ${stepForm.status === 'Not Started' && stepForm.completedHours && parseFloat(stepForm.completedHours) > 0 && error ? 'border-red-500' : 'border-gray-300'} rounded-md bg-gray-100 cursor-not-allowed`}
              value={stepForm.completedHours || ''}
              disabled
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-electric-violet text-white rounded-md hover:bg-purple-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSaving}
          >
            {editingStepId ? 'Save' : 'Add Subtask'}
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubtaskModal;