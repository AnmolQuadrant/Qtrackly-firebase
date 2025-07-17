// import React, { useState } from 'react';
// import Button from '../../common-components/Button';

// function Filter({ onFilterChange }) {
//   const [priority, setPriority] = useState('');
//   const [status, setStatus] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [dueDate, setDueDate] = useState('');

//   // Helper function to convert YYYY-MM-DD to DD-MM-YYYY
//   const formatToDDMMYYYY = (dateStr) => {
//     if (!dateStr) return '';
//     try {
//       const [year, month, day] = dateStr.split('-');
//       return `${day}-${month}-${year}`;
//     } catch (e) {
//       console.error('Invalid date format:', dateStr);
//       return '';
//     }
//   };

//   // Helper function to convert DD-MM-YYYY to YYYY-MM-DD for display in input
//   const formatToYYYYMMDD = (dateStr) => {
//     if (!dateStr) return '';
//     try {
//       const [day, month, year] = dateStr.split('-');
//       return `${year}-${month}-${day}`;
//     } catch (e) {
//       console.error('Invalid date format:', dateStr);
//       return '';
//     }
//   };

//   const handleFilterChange = () => {
//     onFilterChange({
//       priority,
//       status,
//       startDate,
//       dueDate
//     });
//   };

//   const handleApply = () => {
//     handleFilterChange();
//   };

//   const handleClear = () => {
//     setPriority('');
//     setStatus('');
//     setStartDate('');
//     setDueDate('');
//     onFilterChange({ priority: '', status: '', startDate: '', dueDate: '' });
//   };

//   return (
//     <div className='p-4 bg-gray-100 rounded-md shadow-md w-64 absolute top-[10] right-[10%]'>
//       <h3 className='font-bold text-lg'> Filter Tasks</h3>

//       <div className='space-y-4'>
//         {/* filter by priority */}
//         <div>
//           <label className='block text-sm'>Priority</label>
//           <select
//             className='w-full p-2 border border-gray-300 rounded-md'
//             value={priority}
//             onChange={(e) => setPriority(e.target.value)}
//           >
//             <option value="">All Priorities</option>
//             <option value="Low">Low</option>
//             <option value="Medium">Medium</option>
//             <option value="High">High</option>
//           </select>
//         </div>
        
//         {/* filter by status */}
//         <div>
//           <label className='block text-sm'>Status</label>
//           <select
//             className='w-full p-2 border border-gray-300 rounded-md'
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//           >
//             <option value="">All Status</option>
//             <option value="To Do">To Do</option>
//             <option value="In Progress">In Progress</option>
//             <option value="Completed">Completed</option>
//           </select>
//         </div>

//         {/* filter by start date */}
//         <div>
//           <label className='block text-sm'>Start Date</label>
//           <input
//             type="date"
//             className='w-full p-2 border border-gray-300 rounded-md'
//             value={formatToYYYYMMDD(startDate)}
//             onChange={(e) => setStartDate(formatToDDMMYYYY(e.target.value))}
//           />
//         </div>

//         {/* filter by due date */}
//         <div>
//           <label className='block text-sm'>Due Date</label>
//           <input
//             type="date"
//             className='w-full p-2 border border-gray-300 rounded-md'
//             value={formatToYYYYMMDD(dueDate)}
//             onChange={(e) => setDueDate(formatToDDMMYYYY(e.target.value))}
//           />
//         </div>
//       </div>

//       <div className='mt-4 flex gap-4'>
//         <Button onClick={handleClear}>Clear</Button>
//         <Button onClick={handleApply}>Apply</Button>
//       </div>
//     </div>
//   );
// }

// export default Filter;

import React, { useState } from 'react';
import Button from '../../common-components/Button';

function Filter({ onFilterChange, onClose }) {
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Helper function to convert YYYY-MM-DD to DD-MM-YYYY
  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    } catch (e) {
      console.error('Invalid date format:', dateStr);
      return '';
    }
  };

  // Helper function to convert DD-MM-YYYY to YYYY-MM-DD for display in input
  const formatToYYYYMMDD = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Invalid date format:', dateStr);
      return '';
    }
  };

  const handleFilterChange = () => {
    onFilterChange({
      priority,
      status,
      startDate,
      dueDate
    });
  };

  const handleApply = () => {
    handleFilterChange();
    onClose();
  };

  const handleClear = () => {
    setPriority('');
    setStatus('');
    setStartDate('');
    setDueDate('');
    onFilterChange({ priority: '', status: '', startDate: '', dueDate: '' });
    onClose();
  };

  return (
    <div className='p-4 bg-gray-100 rounded-md shadow-md w-64 absolute top-[10] right-[10%] z-50'>
      <h3 className='font-bold text-lg'>Filter Tasks</h3>

      <div className='space-y-4'>
        {/* filter by priority */}
        <div>
          <label className='block text-sm'>Priority</label>
          <select
            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        {/* filter by status */}
        <div>
          <label className='block text-sm'>Status</label>
          <select
            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* filter by start date */}
        <div>
          <label className='block text-sm'>Start Date</label>
          <input
            type="date"
            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            value={formatToYYYYMMDD(startDate)}
            onChange={(e) => setStartDate(formatToDDMMYYYY(e.target.value))}
          />
        </div>

        {/* filter by due date */}
        <div>
          <label className='block text-sm'>Due Date</label>
          <input
            type="date"
            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            value={formatToYYYYMMDD(dueDate)}
            onChange={(e) => setDueDate(formatToDDMMYYYY(e.target.value))}
          />
        </div>
      </div>

      <div className='mt-4 flex gap-4'>
        <Button onClick={handleClear}>Clear</Button>
        <Button onClick={handleApply}>Apply</Button>
      </div>
    </div>
  );
}

export default Filter;