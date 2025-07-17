import axios from 'axios';
 import { decryptString } from '../../services/decrypt';
 import { fetchEncryptionKeys } from '../../services/apiClient';
import { decryptUser } from '../../services/decrypt';
import { useState,useEffect } from 'react';

export const makeAuthenticatedRequest = async (url, method = 'GET', data = null, acquireToken) => {
  try {
    const token = await acquireToken('api');
    if (!token) throw new Error('Failed to acquire authentication token');
    const config = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...(data && (method === 'POST' || method === 'PUT' || method === 'PATCH') && { data })
    };
    // const response = await axios(config);
    // if (!response.headers['content-type']?.includes('application/json')) {
    //   throw new Error('Received non-JSON response from server');
    // }
    // //console.log(response.data);
    // return response.data;

    const response = await axios(config);
if (!response.headers['content-type']?.includes('application/json')) {
  throw new Error("Received non-JSON response from server");
}


// ✅ Apply decryption to each user in the response if it's an array
// const decryptedData = Array.isArray(response.data)
//   ? response.data.map(user => decryptUser(user, aesKey, aesIV))
//   : decryptUser(response.data, aesKey, aesIV); // ✅ Decrypt single user if response is an object
//console.log(decryptedData);
//console.log(aesKey+" "+aesiv);
return response.data;

  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please try logging in again.');
    }
    throw error.response?.data?.message || error.message || 'An unexpected error occurred';
  }
};
 
export const getWeeksInMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => i + 1);
};
 
export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
 
export const exportData = (viewType, weeklyData, monthlyData, yearlyData, selectedYear, selectedMonth, searchQuery) => {
  let dataArray = [];
  if (viewType === 'Weekly') {
    if (weeklyData.length === 0) return;
    dataArray = weeklyData
      .filter(row => !searchQuery || row.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(row => ({
        Name: row.name,
        Mon: row.mon,
        Tue: row.tue,
        Wed: row.wed,
        Thu: row.thu,
        Fri: row.fri,
        Sat: row.sat,
        Sun: row.sun,
        Total: row.total,
      }));
  } else if (viewType === 'Monthly') {
    if (monthlyData.length === 0) return;
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    dataArray = monthlyData
      .filter(row => !searchQuery || row.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(row => {
        const obj = { Name: row.name };
        for (let i = 0; i < daysInMonth; i++) {
          obj[`Day ${i + 1}`] = row.days[i] ?? 0;
        }
        return obj;
      });
  } else if (viewType === 'Yearly') {
    if (yearlyData.length === 0) return;
    dataArray = yearlyData
      .filter(row => !searchQuery || row.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(row => ({
        Name: row.name,
        Jan: row.jan,
        Feb: row.feb,
        Mar: row.mar,
        Apr: row.apr,
        May: row.may,
        Jun: row.jun,
        Jul: row.jul,
        Aug: row.aug,
        Sep: row.sep,
        Oct: row.oct,
        Nov: row.nov,
        Dec: row.dec,
      }));
  }
  if (dataArray.length === 0) return;
  const headers = Object.keys(dataArray[0]);
  const csvRows = [
    headers.join(','),
    ...dataArray.map(row => headers.map(h => `"${row[h] != null ? row[h] : ''}"`).join(','))
  ];
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const fileName = `timesheet_${viewType.toLowerCase()}_${new Date().toISOString()}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};