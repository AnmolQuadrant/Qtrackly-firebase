

import React, { useState } from 'react';
import axios from 'axios';
import Button from '../../common-components/Button';
import { useAuth } from '../../context/AuthContext';

function Filter({ onFilterChange, onClose }) {
  const { acquireToken } = useAuth();
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const API_ENDPOINT = 'https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api/Task/GetAllTasks';

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

  const handleFilterChange = async () => {
    try {
      const config = await getAuthHeaders();
      const filterParams = {
        priority: priority || null,
        status: status || null,
        startDate: startDate ? formatToYYYYMMDD(startDate) : null,
        dueDate: dueDate ? formatToYYYYMMDD(dueDate) : null,
        pageNumber: 1,
        pageSize: 5
      };

      const response = await axios.get(API_ENDPOINT, {
        ...config,
        params: filterParams
      });

      onFilterChange({
        tasks: response.data.data,
        filters: { priority, status, startDate, dueDate }
      });
      console.log('Filtered tasks:', response.data.data);
    } catch (error) {
      console.error('Error applying filters:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('Failed to apply filters. Please try again.');
    }
  };

  const handleApply = async () => {
    await handleFilterChange();
    onClose();
  };

  const handleClear = async () => {
    setPriority('');
    setStatus('');
    setStartDate('');
    setDueDate('');
    try {
      const config = await getAuthHeaders();
      const response = await axios.get(API_ENDPOINT, {
        ...config,
        params: { pageNumber: 1, pageSize: 5 }
      });
      onFilterChange({
        tasks: response.data.data,
        filters: { priority: '', status: '', startDate: '', dueDate: '' }
      });
    } catch (error) {
      console.error('Error clearing filters:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('Failed to clear filters. Please try again.');
    }
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
            <option value="Not Started">Not Started</option>
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