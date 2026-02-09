'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6 p-4 bg-muted rounded-full"
      >
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" aria-hidden="true" />
      </motion.div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
      <p className="text-foreground mb-1">
        Get started by creating your first task
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Your tasks will appear here once you add them
      </p>
    </motion.div>
  );
};

export default EmptyState;
