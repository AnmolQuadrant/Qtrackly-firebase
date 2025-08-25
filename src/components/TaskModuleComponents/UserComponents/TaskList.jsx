
// // // // import React, { useState, useEffect } from 'react';
// // // // import TaskRow from './TaskRow';
// // // // import SubtaskModal from './SubTaskModal';
// // // // import DependencyRequestForm from './DependencyRequestsForm';
// // // // import AcceptedDependencies from './AcceptedDependencies';
// // // // import PendingDependencyMessage from './PendingDependencyMessage';
// // // // import Pagination from './Pagination';
// // // // import apiClient from '../../services/apiClient';
// // // // import { useAuth } from '../../context/AuthContext';
// // // // import axios from 'axios';

// // // // function TaskList({ taskList, setTaskList, openEditTaskModal, onTaskUpdate, paginationData, onPageChange }) {
// // // //     const { acquireToken } = useAuth();
// // // //     const [expandedTasks, setExpandedTasks] = useState(new Set());
// // // //     const [showSubtaskModal, setShowSubtaskModal] = useState(null);
// // // //     const [showDependencyRequestForm, setShowDependencyRequestForm] = useState(false);
// // // //     const [dependencyTaskId, setDependencyTaskId] = useState(null);
// // // //     const [dependencyStepId, setDependencyStepId] = useState(null);
// // // //     const [editingStepId, setEditingStepId] = useState(null);
// // // //     const [dependencyTasksMap, setDependencyTasksMap] = useState(new Map());
// // // //     const [dependentTasksMap, setDependentTasksMap] = useState(new Map());
// // // //     const [showAcceptedDependencies, setShowAcceptedDependencies] = useState(false);
// // // //     const [acceptedDependentTasks, setAcceptedDependentTasks] = useState([]);
// // // //     const [showPendingDependencyMessage, setShowPendingDependencyMessage] = useState(false);
// // // //     const [isNavigating, setIsNavigating] = useState(false);
// // // //     const [stepForm, setStepForm] = useState({
// // // //         name: '',
// // // //         description: '',
// // // //         startDate: '',
// // // //         dueDate: '',
// // // //         date: '',
// // // //         priority: 'Medium',
// // // //         status: 'Not Started',
// // // //         estimatedHours: '',
// // // //         todayEffort: '',
// // // //         completedHours: ''
// // // //     });
// // // //     const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';

// // // //     // Navigate to appropriate page if current page has no tasks
// // // //     useEffect(() => {
// // // //         if (!isNavigating && 
// // // //             taskList.length === 0 && 
// // // //             paginationData && 
// // // //             paginationData.totalPages > 0 && 
// // // //             paginationData.currentPage > 1) {
            
// // // //             console.log('No tasks on current page, navigating to previous page', {
// // // //                 currentPage: paginationData.currentPage,
// // // //                 totalPages: paginationData.totalPages,
// // // //                 taskListLength: taskList.length
// // // //             });
            
// // // //             setIsNavigating(true);
// // // //             // Navigate to the previous page or the last available page
// // // //             const targetPage = Math.min(paginationData.currentPage - 1, paginationData.totalPages);
// // // //             const finalPage = Math.max(1, targetPage);
            
// // // //             // Use setTimeout to ensure state updates are processed
// // // //             setTimeout(() => {
// // // //                 onPageChange(finalPage);
// // // //                 setIsNavigating(false);
// // // //             }, 100);
// // // //         }
// // // //     }, [taskList.length, paginationData, onPageChange, isNavigating]);

// // // //     const getAuthHeaders = async () => {
// // // //         try {
// // // //             const token = await acquireToken('api');
// // // //             if (!token) throw new Error('Token acquisition failed');
// // // //             return {
// // // //                 headers: {
// // // //                     Authorization: `Bearer ${token}`,
// // // //                     'Content-Type': 'application/json'
// // // //                 }
// // // //             };
// // // //         } catch (error) {
// // // //             console.error('Error acquiring token:', error);
// // // //             throw error;
// // // //         }
// // // //     };

// // // //     const addTask = async (formData) => {
// // // //         try {
// // // //             // Validate formData
// // // //             if (!formData.taskName || typeof formData.taskName !== 'string' || formData.taskName.trim() === '') {
// // // //                 throw new Error('Task name is required');
// // // //             }

// // // //             const config = await getAuthHeaders();
// // // //             const taskData = {
// // // //                 TaskName: formData.taskName.trim(),
// // // //                 Priority: formData.priority || 'Medium',
// // // //                 Status: formData.status || 'Not Started',
// // // //                 Description: formData.description || '',
// // // //                 StartDate: formData.startDate || new Date().toISOString().split('T')[0],
// // // //                 DueDate: formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// // // //                 EstimatedHours: parseFloat(formData.estimatedHours) || 0,
// // // //                 CompletedHours: parseFloat(formData.completedHours) || 0,
// // // //                 DependencyTaskId: formData.dependencyTaskId || null,
// // // //                 CreatedBy: formData.createdBy || null,
// // // //                 WorkedHours: parseFloat(formData.todayEffort) || 0,
// // // //                 HasSubtask: formData.hasSubtask || false
// // // //             };
// // // //             const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
// // // //                 ? 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/DependencyTask'
// // // //                 : 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
// // // //             const response = await axios.post(endpoint, taskData, config);
            
// // // //             // Log the response for debugging
// // // //             console.log('Backend response:', response.data);

// // // //             // Normalize the response
// // // //             const responseTask = response.data.task || response.data || {};
// // // //             const newTask = {
// // // //                 id: responseTask.id || responseTask.Id || responseTask.taskId || responseTask.TaskId || `temp-${Math.random()}`,
// // // //                 taskName: responseTask.TaskName || responseTask.taskName || responseTask.task_name || formData.taskName.trim(),
// // // //                 priority: responseTask.Priority || responseTask.priority || formData.priority || 'Medium',
// // // //                 status: responseTask.Status || responseTask.status || formData.status || 'Not Started',
// // // //                 description: responseTask.Description || responseTask.description || formData.description || '',
// // // //                 startDate: responseTask.StartDate || responseTask.startDate || responseTask.start_date || formData.startDate || new Date().toISOString().split('T')[0],
// // // //                 dueDate: responseTask.DueDate || responseTask.dueDate || responseTask.due_date || formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// // // //                 estimatedHours: parseFloat(responseTask.EstimatedHours || responseTask.estimatedHours || responseTask.estimated_hours || formData.estimatedHours || 0),
// // // //                 completedHours: parseFloat(responseTask.CompletedHours || responseTask.completedHours || responseTask.completed_hours || formData.completedHours || 0),
// // // //                 dependencyTaskId: responseTask.DependencyTaskId || responseTask.dependencyTaskId || responseTask.dependency_task_id || formData.dependencyTaskId || null,
// // // //                 createdBy: responseTask.CreatedBy || responseTask.createdBy || responseTask.created_by || formData.createdBy || null,
// // // //                 workedHours: parseFloat(responseTask.WorkedHours || responseTask.workedHours || responseTask.worked_hours || formData.todayEffort || 0),
// // // //                 hasSubtask: responseTask.HasSubtask || responseTask.hasSubtask || responseTask.has_subtask || formData.hasSubtask || false,
// // // //                 steps: responseTask.steps || responseTask.subTasks || responseTask.subtasks || [],
// // // //                 subTasksCount: responseTask.subTasksCount || responseTask.subtasksCount || responseTask.subtasks_count || 0
// // // //             };

// // // //             // Validate newTask
// // // //             if (!newTask.id || !newTask.taskName) {
// // // //                 console.warn('Invalid task, but backend may have saved it:', newTask);
// // // //                 throw new Error('Invalid task: missing id or taskName');
// // // //             }

// // // //             setTaskList(prev => [newTask, ...prev.filter(task => task && task.id)]);
// // // //             onTaskUpdate(newTask);
// // // //             console.log('Task added:', newTask);
// // // //         } catch (error) {
// // // //             console.error('Error adding task:', error);
// // // //             alert('Failed to adddd task: ' + (error.response?.data?.message || error.message));
// // // //             // Trigger a refresh to fetch the task if saved by the backend
// // // //             onTaskUpdate(null); // Pass null to indicate refresh without adding invalid task
// // // //         }
// // // //     };

// // // //     const toggleTaskExpand = async (taskId) => {
// // // //         try {
// // // //             const [dependencyResponse, dependentResponse] = await Promise.all([
// // // //                 apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
// // // //                 apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
// // // //             ]);
// // // //             console.log(dependencyResponse.data);
// // // //             console.log(dependentResponse.data);

// // // //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), dependencyResponse.data || []));
// // // //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), dependentResponse.data || []));
// // // //             setExpandedTasks(prev => {
// // // //                 const newSet = new Set(prev);
// // // //                 const taskIdStr = taskId.toString();
// // // //                 newSet.has(taskIdStr) ? newSet.delete(taskIdStr) : newSet.add(taskIdStr);
// // // //                 return newSet;
// // // //             });
// // // //         } catch (error) {
// // // //             console.error('Error fetching task dependencies:', error);
// // // //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// // // //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// // // //         }
// // // //     };

// // // //     const handleDependencyItemClick = async (dep) => {
// // // //         try {
// // // //             if (dep.status === "Accepted") {
// // // //                 const response = await apiClient.get(`/Dependency/GetDependentAcceptedTasks/${dep.request.dependencyTaskId}`);
// // // //                 setAcceptedDependentTasks(response.data || []);
// // // //                 setShowAcceptedDependencies(true);
// // // //                 setShowPendingDependencyMessage(false);
// // // //             } else if (dep.status === "Pending") {
// // // //                 setShowPendingDependencyMessage(true);
// // // //                 setShowAcceptedDependencies(false);
// // // //             } else {
// // // //                 alert("Dependency Has Been Rejected");
// // // //             }
// // // //         } catch (error) {
// // // //             console.error('Error fetching dependent accepted tasks:', error);
// // // //             setShowPendingDependencyMessage(true);
// // // //             setShowAcceptedDependencies(false);
// // // //         }
// // // //     };

// // // //     const deleteTask = async (taskId) => {
// // // //         try {
// // // //             const config = await getAuthHeaders();
// // // //             await axios.delete(`${API_ENDPOINT}/${taskId}`, config);
            
// // // //             // Remove task from local state
// // // //             setTaskList(prev => prev.filter(task => task && task.id && task.id.toString() !== taskId.toString()));
            
// // // //             // Trigger task update to refresh data and handle pagination
// // // //             onTaskUpdate();
            
// // // //             console.log('Task deleted successfully:', taskId);
// // // //         } catch (error) {
// // // //             console.error('Error deleting task:', error);
// // // //             alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
// // // //         }
// // // //     };

// // // //     const addStepToTask = (taskId, stepId, formData) => {
// // // //         const estimatedHours = parseFloat(formData.estimatedHours);
// // // //         console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
// // // //         setTaskList(prev => prev.map(task => 
// // // //             task && task.id && task.id.toString() === taskId.toString()
// // // //                 ? {
// // // //                     ...task,
// // // //                     steps: [
// // // //                         ...(task.steps || []),
// // // //                         {
// // // //                             id: stepId,
// // // //                             name: formData.name,
// // // //                             description: formData.description,
// // // //                             startDate: formData.startDate,
// // // //                             dueDate: formData.dueDate,
// // // //                             status: formData.status,
// // // //                             estimatedHours: estimatedHours,
// // // //                             todayEffort: parseFloat(formData.todayEffort) || 0,
// // // //                             completedHours: parseFloat(formData.completedHours) || 0,
// // // //                             taskItemId: parseInt(taskId),
// // // //                             priority: formData.priority
// // // //                         }
// // // //                     ]
// // // //                 }
// // // //                 : task
// // // //         ).filter(task => task && task.id));
// // // //         setExpandedTasks(prev => new Set(prev).add(taskId.toString()));
// // // //         setShowSubtaskModal(null);
// // // //         setEditingStepId(null);
// // // //         setStepForm({
// // // //             name: '',
// // // //             description: '',
// // // //             startDate: '',
// // // //             dueDate: '',
// // // //             date: '',
// // // //             priority: 'Medium',
// // // //             status: 'Not Started',
// // // //             estimatedHours: '',
// // // //             todayEffort: '',
// // // //             completedHours: ''
// // // //         });
// // // //         onTaskUpdate();
// // // //     };

// // // //     const updateStep = (taskId, stepId, formData) => {
// // // //         const estimatedHours = parseFloat(formData.estimatedHours);
// // // //         console.log('Updating subtask:', { taskId, stepId, formData, estimatedHours });
// // // //         setTaskList(prev => prev.map(task => 
// // // //             task && task.id && task.id.toString() === taskId.toString()
// // // //                 ? {
// // // //                     ...task,
// // // //                     steps: task.steps.map(step => 
// // // //                         step.id.toString() === stepId.toString()
// // // //                             ? {
// // // //                                 ...step,
// // // //                                 name: formData.name,
// // // //                                 description: formData.description,
// // // //                                 startDate: formData.startDate,
// // // //                                 dueDate: formData.dueDate || formData.date,
// // // //                                 priority: formData.priority,
// // // //                                 status: formData.status,
// // // //                                 estimatedHours: estimatedHours,
// // // //                                 todayEffort: parseFloat(formData.todayEffort) || 0,
// // // //                                 completedHours: parseFloat(formData.completedHours) || 0
// // // //                             }
// // // //                             : step
// // // //                     )
// // // //                 }
// // // //                 : task
// // // //         ).filter(task => task && task.id));
// // // //         setShowSubtaskModal(null);
// // // //         setEditingStepId(null);
// // // //         setStepForm({
// // // //             name: '',
// // // //             description: '',
// // // //             startDate: '',
// // // //             dueDate: '',
// // // //             date: '',
// // // //             priority: 'Medium',
// // // //             status: 'Not Started',
// // // //             estimatedHours: '',
// // // //             todayEffort: '',
// // // //             completedHours: ''
// // // //         });
// // // //         onTaskUpdate();
// // // //     };

// // // //     const deleteStep = (taskId, stepId) => {
// // // //         console.log('Deleting subtask:', { taskId, stepId });
// // // //         setTaskList(prev => prev.map(task => 
// // // //             task && task.id && task.id.toString() === taskId.toString()
// // // //                 ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
// // // //                 : task
// // // //         ).filter(task => task && task.id));
// // // //         onTaskUpdate();
// // // //     };

