


// import React, { useState } from 'react';
// import TaskRow from './TaskRow';
// import SubtaskModal from './SubTaskModal';
// import DependencyRequestForm from './DependencyRequestsForm';
// import AcceptedDependencies from './AcceptedDependencies';
// import PendingDependencyMessage from './PendingDependencyMessage';
// import Pagination from './Pagination';
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

//     const addTask = async (formData) => {
//         try {
//             const config = await getAuthHeaders();
//             const taskData = {
//                 TaskName: formData.taskName,
//                 Priority: formData.priority || 'Medium',
//                 Status: formData.status || 'Not Started',
//                 Description: formData.description || '',
//                 StartDate: formData.startDate,
//                 DueDate: formData.dueDate,
//                 EstimatedHours: parseFloat(formData.estimatedHours) || 0,
//                 CompletedHours: parseFloat(formData.completedHours) || 0,
//                 DependencyTaskId: formData.dependencyTaskId || null,
//                 CreatedBy: formData.createdBy || null,
//                 WorkedHours: parseFloat(formData.todayEffort) || 0,
//                 HasSubtask: formData.hasSubtask // Include HasSubtask
//             };
//             const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
//                 ? 'http://localhost:5181/api/User/DependencyTask'
//                 : 'http://localhost:5181/api/Task';
//             const response = await axios.post(endpoint, taskData, config);
//             const newTask = response.data.task; // Use task object from response
//             setTaskList(prev => [...prev, newTask]);
//             onTaskUpdate();
//             console.log('Task added:', newTask);
//         } catch (error) {
//             console.error('Error adding task:', error);
//             alert('Failed to add task: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     const toggleTaskExpand = async (taskId) => {
//         try {
//             const [dependencyResponse, dependentResponse] = await Promise.all([
//                 apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
//                 apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
//             ]);
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
//             setTaskList(prev => prev.filter(task => task.id.toString() !== taskId.toString()));
//             onTaskUpdate();
//         } catch (error) {
//             console.error('Error deleting task:', error);
//             alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     const addStepToTask = (taskId, stepId, formData) => {
//         const estimatedHours = parseFloat(formData.estimatedHours);
//         console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
//         setTaskList(prev => prev.map(task => 
//             task.id.toString() === taskId.toString()
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
//         ));
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
//             task.id.toString() === taskId.toString()
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
//         ));
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
//             task.id.toString() === taskId.toString()
//                 ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
//                 : task
//         ));
//         onTaskUpdate();
//     };

//     const addDependency = async (taskId, stepId, formData) => {
//         try {
//             const config = await getAuthHeaders();
//             await axios.post('http://localhost:5181/api/Dependency', {
//                 taskId: taskId,
//                 subTaskId: stepId,
//                 dependsOnTaskId: formData.dependsOnTaskId,
//                 assignedTo: formData.assignedTo,
//                 notes: formData.notes
//             }, config);
//             alert('Dependency added successfully.');
//             await toggleTaskExpand(taskId);
//             onTaskUpdate();
//         } catch (error) {
//             console.error('Error adding dependency:', error);
//             alert('Failed to add dependency: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     // Calculate the slice of tasks to display based on pagination
//     const { pageNumber, totalPages, totalCount, pageSize } = paginationData || {};
//     const indexOfLastTask = pageNumber * pageSize;
//     const indexOfFirstTask = indexOfLastTask - pageSize;
//     const currentTasks = taskList.slice(indexOfFirstTask, indexOfLastTask);

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
//                 {currentTasks.length === 0 ? (
//                     <div className="p-4 text-sm text-gray-500 text-center">
//                         No tasks to display
//                     </div>
//                 ) : (
//                     currentTasks.map(task => (
//                         <TaskRow
//                             key={task.id}
//                             task={task}
//                             isExpanded={expandedTasks.has(task.id.toString())}
//                             toggleTaskExpand={toggleTaskExpand}
//                             dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
//                             dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
//                             handleDependencyItemClick={handleDependencyItemClick}
//                             openEditTaskModal={openEditTaskModal}
//                             deleteTask={deleteTask}
//                             setShowSubtaskModal={setShowSubtaskModal}
//                             setEditingStepId={setEditingStepId}
//                             setStepForm={setStepForm}
//                             setShowDependencyRequestForm={setShowDependencyRequestForm}
//                             setDependencyTaskId={setDependencyTaskId}
//                             setDependencyStepId={setDependencyStepId}
//                             onDeleteSubtask={deleteStep}
//                             setTaskList={setTaskList}
//                         />
//                     ))
//                 )}
//             </div>
//             <Pagination paginationData={paginationData} onPageChange={onPageChange} />
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


// import React, { useState } from 'react';
// import TaskRow from './TaskRow';
// import SubtaskModal from './SubTaskModal';
// import DependencyRequestForm from './DependencyRequestsForm';
// import AcceptedDependencies from './AcceptedDependencies';
// import PendingDependencyMessage from './PendingDependencyMessage';
// import Pagination from './Pagination';
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

//     const addTask = async (formData) => {
//         try {
//             const config = await getAuthHeaders();
//             const taskData = {
//                 TaskName: formData.taskName,
//                 Priority: formData.priority || 'Medium',
//                 Status: formData.status || 'Not Started',
//                 Description: formData.description || '',
//                 StartDate: formData.startDate,
//                 DueDate: formData.dueDate,
//                 EstimatedHours: parseFloat(formData.estimatedHours) || 0,
//                 CompletedHours: parseFloat(formData.completedHours) || 0,
//                 DependencyTaskId: formData.dependencyTaskId || null,
//                 CreatedBy: formData.createdBy || null,
//                 WorkedHours: parseFloat(formData.todayEffort) || 0,
//                 HasSubtask: formData.hasSubtask
//             };
//             const endpoint = formData.dependencyTaskId && formData.dependencyTaskId > 0
//                 ? 'http://localhost:5181/api/User/DependencyTask'
//                 : 'http://localhost:5181/api/Task';
//             const response = await axios.post(endpoint, taskData, config);
//             const newTask = response.data.task;
//             setTaskList(prev => [newTask, ...prev]); // Modified to prepend new task
//             onTaskUpdate();
//             console.log('Task added:', newTask);
//         } catch (error) {
//             console.error('Error adding task:', error);
//             alert('Failed to add task: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     const toggleTaskExpand = async (taskId) => {
//         try {
//             const [dependencyResponse, dependentResponse] = await Promise.all([
//                 apiClient.get(`/Dependency/GetDependencyRequests/${taskId}`),
//                 apiClient.get(`/Dependency/GetDependentTasks/${taskId}`)
//             ]);
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
//             setTaskList(prev => prev.filter(task => task.id.toString() !== taskId.toString()));
//             onTaskUpdate();
//         } catch (error) {
//             console.error('Error deleting task:', error);
//             alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     const addStepToTask = (taskId, stepId, formData) => {
//         const estimatedHours = parseFloat(formData.estimatedHours);
//         console.log('Adding subtask:', { taskId, stepId, formData, estimatedHours });
//         setTaskList(prev => prev.map(task => 
//             task.id.toString() === taskId.toString()
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
//         ));
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
//             task.id.toString() === taskId.toString()
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
//         ));
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
//             task.id.toString() === taskId.toString()
//                 ? { ...task, steps: task.steps.filter(step => step.id.toString() !== stepId.toString()) }
//                 : task
//         ));
//         onTaskUpdate();
//     };

//     const addDependency = async (taskId, stepId, formData) => {
//         try {
//             const config = await getAuthHeaders();
//             await axios.post('http://localhost:5181/api/Dependency', {
//                 taskId: taskId,
//                 subTaskId: stepId,
//                 dependsOnTaskId: formData.dependsOnTaskId,
//                 assignedTo: formData.assignedTo,
//                 notes: formData.notes
//             }, config);
//             alert('Dependency added successfully.');
//             await toggleTaskExpand(taskId);
//             onTaskUpdate();
//         } catch (error) {
//             console.error('Error adding dependency:', error);
//             alert('Failed to add dependency: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     // Calculate the slice of tasks to display based on pagination
//     const { pageNumber, totalPages, totalCount, pageSize } = paginationData || {};
//     const indexOfLastTask = pageNumber * pageSize;
//     const indexOfFirstTask = indexOfLastTask - pageSize;
//     const currentTasks = taskList.slice(indexOfFirstTask, indexOfLastTask);

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
//                 {currentTasks.length === 0 ? (
//                     <div className="p-4 text-sm text-gray-500 text-center">
//                         No tasks to display
//                     </div>
//                 ) : (
//                     currentTasks.map(task => (
//                         <TaskRow
//                             key={task.id}
//                             task={task}
//                             isExpanded={expandedTasks.has(task.id.toString())}
//                             toggleTaskExpand={toggleTaskExpand}
//                             dependencyTasks={dependencyTasksMap.get(task.id.toString()) || []}
//                             dependentTasks={dependentTasksMap.get(task.id.toString()) || []}
//                             handleDependencyItemClick={handleDependencyItemClick}
//                             openEditTaskModal={openEditTaskModal}
//                             deleteTask={deleteTask}
//                             setShowSubtaskModal={setShowSubtaskModal}
//                             setEditingStepId={setEditingStepId}
//                             setStepForm={setStepForm}
//                             setShowDependencyRequestForm={setShowDependencyRequestForm}
//                             setDependencyTaskId={setDependencyTaskId}
//                             setDependencyStepId={setDependencyStepId}
//                             onDeleteSubtask={deleteStep}
//                             setTaskList={setTaskList}
//                         />
//                     ))
//                 )}
//             </div>
//             <Pagination paginationData={paginationData} onPageChange={onPageChange} />
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


import React, { useState } from 'react';
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
                ? 'http://localhost:5181/api/User/DependencyTask'
                : 'http://localhost:5181/api/Task';
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
            alert('Failed to add task: ' + (error.response?.data?.message || error.message));
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
            setTaskList(prev => prev.filter(task => task && task.id && task.id.toString() !== taskId.toString()));
            onTaskUpdate();
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
            await axios.post('http://localhost:5181/api/Dependency', {
                taskId: taskId,
                subTaskId: stepId,
                dependsOnTaskId: formData.dependsOnTaskId,
                assignedTo: formData.assignedTo,
                notes: formData.notes
            }, config);
            alert('Dependency added successfully.');
            await toggleTaskExpand(taskId);
            onTaskUpdate();
        } catch (error) {
            console.error('Error adding dependency:', error);
            alert('Failed to add task: ' + (error.response?.data?.message || error.message));
        }
    };

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
                {taskList.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                        No tasks to display
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