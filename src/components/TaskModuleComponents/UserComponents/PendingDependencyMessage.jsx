
import React from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';

function PendingDependencyMessage({ onClose, dependencyInfo }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Dependency Status</h3>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Dependency Request Pending
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your dependency request has been submitted and is awaiting approval. 
              You will be notified once the request has been reviewed and accepted.
            </p>
          </div>

          {/* Additional Info if provided */}
          {dependencyInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Request Details</h5>
              <div className="space-y-2 text-sm">
                {dependencyInfo.taskName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Task:</span>
                    <span className="text-gray-800 font-medium">{dependencyInfo.taskName}</span>
                  </div>
                )}
                {dependencyInfo.requestedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested:</span>
                    <span className="text-gray-800">{formatDate(dependencyInfo.requestedDate)}</span>
                  </div>
                )}
                {dependencyInfo.notes && (
                  <div className="mt-3">
                    <span className="text-gray-600 block mb-1">Notes:</span>
                    <p className="text-gray-800 text-xs bg-white p-2 rounded border">
                      {dependencyInfo.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Steps */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Status Timeline</h5>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Request Submitted</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm text-gray-800 font-medium">Pending Review</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-sm text-gray-400">Awaiting Approval</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
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

export default PendingDependencyMessage;