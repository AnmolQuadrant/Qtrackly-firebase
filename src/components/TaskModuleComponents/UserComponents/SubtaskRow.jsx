import React, { useState } from 'react';
import { AlignLeft, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from './ProgressBar';
import EffortDisplay from './EffortDisplay';

function SubtaskRow({ step, taskId, setShowSubtaskModal, setEditingStepId, setStepForm, onDeleteSubtask }) {
    const { acquireToken } = useAuth();
    const [showDescriptionId, setShowDescriptionId] = useState(null);
    const isInProgress = step.status === 'In Progress';
    const SUBTASK_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/SubTask';

    // Debug step data
    // console.log('SubtaskRow step:', step);

    const calculateSubtaskProgress = (step) => {
        if (step.status === 'Completed') {
            return { progress: 100, isOvertime: false };
        }
        if (!step.estimatedHours) {
            return { progress: 0, isOvertime: false };
        }
        const completed = parseFloat(step.completedHours || 0);
        const estimated = parseFloat(step.estimatedHours);
        const isOvertime = completed > estimated;
        let progress;
        if (completed === estimated && step.status !== 'Completed') {
            progress = 90; // Show 90% when completed hours equal estimated hours and subtask is not completed
        } else {
            progress = Math.min(100, Math.round((completed / estimated) * 100));
        }
        return { progress, isOvertime };
    };

    const getAuthHeaders = async () => {
        try {
            const token = await acquireToken('api');
            if (!token) throw new Error('Token acquisition failed');
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

    const toggleDescription = (stepId) => {
        setShowDescriptionId(showDescriptionId === stepId ? null : stepId);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };

    const deleteStep = async (taskId, stepId) => {
        try {
            const config = await getAuthHeaders();
            await axios.delete(`${SUBTASK_ENDPOINT}/${stepId}`, config);
            if (onDeleteSubtask) {
                onDeleteSubtask(taskId, stepId);
            }
            alert('Subtask deleted successfully.');
        } catch (error) {
            console.error('Error deleting subtask:', error);
            alert('Failed to delete subtask: ' + (error.response?.data?.message || error.message));
        }
    };

    const { progress, isOvertime } = calculateSubtaskProgress(step);

    return (
        <div className="grid grid-cols-8 py-2 px-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    <span className={`font-medium text-gray-800 text-base ${step.status === 'Completed' ? 'text-gray-500' : ''}`}>
                        {step.name}
                    </span>
                    {step.description && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDescription(step.id);
                            }}
                            className="text-xs text-gray-500 flex items-center hover:text-electric-violet"
                        >
                            <AlignLeft className="w-3 h-3 mr-1" />Description
                        </button>
                    )}
                    {showDescriptionId === step.id && step.description && (
                        <div className="mt-1 text-xs text-gray-600">{step.description}</div>
                    )}
                </div>
            </div>
            <div className="text-sm text-gray-700 flex items-center">{formatDate(step.startDate)}</div>
            <div className="text-sm text-gray-700 flex items-center">{formatDate(step.dueDate)}</div>
            <div className="flex items-center">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(step.priority)}`}>
                    {step.priority}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(step.status)}`}>
                    {step.status}
                </span>
            </div>
            <div className="flex items-center">
                <ProgressBar progress={progress} isOvertime={isOvertime} dueDate={step.dueDate} status={step.status} />
            </div>
            <div className="flex items-center">
                <EffortDisplay taskOrStep={step} />
            </div>
            <div className="flex items-center justify-end space-x-2">
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        try {
                            const config = await getAuthHeaders();
                            const response = await axios.get(`${SUBTASK_ENDPOINT}/${step.id}`, config);
                            const subtask = response.data;
                            setShowSubtaskModal(taskId);
                            setEditingStepId(step.id);
                            setStepForm({
                                name: subtask.subTaskName || subtask.name || '',
                                description: subtask.description || '',
                                startDate: formatDate(subtask.startDate),
                                dueDate: formatDate(subtask.dueDate),
                                date: formatDate(subtask.datetime || subtask.dueDate),
                                priority: subtask.priority || 'Medium',
                                status: subtask.status || 'Not Started',
                                estimatedHours: subtask.estimatedHours ? subtask.estimatedHours.toString() : '1', // Fallback for invalid API data
                                todayEffort: subtask.workedHours ? subtask.workedHours.toString() : '',
                                completedHours: subtask.completedHours ? subtask.completedHours.toString() : ''
                            });
                        } catch (error) {
                            console.error('Error fetching subtask:', error);
                            alert('Failed to load subtask data: ' + (error.response?.data?.message || error.message));
                        }
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                    <Edit className="w-3 h-3 text-gray-500" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isInProgress) {
                            alert('Cannot delete a subtask that is In Progress.');
                            return;
                        }
                        if (window.confirm('Are you sure you want to delete this subtask?')) {
                            deleteStep(taskId, step.id);
                        }
                    }}
                    className={`p-1 rounded transition-colors ${isInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    disabled={isInProgress}
                    title={isInProgress ? 'Cannot delete In Progress subtask' : 'Delete subtask'}
                >
                    <Trash2 className="w-3 h-3 text-gray-500" />
                </button>
            </div>
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        case 'Not Started': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High': return 'bg-red-100 text-red-800';
        case 'Medium': return 'bg-yellow-100 text-yellow-800';
        case 'Low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default SubtaskRow;