// // // //     const addDependency = async (taskId, stepId, formData) => {
// // // //         try {
// // // //             const config = await getAuthHeaders();
// // // //             await axios.post('https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Dependency', {
// // // //                 taskId: taskId,
// // // //                 subTaskId: stepId,
// // // //                 dependsOnTaskId: formData.dependsOnTaskId,
// // // //                 assignedTo: formData.assignedTo,
// // // //                 notes: formData.notes
// // // //             }, config);
// // // //            // alert('Dependency added successfully.');
// // // //             await toggleTaskExpand(taskId);
// // // //             onTaskUpdate();
// // // //         } catch (error) {
// // // //             console.error('Error adding dependency:', error);
// // // //             //alert('Failed to adddppp task: ' + (error.response?.data?.message || error.message));
// // // //         }
// // // //     };

// // // //     // Determine what message to show
// // // //     const getEmptyStateMessage = () => {
// // // //         if (isNavigating) {
// // // //             return "Navigating to previous page...";
// // // //         }
// // // //         if (paginationData && paginationData.totalPages === 0) {
// // // //             return "No tasks to display";
// // // //         }
// // // //         if (taskList.length === 0) {
// // // //             return "Loading tasks...";
// // // //         }
// // // //         return null;
// // // //     };

// // // //     const emptyMessage = getEmptyStateMessage();

// // // //     return (
// // // //         <>
// // // //             {showAcceptedDependencies && (
// // // //                 <AcceptedDependencies
// // // //                     tasks={acceptedDependentTasks}
// // // //                     onClose={() => setShowAcceptedDependencies(false)}
// // // //                 />
// // // //             )}
// // // //             {showPendingDependencyMessage && (
// // // //                 <PendingDependencyMessage
// // // //                     onClose={() => setShowPendingDependencyMessage(false)}
// // // //                 />
// // // //             )}
// // // //             {showDependencyRequestForm && (
// // // //                 <DependencyRequestForm
// // // //                     taskId={dependencyTaskId}
// // // //                     stepId={dependencyStepId}
// // // //                     taskList={taskList}
// // // //                     onClose={() => setShowDependencyRequestForm(false)}
// // // //                     onSave={addDependency}
// // // //                 />
// // // //             )}
// // // //             <div className="border border-gray-200 rounded-md">
// // // //                 <div className="grid grid-cols-8 py-2 px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
// // // //                     <div>Task Name</div>
// // // //                     <div>Start Date</div>
// // // //                     <div>Due Date</div>
// // // //                     <div>Priority</div>
// // // //                     <div>Status</div>
// // // //                     <div>Progress</div>
// // // //                     <div>Effort</div>
// // // //                     <div className="text-right pr-2">Actions</div>
// // // //                 </div>
// // // //                 {emptyMessage ? (
// // // //                     <div className="p-4 text-sm text-gray-500 text-center">
// // // //                         {emptyMessage}
// // // //                     </div>
// // // //                 ) : (
// // // //                     taskList
// // // //                         .filter(task => task && task.id)
// // // //                         .map(task => (
// // // //                             <TaskRow
// // // //                                 key={task.id}
// // // //                                 task={task}
// // // //                                 isExpanded={expandedTasks.has(task.id.toString())}
// // // //                                 toggleTaskExpand={toggleTaskExpand}
// // // //                                 dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
// // // //                                 dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
// // // //                                 handleDependencyItemClick={handleDependencyItemClick}
// // // //                                 openEditTaskModal={openEditTaskModal}
// // // //                                 deleteTask={deleteTask}
// // // //                                 setShowSubtaskModal={setShowSubtaskModal}
// // // //                                 setEditingStepId={setEditingStepId}
// // // //                                 setStepForm={setStepForm}
// // // //                                 setShowDependencyRequestForm={setShowDependencyRequestForm}
// // // //                                 setDependencyTaskId={setDependencyTaskId}
// // // //                                 setDependencyStepId={setDependencyStepId}
// // // //                                 onDeleteSubtask={deleteStep}
// // // //                                 setTaskList={setTaskList}
// // // //                             />
// // // //                         ))
// // // //                 )}
// // // //             </div>
// // // //             <Pagination paginationData={paginationData} onPageChange={onPageChange} />
// // // //             {showSubtaskModal && (
// // // //                 <SubtaskModal
// // // //                     taskId={showSubtaskModal}
// // // //                     editingStepId={editingStepId}
// // // //                     stepForm={stepForm}
// // // //                     setStepForm={setStepForm}
// // // //                     onClose={() => {
// // // //                         setShowSubtaskModal(null);
// // // //                         setEditingStepId(null);
// // // //                         setStepForm({
// // // //                             name: '',
// // // //                             description: '',
// // // //                             startDate: '',
// // // //                             dueDate: '',
// // // //                             date: '',
// // // //                             priority: 'Medium',
// // // //                             status: 'Not Started',
// // // //                             estimatedHours: '',
// // // //                             todayEffort: '',
// // // //                             completedHours: ''
// // // //                         });
// // // //                     }}
// // // //                     onSave={(taskId, stepId, formData) => {
// // // //                         if (stepId) {
// // // //                             updateStep(taskId, stepId, formData);
// // // //                         } else {
// // // //                             addStepToTask(taskId, stepId, formData);
// // // //                         }
// // // //                     }}
// // // //                 />
// // // //             )}
// // // //         </>
// // // //     );
// // // // }

// // // // export default TaskList;

// // // import React, { useState, useEffect } from 'react';
// // // import TaskRow from './TaskRow';
// // // import SubtaskModal from './SubTaskModal';
// // // import DependencyRequestForm from './DependencyRequestsForm';
// // // import AcceptedDependencies from './AcceptedDependencies';
// // // import PendingDependencyMessage from './PendingDependencyMessage';
// // // import apiClient from '../../services/apiClient';
// // // import { useAuth } from '../../context/AuthContext';
// // // import axios from 'axios';

// // // function TaskList({ taskList, setTaskList, openEditTaskModal, onTaskUpdate, paginationData, onPageChange }) {
// // //     const { acquireToken } = useAuth();
// // //     const [expandedTasks, setExpandedTasks] = useState(new Set());
// // //     const [showSubtaskModal, setShowSubtaskModal] = useState(null);
// // //     const [showDependencyRequestForm, setShowDependencyRequestForm] = useState(false);
// // //     const [dependencyTaskId, setDependencyTaskId] = useState(null);
// // //     const [dependencyStepId, setDependencyStepId] = useState(null);
// // //     const [editingStepId, setEditingStepId] = useState(null);
// // //     const [dependencyTasksMap, setDependencyTasksMap] = useState(new Map());
// // //     const [dependentTasksMap, setDependentTasksMap] = useState(new Map());
// // //     const [showAcceptedDependencies, setShowAcceptedDependencies] = useState(false);
// // //     const [acceptedDependentTasks, setAcceptedDependentTasks] = useState([]);
// // //     const [showPendingDependencyMessage, setShowPendingDependencyMessage] = useState(false);
// // //     const [isNavigating, setIsNavigating] = useState(false);
// // //     const [stepForm, setStepForm] = useState({
// // //         name: '',
// // //         description: '',
// // //         startDate: '',
// // //         dueDate: '',
// // //         date: '',
// // //         priority: 'Medium',
// // //         status: 'Not Started',
// // //         estimatedHours: '',
// // //         todayEffort: '',
// // //         completedHours: ''
// // //     });
// // //     const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';

// // //     // Navigate to appropriate page if current page has no tasks
// // //     useEffect(() => {
// // //         if (!isNavigating && 
// // //             taskList.length === 0 && 
// // //             paginationData && 
// // //             paginationData.totalPages > 0 && 
// // //             paginationData.currentPage > 1) {
            
// // //             console.log('No tasks on current page, navigating to previous page', {
// // //                 currentPage: paginationData.currentPage,
// // //                 totalPages: paginationData.totalPages,
// // //                 taskListLength: taskList.length
// // //             });
            
// // //             setIsNavigating(true);
// // //             const targetPage = Math.min(paginationData.currentPage - 1, paginationData.totalPages);
// // //             const finalPage = Math.max(1, targetPage);
            
// // //             setTimeout(() => {
// // //                 onPageChange(finalPage);
// // //                 setIsNavigating(false);
// // //             }, 100);
// // //         }
// // //     }, [taskList.length, paginationData, onPageChange, isNavigating]);

// // //     const getAuthHeaders = async () => {
// // //         try {
// // //             const token = await acquireToken('api');
// // //             if (!token) throw new Error('Token acquisition failed');
// // //             return {
// // //                 headers: {
// // //                     Authorization: `Bearer ${token}`,
// // //                     'Content-Type': 'application/json'
// // //                 }
// // //             };
// // //         } catch (error) {
// // //             console.error('Error acquiring token:', error);
// // //             throw error;
// // //         }
// // //     };

// // //     const addTask = async (formData) => {
// // //         try {
// // //             if (!formData.taskName || typeof formData.taskName !== 'string' || formData.taskName.trim() === '') {
// // //                 throw new Error('Task name is required');
// // //             }

// // //             const config = await getAuthHeaders();
// // //             const taskData = {
// // //                 TaskName: formData.taskName.trim(),
// // //                 Priority: formData.priority || 'Medium',
// // //                 Status: formData.status || 'Not Started',
// // //                 Description: formData.description || '',
// // //                 StartDate: formData.startDate || new Date().toISOString().split('T')[0],
// // //                 DueDate: formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// // //                 EstimatedHours: parseFloat(formData.estimatedHours) || 0,
// // //                 CompletedHours: parseFloat(formData.completedHours) || 0,
// // //                 DependencyTaskId: formData.dependencyTaskId || null,
// // //                 CreatedBy: formData.createdBy || null,
// // //                 WorkedHours: parseFloat(formData.todayEffort) || 0,
// // //                 HasSubtask: formData.hasSubtask || false
// // //             };
// // //             const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
// // //                 ? 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/DependencyTask'
// // //                 : 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
// // //             const response = await axios.post(endpoint, taskData, config);
            
// // //             console.log('Backend response:', response.data);

// // //             const responseTask = response.data.task || response.data || {};
// // //             const newTask = {
// // //                 id: responseTask.id || responseTask.Id || responseTask.taskId || responseTask.TaskId || `temp-${Math.random()}`,
// // //                 taskName: responseTask.TaskName || responseTask.taskName || responseTask.task_name || formData.taskName.trim(),
// // //                 priority: responseTask.Priority || responseTask.priority || formData.priority || 'Medium',
// // //                 status: responseTask.Status || responseTask.status || formData.status || 'Not Started',
// // //                 description: responseTask.Description || responseTask.description || formData.description || '',
// // //                 startDate: responseTask.StartDate || responseTask.startDate || responseTask.start_date || formData.startDate || new Date().toISOString().split('T')[0],
// // //                 dueDate: responseTask.DueDate || responseTask.dueDate || responseTask.due_date || formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// // //                 estimatedHours: parseFloat(responseTask.EstimatedHours || responseTask.estimatedHours || responseTask.estimated_hours || formData.estimatedHours || 0),
// // //                 completedHours: parseFloat(responseTask.CompletedHours || responseTask.completedHours || responseTask.completed_hours || formData.completedHours || 0),
// // //                 dependencyTaskId: responseTask.DependencyTaskId || responseTask.dependencyTaskId || responseTask.dependency_task_id || formData.dependencyTaskId || null,
// // //                 createdBy: responseTask.CreatedBy || responseTask.createdBy || responseTask.created_by || formData.createdBy || null,
// // //                 workedHours: parseFloat(responseTask.WorkedHours || responseTask.workedHours || responseTask.worked_hours || formData.todayEffort || 0),
// // //                 hasSubtask: responseTask.HasSubtask || responseTask.hasSubtask || responseTask.has_subtask || formData.hasSubtask || false,
// // //                 steps: responseTask.steps || responseTask.subTasks || responseTask.subtasks || [],
// // //                 subTasksCount: responseTask.subTasksCount || responseTask.subtasksCount || responseTask.subtasks_count || 0
// // //             };

// // //             if (!newTask.id || !newTask.taskName) {
// // //                 console.warn('Invalid task, but backend may have saved it:', newTask);
// // //                 throw new Error('Invalid task: missing id or taskName');
// // //             }

// // //             setTaskList(prev => [newTask, ...prev.filter(task => task && task.id)]);
// // //             onTaskUpdate(newTask);
// // //             console.log('Task added:', newTask);
// // //         } catch (error) {
// // //             console.error('Error adding task:', error);
// // //             alert('Failed to add task: ' + (error.response?.data?.message || error.message));
// // //             onTaskUpdate(null);
// // //         }
// // //     };

// // //     const toggleTaskExpand = async (taskId) => {
// // //         try {
// // //             const [dependencyResponse, dependentResponse] = await Promise.all([
// // //                 apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
// // //                 apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
// // //             ]);
// // //             console.log(dependencyResponse.data);
// // //             console.log(dependentResponse.data);

// // //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), dependencyResponse.data || []));
// // //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), dependentResponse.data || []));
// // //             setExpandedTasks(prev => {
// // //                 const newSet = new Set(prev);
// // //                 const taskIdStr = taskId.toString();
// // //                 newSet.has(taskIdStr) ? newSet.delete(taskIdStr) : newSet.add(taskIdStr);
// // //                 return newSet;
// // //             });
// // //         } catch (error) {
// // //             console.error('Error fetching task dependencies:', error);
// // //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// // //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// // //         }
// // //     };

// // //     const handleDependencyItemClick = async (dep) => {
// // //         try {
// // //             if (dep.status === "Accepted") {
// // //                 const response = await apiClient.get(`/Dependency/GetDependentAcceptedTasks/${dep.request.dependencyTaskId}`);
// // //                 setAcceptedDependentTasks(response.data || []);
// // //                 setShowAcceptedDependencies(true);
// // //                 setShowPendingDependencyMessage(false);
// // //             } else if (dep.status === "Pending") {
// // //                 setShowPendingDependencyMessage(true);
// // //                 setShowAcceptedDependencies(false);
// // //             } else {
// // //                 alert("Dependency Has Been Rejected");
// // //             }
// // //         } catch (error) {
// // //             console.error('Error fetching dependent accepted tasks:', error);
// // //             setShowPendingDependencyMessage(true);
// // //             setShowAcceptedDependencies(false);
// // //         }
// // //     };

// // //     const deleteTask = async (taskId) => {
// // //         try {
// // //             const config = await getAuthHeaders();
// // //             await axios.delete(`${API_ENDPOINT}/${taskId}`, config);
            
// // //             setTaskList(prev => prev.filter(task => task && task.id && task.id.toString() !== taskId.toString()));
// // //             onTaskUpdate();
// // //             console.log('Task deleted successfully:', taskId);
// // //         } catch (error) {
// // //             console.error('Error deleting task:', error);
// // //             alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
// // //         }
// // //     };

