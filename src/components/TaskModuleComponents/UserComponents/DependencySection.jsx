
import React from 'react';
import { AlignLeft, ArrowRight, Link } from 'lucide-react';

function DependencySection({ task, dependencyTasks, dependentTasks, handleDependencyItemClick }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };
    console.log(dependentTasks);
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Not Started': return 'bg-gray-100 text-gray-800';
            case 'Accepted': return 'bg-purple-100 text-purple-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                    <AlignLeft className="w-4 h-4 text-electric-violet mr-2" />
                    <h4 className="text-sm font-medium text-gray-800">Description</h4>
                </div>
                <div className="pl-2">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {task?.description || "This task needs to be completed according to the project requirements."}
                    </p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                    <Link className="w-4 h-4 text-electric-violet mr-2" />
                    <h4 className="text-sm font-medium text-gray-800">Dependencies</h4>
                </div>
                <div className="pl-2 space-y-4">
                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">This task depends on:</h5>
                        {dependencyTasks && dependencyTasks.length > 0 ? (
                            dependencyTasks.map((dep, index) => (
                                <div
                                    key={dep?.id || index}
                                    className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-2 cursor-pointer hover:bg-blue-100"
                                    onClick={() => dep && handleDependencyItemClick(dep)}
                                >
                                    <div className="flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4 text-blue-500" />
                                        <div>
                                            <div className="text-sm font-medium text-blue-800">
                                                {dep?.request?.taskName || 'Unnamed Task'}
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(dep?.status)}`}>
                                                    Status: {dep?.status || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Date: {formatDate(dep?.request?.requestedDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">No dependencies</div>
                        )}
                    </div>
                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Tasks dependent on this:</h5>
                        {dependentTasks && dependentTasks.length > 0 ? (
                            dependentTasks.map((depTask, index) => (
                                <div
                                    key={depTask?.id || index}
                                    className="bg-purple-50 p-3 rounded-md border border-purple-100 mb-2 cursor-pointer hover:bg-purple-100"
                                    onClick={() => depTask && handleDependencyItemClick(depTask)}
                                >
                                    <div className="flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4 text-purple-500" />
                                        <div>
                                            <div className="text-sm font-medium text-purple-800">
                                                {depTask?.request?.taskName || 'Unnamed Task'}
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(depTask?.status)}`}>
                                                    Status: {depTask?.status || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Date: {formatDate(depTask?.request?.requestedDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">No tasks depend on this</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DependencySection;