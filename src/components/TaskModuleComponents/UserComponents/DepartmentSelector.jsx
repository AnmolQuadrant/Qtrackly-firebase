import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchEncryptionKeys } from '../../services/apiClient';
import apiClient from '../../services/apiClient';
import { decryptString } from '../../services/decrypt';

const DepartmentSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, acquireToken, user, getPrimaryRole, logout } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isSubDepartmentOpen, setIsSubDepartmentOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);

  // Prevent browser back button navigation
  useEffect(() => {
    // Replace current history entry to prevent going back to previous page
    window.history.replaceState(null, '', location.pathname);
    
    // Add a new history entry
    window.history.pushState(null, '', location.pathname);
    
    const handlePopState = (event) => {
      // Prevent default back navigation
      event.preventDefault();
      
      // Show confirmation dialog
      const confirmLeave = window.confirm(
        'Are you sure you want to leave? You will be logged out for security purposes.'
      );
      
      if (confirmLeave) {
        handleBack();
      } else {
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', location.pathname);
      }
    };

    // Add event listener for browser back/forward buttons
    window.addEventListener('popstate', handlePopState);
    
    // Add beforeunload event to handle page refresh/close
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Department selection is required. Are you sure you want to leave?';
      return event.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  // Fetch initial options (encryption keys and departments)
  useEffect(() => {
    const fetchInitialOptions = async () => {
      if (!isAuthenticated) {
        setError('Please log in to continue.');
        navigate('/login');
        return;
      }

      setIsLoadingOptions(true);
      setError(null);

      try {
        const token = await acquireToken('api');

        // Fetch encryption keys
        const keys = await fetchEncryptionKeys();
        setAesKey(keys.aesKey);
        setAesIV(keys.aesIV);

        // Fetch departments (mocked for now)
        console.log('Fetching departments');
        setDepartments(['BBU-Warangal', 'BBU-Hyderabad']);
        // Uncomment to fetch from API:
        // const deptResponse = await apiClient.get('/Department/departments', {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setDepartments(deptResponse.data || ['BBU-Warangal', 'BBU-Hyderabad']);
      } catch (err) {
        console.error('Error fetching initial options:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to load department options. Using default options.');
          setDepartments(['BBU-Warangal', 'BBU-Hyderabad']);
        }
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchInitialOptions();
  }, [isAuthenticated, acquireToken, navigate]);

  // Fetch sub-departments when department is selected
  useEffect(() => {
    const fetchSubDepartments = async () => {
      if (!selectedDepartment || !isAuthenticated || !aesKey || !aesIV) return;

      try {
        const token = await acquireToken('api');
        console.log('Fetching sub-departments for department:', selectedDepartment);
        setSubDepartments(['Development', 'Sales', 'Finance']);
        // Uncomment to fetch from API:
        // const subDeptResponse = await apiClient.get('/Department/sub-departments', {
        //   headers: { Authorization: `Bearer ${token}` },
        //   params: { department: selectedDepartment },
        // });
        // setSubDepartments(subDeptResponse.data || ['Development', 'Sales', 'Finance']);
      } catch (err) {
        console.error('Error fetching sub-departments:', err);
        setError('Failed to load sub-department options. Using default options.');
        setSubDepartments(['Development', 'Sales', 'Finance']);
      }
    };

    fetchSubDepartments();
  }, [selectedDepartment, isAuthenticated, acquireToken, aesKey, aesIV]);

  // Fetch managers when sub-department is selected
  useEffect(() => {
    const fetchManagers = async () => {
      if (!selectedSubDepartment || !isAuthenticated || !aesKey || !aesIV) return;

      try {
        const token = await acquireToken('api');
        console.log('Fetching managers for sub-department:', selectedSubDepartment);
        const managerResponse = await apiClient.get('/User/managers', {
          headers: { Authorization: `Bearer ${token}` },
          params: { subDepartment: selectedSubDepartment },
        });

        // Extract and decrypt manager names
        const decryptedNames = managerResponse.data
          .map((user) => {
            try {
              const decryptedName = decryptString(user.name, aesKey, aesIV);
              const updatedName = decryptedName.replace(' (Quadrant Technologies)', '');
              return updatedName && typeof updatedName === 'string' ? updatedName : null;
            } catch (error) {
              console.error(`Error decrypting name for user ${user.userId}:`, error);
              return null;
            }
          })
          .filter((name) => name != null)
          .sort();

        setManagers(decryptedNames);
        console.log('Decrypted manager names:', decryptedNames);
      } catch (err) {
        console.error('Error fetching managers:', err);
        setError('Failed to load manager options.');
        setManagers([]);
      }
    };

    fetchManagers();
  }, [selectedSubDepartment, isAuthenticated, acquireToken, aesKey, aesIV]);

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setIsDepartmentOpen(false);
    setSelectedSubDepartment('');
    setSelectedManager('');
  };

  const handleSubDepartmentSelect = (subDepartment) => {
    setSelectedSubDepartment(subDepartment);
    setIsSubDepartmentOpen(false);
    setSelectedManager('');
  };

  const handleManagerSelect = (manager) => {
    setSelectedManager(manager);
    setIsManagerOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedDepartment || !selectedSubDepartment || !selectedManager) {
      setError('Please select all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const departmentData = {
        department: selectedDepartment,
        subDepartment: selectedSubDepartment,
        manager: selectedManager,
      };

      // Store department data in localStorage
      localStorage.setItem('userDepartmentData', JSON.stringify(departmentData));
      // Set a flag to indicate department selection is completed
      localStorage.setItem('departmentSelectionCompleted', 'true');

      const token = await acquireToken('api');
      await apiClient.post(`/User/${user?.id}/department`, departmentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Department selection saved:', departmentData);

      const primaryRole = getPrimaryRole();
      const navigationMap = {
        admin: '/admin',
        manager: '/manager',
        user: '/tasks',
      };
      const destination = navigationMap[primaryRole] || '/dashboard';
      
      // Remove beforeunload listener before navigating
      window.removeEventListener('beforeunload', () => {});
      
      navigate(destination, { replace: true });
    } catch (error) {
      console.error('Error saving department selection:', error);
      setError(
        error.response?.status === 401
          ? 'Authentication failed. Please log in again.'
          : 'Failed to save department selection. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = async () => {
    console.log('User wants to go back - logging out for security');
    // Since department selection is mandatory and going back would bypass the requirement,
    // we log the user out to maintain security and proper flow
    try {
      // Remove beforeunload listener before logout
      window.removeEventListener('beforeunload', () => {});
      
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation to login even if logout fails
      navigate('/login', { replace: true });
    }
  };

  const DropdownButton = ({
    isOpen,
    toggle,
    selected,
    placeholder,
    options,
    onSelect,
    disabled = false,
    ariaLabel,
  }) => {
    const validOptions = Array.isArray(options) ? options : [];
    if (!Array.isArray(options)) {
      console.warn("DropdownButton: 'options' prop is not an array", options);
    } else if (options.some((opt) => typeof opt !== 'string')) {
      console.warn("DropdownButton: 'options' contains non-string values", options);
    }

    return (
      <div className="relative w-full">
        <button
          onClick={toggle}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          className={`w-full px-4 py-3 text-left bg-white border border-violet-300 rounded-lg shadow-sm hover:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
            disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
              {selected || placeholder}
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                disabled ? 'text-gray-300' : 'text-gray-400'
              }`}
            />
          </div>
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute z-10 w-full mt-1 bg-white border border-violet-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
          >
            <div className="py-1">
              {validOptions.length > 0 ? (
                validOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(option)}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:bg-violet-50 focus:text-violet-700 transition-colors"
                    role="option"
                    aria-selected={selected === option}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No options available</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-violet-50 min-h-screen">
      <style>
        {`
          /* Ensure dropdown transitions are smooth and don't affect layout */
          .dropdown-container {
            transition: all 0.2s ease-in-out;
          }
          /* Prevent layout shifts during dropdown open/close */
          .dropdown-list {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
          }
        `}
      </style>
      <div className="bg-white rounded-xl shadow-lg p-8 border border-violet-100 min-h-[450px] flex flex-col">
        <h1 className="text-2xl font-bold text-violet-800 mb-2 text-center">
          Welcome! Complete Your Profile
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Please select your department information to get started
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isLoadingOptions ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            Loading options...
          </div>
        ) : (
          <div className="space-y-6 flex-1 dropdown-container">
            {/* Department Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <DropdownButton
                isOpen={isDepartmentOpen}
                toggle={() => setIsDepartmentOpen(!isDepartmentOpen)}
                selected={selectedDepartment}
                placeholder="Select Department"
                options={departments}
                onSelect={handleDepartmentSelect}
                ariaLabel="Select Department"
              />
            </div>

            {/* Sub-Department Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Department <span className="text-red-500">*</span>
              </label>
              <DropdownButton
                isOpen={isSubDepartmentOpen}
                toggle={() => setIsSubDepartmentOpen(!isSubDepartmentOpen)}
                selected={selectedSubDepartment}
                placeholder="Select Sub-Department"
                options={subDepartments}
                onSelect={handleSubDepartmentSelect}
                disabled={!selectedDepartment}
                ariaLabel="Select Sub-Department"
              />
            </div>

            {/* Manager Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager <span className="text-red-500">*</span>
              </label>
              <DropdownButton
                isOpen={isManagerOpen}
                toggle={() => setIsManagerOpen(!isManagerOpen)}
                selected={selectedManager}
                placeholder="Select Manager"
                options={managers}
                onSelect={handleManagerSelect}
                disabled={!selectedSubDepartment}
                ariaLabel="Select Manager"
              />
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {selectedDepartment && (
          <div className="mt-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">Current Selection:</h3>
            <div className="space-y-1 text-sm text-violet-700">
              <p>
                <span className="font-medium">Department:</span> {selectedDepartment}
              </p>
              {selectedSubDepartment && (
                <p>
                  <span className="font-medium">Sub-Department:</span> {selectedSubDepartment}
                </p>
              )}
              {selectedManager && (
                <p>
                  <span className="font-medium">Manager:</span> {selectedManager}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700 transition-all"
            aria-label="Go back to login"
          >
            Back to Login
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedDepartment ||
              !selectedSubDepartment ||
              !selectedManager ||
              isSubmitting ||
              isLoadingOptions
            }
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              selectedDepartment &&
              selectedSubDepartment &&
              selectedManager &&
              !isSubmitting &&
              !isLoadingOptions
                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Continue to User View"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Complete Setup</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelector;