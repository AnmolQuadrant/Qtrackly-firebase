import React from 'react';

function ProgressBar({ progress, isOvertime, dueDate, status }) {
    const currentDate = new Date();
    const taskDueDate = new Date(dueDate);
    // Remove time portion for date comparison
    currentDate.setHours(0, 0, 0, 0);
    taskDueDate.setHours(0, 0, 0, 0);
    const isOverdue = currentDate > taskDueDate;
    const isCompleted = status === 'Completed';

    let progressColor = 'bg-red-500';
    if (isOvertime) {
        progressColor = 'bg-black'; // Use black for overtime
    } else if (progress >= 70) {
        progressColor = 'bg-green-500';
    } else if (progress >= 30) {
        progressColor = 'bg-yellow-500';
    }

    let displayText = isCompleted ? '100%' : `${progress}%`;
    let textClass = 'text-gray-700';
    if (!isCompleted) {
        if (isOverdue && isOvertime) {
            displayText = 'OVERDUE';
            textClass = 'text-red-500';
        } else if (isOverdue) {
            displayText = 'OVERDUE';
            textClass = 'text-red-500 ';
        } else if (isOvertime) {
            displayText = 'OVER TIME';
            textClass = 'text-red-500 ';
        }
    }

    return (
        <div className="flex flex-col items-start">
            <div className={`text-xs ${textClass} font-medium mb-1`}>
                {displayText}
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
                <div
                    className={`${progressColor} h-2.5 rounded-full transition-all duration-300`}
                    style={{ width: `${isCompleted ? 100 : progress}%` }}
                ></div>
            </div>
        </div>
    );
}

// Define the blinking animation using Tailwind's arbitrary value syntax
const style = document.createElement('style');
style.innerHTML = `
  .animate-blink {
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
document.head.appendChild(style);

export default ProgressBar;