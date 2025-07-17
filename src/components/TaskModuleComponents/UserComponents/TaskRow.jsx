// import React, { useEffect } from 'react';
// import { ChevronRight, ChevronDown, Link, Edit, Trash2, Plus } from 'lucide-react';
// import DependencySection from './DependencySection';
// import SubtaskRow from './SubtaskRow';
// import ProgressBar from './ProgressBar';
// import EffortDisplay from './EffortDisplay';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

// function TaskRow({
//     task,
//     isExpanded,
//     toggleTaskExpand,
//     dependencyTasks,
//     dependentTasks,
//     handleDependencyItemClick,
//     openEditTaskModal,
//     deleteTask,
//     setShowSubtaskModal,
//     setEditingStepId,
//     setStepForm,
//     setShowDependencyRequestForm,
//     setDependencyTaskId,
//     setDependencyStepId,
//     onDeleteSubtask,
//     setTaskList
// }) {
//     const { acquireToken } = useAuth();
//     const isCompleted = task.status === 'Completed';
//     const isNotStarted = task.status === 'Not Started';
//     const canAddSubtasks = task.hasSubtask === 'Yes'; // Use hasSubtask from backend
//     const API_ENDPOINT = 'http://localhost:5181/api/Task';

//     const getAuthHeaders = async () => {
//         try {
//             const token = await acquireToken('api');
//             if (!token) throw new Error('Token acquisition failed');
//             return {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             };
//         } catch (error) {
//             console.error('Error acquiring token:', error);
//             throw error;
//         }
//     };

//     const calculateProgress = (task) => {
//         if (task.status === 'Completed') {
//             return { progress: 100, isOvertime: false };
//         }
//         if (task.steps && task.steps.length > 0) {
//             const allSubtasksCompleted = task.steps.every(step => step.status === 'Completed');
//             if (allSubtasksCompleted) {
//                 return { progress: 100, isOvertime: false };
//             }
//         }
//         if (!task.estimatedHours) {
//             return { progress: 0, isOvertime: false };
//         }
//         const completed = parseFloat(task.completedHours || 0);
//         const estimated = parseFloat(task.estimatedHours);
//         const isOvertime = completed > estimated;
//         let progress;
//         if (completed === estimated && task.status !== 'Completed') {
//             progress = 90; // Show 90% when completed hours equal estimated hours and task is not completed
//         } else {
//             progress = Math.min(100, Math.round((completed / estimated) * 100));
//         }
//         return { progress, isOvertime };
//     };

//     // Calculate task status based on subtasks
//     const calculateTaskStatus = (steps) => {
//         // Return existing task status if no subtasks exist
//         if (!steps || steps.length === 0) return task.status;

//         // Check if any subtask is In Progress (takes precedence)
//         if (steps.some(step => step.status === 'In Progress')) {
//             return 'In Progress';
//         }

//         // Check if all subtasks are Completed
//         if (steps.every(step => step.status === 'Completed')) {
//             return 'Completed';
//         }

//         // Check if all subtasks are Not Started
//         if (steps.every(step => step.status === 'Not Started')) {
//             return 'Not Started';
//         }

//         // Default to In Progress for mixed statuses (e.g., some Completed, some Not Started)
//         return 'In Progress';
//     };

//     // Update task status when subtask statuses change
//     useEffect(() => {
//         if (task.steps && task.steps.length > 0 && !isCompleted) {
//             console.log('TaskRow useEffect triggered for task:', task.id, 'Steps:', task.steps);
//             const newStatus = calculateTaskStatus(task.steps);
//             if (newStatus !== task.status) {
//                 console.log(`Task ${task.id} status changing from ${task.status} to ${newStatus}`);
//                 // Update local state immediately for UI responsiveness
//                 setTaskList(prev => prev.map(t =>
//                     t.id.toString() === task.id.toString()
//                         ? { ...t, status: newStatus }
//                         : { ...t }
//                 ));

//                 const updateTaskStatus = async () => {
//                     try {
//                         const config = await getAuthHeaders();
//                         await axios.patch(`${API_ENDPOINT}/UpdateTask`, {
//                             TaskId: task.id,
//                             Status: newStatus,
//                             Priority: task.priority, // Preserve existing priority
//                             WorkedHours: 0, // No hours updated for status change
//                             UpdateDate: new Date().toISOString(), // Current time in UTC
//                             HasSubtask: task.hasSubtask // Preserve existing HasSubtask
//                         }, config);
//                         console.log(`Task ${task.id} status updated to ${newStatus} in backend`);
//                     } catch (error) {
//                         console.error('Error updating task status:', {
//                             message: error.message,
//                             status: error.response?.status,
//                             data: error.response?.data,
//                             headers: error.response?.headers
//                         });
//                         alert(`Failed to update task status: ${error.response?.status || ''} ${error.response?.data?.message || error.message}. Please check permissions or try again. The status has been updated locally.`);
//                     }
//                 };
//                 updateTaskStatus();
//             }
//         }
//     }, [task.steps, task.status, task.id, setTaskList, acquireToken, isCompleted]);

