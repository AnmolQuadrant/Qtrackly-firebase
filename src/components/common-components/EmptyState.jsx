import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
 
const EmptyState = () => (
  <motion.div
    className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <BarChart3 className="mx-auto h-12 w-12 mb-4 text-gray-300" />
    <p className="text-lg font-medium">No data available</p>
    <p className="text-sm">Try selecting a different time period or team.</p>
  </motion.div>
);
 
export default EmptyState;