import React from 'react';
import { motion } from 'framer-motion';

export const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <motion.p 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-wider"
    >
      {message}
    </motion.p>
  );
};