// // //     const addStepToTask = (taskId, stepId, formData) => {
// // //         const estimatedHours = parseFloat(formData.estimatedHours);
// // //         console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
// // //         setTaskList(prev => prev.map(task => 
// // //             task && task.id && task.id.toString() === taskId.toString()
// // //                 ? {
// // //                     ...task,
// // //                     steps: [
// // //                         ...(task.steps || []),
// // //                         {
// // //                             id: stepId,
// // //                             name: formData.name,
// // //                             description: formData.description,
// // //                             startDate: formData.startDate,
// // //                             dueDate: formData.dueDate,
// // //                             status: formData.status,
// // //                             estimatedHours: estimatedHours,
// // //                             todayEffort: parseFloat(formData.todayEffort) || 0,
// // //                             completedHours: parseFloat(formData.completedHours) || 0,
// // //                             taskItemId: parseInt(taskId),
// // //                             priority: formData.priority
// // //                         }
// // //                     ]
// // //                 }
// // //                 : task
// // //         ).filter(task => task && task.id));
// // //         setExpandedTasks(prev => new Set(prev).add(taskId.toString()));
// // //         setShowSubtaskModal(null);
// // //         setEditingStepId(null);
// // //         setStepForm({
// // //             name: '',
// // //             description: '',
// // //             startDate: '',
// // //             dueDate: '',
// // //             date: '',
// // //             priority: 'Medium',
// // //             status: 'Not Started',
// // //             estimatedHours: '',
// // //             todayEffort: '',
// // //             completedHours: ''
// // //         });
// // //         onTaskUpdate();
// // //     };

// // //     const updateStep = (taskId, stepId, formData) => {
// // //         const estimatedHours = parseFloat(formData.estimatedHours);
// // //         console.log('Updating subtask:', { taskId, stepId, formData, estimatedHours });
// // //         setTaskList(prev => prev.map(task => 
// // //             task && task.id && task.id.toString() === taskId.toString()
// // //                 ? {
// // //                     ...task,
// // //                     steps: task.steps.map(step => 
// // //                         step.id.toString() === stepId.toString()
// // //                             ? {
// // //                                 ...step,
// // //                                 name: formData.name,
// // //                                 description: formData.description,
// // //                                 startDate: formData.startDate,
// // //                                 dueDate: formData.dueDate || formData.date,
// // //                                 priority: formData.priority,
// // //                                 status: formData.status,
// // //                                 estimatedHours: estimatedHours,
// // //                                 todayEffort: parseFloat(formData.todayEffort) || 0,
// // //                                 completedHours: parseFloat(formData.completedHours) || 0
// // //                             }
// // //                             : step
// // //                     )
// // //                 }
// // //                 : task
// // //         ).filter(task => task && task.id));
// // //         setShowSubtaskModal(null);
// // //         setEditingStepId(null);
// // //         setStepForm({
// // //             name: '',
// // //             description: '',
// // //             startDate: '',
// // //             dueDate: '',
// // //             date: '',
// // //             priority: 'Medium',
// // //             status: 'Not Started',
// // //             estimatedHours: '',
// // //             todayEffort: '',
// // //             completedHours: ''
// // //         });
// // //         onTaskUpdate();
// // //     };

// // //     const deleteStep = (taskId, stepId) => {
// // //         console.log('Deleting subtask:', { taskId, stepId });
// // //         setTaskList(prev => prev.map(task => 
// // //             task && task.id && task.id.toString() === taskId.toString()
// // //                 ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
// // //                 : task
// // //         ).filter(task => task && task.id));
// // //         onTaskUpdate();
// // //     };

// // //     const addDependency = async (taskId, stepId, formData) => {
// // //         try {
// // //             const config = await getAuthHeaders();
// // //             await axios.post('https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Dependency', {
// // //                 taskId: taskId,
// // //                 subTaskId: stepId,
// // //                 dependsOnTaskId: formData.dependsOnTaskId,
// // //                 assignedTo: formData.assignedTo,
// // //                 notes: formData.notes
// // //             }, config);
// // //             await toggleTaskExpand(taskId);
// // //             onTaskUpdate();
// // //         } catch (error) {
// // //             console.error('Error adding dependency:', error);
// // //             alert('Failed to add dependency: ' + (error.response?.data?.message || error.message));
// // //         }
// // //     };

// // //     const getPageWindow = () => {
// // //         const maxPagesToShow = 3;
// // //         const totalPages = paginationData?.totalPages || 1;
// // //         const currentPage = paginationData?.currentPage || 1;

// // //         let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
// // //         let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

// // //         if (endPage - startPage + 1 < maxPagesToShow) {
// // //             startPage = Math.max(1, endPage - maxPagesToShow + 1);
// // //         }

// // //         const pages = [];
// // //         for (let i = startPage; i <= endPage; i++) {
// // //             pages.push(i);
// // //         }
// // //         return pages;
// // //     };

// // //     const pageWindow = getPageWindow();

// // //     const handlePrevious = () => {
// // //         if (paginationData?.hasPreviousPage) {
// // //             const newPage = Math.max(1, paginationData.currentPage - 1);
// // //             onPageChange(newPage);
// // //         }
// // //     };

// // //     const handleNext = () => {
// // //         if (paginationData?.hasNextPage) {
// // //             const newPage = Math.min(paginationData.totalPages, paginationData.currentPage + 1);
// // //             onPageChange(newPage);
// // //         }
// // //     };

// // //     const getEmptyStateMessage = () => {
// // //         if (isNavigating) {
// // //             return "Navigating to previous page...";
// // //         }
// // //         if (paginationData && paginationData.totalPages === 0) {
// // //             return "No tasks to display";
// // //         }
// // //         if (taskList.length === 0) {
// // //             return "Loading tasks...";
// // //         }
// // //         return null;
// // //     };

// // //     const emptyMessage = getEmptyStateMessage();

// // //     return (
// // //         <>
// // //             {showAcceptedDependencies && (
// // //                 <AcceptedDependencies
// // //                     tasks={acceptedDependentTasks}
// // //                     onClose={() => setShowAcceptedDependencies(false)}
// // //                 />
// // //             )}
// // //             {showPendingDependencyMessage && (
// // //                 <PendingDependencyMessage
// // //                     onClose={() => setShowPendingDependencyMessage(false)}
// // //                 />
// // //             )}
// // //             {showDependencyRequestForm && (
// // //                 <DependencyRequestForm
// // //                     taskId={dependencyTaskId}
// // //                     stepId={dependencyStepId}
// // //                     taskList={taskList}
// // //                     onClose={() => setShowDependencyRequestForm(false)}
// // //                     onSave={addDependency}
// // //                 />
// // //             )}
// // //             <div className="border border-gray-200 rounded-md">
// // //                 <div className="grid grid-cols-8 py-2 px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
// // //                     <div>Task Name</div>
// // //                     <div>Start Date</div>
// // //                     <div>Due Date</div>
// // //                     <div>Priority</div>
// // //                     <div>Status</div>
// // //                     <div>Progress</div>
// // //                     <div>Effort</div>
// // //                     <div className="text-right pr-2">Actions</div>
// // //                 </div>
// // //                 {emptyMessage ? (
// // //                     <div className="p-4 text-sm text-gray-500 text-center">
// // //                         {emptyMessage}
// // //                     </div>
// // //                 ) : (
// // //                     taskList
// // //                         .filter(task => task && task.id)
// // //                         .map(task => (
// // //                             <TaskRow
// // //                                 key={task.id}
// // //                                 task={task}
// // //                                 isExpanded={expandedTasks.has(task.id.toString())}
// // //                                 toggleTaskExpand={toggleTaskExpand}
// // //                                 dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
// // //                                 dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
// // //                                 handleDependencyItemClick={handleDependencyItemClick}
// // //                                 openEditTaskModal={openEditTaskModal}
// // //                                 deleteTask={deleteTask}
// // //                                 setShowSubtaskModal={setShowSubtaskModal}
// // //                                 setEditingStepId={setEditingStepId}
// // //                                 setStepForm={setStepForm}
// // //                                 setShowDependencyRequestForm={setShowDependencyRequestForm}
// // //                                 setDependencyTaskId={setDependencyTaskId}
// // //                                 setDependencyStepId={setDependencyStepId}
// // //                                 onDeleteSubtask={deleteStep}
// // //                                 setTaskList={setTaskList}
// // //                             />
// // //                         ))
// // //                 )}
// // //             </div>
// // //             {paginationData && paginationData.totalPages > 1 && (
// // //                 <div className="mt-4 flex justify-center items-center gap-2">
// // //                     <button
// // //                         onClick={handlePrevious}
// // //                         disabled={!paginationData.hasPreviousPage}
// // //                         className={`px-3 py-1.5 rounded-md text-sm font-medium ${
// // //                             paginationData.hasPreviousPage
// // //                                 ? 'bg-purple-600 text-white hover:bg-purple-700'
// // //                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
// // //                         }`}
// // //                     >
// // //                         Previous
// // //                     </button>
// // //                     {pageWindow.map(page => (
// // //                         <button
// // //                             key={page}
// // //                             onClick={() => onPageChange(page)}
// // //                             className={`px-3 py-1.5 rounded-md text-sm font-medium ${
// // //                                 paginationData.currentPage === page
// // //                                     ? 'bg-purple-600 text-white'
// // //                                     : 'bg-white text-gray-700 hover:bg-gray-100'
// // //                             } border border-gray-200`}
// // //                         >
// // //                             {page}
// // //                         </button>
// // //                     ))}
// // //                     <button
// // //                         onClick={handleNext}
// // //                         disabled={!paginationData.hasNextPage}
// // //                         className={`px-3 py-1.5 rounded-md text-sm font-medium ${
// // //                             paginationData.hasNextPage
// // //                                 ? 'bg-purple-600 text-white hover:bg-purple-700'
// // //                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
// // //                         }`}
// // //                     >
// // //                         Next
// // //                     </button>
// // //                 </div>
// // //             )}
// // //             {showSubtaskModal && (
// // //                 <SubtaskModal
// // //                     taskId={showSubtaskModal}
// // //                     editingStepId={editingStepId}
// // //                     stepForm={stepForm}
// // //                     setStepForm={setStepForm}
// // //                     onClose={() => {
// // //                         setShowSubtaskModal(null);
// // //                         setEditingStepId(null);
// // //                         setStepForm({
// // //                             name: '',
// // //                             description: '',
// // //                             startDate: '',
// // //                             dueDate: '',
// // //                             date: '',
// // //                             priority: 'Medium',
// // //                             status: 'Not Started',
// // //                             estimatedHours: '',
// // //                             todayEffort: '',
// // //                             completedHours: ''
// // //                         });
// // //                     }}
// // //                     onSave={(taskId, stepId, formData) => {
// // //                         if (stepId) {
// // //                             updateStep(taskId, stepId, formData);
// // //                         } else {
// // //                             addStepToTask(taskId, stepId, formData);
// // //                         }
// // //                     }}
// // //                 />
// // //             )}
// // //         </>
// // //     );
// // // }

// // // export default TaskList;

// // // import React, { useState, useEffect } from 'react';
// // // import TaskRow from './TaskRow';
// // // import SubtaskModal from './SubTaskModal';
// // // import DependencyRequestForm from './DependencyRequestsForm';
// // // import AcceptedDependencies from './AcceptedDependencies';
// // // import PendingDependencyMessage from './PendingDependencyMessage';
// // // import apiClient from '../../services/apiClient';
// // // import { useAuth } from '../../context/AuthContext';
// // // import axios from 'axios';

// // // function TaskList({ taskList, setTaskList, openEditTaskModal, onTaskUpdate, paginationData, onPageChange }) {
// // //     const { acquireToken } = useAuth();
// // //     const [expandedTasks, setExpandedTasks] = useState(new Set());
// // //     const [showSubtaskModal, setShowSubtaskModal] = useState(null);
// // //     const [showDependencyRequestForm, setShowDependencyRequestForm] = useState(false);
// // //     const [dependencyTaskId, setDependencyTaskId] = useState(null);
// // //     const [dependencyStepId, setDependencyStepId] = useState(null);
// // //     const [editingStepId, setEditingStepId] = useState(null);
// // //     const [dependencyTasksMap, setDependencyTasksMap] = useState(new Map());
// // //     const [dependentTasksMap, setDependentTasksMap] = useState(new Map());
// // //     const [showAcceptedDependencies, setShowAcceptedDependencies] = useState(false);
// // //     const [acceptedDependentTasks, setAcceptedDependentTasks] = useState([]);
// // //     const [showPendingDependencyMessage, setShowPendingDependencyMessage] = useState(false);
// // //     const [isNavigating, setIsNavigating] = useState(false);
// // //     const [stepForm, setStepForm] = useState({
// // //         name: '',
// // //         description: '',
// // //         startDate: '',
// // //         dueDate: '',
// // //         date: '',
// // //         priority: 'Medium',
// // //         status: 'Not Started',
// // //         estimatedHours: '',
// // //         todayEffort: '',
// // //         completedHours: ''
// // //     });
// // //     const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';

// // //     useEffect(() => {
// // //         if (!isNavigating && 
// // //             taskList.length === 0 && 
// // //             paginationData && 
// // //             paginationData.totalPages > 0 && 
// // //             paginationData.currentPage > 1) {
            
// // //             console.log('No tasks on current page, navigating to previous page', {
// // //                 currentPage: paginationData.currentPage,
// // //                 totalPages: paginationData.totalPages,
// // //                 taskListLength: taskList.length
// // //             });
            
// // //             setIsNavigating(true);
// // //             const targetPage = Math.min(paginationData.currentPage - 1, paginationData.totalPages);
// // //             const finalPage = Math.max(1, targetPage);
            
// // //             setTimeout(() => {
// // //                 onPageChange(finalPage);
// // //                 setIsNavigating(false);
// // //             }, 100);
// // //         }
// // //     }, [taskList.length, paginationData, onPageChange, isNavigating]);

// // //     useEffect(() => {
// // //         console.log('TaskList received:', {
// // //             taskCount: taskList.length,
// // //             paginationData: {
// // //                 currentPage: paginationData?.currentPage,
// // //                 totalPages: paginationData?.totalPages,
// // //                 totalCount: paginationData?.totalCount,
// // //                 hasPreviousPage: paginationData?.hasPreviousPage,
// // //                 hasNextPage: paginationData?.hasNextPage
// // //             }
// // //         });
// // //     }, [taskList, paginationData]);

// // //     const getAuthHeaders = async () => {
// // //         try {
// // //             const token = await acquireToken('api');
// // //             if (!token) throw new Error('Token acquisition failed');
// // //             return {
// // //                 headers: {
// // //                     Authorization: `Bearer ${token}`,
// // //                     'Content-Type': 'application/json'
// // //                 }
// // //             };
// // //         } catch (error) {
// // //             console.error('Error acquiring token:', error);
// // //             throw error;
// // //         }
// // //     };

