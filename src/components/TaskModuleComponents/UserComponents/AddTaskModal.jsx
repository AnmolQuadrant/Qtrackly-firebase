import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AddTaskModal({ isOpen, onClose, onAddTask, taskToEdit, makeAuthenticatedRequest, dependencyTaskId }) {
  const { acquireToken, user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const initialTaskState = {
    taskId: 0,
    taskName: '',
    priority: 'Medium',
    status: 'Not Started',
    description: '',
    startDate: today,
    dueDate: today,
    estimatedHours: 0,
    completedHours: '',
    updateDate: today,
    todayEffort: 0,
    dependencyTaskId: dependencyTaskId || null,
    createdBy: user?.id || null,
    hasSubtask: 'No',
  };

  const [task, setTask] = useState(initialTaskState);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTask({
          taskId: taskToEdit.id || taskToEdit.Id || 0,
          taskName: taskToEdit.taskName || taskToEdit.TaskName || '',
          priority: taskToEdit.priority || taskToEdit.Priority || 'Medium',
          status: taskToEdit.status || taskToEdit.Status || 'Not Started',
          description: taskToEdit.description || taskToEdit.Description || '',
          startDate: (taskToEdit.startDate || taskToEdit.StartDate)?.split('T')[0] || today,
          dueDate: (taskToEdit.dueDate || taskToEdit.DueDate)?.split('T')[0] || today,
          estimatedHours: (taskToEdit.estimatedHours || taskToEdit.EstimatedHours || '').toString(),
          completedHours: (taskToEdit.completedHours || taskToEdit.CompletedHours || '').toString(),
          updateDate: today,
          todayEffort: 0,
          dependencyTaskId: dependencyTaskId || null,
          createdBy: user?.id || null,
          hasSubtask: taskToEdit.hasSubtask || 'No',
        });
      } else {
        setTask({ ...initialTaskState, dependencyTaskId, createdBy: user?.id || null });
      }
      setError(null);
    }
  }, [isOpen, taskToEdit, dependencyTaskId, user?.id]);

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    if (taskToEdit && (name === 'taskName' || name === 'description' || name === 'estimatedHours')) {
      return; // Prevent updates to read-only fields in edit mode
    }
    if (name === 'completedHours') {
      return; // Completed Hours is read-only in both modes
    }
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toISOString();
  };

  const getMinUpdateDate = () => {
    if (!taskToEdit) return today;
    const startDate = task.startDate || today;
    return startDate;
  };

  const handleSubmit = async () => {
    // Validation
    if (!task.taskName.trim()) {
      setError('Task Name is required');
      return;
    }
    if (!taskToEdit && !task.dueDate) {
      setError('Due Date is required');
      return;
    }
    if (task.hasSubtask === 'No' && (!task.estimatedHours || parseFloat(task.estimatedHours) <= 0)) {
      setError('Estimated Hours must be greater than 0 when no subtasks are selected');
      return;
    }
    if (taskToEdit && !task.updateDate) {
      setError('Date is required for updating task');
      return;
    }
    if (task.hasSubtask === 'No' && task.todayEffort && parseFloat(task.todayEffort) < 0) {
      setError("Today's Effort cannot be negative");
      return;
    }
    if (task.status === 'Not Started' && task.todayEffort && parseFloat(task.todayEffort) > 0) {
      setError('Tasks with "Not Started" status cannot have Today\'s Effort');
      return;
    }
    if (task.status === 'Not Started' && task.completedHours && parseFloat(task.completedHours) > 0) {
      setError('Tasks with "Not Started" status cannot have completed hours');
      return;
    }
    // if (task.hasSubtask === 'No' && task.completedHours && parseFloat(task.completedHours) > parseFloat(task.estimatedHours)) {
    //   setError('Completed Hours cannot exceed Estimated Hours');
    //   return;
    // }

    try {
      if (taskToEdit) {
        // Update existing task
        const formattedTask = {
          taskId: task.taskId,
          status: task.status,
          updateDate: formatDate(task.updateDate),
          workedHours: parseFloat(task.todayEffort) || 0,
          priority: task.priority,
          hasSubtask: task.hasSubtask,
          completedHours: task.status === 'Completed' ? parseFloat(task.estimatedHours) || 0 : parseFloat(task.completedHours) || 0,
        };

        console.log('Updating task with payload:', formattedTask);

        if (makeAuthenticatedRequest) {
          await makeAuthenticatedRequest('http://localhost:5181/api/Task/UpdateTask', 'PATCH', formattedTask);
        } else {
          const token = await acquireToken('api');
          if (!token) {
            setError('Failed to get authentication token. Please try logging in again.');
            return;
          }
          const headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`,
          };
          await axios.patch('http://localhost:5181/api/Task/UpdateTask', formattedTask, { headers });
        }
      } else {
        // Create new task
        const formattedTask = {
          TaskName: task.taskName,
          Priority: task.priority,
          Status: task.status,
          Description: task.description || '',
          StartDate: formatDate(task.startDate),
          DueDate: formatDate(task.dueDate),
          EstimatedHours: parseFloat(task.estimatedHours) || 0,
          CompletedHours: task.status === 'Completed' ? parseFloat(task.estimatedHours) || 0 : parseFloat(task.completedHours) || 0,
          DependencyTaskId: task.dependencyTaskId || null,
          CreatedBy: task.createdBy || null,
          WorkedHours: parseFloat(task.todayEffort) || 0,
          HasSubtask: task.hasSubtask,
        };

        console.log('Creating task with payload:', formattedTask);

        let response;
        if (makeAuthenticatedRequest) {
          if (dependencyTaskId && dependencyTaskId > 0) {
            response = await makeAuthenticatedRequest('http://localhost:5181/api/User/DependencyTask', 'POST', formattedTask);
          } else {
            response = await makeAuthenticatedRequest('http://localhost:5181/api/Task', 'POST', formattedTask);
          }
        } else {
          const token = await acquireToken('api');
          if (!token) {
            setError('Failed to get authentication token. Please try logging in again.');
            return;
          }
          const headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`,
          };
          const endpoint = dependencyTaskId && dependencyTaskId > 0
            ? 'http://localhost:5181/api/User/DependencyTask'
            : 'http://localhost:5181/api/Task';
          response = await axios.post(endpoint, formattedTask, { headers });
        }

        console.log('Task creation response:', JSON.stringify(response, null, 2));

        const newTaskId = response?.data?.id || response?.data?.Id || response?.data?.taskId || response?.id || response?.Id || response?.taskId;
        if (!newTaskId) {
          console.warn('Task ID not found in response, proceeding anyway');
        }
      }

      onAddTask();
      onClose();
    } catch (err) {
      console.error('Error saving task:', {
        endpoint: taskToEdit ? '/api/Task/UpdateTask' : (dependencyTaskId && dependencyTaskId > 0 ? '/api/User/DependencyTask' : '/api/Task'),
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
          ? 'Task not found. Please try again or contact support.'
          : err.response?.data?.message || 'Failed to save task. Please check the input data or server logs.'
      );
    }
  };

  const statusOptions = task.status === 'Not Started' ? ['Not Started', 'In Progress', 'Completed'] : ['In Progress', 'Completed'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3 bg-violet-50">
          <h2 className="text-lg font-semibold text-violet-700">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="taskName"
                value={task.taskName}
                onChange={handleTaskChange}
                className={`w-full px-3 py-2 border ${!task.taskName.trim() && error ? 'border-red-500' : 'border-gray-300'} rounded-md ${taskToEdit ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-violet-500'}`}
                placeholder="Enter task name"
                disabled={taskToEdit}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={task.status}
                  onChange={handleTaskChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${task.hasSubtask === 'Yes' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-violet-500'}`}
                  disabled={task.hasSubtask === 'Yes'}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={task.priority}
                  onChange={handleTaskChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Has Subtask</label>
              <select
                name="hasSubtask"
                value={task.hasSubtask}
                onChange={handleTaskChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${task.hasSubtask === 'Yes' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-violet-500'}`}
                disabled={task.hasSubtask === 'Yes'}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={task.description}
                onChange={handleTaskChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${taskToEdit ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-violet-500'}`}
                rows="2"
                placeholder="Enter task description"
                disabled={taskToEdit}
              />
            </div>
            {!taskToEdit && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={task.startDate}
                    onChange={handleTaskChange}
                    className={`w-full px-3 py-2 border ${!task.startDate && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-violet-500`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={task.dueDate}
                    onChange={handleTaskChange}
                    className={`w-full px-3 py-2 border ${!task.dueDate && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-violet-500`}
                    required
                  />
                </div>
              </div>
            )}
            {taskToEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="updateDate"
                  value={task.updateDate}
                  onChange={handleTaskChange}
                  min={getMinUpdateDate()}
                  className={`w-full px-3 py-2 border ${!task.updateDate && error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-violet-500`}
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Est. Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={task.estimatedHours}
                  onChange={handleTaskChange}
                  min="0.5"
                  step="0.5"
                  className={`w-full px-3 py-2 border ${task.hasSubtask === 'No' && (!task.estimatedHours || parseFloat(task.estimatedHours) <= 0) && error ? 'border-red-500' : 'border-gray-300'} rounded-md ${taskToEdit || task.hasSubtask === 'Yes' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-violet-500'}`}
                  placeholder="0.0"
                  disabled={taskToEdit || task.hasSubtask === 'Yes'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Today's Efforts
                </label>
                <input
                  type="number"
                  name="todayEffort"
                  value={task.todayEffort}
                  onChange={handleTaskChange}
                  min="0"
                  step="0.5"
                  className={`w-full px-3 py-2 border ${task.status === 'Not Started' && task.todayEffort && parseFloat(task.todayEffort) > 0 && error ? 'border-red-500' : 'border-gray-300'} rounded-md ${task.hasSubtask === 'Yes' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-violet-500'}`}
                  placeholder="0.0"
                  disabled={task.hasSubtask === 'Yes'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Done Hours</label>
              <input
                type="number"
                name="completedHours"
                value={task.completedHours}
                onChange={handleTaskChange}
                disabled={true}
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 cursor-not-allowed rounded-md"
                placeholder="0.0"
                min="0"
                step="0.5"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-md hover:from-violet-700 hover:to-purple-700 transition-colors"
          >
            <Save className="mr-1 h-4 w-4" />
            {taskToEdit ? 'Update Task' : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  );
}