//     // Filter out undefined or null dependency tasks
//     const validDependencyTasks = dependencyTasks;
//     const validDependentTasks = dependentTasks;

//     const handleAddSubtaskModalOpen = () => {
//         if (!isCompleted && task.id && canAddSubtasks) {
//             console.log('Opening subtask modal with taskId:', task.id, 'hasSubtask:', task.hasSubtask);
//             setShowSubtaskModal(task.id);
//             setEditingStepId(null);
//             setStepForm({
//                 name: '',
//                 description: '',
//                 startDate: '',
//                 dueDate: '',
//                 date: '',
//                 priority: 'Medium',
//                 status: 'Not Started',
//                 estimatedHours: '',
//                 todayEffort: '',
//                 completedHours: ''
//             });
//         } else {
//             console.error('Cannot open subtask modal: Invalid taskId, task is completed, or cannot add subtasks', { id: task.id, status: task.status, canAddSubtasks });
//         }
//     };

//     const { progress, isOvertime } = calculateProgress(task);

//     return (
//         <div className="border-b border-gray-200">
//             <div className="grid grid-cols-8 py-4 px-4">
//                 <div className="flex items-center gap-3">
//                     <button
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             toggleTaskExpand(task.id);
//                         }}
//                         className="text-gray-500 hover:text-electric-violet transition-colors flex-shrink-0"
//                     >
//                         {isExpanded ? (
//                             <ChevronDown className="w-5 h-5" />
//                         ) : (
//                             <ChevronRight className="w-5 h-5" />
//                         )}
//                     </button>
//                     <div className="flex flex-col gap-1">
//                         <span className={`font-medium text-gray-800 text-base ${isExpanded ? 'font-semibold' : ''}`}>
//                             {task.taskName}
//                         </span>
//                         {task.steps && task.steps.length > 0 && (
//                             <span className="text-xs text-gray-600 font-medium">
//                                 {task.steps.length} subtask{task.steps.length !== 1 ? 's' : ''}
//                             </span>
//                         )}
//                     </div>
//                 </div>
//                 <div className="text-sm text-gray-700 flex items-center">{new Date(task.startDate).toISOString().split('T')[0]}</div>
//                 <div className="text-sm text-gray-700 flex items-center">{new Date(task.dueDate).toISOString().split('T')[0]}</div>
//                 <div className="flex items-center">
//                     <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
//                         {task.priority}
//                     </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
//                         {task.status}
//                     </span>
//                 </div>
//                 <div className="flex items-center">
//                     <ProgressBar progress={progress} isOvertime={isOvertime} dueDate={task.dueDate} status={task.status} />
//                 </div>
//                 <div className="flex items-center">
//                     <EffortDisplay taskOrStep={task} />
//                 </div>
//                 <div className="flex items-center justify-end space-x-2">
//                     <button
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             if (!isCompleted) {
//                                 setDependencyTaskId(task.id);
//                                 setDependencyStepId(null);
//                                 setShowDependencyRequestForm(true);
//                             }
//                         }}
//                         className={`p-1 rounded transition-colors ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
//                         disabled={isCompleted}
//                         title={isCompleted ? 'Cannot add dependency to completed task' : 'Add dependency'}
//                     >
//                         <Link className="w-4 h-4 text-blue-500" />
//                     </button>
//                     <button
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             if (!isCompleted) {
//                                 openEditTaskModal(task);
//                             }
//                         }}
//                         className={`p-1 rounded transition-colors ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
//                         disabled={isCompleted}
//                         title={isCompleted ? 'Cannot edit completed task' : 'Edit task'}
//                     >
//                         <Edit className="w-4 h-4 text-blue-500" />
//                     </button>
//                     <button
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             if (isNotStarted) {
//                                 deleteTask(task.id);
//                             }
//                         }}
//                         className={`p-1 rounded transition-colors ${isNotStarted ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
//                         disabled={!isNotStarted}
//                         title={isNotStarted ? 'Delete task' : 'Cannot delete task unless not started'}
//                     >
//                         <Trash2 className="w-4 h-4 text-red-500" />
//                     </button>
//                     <button
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             if (!isCompleted && canAddSubtasks) {
//                                 handleAddSubtaskModalOpen();
//                             }
//                         }}
//                         className={`p-1 rounded transition-colors ${(isCompleted || !canAddSubtasks) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
//                         disabled={isCompleted || !canAddSubtasks}
//                         title={isCompleted ? 'Cannot add subtask to completed task' : !canAddSubtasks ? 'Cannot add subtasks to this task' : 'Add subtask'}
//                     >
//                         <Plus className="w-4 h-4 text-green-800" />
//                     </button>
//                 </div>
//             </div>
//             {isExpanded && (
//                 <div className="pl-8 pr-4 pb-4">
//                     {task.steps && task.steps.length > 0 && (
//                         <div className="mb-4">
//                             {task.steps.map((step) => (
//                                 <SubtaskRow
//                                     key={step.id}
//                                     step={step}
//                                     taskId={task.id}
//                                     setShowSubtaskModal={setShowSubtaskModal}
//                                     setEditingStepId={setEditingStepId}
//                                     setStepForm={setStepForm}
//                                     onDeleteSubtask={onDeleteSubtask}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                     <DependencySection
//                         task={task}
//                         dependencyTasks={validDependencyTasks}
//                         dependentTasks={validDependentTasks}
//                         handleDependencyItemClick={handleDependencyItemClick}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// }

// function getPriorityColor(priority) {
//     switch (priority) {
//         case 'High':
//             return 'bg-red-100 text-red-800';
//         case 'Medium':
//             return 'bg-yellow-100 text-yellow-800';
//         case 'Low':
//             return 'bg-green-100 text-green-800';
//         default:
//             return 'bg-gray-100 text-gray-800';
//     }
// }

// function getStatusColor(status) {
//     switch (status) {
//         case 'Completed':
//             return 'bg-green-100 text-green-800';
//         case 'In Progress':
//             return 'bg-blue-100 text-blue-800';
//         case 'Not Started':
//             return 'bg-gray-100 text-gray-800';
//         default:
//             return 'bg-gray-100 text-gray-800';
//     }
// }

// export default TaskRow;



import React, { useEffect } from 'react';
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
    const isCompleted = task.status === 'Completed';
    const isNotStarted = task.status === 'Not Started';
    const canAddSubtasks = task.hasSubtask === 'Yes'; // Use hasSubtask from backend
    const API_ENDPOINT = 'http://localhost:5181/api/Task';

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
            progress = 90; // Show 90% when completed hours equal estimated hours and task is not completed
        } else {
            progress = Math.min(100, Math.round((completed / estimated) * 100));
        }
        return { progress, isOvertime };
    };

    // Calculate task status based on subtasks
    const calculateTaskStatus = (steps) => {
        // Return existing task status if no subtasks exist
        if (!steps || steps.length === 0) return task.status;

        // Check if any subtask is In Progress (takes precedence)
        if (steps.some(step => step.status === 'In Progress')) {
            return 'In Progress';
        }

        // Check if all subtasks are Completed
        if (steps.every(step => step.status === 'Completed')) {
            return 'Completed';
        }

        // Check if all subtasks are Not Started
        if (steps.every(step => step.status === 'Not Started')) {
            return 'Not Started';
        }

        // Default to In Progress for mixed statuses (e.g., some Completed, some Not Started)
        return 'In Progress';
    };

    // Update task status when subtask statuses change
    useEffect(() => {
        if (task.steps && task.steps.length > 0 && !isCompleted) {
            console.log('TaskRow useEffect triggered for task:', task.id, 'Steps:', task.steps);
            const newStatus = calculateTaskStatus(task.steps);
            if (newStatus !== task.status) {
                console.log(`Task ${task.id} status changing from ${task.status} to ${newStatus}`);
                // Update local state immediately for UI responsiveness
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
                            Priority: task.priority, // Preserve existing priority
                            WorkedHours: 0, // No hours updated for status change
                            UpdateDate: new Date().toISOString(), // Current time in UTC
                            HasSubtask: task.hasSubtask // Preserve existing HasSubtask
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

    // Filter out undefined or null dependency tasks
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

    const { progress, isOvertime } = calculateProgress(task);

    // Truncate task name if it exceeds 30 characters
    const maxTaskNameLength = 13;
    const truncatedTaskName = task.taskName.length > maxTaskNameLength
        ? `${task.taskName.substring(0, maxTaskNameLength - 3)}...`
        : task.taskName;

    return (
        <div className="border-b border-gray-200">
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
                            title={task.taskName} // Full task name on hover
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
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isNotStarted) {
                                deleteTask(task.id);
                            }
                        }}
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