// // //     const addTask = async (formData) => {
// // //         try {
// // //             if (!formData.taskName || typeof formData.taskName !== 'string' || formData.taskName.trim() === '') {
// // //                 throw new Error('Task name is required');
// // //             }

// // //             const config = await getAuthHeaders();
// // //             const taskData = {
// // //                 TaskName: formData.taskName.trim(),
// // //                 Priority: formData.priority || 'Medium',
// // //                 Status: formData.status || 'Not Started',
// // //                 Description: formData.description || '',
// // //                 StartDate: formData.startDate || new Date().toISOString().split('T')[0],
// // //                 DueDate: formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// // //                 EstimatedHours: parseFloat(formData.estimatedHours) || 0,
// // //                 CompletedHours: parseFloat(formData.completedHours) || 0,
// // //                 DependencyTaskId: formData.dependencyTaskId || null,
// // //                 CreatedBy: formData.createdBy || null,
// // //                 WorkedHours: parseFloat(formData.todayEffort) || 0,
// // //                 HasSubtask: formData.hasSubtask || false
// // //             };
// // //             const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
// // //                 ? 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/DependencyTask'
// // //                 : 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
// // //             const response = await axios.post(endpoint, taskData, config);
            
// // //             console.log('Backend response:', response.data);

// // //             const responseTask = response.data.task || response.data || {};
// // //             const newTask = {
// // //                 id: responseTask.id || responseTask.Id || responseTask.taskId || responseTask.TaskId || `temp-${Math.random()}`,
// // //                 taskName: responseTask.TaskName || responseTask.taskName || responseTask.task_name || formData.taskName.trim(),
// // //                 priority: responseTask.Priority || responseTask.priority || formData.priority || 'Medium',
// // //                 status: responseTask.Status || responseTask.status || formData.status || 'Not Started',
// // //                 description: responseTask.Description || responseTask.description || formData.description || '',
// // //                 startDate: responseTask.StartDate || responseTask.startDate || responseTask.start_date || formData.startDate || new Date().toISOString().split('T')[0],
// // //                 dueDate: responseTask.DueDate || responseTask.dueDate || responseTask.due_date || formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// // //                 estimatedHours: parseFloat(responseTask.EstimatedHours || responseTask.estimatedHours || responseTask.estimated_hours || formData.estimatedHours || 0),
// // //                 completedHours: parseFloat(responseTask.CompletedHours || responseTask.completedHours || responseTask.completed_hours || formData.completedHours || 0),
// // //                 dependencyTaskId: responseTask.DependencyTaskId || responseTask.dependencyTaskId || responseTask.dependency_task_id || formData.dependencyTaskId || null,
// // //                 createdBy: responseTask.CreatedBy || responseTask.createdBy || responseTask.created_by || formData.createdBy || null,
// // //                 workedHours: parseFloat(responseTask.WorkedHours || responseTask.workedHours || responseTask.worked_hours || formData.todayEffort || 0),
// // //                 hasSubtask: responseTask.HasSubtask || responseTask.hasSubtask || responseTask.has_subtask || formData.hasSubtask || false,
// // //                 steps: responseTask.steps || responseTask.subTasks || responseTask.subtasks || [],
// // //                 subTasksCount: responseTask.subTasksCount || responseTask.subtasksCount || responseTask.subtasks_count || 0
// // //             };

// // //             if (!newTask.id || !newTask.taskName) {
// // //                 console.warn('Invalid task, but backend may have saved it:', newTask);
// // //                 throw new Error('Invalid task: missing id or taskName');
// // //             }

// // //             setTaskList(prev => [newTask, ...prev.filter(task => task && task.id)]);
// // //             onTaskUpdate(newTask);
// // //             console.log('Task added:', newTask);
// // //         } catch (error) {
// // //             console.error('Error adding task:', error);
// // //             alert('Failed to add task: ' + (error.response?.data?.message || error.message));
// // //             onTaskUpdate(null);
// // //         }
// // //     };

// // //     const toggleTaskExpand = async (taskId) => {
// // //         try {
// // //             const [dependencyResponse, dependentResponse] = await Promise.all([
// // //                 apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
// // //                 apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
// // //             ]);
// // //             console.log(dependencyResponse.data);
// // //             console.log(dependentResponse.data);

// // //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), dependencyResponse.data || []));
// // //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), dependentResponse.data || []));
// // //             setExpandedTasks(prev => {
// // //                 const newSet = new Set(prev);
// // //                 const taskIdStr = taskId.toString();
// // //                 newSet.has(taskIdStr) ? newSet.delete(taskIdStr) : newSet.add(taskIdStr);
// // //                 return newSet;
// // //             });
// // //         } catch (error) {
// // //             console.error('Error fetching task dependencies:', error);
// // //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// // //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// // //         }
// // //     };

// // //     const handleDependencyItemClick = async (dep) => {
// // //         try {
// // //             if (dep.status === "Accepted") {
// // //                 const response = await apiClient.get(`/Dependency/GetDependentAcceptedTasks/${dep.request.dependencyTaskId}`);
// // //                 setAcceptedDependentTasks(response.data || []);
// // //                 setShowAcceptedDependencies(true);
// // //                 setShowPendingDependencyMessage(false);
// // //             } else if (dep.status === "Pending") {
// // //                 setShowPendingDependencyMessage(true);
// // //                 setShowAcceptedDependencies(false);
// // //             } else {
// // //                 alert("Dependency Has Been Rejected");
// // //             }
// // //         } catch (error) {
// // //             console.error('Error fetching dependent accepted tasks:', error);
// // //             setShowPendingDependencyMessage(true);
// // //             setShowAcceptedDependencies(false);
// // //         }
// // //     };

// // //     const deleteTask = async (taskId) => {
// // //         try {
// // //             const config = await getAuthHeaders();
// // //             await axios.delete(`${API_ENDPOINT}/${taskId}`, config);
            
// // //             setTaskList(prev => prev.filter(task => task && task.id && task.id.toString() !== taskId.toString()));
// // //             onTaskUpdate();
// // //             console.log('Task deleted successfully:', taskId);
// // //         } catch (error) {
// // //             console.error('Error deleting task:', error);
// // //             alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
// // //         }
// // //     };

// // //     const addStepToTask = (taskId, stepId, formData) => {
// // //         const estimatedHours = parseFloat(formData.estimatedHours);
// // //         console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
// // //         setTaskList(prev => prev.map(task => 
// // //             task && task.id && task.id.toString() === taskId.toString()
// // //                 ? {
// // //                     ...task,
// // //                     steps: [
// // //                         ...(task.steps || []),
// // //                         {
// // //                             id: stepId,
// // //                             name: formData.name,
// // //                             description: formData.description,
// // //                             startDate: formData.startDate,
// // //                             dueDate: formData.dueDate,
// // //                             status: formData.status,
// // //                             estimatedHours: estimatedHours,
// // //                             todayEffort: parseFloat(formData.todayEffort) || 0,
// // //                             completedHours: parseFloat(formData.completedHours) || 0,
// // //                             taskItemId: parseInt(taskId),
// // //                             priority: formData.priority
// // //                         }
// // //                     ]
// // //                 }
// // //                 : task
// // //         ).filter(task => task && task.id));
// // //         setExpandedTasks(prev => new Set(prev).add(taskId.toString()));
// // //         setShowSubtaskModal(null);
// // //         setEditingStepId(null);
// // //         setStepForm({
// // //             name: '',
// // //             description: '',
// // //             startDate: '',
// // //             dueDate: '',
// // //             date: '',
// // //             priority: 'Medium',
// // //             status: 'Not Started',
// // //             estimatedHours: '',
// // //             todayEffort: '',
// // //             completedHours: ''
// // //         });
// // //         onTaskUpdate();
// // //     };

// // //     const updateStep = (taskId, stepId, formData) => {
// // //         const estimatedHours = parseFloat(formData.estimatedHours);
// // //         console.log('Updating subtask:', { taskId, stepId, formData, estimatedHours });
// // //         setTaskList(prev => prev.map(task => 
// // //             task && task.id && task.id.toString() === taskId.toString()
// // //                 ? {
// // //                     ...task,
// // //                     steps: task.steps.map(step => 
// // //                         step.id.toString() === stepId.toString()
// // //                             ? {
// // //                                 ...step,
// // //                                 name: formData.name,
// // //                                 description: formData.description,
// // //                                 startDate: formData.startDate,
// // //                                 dueDate: formData.dueDate || formData.date,
// // //                                 priority: formData.priority,
// // //                                 status: formData.status,
// // //                                 estimatedHours: estimatedHours,
// // //                                 todayEffort: parseFloat(formData.todayEffort) || 0,
// // //                                 completedHours: parseFloat(formData.completedHours) || 0
// // //                             }
// // //                             : step
// // //                     )
// // //                 }
// // //                 : task
// // //         ).filter(task => task && task.id));
// // //         setShowSubtaskModal(null);
// // //         setEditingStepId(null);
// // //         setStepForm({
// // //             name: '',
// // //             description: '',
// // //             startDate: '',
// // //             dueDate: '',
// // //             date: '',
// // //             priority: 'Medium',
// // //             status: 'Not Started',
// // //             estimatedHours: '',
// // //             todayEffort: '',
// // //             completedHours: ''
// // //         });
// // //         onTaskUpdate();
// // //     };

// // //     const deleteStep = (taskId, stepId) => {
// // //         console.log('Deleting subtask:', { taskId, stepId });
// // //         setTaskList(prev => prev.map(task => 
// // //             task && task.id && task.id.toString() === taskId.toString()
// // //                 ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
// // //                 : task
// // //         ).filter(task => task && task.id));
// // //         onTaskUpdate();
// // //     };

// // //     const addDependency = async (taskId, stepId, formData) => {
// // //         try {
// // //             const config = await getAuthHeaders();
// // //             await axios.post('https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Dependency', {
// // //                 taskId: taskId,
// // //                 subTaskId: stepId,
// // //                 dependsOnTaskId: formData.dependsOnTaskId,
// // //                 assignedTo: formData.assignedTo,
// // //                 notes: formData.notes
// // //             }, config);
// // //             await toggleTaskExpand(taskId);
// // //             onTaskUpdate();
// // //         } catch (error) {
// // //             console.error('Error adding dependency:', error);
// // //             alert('Failed to add dependency: ' + (error.response?.data?.message || error.message));
// // //         }
// // //     };

// // //     const getPageWindow = () => {
// // //         const maxPagesToShow = 3; // Show exactly 3 pages
// // //         const totalPages = paginationData?.totalPages && !isNaN(paginationData.totalPages) ? paginationData.totalPages : 1;
// // //         const currentPage = paginationData?.currentPage && !isNaN(paginationData.currentPage) ? paginationData.currentPage : 1;
// // //         const blockSize = maxPagesToShow;
// // //         const currentBlock = Math.ceil(currentPage / blockSize);
// // //         const startPage = (currentBlock - 1) * blockSize + 1;
// // //         const endPage = Math.min(totalPages, startPage + blockSize - 1);

// // //         const pages = [];
// // //         for (let i = startPage; i <= endPage; i++) {
// // //             pages.push(i);
// // //         }
// // //         console.log('Page window:', { currentPage, totalPages, pages });
// // //         return pages;
// // //     };

// // //     const handlePrevious = () => {
// // //         if (!paginationData || isNaN(paginationData.currentPage) || isNaN(paginationData.totalPages)) {
// // //             console.warn('Invalid pagination data, resetting to page 1:', paginationData);
// // //             onPageChange(1);
// // //             return;
// // //         }
// // //         if (paginationData.hasPreviousPage) {
// // //             const newPage = Math.max(1, paginationData.currentPage - 1);
// // //             console.log('Navigating to previous page:', newPage);
// // //             onPageChange(newPage);
// // //         }
// // //     };

// // //     const handleNext = () => {
// // //         if (!paginationData || isNaN(paginationData.currentPage) || isNaN(paginationData.totalPages)) {
// // //             console.warn('Invalid pagination data, resetting to page 1:', paginationData);
// // //             onPageChange(1);
// // //             return;
// // //         }
// // //         if (paginationData.hasNextPage) {
// // //             const newPage = Math.min(paginationData.totalPages, paginationData.currentPage + 1);
// // //             console.log('Navigating to next page:', { currentPage: paginationData.currentPage, newPage, totalPages: paginationData.totalPages });
// // //             onPageChange(newPage);
// // //         }
// // //     };

// // //     const getEmptyStateMessage = () => {
// // //         if (isNavigating) {
// // //             return "Navigating to previous page...";
// // //         }
// // //         if (!paginationData || isNaN(paginationData.totalPages)) {
// // //             return "Invalid pagination data. Please try refreshing.";
// // //         }
// // //         if (paginationData.totalPages === 0) {
// // //             return "No tasks to display";
// // //         }
// // //         if (taskList.length === 0) {
// // //             return "Loading tasks...";
// // //         }
// // //         return null;
// // //     };

// // //     const pageWindow = getPageWindow();
// // //     const emptyMessage = getEmptyStateMessage();

