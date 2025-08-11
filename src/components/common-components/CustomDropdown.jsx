
 import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
 
// Context to manage open dropdown
const DropdownContext = createContext({
  openDropdown: null,
  setOpenDropdown: () => {},
});
 
export function DropdownProvider({ children }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  return (
    <DropdownContext.Provider value={{ openDropdown, setOpenDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
}
 
const CustomDropdown = ({ value, options, onChange, icon: Icon, className }) => {
  const { openDropdown, setOpenDropdown } = useContext(DropdownContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownId = useRef(`dropdown-${Math.random().toString(36).substr(2, 9)}`).current;
 
  // Toggle dropdown and close others
  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
      setOpenDropdown(null);
    } else {
      setIsOpen(true);
      setOpenDropdown(dropdownId);
    }
  };
 
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenDropdown(null);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
 
  // Sync local isOpen with global openDropdown state
  useEffect(() => {
    setIsOpen(openDropdown === dropdownId);
  }, [openDropdown, dropdownId]);
 
  return (
    <motion.div
      className={`relative ${className || 'min-w-[150px]'}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={dropdownRef}
    >
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 w-full h-10"
        type="button"
        title={value}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {Icon && <Icon size={16} className="text-gray-500 shrink-0" />}
          <span className="text-sm font-medium text-gray-700 truncate">{value}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-500 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg z-20"
          >
            {options.map((option) => (
              <motion.button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setOpenDropdown(null);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                type="button"
                whileHover={{ backgroundColor: '#f3f4f6' }}
                title={option}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
 
export default CustomDropdown;
 