import React, { useState, useEffect } from 'react';
import { Link, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
 
const TaskLinkDropdown = ({ request, handleLinkToExistingTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const tasksPerPage = 5;
 
  const { acquireToken } = useAuth();
 
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
 
      try {
        const token = await acquireToken('api');
        const response = await axios.get('https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task/inprogress-tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        const rawTasks = Array.isArray(response.data) ? response.data : [];
 
        const sortedTasks = rawTasks
          .filter(task => task.taskName)
          .sort((a, b) => a.taskName.localeCompare(b.taskName));
 
        setTasks(sortedTasks);
      } catch (err) {
        setError('Failed to load tasks: ' + (err.response?.data?.message || err.message));
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
 
    if (isOpen) {
      fetchTasks();
    }
  }, [acquireToken, isOpen]);
 
  const handleButtonClick = () => setIsOpen(true);
 
  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setCurrentPage(1);
  };
 
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    setSelectedTaskId(null);
  };
 
  const linkSelectedTask = async () => {
    try {
      const token = await acquireToken('api');
      await handleLinkToExistingTask(request, selectedTaskId);
      handleClose();
      handleConfirmClose();
    } catch (err) {
      console.error('Failed to link task:', err);
      setError('Failed to link task. Please try again.');
    }
  };
 
  const filteredTasks = tasks.filter(task =>
    task.taskName.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
 
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
 
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
 
  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
      >
        <Link size={16} className="mr-1" />
        Link to Task
        <ChevronDown size={16} className="ml-1" />
      </button>
 
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Task to Link</h2>
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-2">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading tasks...</p>
                </div>
              )}
              {error && (
                <div className="text-center py-4 text-red-600">
                  {error}
                </div>
              )}
              {!loading && !error && filteredTasks.length === 0 && (
                <div className="text-center py-4 text-gray-600">
                  No tasks available
                </div>
              )}
              {!loading && !error && filteredTasks.length > 0 && (
                <div className="space-y-2">
                  {currentTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsConfirmOpen(true);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md transition-colors
                        ${selectedTaskId === task.id ? 'bg-violet-100 border-violet-300' : 'hover:bg-violet-50'}
                        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-violet-100`}
                    >
                      {task.taskName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
 
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Task Link</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to link this task to the request?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleConfirmClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                No
              </button>
              <button
                onClick={linkSelectedTask}
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
 
export default TaskLinkDropdown;
 