// // //     return (
// // //         <>
// // //             {showAcceptedDependencies && (
// // //                 <AcceptedDependencies
// // //                     tasks={acceptedDependentTasks}
// // //                     onClose={() => setShowAcceptedDependencies(false)}
// // //                 />
// // //             )}
// // //             {showPendingDependencyMessage && (
// // //                 <PendingDependencyMessage
// // //                     onClose={() => setShowPendingDependencyMessage(false)}
// // //                 />
// // //             )}
// // //             {showDependencyRequestForm && (
// // //                 <DependencyRequestForm
// // //                     taskId={dependencyTaskId}
// // //                     stepId={dependencyStepId}
// // //                     taskList={taskList}
// // //                     onClose={() => setShowDependencyRequestForm(false)}
// // //                     onSave={addDependency}
// // //                 />
// // //             )}
// // //             <div className="border border-gray-200 rounded-md">
// // //                 <div className="grid grid-cols-8 py-2 px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
// // //                     <div>Task Name</div>
// // //                     <div>Start Date</div>
// // //                     <div>Due Date</div>
// // //                     <div>Priority</div>
// // //                     <div>Status</div>
// // //                     <div>Progress</div>
// // //                     <div>Effort</div>
// // //                     <div className="text-right pr-2">Actions</div>
// // //                 </div>
// // //                 {emptyMessage ? (
// // //                     <div className="p-4 text-sm text-gray-500 text-center">
// // //                         {emptyMessage}
// // //                     </div>
// // //                 ) : (
// // //                     taskList
// // //                         .filter(task => task && task.id)
// // //                         .map(task => (
// // //                             <TaskRow
// // //                                 key={task.id}
// // //                                 task={task}
// // //                                 isExpanded={expandedTasks.has(task.id.toString())}
// // //                                 toggleTaskExpand={toggleTaskExpand}
// // //                                 dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
// // //                                 dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
// // //                                 handleDependencyItemClick={handleDependencyItemClick}
// // //                                 openEditTaskModal={openEditTaskModal}
// // //                                 deleteTask={deleteTask}
// // //                                 setShowSubtaskModal={setShowSubtaskModal}
// // //                                 setEditingStepId={setEditingStepId}
// // //                                 setStepForm={setStepForm}
// // //                                 setShowDependencyRequestForm={setShowDependencyRequestForm}
// // //                                 setDependencyTaskId={setDependencyTaskId}
// // //                                 setDependencyStepId={setDependencyStepId}
// // //                                 onDeleteSubtask={deleteStep}
// // //                                 setTaskList={setTaskList}
// // //                             />
// // //                         ))
// // //                 )}
// // //             </div>
// // //             {paginationData && !isNaN(paginationData.totalPages) && paginationData.totalPages > 1 && (
// // //                 <div className="mt-4 flex justify-center items-center gap-2">
// // //                     <button
// // //                         onClick={handlePrevious}
// // //                         disabled={!paginationData.hasPreviousPage}
// // //                         className={`px-3 py-1.5 rounded-md text-sm font-medium ${
// // //                             paginationData.hasPreviousPage
// // //                                 ? 'bg-purple-600 text-white hover:bg-purple-700'
// // //                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
// // //                         }`}
// // //                     >
// // //                         Previous
// // //                     </button>
// // //                     {pageWindow.map((page, index) => (
// // //                         <button
// // //                             key={index}
// // //                             onClick={() => {
// // //                                 if (typeof page === 'number') {
// // //                                     console.log('Navigating to page:', page);
// // //                                     onPageChange(page);
// // //                                 }
// // //                             }}
// // //                             disabled={page === '...'}
// // //                             className={`px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 ${
// // //                                 page === '...' 
// // //                                     ? 'bg-white text-gray-500 cursor-default'
// // //                                     : paginationData.currentPage === page
// // //                                         ? 'bg-purple-600 text-white font-bold text-base border-purple-700 shadow-md'
// // //                                         : 'bg-white text-gray-700 hover:bg-gray-100'
// // //                             }`}
// // //                         >
// // //                             {page}
// // //                         </button>
// // //                     ))}
// // //                     <button
// // //                         onClick={handleNext}
// // //                         disabled={!paginationData.hasNextPage}
// // //                         className={`px-3 py-1.5 rounded-md text-sm font-medium ${
// // //                             paginationData.hasNextPage
// // //                                 ? 'bg-purple-600 text-white hover:bg-purple-700'
// // //                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
// // //                         }`}
// // //                     >
// // //                         Next
// // //                     </button>
// // //                 </div>
// // //             )}
// // //             {showSubtaskModal && (
// // //                 <SubtaskModal
// // //                     taskId={showSubtaskModal}
// // //                     editingStepId={editingStepId}
// // //                     stepForm={stepForm}
// // //                     setStepForm={setStepForm}
// // //                     onClose={() => {
// // //                         setShowSubtaskModal(null);
// // //                         setEditingStepId(null);
// // //                         setStepForm({
// // //                             name: '',
// // //                             description: '',
// // //                             startDate: '',
// // //                             dueDate: '',
// // //                             date: '',
// // //                             priority: 'Medium',
// // //                             status: 'Not Started',
// // //                             estimatedHours: '',
// // //                             todayEffort: '',
// // //                             completedHours: ''
// // //                         });
// // //                     }}
// // //                     onSave={(taskId, stepId, formData) => {
// // //                         if (stepId) {
// // //                             updateStep(taskId, stepId, formData);
// // //                         } else {
// // //                             addStepToTask(taskId, stepId, formData);
// // //                         }
// // //                     }}
// // //                 />
// // //             )}
// // //         </>
// // //     );
// // // }

// // // export default TaskList;


// // import React, { useState, useEffect } from 'react';
// // import TaskRow from './TaskRow';
// // import SubtaskModal from './SubTaskModal';
// // import DependencyRequestForm from './DependencyRequestsForm';
// // import AcceptedDependencies from './AcceptedDependencies';
// // import PendingDependencyMessage from './PendingDependencyMessage';
// // import apiClient from '../../services/apiClient';
// // import { useAuth } from '../../context/AuthContext';
// // import axios from 'axios';

// // function TaskList({ taskList, setTaskList, openEditTaskModal, onTaskUpdate, paginationData, onPageChange }) {
// //     const { acquireToken } = useAuth();
// //     const [expandedTasks, setExpandedTasks] = useState(new Set());
// //     const [showSubtaskModal, setShowSubtaskModal] = useState(null);
// //     const [showDependencyRequestForm, setShowDependencyRequestForm] = useState(false);
// //     const [dependencyTaskId, setDependencyTaskId] = useState(null);
// //     const [dependencyStepId, setDependencyStepId] = useState(null);
// //     const [editingStepId, setEditingStepId] = useState(null);
// //     const [dependencyTasksMap, setDependencyTasksMap] = useState(new Map());
// //     const [dependentTasksMap, setDependentTasksMap] = useState(new Map());
// //     const [showAcceptedDependencies, setShowAcceptedDependencies] = useState(false);
// //     const [acceptedDependentTasks, setAcceptedDependentTasks] = useState([]);
// //     const [showPendingDependencyMessage, setShowPendingDependencyMessage] = useState(false);
// //     const [isNavigating, setIsNavigating] = useState(false); // Reintroduced isNavigating state
// //     const [stepForm, setStepForm] = useState({
// //         name: '',
// //         description: '',
// //         startDate: '',
// //         dueDate: '',
// //         date: '',
// //         priority: 'Medium',
// //         status: 'Not Started',
// //         estimatedHours: '',
// //         todayEffort: '',
// //         completedHours: ''
// //     });
// //     const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';

// //     // Handle navigation to previous page when task list is empty
// //     useEffect(() => {
// //         if (!isNavigating && 
// //             taskList.length === 0 && 
// //             paginationData && 
// //             paginationData.totalPages > 0 && 
// //             paginationData.currentPage > 1) {
            
// //             console.log('No tasks on current page, navigating to previous page', {
// //                 currentPage: paginationData.currentPage,
// //                 totalPages: paginationData.totalPages,
// //                 taskListLength: taskList.length
// //             });
            
// //             setIsNavigating(true);
// //             const targetPage = Math.min(paginationData.currentPage - 1, paginationData.totalPages);
// //             const finalPage = Math.max(1, targetPage);
            
// //             setTimeout(() => {
// //                 onPageChange(finalPage);
// //                 setIsNavigating(false);
// //             }, 100);
// //         }
// //     }, [taskList.length, paginationData, onPageChange, isNavigating]);

// //     // Log task count and pagination data for debugging
// //     useEffect(() => {
// //         console.log('TaskList received:', {
// //             taskCount: taskList.length,
// //             paginationData: {
// //                 currentPage: paginationData?.currentPage,
// //                 totalPages: paginationData?.totalPages,
// //                 totalCount: paginationData?.totalCount,
// //                 hasPreviousPage: paginationData?.hasPreviousPage,
// //                 hasNextPage: paginationData?.hasNextPage
// //             }
// //         });
// //     }, [taskList, paginationData]);

// //     const getAuthHeaders = async () => {
// //         try {
// //             const token = await acquireToken('api');
// //             if (!token) throw new Error('Token acquisition failed');
// //             return {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`,
// //                     'Content-Type': 'application/json'
// //                 }
// //             };
// //         } catch (error) {
// //             console.error('Error acquiring token:', error);
// //             throw error;
// //         }
// //     };

// //     const addTask = async (formData) => {
// //         try {
// //             if (!formData.taskName || typeof formData.taskName !== 'string' || formData.taskName.trim() === '') {
// //                 throw new Error('Task name is required');
// //             }

// //             const config = await getAuthHeaders();
// //             const taskData = {
// //                 TaskName: formData.taskName.trim(),
// //                 Priority: formData.priority || 'Medium',
// //                 Status: formData.status || 'Not Started',
// //                 Description: formData.description || '',
// //                 StartDate: formData.startDate || new Date().toISOString().split('T')[0],
// //                 DueDate: formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// //                 EstimatedHours: parseFloat(formData.estimatedHours) || 0,
// //                 CompletedHours: parseFloat(formData.completedHours) || 0,
// //                 DependencyTaskId: formData.dependencyTaskId || null,
// //                 CreatedBy: formData.createdBy || null,
// //                 WorkedHours: parseFloat(formData.todayEffort) || 0,
// //                 HasSubtask: formData.hasSubtask || false
// //             };
// //             const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
// //                 ? 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/DependencyTask'
// //                 : 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
// //             const response = await axios.post(endpoint, taskData, config);
            
// //             console.log('Backend response:', response.data);

// //             const responseTask = response.data.task || response.data || {};
// //             const newTask = {
// //                 id: responseTask.id || responseTask.Id || responseTask.taskId || responseTask.TaskId || `temp-${Math.random()}`,
// //                 taskName: responseTask.TaskName || responseTask.taskName || responseTask.task_name || formData.taskName.trim(),
// //                 priority: responseTask.Priority || responseTask.priority || formData.priority || 'Medium',
// //                 status: responseTask.Status || responseTask.status || formData.status || 'Not Started',
// //                 description: responseTask.Description || responseTask.description || formData.description || '',
// //                 startDate: responseTask.StartDate || responseTask.startDate || responseTask.start_date || formData.startDate || new Date().toISOString().split('T')[0],
// //                 dueDate: responseTask.DueDate || responseTask.dueDate || responseTask.due_date || formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// //                 estimatedHours: parseFloat(responseTask.EstimatedHours || responseTask.estimatedHours || responseTask.estimated_hours || formData.estimatedHours || 0),
// //                 completedHours: parseFloat(responseTask.CompletedHours || responseTask.completedHours || responseTask.completed_hours || formData.completedHours || 0),
// //                 dependencyTaskId: responseTask.DependencyTaskId || responseTask.dependencyTaskId || responseTask.dependency_task_id || formData.dependencyTaskId || null,
// //                 createdBy: responseTask.CreatedBy || responseTask.createdBy || responseTask.created_by || formData.createdBy || null,
// //                 workedHours: parseFloat(responseTask.WorkedHours || responseTask.workedHours || responseTask.worked_hours || formData.todayEffort || 0),
// //                 hasSubtask: responseTask.HasSubtask || responseTask.hasSubtask || responseTask.has_subtask || formData.hasSubtask || false,
// //                 steps: responseTask.steps || responseTask.subTasks || responseTask.subtasks || [],
// //                 subTasksCount: responseTask.subTasksCount || responseTask.subtasksCount || responseTask.subtasks_count || 0
// //             };

// //             if (!newTask.id || !newTask.taskName) {
// //                 console.warn('Invalid task, but backend may have saved it:', newTask);
// //                 throw new Error('Invalid task: missing id or taskName');
// //             }

// //             setTaskList(prev => [newTask, ...prev.filter(task => task && task.id)]);
// //             onTaskUpdate(newTask);
// //             console.log('Task added:', newTask);
// //         } catch (error) {
// //             console.error('Error adding task:', error);
// //             alert('Failed to add task: ' + (error.response?.data?.message || error.message));
// //             onTaskUpdate(null);
// //         }
// //     };

// //     const toggleTaskExpand = async (taskId) => {
// //         try {
// //             const [dependencyResponse, dependentResponse] = await Promise.all([
// //                 apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
// //                 apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
// //             ]);
// //             console.log(dependencyResponse.data);
// //             console.log(dependentResponse.data);

// //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), dependencyResponse.data || []));
// //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), dependentResponse.data || []));
// //             setExpandedTasks(prev => {
// //                 const newSet = new Set(prev);
// //                 const taskIdStr = taskId.toString();
// //                 newSet.has(taskIdStr) ? newSet.delete(taskIdStr) : newSet.add(taskIdStr);
// //                 return newSet;
// //             });
// //         } catch (error) {
// //             console.error('Error fetching task dependencies:', error);
// //             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// //             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), []));
// //         }
// //     };

// //     const handleDependencyItemClick = async (dep) => {
// //         try {
// //             if (dep.status === "Accepted") {
// //                 const response = await apiClient.get(`/Dependency/GetDependentAcceptedTasks/${dep.request.dependencyTaskId}`);
// //                 setAcceptedDependentTasks(response.data || []);
// //                 setShowAcceptedDependencies(true);
// //                 setShowPendingDependencyMessage(false);
// //             } else if (dep.status === "Pending") {
// //                 setShowPendingDependencyMessage(true);
// //                 setShowAcceptedDependencies(false);
// //             } else {
// //                 alert("Dependency Has Been Rejected");
// //             }
// //         } catch (error) {
// //             console.error('Error fetching dependent accepted tasks:', error);
// //             setShowPendingDependencyMessage(true);
// //             setShowAcceptedDependencies(false);
// //         }
// //     };

// //     const deleteTask = async (taskId) => {
// //         try {
// //             const config = await getAuthHeaders();
// //             await axios.delete(`${API_ENDPOINT}/${taskId}`, config);
            
// //             setTaskList(prev => prev.filter(task => task && task.id && task.id.toString() !== taskId.toString()));
// //             onTaskUpdate();
// //             console.log('Task deleted successfully:', taskId);
// //         } catch (error) {
// //             console.error('Error deleting task:', error);
// //             alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
// //         }
// //     };

// //     const addStepToTask = (taskId, stepId, formData) => {
// //         const estimatedHours = parseFloat(formData.estimatedHours);
// //         console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
// //         setTaskList(prev => prev.map(task => 
// //             task && task.id && task.id.toString() === taskId.toString()
// //                 ? {
// //                     ...task,
// //                     steps: [
// //                         ...(task.steps || []),
// //                         {
// //                             id: stepId,
// //                             name: formData.name,
// //                             description: formData.description,
// //                             startDate: formData.startDate,
// //                             dueDate: formData.dueDate,
// //                             status: formData.status,
// //                             estimatedHours: estimatedHours,
// //                             todayEffort: parseFloat(formData.todayEffort) || 0,
// //                             completedHours: parseFloat(formData.completedHours) || 0,
// //                             taskItemId: parseInt(taskId),
// //                             priority: formData.priority
// //                         }
// //                     ]
// //                 }
// //                 : task
// //         ).filter(task => task && task.id));
// //         setExpandedTasks(prev => new Set(prev).add(taskId.toString()));
// //         setShowSubtaskModal(null);
// //         setEditingStepId(null);
// //         setStepForm({
// //             name: '',
// //             description: '',
// //             startDate: '',
// //             dueDate: '',
// //             date: '',
// //             priority: 'Medium',
// //             status: 'Not Started',
// //             estimatedHours: '',
// //             todayEffort: '',
// //             completedHours: ''
// //         });
// //         onTaskUpdate();
// //     };

