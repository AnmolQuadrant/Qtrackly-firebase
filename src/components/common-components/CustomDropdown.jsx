import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
 
const CustomDropdown = ({ value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      className="relative min-w-[150px]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 w-full"
        type="button"
      >
        {Icon && <Icon size={16} className="text-gray-500" />}
        <span className="text-sm font-medium text-gray-700 truncate">{value}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
            {options.map(option => (
              <motion.button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                type="button"
                whileHover={{ backgroundColor: '#f3f4f6' }}
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
 