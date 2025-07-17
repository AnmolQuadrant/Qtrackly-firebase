import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
 
const ErrorMessage = ({ message }) => (
  <motion.div
    className="flex items-center justify-center py-8 text-red-600 bg-red-50 rounded-lg border border-red-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <AlertCircle className="h-5 w-5 mr-2" />
    <span>{message}</span>
  </motion.div>
);
 
export default ErrorMessage;