// //     const updateStep = (taskId, stepId, formData) => {
// //         const estimatedHours = parseFloat(formData.estimatedHours);
// //         console.log('Updating subtask:', { taskId, stepId, formData, estimatedHours });
// //         setTaskList(prev => prev.map(task => 
// //             task && task.id && task.id.toString() === taskId.toString()
// //                 ? {
// //                     ...task,
// //                     steps: task.steps.map(step => 
// //                         step.id.toString() === stepId.toString()
// //                             ? {
// //                                 ...step,
// //                                 name: formData.name,
// //                                 description: formData.description,
// //                                 startDate: formData.startDate,
// //                                 dueDate: formData.dueDate || formData.date,
// //                                 priority: formData.priority,
// //                                 status: formData.status,
// //                                 estimatedHours: estimatedHours,
// //                                 todayEffort: parseFloat(formData.todayEffort) || 0,
// //                                 completedHours: parseFloat(formData.completedHours) || 0
// //                             }
// //                             : step
// //                     )
// //                 }
// //                 : task
// //         ).filter(task => task && task.id));
// //         setShowSubtaskModal(null);
// //         setEditingStepId(null);
// //         setStepForm({
// //             name: '',
// //             description: '',
// //             startDate: '',
// //             dueDate: '',
// //             date: '',
// //             priority: 'Medium',
// //             status: 'Not Started',
// //             estimatedHours: '',
// //             todayEffort: '',
// //             completedHours: ''
// //         });
// //         onTaskUpdate();
// //     };

// //     const deleteStep = (taskId, stepId) => {
// //         console.log('Deleting subtask:', { taskId, stepId });
// //         setTaskList(prev => prev.map(task => 
// //             task && task.id && task.id.toString() === taskId.toString()
// //                 ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
// //                 : task
// //         ).filter(task => task && task.id));
// //         onTaskUpdate();
// //     };

// //     const addDependency = async (taskId, stepId, formData) => {
// //         try {
// //             const config = await getAuthHeaders();
// //             await axios.post('https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Dependency', {
// //                 taskId: taskId,
// //                 subTaskId: stepId,
// //                 dependsOnTaskId: formData.dependsOnTaskId,
// //                 assignedTo: formData.assignedTo,
// //                 notes: formData.notes
// //             }, config);
// //             await toggleTaskExpand(taskId);
// //             onTaskUpdate();
// //         } catch (error) {
// //             console.error('Error adding dependency:', error);
// //             alert('Failed to add dependency: ' + (error.response?.data?.message || error.message));
// //         }
// //     };

// //     const getPageWindow = () => {
// //         const maxPagesToShow = 3; // Show exactly 3 pages
// //         const totalPages = paginationData?.totalPages && !isNaN(paginationData.totalPages) ? paginationData.totalPages : 1;
// //         const currentPage = paginationData?.currentPage && !isNaN(paginationData.currentPage) ? paginationData.currentPage : 1;

// //         // Adjust startPage to ensure we show pages beyond page 3
// //         let startPage = Math.floor((currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1;
// //         const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

// //         // Ensure we always show maxPagesToShow pages if possible
// //         if (endPage - startPage + 1 < maxPagesToShow && totalPages >= maxPagesToShow) {
// //             startPage = Math.max(1, endPage - maxPagesToShow + 1);
// //         }

// //         const pages = [];
// //         for (let i = startPage; i <= endPage; i++) {
// //             pages.push(i);
// //         }
// //         console.log('Page window:', { currentPage, totalPages, startPage, endPage, pages });
// //         return pages;
// //     };

// //     const handlePrevious = () => {
// //         if (!paginationData || isNaN(paginationData.currentPage) || isNaN(paginationData.totalPages)) {
// //             console.warn('Invalid pagination data, resetting to page 1:', paginationData);
// //             onPageChange(1);
// //             return;
// //         }
// //         if (paginationData.hasPreviousPage) {
// //             const newPage = Math.max(1, paginationData.currentPage - 1);
// //             console.log('Navigating to previous page:', newPage);
// //             onPageChange(newPage);
// //         }
// //     };

// //     const handleNext = () => {
// //         if (!paginationData || isNaN(paginationData.currentPage) || isNaN(paginationData.totalPages)) {
// //             console.warn('Invalid pagination data, resetting to page 1:', paginationData);
// //             onPageChange(1);
// //             return;
// //         }
// //         if (paginationData.hasNextPage) {
// //             const newPage = Math.min(paginationData.totalPages, paginationData.currentPage + 1);
// //             console.log('Navigating to next page:', { currentPage: paginationData.currentPage, newPage, totalPages: paginationData.totalPages });
// //             onPageChange(newPage);
// //         }
// //     };

// //     const getEmptyStateMessage = () => {
// //         if (isNavigating) {
// //             return "Navigating to previous page...";
// //         }
// //         if (!paginationData || isNaN(paginationData.totalPages)) {
// //             return "Invalid pagination data. Please try refreshing.";
// //         }
// //         if (paginationData.totalPages === 0) {
// //             return "No tasks to display";
// //         }
// //         if (taskList.length === 0) {
// //             return "Loading tasks...";
// //         }
// //         return null;
// //     };

// //     const pageWindow = getPageWindow();
// //     const emptyMessage = getEmptyStateMessage();

// //     return (
// //         <>
// //             {showAcceptedDependencies && (
// //                 <AcceptedDependencies
// //                     tasks={acceptedDependentTasks}
// //                     onClose={() => setShowAcceptedDependencies(false)}
// //                 />
// //             )}
// //             {showPendingDependencyMessage && (
// //                 <PendingDependencyMessage
// //                     onClose={() => setShowPendingDependencyMessage(false)}
// //                 />
// //             )}
// //             {showDependencyRequestForm && (
// //                 <DependencyRequestForm
// //                     taskId={dependencyTaskId}
// //                     stepId={dependencyStepId}
// //                     taskList={taskList}
// //                     onClose={() => setShowDependencyRequestForm(false)}
// //                     onSave={addDependency}
// //                 />
// //             )}
// //             <div className="border border-gray-200 rounded-md">
// //                 <div className="grid grid-cols-8 py-2 px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
// //                     <div>Task Name</div>
// //                     <div>Start Date</div>
// //                     <div>Due Date</div>
// //                     <div>Priority</div>
// //                     <div>Status</div>
// //                     <div>Progress</div>
// //                     <div>Effort</div>
// //                     <div className="text-right pr-2">Actions</div>
// //                 </div>
// //                 {emptyMessage ? (
// //                     <div className="p-4 text-sm text-gray-500 text-center">
// //                         {emptyMessage}
// //                     </div>
// //                 ) : (
// //                     taskList
// //                         .filter(task => task && task.id)
// //                         .map(task => (
// //                             <TaskRow
// //                                 key={task.id}
// //                                 task={task}
// //                                 isExpanded={expandedTasks.has(task.id.toString())}
// //                                 toggleTaskExpand={toggleTaskExpand}
// //                                 dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
// //                                 dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
// //                                 handleDependencyItemClick={handleDependencyItemClick}
// //                                 openEditTaskModal={openEditTaskModal}
// //                                 deleteTask={deleteTask}
// //                                 setShowSubtaskModal={setShowSubtaskModal}
// //                                 setEditingStepId={setEditingStepId}
// //                                 setStepForm={setStepForm}
// //                                 setShowDependencyRequestForm={setShowDependencyRequestForm}
// //                                 setDependencyTaskId={setDependencyTaskId}
// //                                 setDependencyStepId={setDependencyStepId}
// //                                 onDeleteSubtask={deleteStep}
// //                                 setTaskList={setTaskList}
// //                             />
// //                         ))
// //                 )}
// //             </div>
// //             {paginationData && !isNaN(paginationData.totalPages) && paginationData.totalPages > 1 && (
// //                 <div className="mt-4 flex justify-center items-center gap-2">
// //                     <button
// //                         onClick={handlePrevious}
// //                         disabled={!paginationData.hasPreviousPage}
// //                         className={`px-3 py-1.5 rounded-md text-sm font-medium ${
// //                             paginationData.hasPreviousPage
// //                                 ? 'bg-purple-600 text-white hover:bg-purple-700'
// //                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
// //                         }`}
// //                     >
// //                         Previous
// //                     </button>
// //                     {pageWindow.map((page, index) => (
// //                         <button
// //                             key={index}
// //                             onClick={() => {
// //                                 if (typeof page === 'number') {
// //                                     console.log('Navigating to page:', page);
// //                                     onPageChange(page);
// //                                 }
// //                             }}
// //                             disabled={page === '...'}
// //                             className={`px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 ${
// //                                 page === '...' 
// //                                     ? 'bg-white text-gray-500 cursor-default'
// //                                     : paginationData.currentPage === page
// //                                         ? 'bg-purple-600 text-white font-bold text-base border-purple-700 shadow-md'
// //                                         : 'bg-white text-gray-700 hover:bg-gray-100'
// //                             }`}
// //                         >
// //                             {page}
// //                         </button>
// //                     ))}
// //                     <button
// //                         onClick={handleNext}
// //                         disabled={!paginationData.hasNextPage}
// //                         className={`px-3 py-1.5 rounded-md text-sm font-medium ${
// //                             paginationData.hasNextPage
// //                                 ? 'bg-purple-600 text-white hover:bg-purple-700'
// //                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
// //                         }`}
// //                     >
// //                         Next
// //                     </button>
// //                 </div>
// //             )}
// //             {showSubtaskModal && (
// //                 <SubtaskModal
// //                     taskId={showSubtaskModal}
// //                     editingStepId={editingStepId}
// //                     stepForm={stepForm}
// //                     setStepForm={setStepForm}
// //                     onClose={() => {
// //                         setShowSubtaskModal(null);
// //                         setEditingStepId(null);
// //                         setStepForm({
// //                             name: '',
// //                             description: '',
// //                             startDate: '',
// //                             dueDate: '',
// //                             date: '',
// //                             priority: 'Medium',
// //                             status: 'Not Started',
// //                             estimatedHours: '',
// //                             todayEffort: '',
// //                             completedHours: ''
// //                         });
// //                     }}
// //                     onSave={(taskId, stepId, formData) => {
// //                         if (stepId) {
// //                             updateStep(taskId, stepId, formData);
// //                         } else {
// //                             addStepToTask(taskId, stepId, formData);
// //                         }
// //                     }}
// //                 />
// //             )}
// //         </>
// //     );
// // }

// // export default TaskList;
// import React, { useState, useEffect } from 'react';
// import TaskRow from './TaskRow';
// import SubtaskModal from './SubTaskModal';
// import DependencyRequestForm from './DependencyRequestsForm';
// import AcceptedDependencies from './AcceptedDependencies';
// import PendingDependencyMessage from './PendingDependencyMessage';
// import apiClient from '../../services/apiClient';
// import { useAuth } from '../../context/AuthContext';
// import axios from 'axios';

// function TaskList({ taskList, setTaskList, openEditTaskModal, onTaskUpdate, paginationData, onPageChange }) {
//     const { acquireToken } = useAuth();
//     const [expandedTasks, setExpandedTasks] = useState(new Set());
//     const [showSubtaskModal, setShowSubtaskModal] = useState(null);
//     const [showDependencyRequestForm, setShowDependencyRequestForm] = useState(false);
//     const [dependencyTaskId, setDependencyTaskId] = useState(null);
//     const [dependencyStepId, setDependencyStepId] = useState(null);
//     const [editingStepId, setEditingStepId] = useState(null);
//     const [dependencyTasksMap, setDependencyTasksMap] = useState(new Map());
//     const [dependentTasksMap, setDependentTasksMap] = useState(new Map());
//     const [showAcceptedDependencies, setShowAcceptedDependencies] = useState(false);
//     const [acceptedDependentTasks, setAcceptedDependentTasks] = useState([]);
//     const [showPendingDependencyMessage, setShowPendingDependencyMessage] = useState(false);
//     const [isNavigating, setIsNavigating] = useState(false);
//     const [stepForm, setStepForm] = useState({
//         name: '',
//         description: '',
//         startDate: '',
//         dueDate: '',
//         date: '',
//         priority: 'Medium',
//         status: 'Not Started',
//         estimatedHours: '',
//         todayEffort: '',
//         completedHours: ''
//     });
//     const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';

//     // Handle navigation to previous page when task list is empty
//     useEffect(() => {
//         if (!isNavigating && 
//             taskList.length === 0 && 
//             paginationData && 
//             paginationData.totalPages > 0 && 
//             paginationData.currentPage > 1) {
            
//             console.log('No tasks on current page, navigating to previous page', {
//                 currentPage: paginationData.currentPage,
//                 totalPages: paginationData.totalPages,
//                 taskListLength: taskList.length
//             });
            
//             setIsNavigating(true);
//             const targetPage = Math.min(paginationData.currentPage - 1, paginationData.totalPages);
//             const finalPage = Math.max(1, targetPage);
            
//             setTimeout(() => {
//                 onPageChange(finalPage);
//                 setIsNavigating(false);
//             }, 100);
//         }
//     }, [taskList.length, paginationData, onPageChange, isNavigating]);

//     // Enhanced logging for debugging pagination state
//     useEffect(() => {
//         console.log('TaskList pagination update:', {
//             taskCount: taskList.length,
//             currentPage: paginationData?.currentPage,
//             totalPages: paginationData?.totalPages,
//             totalCount: paginationData?.totalCount,
//             hasPreviousPage: paginationData?.hasPreviousPage,
//             hasNextPage: paginationData?.hasNextPage,
//             pageWindow: getPageWindow()
//         });
//     }, [taskList, paginationData]);

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

//     const addTask = async (formData) => {
//         try {
//             if (!formData.taskName || typeof formData.taskName !== 'string' || formData.taskName.trim() === '') {
//                 throw new Error('Task name is required');
//             }

//             const config = await getAuthHeaders();
//             const taskData = {
//                 TaskName: formData.taskName.trim(),
//                 Priority: formData.priority || 'Medium',
//                 Status: formData.status || 'Not Started',
//                 Description: formData.description || '',
//                 StartDate: formData.startDate || new Date().toISOString().split('T')[0],
//                 DueDate: formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//                 EstimatedHours: parseFloat(formData.estimatedHours) || 0,
//                 CompletedHours: parseFloat(formData.completedHours) || 0,
//                 DependencyTaskId: formData.dependencyTaskId || null,
//                 CreatedBy: formData.createdBy || null,
//                 WorkedHours: parseFloat(formData.todayEffort) || 0,
//                 HasSubtask: formData.hasSubtask || false
//             };
//             const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
//                 ? 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/DependencyTask'
//                 : 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
//             const response = await axios.post(endpoint, taskData, config);
            
