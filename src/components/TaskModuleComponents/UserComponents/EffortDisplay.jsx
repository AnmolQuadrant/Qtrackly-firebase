import React from 'react';
import { Clock } from 'lucide-react';

function EffortDisplay({ taskOrStep }) {
    const estimatedHours = parseFloat(taskOrStep.estimatedHours); 
    return (
        <div className="flex items-center text-sm text-gray-700">
            <Clock className="w-4 h-4 mr-1 text-blue-600" />
            <span className="font-medium">{taskOrStep.completedHours || 0}/{estimatedHours || 0} hours</span>
        </div>
    );
}

export default EffortDisplay;