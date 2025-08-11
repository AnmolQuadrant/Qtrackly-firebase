
import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, ChevronDown, Link, Edit, Trash2, Plus } from 'lucide-react';
import DependencySection from './DependencySection';
import SubtaskRow from './SubtaskRow';
import ProgressBar from './ProgressBar';
import EffortDisplay from './EffortDisplay';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function TaskRow({
    task,
    isExpanded,
    toggleTaskExpand,
    dependencyTasks,
    dependentTasks,
    handleDependencyItemClick,
    openEditTaskModal,
    deleteTask,
    setShowSubtaskModal,
    setEditingStepId,
    setStepForm,
    setShowDependencyRequestForm,
    setDependencyTaskId,
    setDependencyStepId,
    onDeleteSubtask,
    setTaskList
}) {
    const { acquireToken } = useAuth();
    const [showAlert, setShowAlert] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deletedTaskName, setDeletedTaskName] = useState('');
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const alertTimerRef = useRef(null);
    
    const isCompleted = task.status === 'Completed';
    const isNotStarted = task.status === 'Not Started';
    const canAddSubtasks = task.hasSubtask === 'Yes';
    const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';

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

    const calculateProgress = (task) => {
        if (task.status === 'Completed') {
            return { progress: 100, isOvertime: false };
        }
        if (task.steps && task.steps.length > 0) {
            const allSubtasksCompleted = task.steps.every(step => step.status === 'Completed');
            if (allSubtasksCompleted) {
                return { progress: 100, isOvertime: false };
            }
        }
        if (!task.estimatedHours) {
            return { progress: 0, isOvertime: false };
        }
        const completed = parseFloat(task.completedHours || 0);
        const estimated = parseFloat(task.estimatedHours);
        const isOvertime = completed > estimated;
        let progress;
        if (completed === estimated && task.status !== 'Completed') {
            progress = 90;
        } else {
            progress = Math.min(100, Math.round((completed / estimated) * 100));
        }
        return { progress, isOvertime };
    };

    const calculateTaskStatus = (steps) => {
        if (!steps || steps.length === 0) return task.status;
        if (steps.some(step => step.status === 'In Progress')) {
            return 'In Progress';
        }
        if (steps.every(step => step.status === 'Completed')) {
            return 'Completed';
        }
        if (steps.every(step => step.status === 'Not Started')) {
            return 'Not Started';
        }
        return 'In Progress';
    };

    useEffect(() => {
        if (task.steps && task.steps.length > 0 && !isCompleted) {
            console.log('TaskRow useEffect triggered for task:', task.id, 'Steps:', task.steps);
            const newStatus = calculateTaskStatus(task.steps);
            if (newStatus !== task.status) {
                console.log(`Task ${task.id} status changing from ${task.status} to ${newStatus}`);
                setTaskList(prev => prev.map(t =>
                    t.id.toString() === task.id.toString()
                        ? { ...t, status: newStatus }
                        : { ...t }
                ));

                const updateTaskStatus = async () => {
                    try {
                        const config = await getAuthHeaders();
                        await axios.patch(`${API_ENDPOINT}/UpdateTask`, {
                            TaskId: task.id,
                            Status: newStatus,
                            Priority: task.priority,
                            WorkedHours: 0,
                            UpdateDate: new Date().toISOString(),
                            HasSubtask: task.hasSubtask
                        }, config);
                        console.log(`Task ${task.id} status updated to ${newStatus} in backend`);
                    } catch (error) {
                        console.error('Error updating task status:', {
                            message: error.message,
                            status: error.response?.status,
                            data: error.response?.data,
                            headers: error.response?.headers
                        });
                        alert(`Failed to update task status: ${error.response?.status || ''} ${error.response?.data?.message || error.message}. Please check permissions or try again. The status has been updated locally.`);
                    }
                };
                updateTaskStatus();
            }
        }
    }, [task.steps, task.status, task.id, setTaskList, acquireToken, isCompleted]);

    const validDependencyTasks = dependencyTasks;
    const validDependentTasks = dependentTasks;

    const handleAddSubtaskModalOpen = () => {
        if (!isCompleted && task.id && canAddSubtasks) {
            console.log('Opening subtask modal with taskId:', task.id, 'hasSubtask:', task.hasSubtask);
            setShowSubtaskModal(task.id);
            setEditingStepId(null);
            setStepForm({
                name: '',
                description: '',
                startDate: '',
                dueDate: '',
                date: '',
                priority: 'Medium',
                status: 'Not Started',
                estimatedHours: '',
                todayEffort: '',
                completedHours: ''
            });
        } else {
            console.error('Cannot open subtask modal: Invalid taskId, task is completed, or cannot add subtasks', { id: task.id, status: task.status, canAddSubtasks });
        }
    };

    const handleDeleteButtonClick = (e) => {
        e.stopPropagation();
        if (isNotStarted) {
            // Store task information for confirmation dialog
            const maxTaskNameLength = 13;
            const taskName = task.taskName.length > maxTaskNameLength
                ? `${task.taskName.substring(0, maxTaskNameLength - 3)}...`
                : task.taskName;
            
            setTaskToDelete({ id: task.id, name: taskName, fullName: task.taskName });
            setShowDeleteConfirmation(true);
            
        }
    };


    const confirmDelete = async () => {
    if (taskToDelete) {
        setIsDeleting(true);

        try {
            const taskNameForAlert = taskToDelete.name;

            await deleteTask(taskToDelete.id);

            setShowDeleteConfirmation(false);
            setTaskToDelete(null);
            setIsDeleting(false);

            setTimeout(() => {
                setDeletedTaskName(taskNameForAlert);
                setShowAlert(true);

                // ✅ Show toast instead of alert
                toast.success(`Task "${taskNameForAlert}" deleted successfully!`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }, 200);

        } catch (error) {
            console.error('Error deleting task:', error);
            setIsDeleting(false);

            // ❌ Replace error alert with toast too
            toast.error('Failed to delete task. Please try again.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }
};

    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setTaskToDelete(null);
    };

    // Handle alert timing with improved cleanup
    useEffect(() => {
        if (showAlert) {
            // Clear any existing timer
            if (alertTimerRef.current) {
                clearTimeout(alertTimerRef.current);
            }
            
            // Set new timer for exactly 3 seconds
            alertTimerRef.current = setTimeout(() => {
                setShowAlert(false);
                setDeletedTaskName('');
            }, 3000);
        }

        // Cleanup function
        return () => {
            if (alertTimerRef.current) {
                clearTimeout(alertTimerRef.current);
                alertTimerRef.current = null;
            }
        };
    }, [showAlert]);

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (alertTimerRef.current) {
                clearTimeout(alertTimerRef.current);
            }
        };
    }, []);

    const { progress, isOvertime } = calculateProgress(task);

    const maxTaskNameLength = 13;
    const truncatedTaskName = task.taskName.length > maxTaskNameLength
        ? `${task.taskName.substring(0, maxTaskNameLength - 3)}...`
        : task.taskName;

    return (
        <div className="relative border-b border-gray-200">
            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete the task{' '}
                                <span className="font-semibold text-gray-900" title={taskToDelete?.fullName}>
                                    "{taskToDelete?.name}"
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Task'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Alert */}
            {showAlert && deletedTaskName && (
                <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">✓</span>
                                </div>
                            </div>
                            <span>Task "{deletedTaskName}" deleted successfully!</span>
                        </div>
                        <button
                            onClick={() => {
                                setShowAlert(false);
                                setDeletedTaskName('');
                                if (alertTimerRef.current) {
                                    clearTimeout(alertTimerRef.current);
                                    alertTimerRef.current = null;
                                }
                            }}
                            className="ml-4 text-white hover:text-gray-200 font-bold text-lg"
                            title="Close alert"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-8 py-4 px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskExpand(task.id);
                        }}
                        className="text-gray-500 hover:text-electric-violet transition-colors flex-shrink-0"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                    </button>
                    <div className="flex flex-col gap-1">
                        <span
                            className={`font-medium text-gray-800 text-base ${isExpanded ? 'font-semibold' : ''}`}
                            title={task.taskName}
                        >
                            {truncatedTaskName}
                        </span>
                        {task.steps && task.steps.length > 0 && (
                            <span className="text-xs text-gray-600 font-medium">
                                {task.steps.length} subtask{task.steps.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-sm text-gray-700 flex items-center">{new Date(task.startDate).toISOString().split('T')[0]}</div>
                <div className="text-sm text-gray-700 flex items-center">{new Date(task.dueDate).toISOString().split('T')[0]}</div>
                <div className="flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                    </span>
                </div>
                <div className="flex items-center">
                    <ProgressBar progress={progress} isOvertime={isOvertime} dueDate={task.dueDate} status={task.status} />
                </div>
                <div className="flex items-center">
                    <EffortDisplay taskOrStep={task} />
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isCompleted) {
                                setDependencyTaskId(task.id);
                                setDependencyStepId(null);
                                setShowDependencyRequestForm(true);
                            }
                        }}
                        className={`p-1 rounded transition-colors ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        disabled={isCompleted}
                        title={isCompleted ? 'Cannot add dependency to completed task' : 'Add dependency'}
                    >
                        <Link className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isCompleted) {
                                openEditTaskModal(task);
                            }
                        }}
                        className={`p-1 rounded transition-colors ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        disabled={isCompleted}
                        title={isCompleted ? 'Cannot edit completed task' : 'Edit task'}
                    >
                        <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                        onClick={handleDeleteButtonClick}
                        className={`p-1 rounded transition-colors ${isNotStarted ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
                        disabled={!isNotStarted}
                        title={isNotStarted ? 'Delete task' : 'Cannot delete task unless not started'}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isCompleted && canAddSubtasks) {
                                handleAddSubtaskModalOpen();
                            }
                        }}
                        className={`p-1 rounded transition-colors ${(isCompleted || !canAddSubtasks) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        disabled={isCompleted || !canAddSubtasks}
                        title={isCompleted ? 'Cannot add subtask to completed task' : !canAddSubtasks ? 'Cannot add subtasks to this task' : 'Add subtask'}
                    >
                        <Plus className="w-4 h-4 text-green-800" />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="pl-8 pr-4 pb-4">
                    {task.steps && task.steps.length > 0 && (
                        <div className="mb-4">
                            {task.steps.map((step) => (
                                <SubtaskRow
                                    key={step.id}
                                    step={step}
                                    taskId={task.id}
                                    setShowSubtaskModal={setShowSubtaskModal}
                                    setEditingStepId={setEditingStepId}
                                    setStepForm={setStepForm}
                                    onDeleteSubtask={onDeleteSubtask}
                                />
                            ))}
                        </div>
                    )}
                    <DependencySection
                        task={task}
                        dependencyTasks={validDependencyTasks}
                        dependentTasks={validDependentTasks}
                        handleDependencyItemClick={handleDependencyItemClick}
                    />
                </div>
            )}
            <style jsx>{`
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'High':
            return 'bg-red-100 text-red-800';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'Low':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        case 'Not Started':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export default TaskRow;