//             console.log('Backend response:', response.data);

//             const responseTask = response.data.task || response.data || {};
//             const newTask = {
//                 id: responseTask.id || responseTask.Id || responseTask.taskId || responseTask.TaskId || `temp-${Math.random()}`,
//                 taskName: responseTask.TaskName || responseTask.taskName || responseTask.task_name || formData.taskName.trim(),
//                 priority: responseTask.Priority || responseTask.priority || formData.priority || 'Medium',
//                 status: responseTask.Status || responseTask.status || formData.status || 'Not Started',
//                 description: responseTask.Description || responseTask.description || formData.description || '',
//                 startDate: responseTask.StartDate || responseTask.startDate || responseTask.start_date || formData.startDate || new Date().toISOString().split('T')[0],
//                 dueDate: responseTask.DueDate || responseTask.dueDate || responseTask.due_date || formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//                 estimatedHours: parseFloat(responseTask.EstimatedHours || responseTask.estimatedHours || responseTask.estimated_hours || formData.estimatedHours || 0),
//                 completedHours: parseFloat(responseTask.CompletedHours || responseTask.completedHours || responseTask.completed_hours || formData.completedHours || 0),
//                 dependencyTaskId: responseTask.DependencyTaskId || responseTask.dependencyTaskId || responseTask.dependency_task_id || formData.dependencyTaskId || null,
//                 createdBy: responseTask.CreatedBy || responseTask.createdBy || responseTask.created_by || formData.createdBy || null,
//                 workedHours: parseFloat(responseTask.WorkedHours || responseTask.workedHours || responseTask.worked_hours || formData.todayEffort || 0),
//                 hasSubtask: responseTask.HasSubtask || responseTask.hasSubtask || responseTask.has_subtask || formData.hasSubtask || false,
//                 steps: responseTask.steps || responseTask.subTasks || responseTask.subtasks || [],
//                 subTasksCount: responseTask.subTasksCount || responseTask.subtasksCount || responseTask.subtasks_count || 0
//             };

//             if (!newTask.id || !newTask.taskName) {
//                 console.warn('Invalid task, but backend may have saved it:', newTask);
//                 throw new Error('Invalid task: missing id or taskName');
//             }

//             setTaskList(prev => [newTask, ...prev.filter(task => task && task.id)]);
//             onTaskUpdate(newTask);
//             console.log('Task added:', newTask);
//         } catch (error) {
//             console.error('Error adding task:', error);
//             alert('Failed to add task: ' + (error.response?.data?.message || error.message));
//             onTaskUpdate(null);
//         }
//     };

//     const toggleTaskExpand = async (taskId) => {
//         try {
//             const [dependencyResponse, dependentResponse] = await Promise.all([
//                 apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
//                 apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
//             ]);
//             console.log(dependencyResponse.data);
//             console.log(dependentResponse.data);

//             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), dependencyResponse.data || []));
//             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), dependentResponse.data || []));
//             setExpandedTasks(prev => {
//                 const newSet = new Set(prev);
//                 const taskIdStr = taskId.toString();
//                 newSet.has(taskIdStr) ? newSet.delete(taskIdStr) : newSet.add(taskIdStr);
//                 return newSet;
//             });
//         } catch (error) {
//             console.error('Error fetching task dependencies:', error);
//             setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), []));
//             setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), []));
//         }
//     };

//     const handleDependencyItemClick = async (dep) => {
//         try {
//             if (dep.status === "Accepted") {
//                 const response = await apiClient.get(`/Dependency/GetDependentAcceptedTasks/${dep.request.dependencyTaskId}`);
//                 setAcceptedDependentTasks(response.data || []);
//                 setShowAcceptedDependencies(true);
//                 setShowPendingDependencyMessage(false);
//             } else if (dep.status === "Pending") {
//                 setShowPendingDependencyMessage(true);
//                 setShowAcceptedDependencies(false);
//             } else {
//                 alert("Dependency Has Been Rejected");
//             }
//         } catch (error) {
//             console.error('Error fetching dependent accepted tasks:', error);
//             setShowPendingDependencyMessage(true);
//             setShowAcceptedDependencies(false);
//         }
//     };

//     const deleteTask = async (taskId) => {
//         try {
//             const config = await getAuthHeaders();
//             await axios.delete(`${API_ENDPOINT}/${taskId}`, config);
            
//             setTaskList(prev => prev.filter(task => task && task.id && task.id.toString() !== taskId.toString()));
//             onTaskUpdate();
//             console.log('Task deleted successfully:', taskId);
//         } catch (error) {
//             console.error('Error deleting task:', error);
//             alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     const addStepToTask = (taskId, stepId, formData) => {
//         const estimatedHours = parseFloat(formData.estimatedHours);
//         console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
//         setTaskList(prev => prev.map(task => 
//             task && task.id && task.id.toString() === taskId.toString()
//                 ? {
//                     ...task,
//                     steps: [
//                         ...(task.steps || []),
//                         {
//                             id: stepId,
//                             name: formData.name,
//                             description: formData.description,
//                             startDate: formData.startDate,
//                             dueDate: formData.dueDate,
//                             status: formData.status,
//                             estimatedHours: estimatedHours,
//                             todayEffort: parseFloat(formData.todayEffort) || 0,
//                             completedHours: parseFloat(formData.completedHours) || 0,
//                             taskItemId: parseInt(taskId),
//                             priority: formData.priority
//                         }
//                     ]
//                 }
//                 : task
//         ).filter(task => task && task.id));
//         setExpandedTasks(prev => new Set(prev).add(taskId.toString()));
//         setShowSubtaskModal(null);
//         setEditingStepId(null);
//         setStepForm({
//             name: '',
//             description: '',
//             startDate: '',
//             dueDate: '',
//             date: '',
//             priority: 'Medium',
//             status: 'Not Started',
//             estimatedHours: '',
//             todayEffort: '',
//             completedHours: ''
//         });
//         onTaskUpdate();
//     };

//     const updateStep = (taskId, stepId, formData) => {
//         const estimatedHours = parseFloat(formData.estimatedHours);
//         console.log('Updating subtask:', { taskId, stepId, formData, estimatedHours });
//         setTaskList(prev => prev.map(task => 
//             task && task.id && task.id.toString() === taskId.toString()
//                 ? {
//                     ...task,
//                     steps: task.steps.map(step => 
//                         step.id.toString() === stepId.toString()
//                             ? {
//                                 ...step,
//                                 name: formData.name,
//                                 description: formData.description,
//                                 startDate: formData.startDate,
//                                 dueDate: formData.dueDate || formData.date,
//                                 priority: formData.priority,
//                                 status: formData.status,
//                                 estimatedHours: estimatedHours,
//                                 todayEffort: parseFloat(formData.todayEffort) || 0,
//                                 completedHours: parseFloat(formData.completedHours) || 0
//                             }
//                             : step
//                     )
//                 }
//                 : task
//         ).filter(task => task && task.id));
//         setShowSubtaskModal(null);
//         setEditingStepId(null);
//         setStepForm({
//             name: '',
//             description: '',
//             startDate: '',
//             dueDate: '',
//             date: '',
//             priority: 'Medium',
//             status: 'Not Started',
//             estimatedHours: '',
//             todayEffort: '',
//             completedHours: ''
//         });
//         onTaskUpdate();
//     };

//     const deleteStep = (taskId, stepId) => {
//         console.log('Deleting subtask:', { taskId, stepId });
//         setTaskList(prev => prev.map(task => 
//             task && task.id && task.id.toString() === taskId.toString()
//                 ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
//                 : task
//         ).filter(task => task && task.id));
//         onTaskUpdate();
//     };

//     const addDependency = async (taskId, stepId, formData) => {
//         try {
//             const config = await getAuthHeaders();
//             await axios.post('https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Dependency', {
//                 taskId: taskId,
//                 subTaskId: stepId,
//                 dependsOnTaskId: formData.dependsOnTaskId,
//                 assignedTo: formData.assignedTo,
//                 notes: formData.notes
//             }, config);
//             await toggleTaskExpand(taskId);
//             onTaskUpdate();
//         } catch (error) {
//             console.error('Error adding dependency:', error);
//             alert('Failed to add dependency: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     // Generate a window of three page numbers, centered around current page where possible
//     const getPageWindow = () => {
//         const totalPages = paginationData?.totalPages && !isNaN(paginationData.totalPages) ? paginationData.totalPages : 1;
//         const currentPage = paginationData?.currentPage && !isNaN(paginationData.currentPage) ? paginationData.currentPage : 1;
//         const windowSize = 3;
//         let startPage = Math.max(1, currentPage - 1);
//         let endPage = Math.min(totalPages, startPage + windowSize - 1);

//         // Adjust startPage if endPage is at totalPages to ensure windowSize
//         if (endPage - startPage + 1 < windowSize && startPage > 1) {
//             startPage = Math.max(1, endPage - windowSize + 1);
//         }

//         const pages = [];
//         for (let i = startPage; i <= endPage; i++) {
//             pages.push(i);
//         }

//         console.log('Page window:', { totalPages, currentPage, startPage, endPage, pages });
//         return pages;
//     };

//     const handlePrevious = () => {
//         if (!paginationData || isNaN(paginationData.currentPage) || isNaN(paginationData.totalPages)) {
//             console.warn('Invalid pagination data, resetting to page 1:', paginationData);
//             onPageChange(1);
//             return;
//         }
//         if (paginationData.hasPreviousPage) {
//             const newPage = Math.max(1, paginationData.currentPage - 1);
//             console.log('Navigating to previous page:', newPage);
//             onPageChange(newPage);
//         }
//     };

//     const handleNext = () => {
//         if (!paginationData || isNaN(paginationData.currentPage) || isNaN(paginationData.totalPages)) {
//             console.warn('Invalid pagination data, resetting to page 1:', paginationData);
//             onPageChange(1);
//             return;
//         }
//         if (paginationData.hasNextPage) {
//             const newPage = Math.min(paginationData.totalPages, paginationData.currentPage + 1);
//             console.log('Navigating to next page:', { 
//                 currentPage: paginationData.currentPage, 
//                 newPage, 
//                 totalPages: paginationData.totalPages 
//             });
//             onPageChange(newPage);
//         }
//     };

//     const handlePageClick = (page) => {
//         if (typeof page === 'number' && page !== paginationData?.currentPage) {
//             console.log('Navigating to page:', { 
//                 clickedPage: page, 
//                 currentPage: paginationData?.currentPage 
//             });
//             onPageChange(page);
//         }
//     };

//     const getEmptyStateMessage = () => {
//         if (isNavigating) {
//             return "Navigating to previous page...";
//         }
//         if (!paginationData || isNaN(paginationData.totalPages)) {
//             return "Invalid pagination data. Please try refreshing.";
//         }
//         if (paginationData.totalPages === 0) {
//             return "No tasks to display";
//         }
//         if (taskList.length === 0) {
//             return "Loading tasks...";
//         }
//         return null;
//     };

//     const pageWindow = getPageWindow();
//     const emptyMessage = getEmptyStateMessage();

//     return (
//         <>
//             {showAcceptedDependencies && (
//                 <AcceptedDependencies
//                     tasks={acceptedDependentTasks}
//                     onClose={() => setShowAcceptedDependencies(false)}
//                 />
//             )}
//             {showPendingDependencyMessage && (
//                 <PendingDependencyMessage
//                     onClose={() => setShowPendingDependencyMessage(false)}
//                 />
//             )}
//             {showDependencyRequestForm && (
//                 <DependencyRequestForm
//                     taskId={dependencyTaskId}
//                     stepId={dependencyStepId}
//                     taskList={taskList}
//                     onClose={() => setShowDependencyRequestForm(false)}
//                     onSave={addDependency}
//                 />
//             )}
//             <div className="border border-gray-200 rounded-md">
//                 <div className="grid grid-cols-8 py-2 px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
//                     <div>Task Name</div>
//                     <div>Start Date</div>
//                     <div>Due Date</div>
//                     <div>Priority</div>
//                     <div>Status</div>
//                     <div>Progress</div>
//                     <div>Effort</div>
//                     <div className="text-right pr-2">Actions</div>
//                 </div>
//                 {emptyMessage ? (
//                     <div className="p-4 text-sm text-gray-500 text-center">
//                         {emptyMessage}
//                     </div>
//                 ) : (
//                     taskList
//                         .filter(task => task && task.id)
//                         .map(task => (
//                             <TaskRow
//                                 key={task.id}
//                                 task={task}
//                                 isExpanded={expandedTasks.has(task.id.toString())}
//                                 toggleTaskExpand={toggleTaskExpand}
//                                 dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
//                                 dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
//                                 handleDependencyItemClick={handleDependencyItemClick}
//                                 openEditTaskModal={openEditTaskModal}
//                                 deleteTask={deleteTask}
//                                 setShowSubtaskModal={setShowSubtaskModal}
//                                 setEditingStepId={setEditingStepId}
//                                 setStepForm={setStepForm}
//                                 setShowDependencyRequestForm={setShowDependencyRequestForm}
//                                 setDependencyTaskId={setDependencyTaskId}
//                                 setDependencyStepId={setDependencyStepId}
//                                 onDeleteSubtask={deleteStep}
//                                 setTaskList={setTaskList}
//                             />
//                         ))
//                 )}
//             </div>
//             {paginationData && !isNaN(paginationData.totalPages) && paginationData.totalPages > 1 && (
//                 <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
//                     <button
//                         onClick={handlePrevious}
//                         disabled={!paginationData.hasPreviousPage}
//                         className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                             paginationData.hasPreviousPage
//                                 ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
//                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                         }`}
//                     >
//                         Previous
//                     </button>
                    
//                     {pageWindow.map((page, index) => {
//                         const isCurrentPage = paginationData.currentPage === page;
                        
//                         return (
//                             <button
//                                 key={`page-${index}-${page}`}
//                                 onClick={() => handlePageClick(page)}
//                                 disabled={isCurrentPage}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
//                                     isCurrentPage
//                                         ? 'bg-purple-600 text-white font-bold border-purple-600 shadow-lg transform scale-105'
//                                         : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-gray-300 hover:border-purple-300 shadow-sm'
//                                 }`}
//                                 style={isCurrentPage ? { 
//                                     boxShadow: '0 4px 16px rgba(147, 51, 234, 0.4)',
//                                     background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
//                                 } : {}}
//                             >
//                                 {page}
//                             </button>
//                         );
//                     })}
                    
