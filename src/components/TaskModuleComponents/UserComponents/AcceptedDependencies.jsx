

import React from 'react';
import { X, CheckCircle } from 'lucide-react';

function AcceptedDependencies({ tasks, onClose }) {

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Accepted Dependency</h3>
              <p className="text-sm text-gray-600">Approved Task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="text-center mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-1">
              Accepted Dependent Task
            </h4>
            <p className="text-sm text-gray-600">
              The following task has been approved as a dependency for your request.
            </p>
          </div>

          {tasks && Object.keys(tasks).length > 0 ? (
            <>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Task Summary</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Task:</span>
                    <span className="text-gray-800 font-medium">{tasks.taskName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-gray-800">{tasks.status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Hours:</span>
                    <span className="text-gray-800">{tasks.estimatedHours || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="text-gray-800">{formatDate(tasks.dueDate)}</span>
                  </div>
                </div>
              </div>

 <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
    <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
    <div className="bg-white p-2 rounded border border-gray-200 text-sm text-gray-800 h-20 overflow-y-auto leading-snug">
        {tasks.description || 'No description provided'}
    </div>
</div>



            </>
          ) : (
            <div className="text-sm text-gray-600 text-center">
              No accepted dependent task found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcceptedDependencies;