//                     <button
//                         onClick={handleNext}
//                         disabled={!paginationData.hasNextPage}
//                         className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                             paginationData.hasNextPage
//                                 ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
//                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                         }`}
//                     >
//                         Next
//                     </button>
//                 </div>
//             )}
//             {showSubtaskModal && (
//                 <SubtaskModal
//                     taskId={showSubtaskModal}
//                     editingStepId={editingStepId}
//                     stepForm={stepForm}
//                     setStepForm={setStepForm}
//                     onClose={() => {
//                         setShowSubtaskModal(null);
//                         setEditingStepId(null);
//                         setStepForm({
//                             name: '',
//                             description: '',
//                             startDate: '',
//                             dueDate: '',
//                             date: '',
//                             priority: 'Medium',
//                             status: 'Not Started',
//                             estimatedHours: '',
//                             todayEffort: '',
//                             completedHours: ''
//                         });
//                     }}
//                     onSave={(taskId, stepId, formData) => {
//                         if (stepId) {
//                             updateStep(taskId, stepId, formData);
//                         } else {
//                             addStepToTask(taskId, stepId, formData);
//                         }
//                     }}
//                 />
//             )}
//         </>
//     );
// }

// export default TaskList;

 
import React, { useState, useEffect } from 'react';
import TaskRow from './TaskRow';
import SubtaskModal from './SubTaskModal';
import DependencyRequestForm from './DependencyRequestsForm';
import AcceptedDependencies from './AcceptedDependencies';
import PendingDependencyMessage from './PendingDependencyMessage';
import Pagination from './Pagination';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
 
function TaskList({ taskList, setTaskList, openEditTaskModal, onTaskUpdate, paginationData, onPageChange }) {
    const { acquireToken } = useAuth();
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [showSubtaskModal, setShowSubtaskModal] = useState(null);
    const [showDependencyRequestForm, setShowDependencyRequestForm] = useState(false);
    const [dependencyTaskId, setDependencyTaskId] = useState(null);
    const [dependencyStepId, setDependencyStepId] = useState(null);
    const [editingStepId, setEditingStepId] = useState(null);
    const [dependencyTasksMap, setDependencyTasksMap] = useState(new Map());
    const [dependentTasksMap, setDependentTasksMap] = useState(new Map());
    const [showAcceptedDependencies, setShowAcceptedDependencies] = useState(false);
    const [acceptedDependentTasks, setAcceptedDependentTasks] = useState([]);
    const [showPendingDependencyMessage, setShowPendingDependencyMessage] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [stepForm, setStepForm] = useState({
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
    const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
 
    // Navigate to appropriate page if current page has no tasks
    useEffect(() => {
        if (!isNavigating &&
            taskList.length === 0 &&
            paginationData &&
            paginationData.totalPages > 0 &&
            paginationData.currentPage > 1) {
           
            console.log('No tasks on current page, navigating to previous page', {
                currentPage: paginationData.currentPage,
                totalPages: paginationData.totalPages,
                taskListLength: taskList.length
            });
           
            setIsNavigating(true);
            // Navigate to the previous page or the last available page
            const targetPage = Math.min(paginationData.currentPage - 1, paginationData.totalPages);
            const finalPage = Math.max(1, targetPage);
           
            // Use setTimeout to ensure state updates are processed
            setTimeout(() => {
                onPageChange(finalPage);
                setIsNavigating(false);
            }, 100);
        }
    }, [taskList.length, paginationData, onPageChange, isNavigating]);
 
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
 
    const addTask = async (formData) => {
        try {
            // Validate formData
            if (!formData.taskName || typeof formData.taskName !== 'string' || formData.taskName.trim() === '') {
                throw new Error('Task name is required');
            }
 
            const config = await getAuthHeaders();
            const taskData = {
                TaskName: formData.taskName.trim(),
                Priority: formData.priority || 'Medium',
                Status: formData.status || 'Not Started',
                Description: formData.description || '',
                StartDate: formData.startDate || new Date().toISOString().split('T')[0],
                DueDate: formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                EstimatedHours: parseFloat(formData.estimatedHours) || 0,
                CompletedHours: parseFloat(formData.completedHours) || 0,
                DependencyTaskId: formData.dependencyTaskId || null,
                CreatedBy: formData.createdBy || null,
                WorkedHours: parseFloat(formData.todayEffort) || 0,
                HasSubtask: formData.hasSubtask || false
            };
            const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
                ? 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/User/DependencyTask'
                : 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task';
            const response = await axios.post(endpoint, taskData, config);
           
            // Log the response for debugging
            console.log('Backend response:', response.data);
 
            // Normalize the response
            const responseTask = response.data.task || response.data || {};
            const newTask = {
                id: responseTask.id || responseTask.Id || responseTask.taskId || responseTask.TaskId || `temp-${Math.random()}`,
                taskName: responseTask.TaskName || responseTask.taskName || responseTask.task_name || formData.taskName.trim(),
                priority: responseTask.Priority || responseTask.priority || formData.priority || 'Medium',
                status: responseTask.Status || responseTask.status || formData.status || 'Not Started',
                description: responseTask.Description || responseTask.description || formData.description || '',
                startDate: responseTask.StartDate || responseTask.startDate || responseTask.start_date || formData.startDate || new Date().toISOString().split('T')[0],
                dueDate: responseTask.DueDate || responseTask.dueDate || responseTask.due_date || formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                estimatedHours: parseFloat(responseTask.EstimatedHours || responseTask.estimatedHours || responseTask.estimated_hours || formData.estimatedHours || 0),
                completedHours: parseFloat(responseTask.CompletedHours || responseTask.completedHours || responseTask.completed_hours || formData.completedHours || 0),
                dependencyTaskId: responseTask.DependencyTaskId || responseTask.dependencyTaskId || responseTask.dependency_task_id || formData.dependencyTaskId || null,
                createdBy: responseTask.CreatedBy || responseTask.createdBy || responseTask.created_by || formData.createdBy || null,
                workedHours: parseFloat(responseTask.WorkedHours || responseTask.workedHours || responseTask.worked_hours || formData.todayEffort || 0),
                hasSubtask: responseTask.HasSubtask || responseTask.hasSubtask || responseTask.has_subtask || formData.hasSubtask || false,
                steps: responseTask.steps || responseTask.subTasks || responseTask.subtasks || [],
                subTasksCount: responseTask.subTasksCount || responseTask.subtasksCount || responseTask.subtasks_count || 0
            };
 
            // Validate newTask
            if (!newTask.id || !newTask.taskName) {
                console.warn('Invalid task, but backend may have saved it:', newTask);
                throw new Error('Invalid task: missing id or taskName');
            }
 
            setTaskList(prev => [newTask, ...prev.filter(task => task && task.id)]);
            onTaskUpdate(newTask);
            console.log('Task added:', newTask);
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to adddd task: ' + (error.response?.data?.message || error.message));
            // Trigger a refresh to fetch the task if saved by the backend
            onTaskUpdate(null); // Pass null to indicate refresh without adding invalid task
        }
    };
 
    const toggleTaskExpand = async (taskId) => {
        try {
            const [dependencyResponse, dependentResponse] = await Promise.all([
                apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
                apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
            ]);
            console.log(dependencyResponse.data);
            console.log(dependentResponse.data);
 
            setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), dependencyResponse.data || []));
            setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), dependentResponse.data || []));
            setExpandedTasks(prev => {
                const newSet = new Set(prev);
                const taskIdStr = taskId.toString();
                newSet.has(taskIdStr) ? newSet.delete(taskIdStr) : newSet.add(taskIdStr);
                return newSet;
            });
        } catch (error) {
            console.error('Error fetching task dependencies:', error);
            setDependencyTasksMap(prev => new Map(prev).set(taskId.toString(), []));
            setDependentTasksMap(prev => new Map(prev).set(taskId.toString(), []));
        }
    };
 
    const handleDependencyItemClick = async (dep) => {
        try {
            if (dep.status === "Accepted") {
                const response = await apiClient.get(`/Dependency/GetDependentAcceptedTasks/${dep.request.dependencyTaskId}`);
                setAcceptedDependentTasks(response.data || []);
                setShowAcceptedDependencies(true);
                setShowPendingDependencyMessage(false);
            } else if (dep.status === "Pending") {
                setShowPendingDependencyMessage(true);
                setShowAcceptedDependencies(false);
            } else {
                alert("Dependency Has Been Rejected");
            }
        } catch (error) {
            console.error('Error fetching dependent accepted tasks:', error);
            setShowPendingDependencyMessage(true);
            setShowAcceptedDependencies(false);
        }
    };
 
    const deleteTask = async (taskId) => {
        try {
            const config = await getAuthHeaders();
            await axios.delete(`${API_ENDPOINT}/${taskId}`, config);
           
            // Remove task from local state
            setTaskList(prev => prev.filter(task => task && task.id && task.id.toString() !== taskId.toString()));
           
            // Trigger task update to refresh data and handle pagination
            onTaskUpdate();
           
            console.log('Task deleted successfully:', taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
        }
    };
 
    const addStepToTask = (taskId, stepId, formData) => {
        const estimatedHours = parseFloat(formData.estimatedHours);
        console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
        setTaskList(prev => prev.map(task =>
            task && task.id && task.id.toString() === taskId.toString()
                ? {
                    ...task,
                    steps: [
                        ...(task.steps || []),
                        {
                            id: stepId,
                            name: formData.name,
                            description: formData.description,
                            startDate: formData.startDate,
                            dueDate: formData.dueDate,
                            status: formData.status,
                            estimatedHours: estimatedHours,
                            todayEffort: parseFloat(formData.todayEffort) || 0,
                            completedHours: parseFloat(formData.completedHours) || 0,
                            taskItemId: parseInt(taskId),
                            priority: formData.priority
                        }
                    ]
                }
                : task
        ).filter(task => task && task.id));
        setExpandedTasks(prev => new Set(prev).add(taskId.toString()));
        setShowSubtaskModal(null);
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
        onTaskUpdate();
    };
 
    const updateStep = (taskId, stepId, formData) => {
        const estimatedHours = parseFloat(formData.estimatedHours);
        console.log('Updating subtask:', { taskId, stepId, formData, estimatedHours });
        setTaskList(prev => prev.map(task =>
            task && task.id && task.id.toString() === taskId.toString()
                ? {
                    ...task,
                    steps: task.steps.map(step =>
                        step.id.toString() === stepId.toString()
                            ? {
                                ...step,
                                name: formData.name,
                                description: formData.description,
                                startDate: formData.startDate,
                                dueDate: formData.dueDate || formData.date,
                                priority: formData.priority,
                                status: formData.status,
                                estimatedHours: estimatedHours,
                                todayEffort: parseFloat(formData.todayEffort) || 0,
                                completedHours: parseFloat(formData.completedHours) || 0
                            }
                            : step
                    )
                }
                : task
        ).filter(task => task && task.id));
        setShowSubtaskModal(null);
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
        onTaskUpdate();
    };
 
    const deleteStep = (taskId, stepId) => {
        console.log('Deleting subtask:', { taskId, stepId });
        setTaskList(prev => prev.map(task =>
            task && task.id && task.id.toString() === taskId.toString()
                ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
                : task
        ).filter(task => task && task.id));
        onTaskUpdate();
    };
 
    const addDependency = async (taskId, stepId, formData) => {
        try {
            const config = await getAuthHeaders();
            await axios.post('https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Dependency', {
                taskId: taskId,
                subTaskId: stepId,
                dependsOnTaskId: formData.dependsOnTaskId,
                assignedTo: formData.assignedTo,
                notes: formData.notes
            }, config);
           // alert('Dependency added successfully.');
            await toggleTaskExpand(taskId);
            onTaskUpdate();
        } catch (error) {
            console.error('Error adding dependency:', error);
            //alert('Failed to adddppp task: ' + (error.response?.data?.message || error.message));
        }
    };
 
    // Determine what message to show
    const getEmptyStateMessage = () => {
        if (isNavigating) {
            return "Navigating to previous page...";
        }
        if (paginationData && paginationData.totalPages === 0) {
            return "No tasks to display";
        }
        if (taskList.length === 0) {
            return "Loading tasks...";
        }
        return null;
    };
 
    const emptyMessage = getEmptyStateMessage();
 
    return (
        <>
            {showAcceptedDependencies && (
                <AcceptedDependencies
                    tasks={acceptedDependentTasks}
                    onClose={() => setShowAcceptedDependencies(false)}
                />
            )}
            {showPendingDependencyMessage && (
                <PendingDependencyMessage
                    onClose={() => setShowPendingDependencyMessage(false)}
                />
            )}
            {showDependencyRequestForm && (
                <DependencyRequestForm
                    taskId={dependencyTaskId}
                    stepId={dependencyStepId}
                    taskList={taskList}
                    onClose={() => setShowDependencyRequestForm(false)}
                    onSave={addDependency}
                />
            )}
            <div className="border border-gray-200 rounded-md">
                <div className="grid grid-cols-8 py-2 px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
                    <div>Task Name</div>
                    <div>Start Date</div>
                    <div>Due Date</div>
                    <div>Priority</div>
                    <div>Status</div>
                    <div>Progress</div>
                    <div>Effort</div>
                    <div className="text-right pr-2">Actions</div>
                </div>
                {emptyMessage ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                        {emptyMessage}
                    </div>
                ) : (
                    taskList
                        .filter(task => task && task.id)
                        .map(task => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                isExpanded={expandedTasks.has(task.id.toString())}
                                toggleTaskExpand={toggleTaskExpand}
                                dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
                                dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
                                handleDependencyItemClick={handleDependencyItemClick}
                                openEditTaskModal={openEditTaskModal}
                                deleteTask={deleteTask}
                                setShowSubtaskModal={setShowSubtaskModal}
                                setEditingStepId={setEditingStepId}
                                setStepForm={setStepForm}
                                setShowDependencyRequestForm={setShowDependencyRequestForm}
                                setDependencyTaskId={setDependencyTaskId}
                                setDependencyStepId={setDependencyStepId}
                                onDeleteSubtask={deleteStep}
                                setTaskList={setTaskList}
                            />
                        ))
                )}
            </div>
            <Pagination paginationData={paginationData} onPageChange={onPageChange} />
            {showSubtaskModal && (
                <SubtaskModal
                    taskId={showSubtaskModal}
                    editingStepId={editingStepId}
                    stepForm={stepForm}
                    setStepForm={setStepForm}
                    onClose={() => {
                        setShowSubtaskModal(null);
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
                    }}
                    onSave={(taskId, stepId, formData) => {
                        if (stepId) {
                            updateStep(taskId, stepId, formData);
                        } else {
                            addStepToTask(taskId, stepId, formData);
                        }
                    }}
                />
            )}
        </>
    );
}
 
export default TaskList;
 