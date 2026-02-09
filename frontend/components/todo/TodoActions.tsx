'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface TodoActionsProps {
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  clearCompleted: () => void;
  activeCount: number;
  completedCount: number;
  loading?: boolean;
}

const TodoActions: React.FC<TodoActionsProps> = ({
  filter,
  onFilterChange,
  clearCompleted,
  activeCount,
  completedCount,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border"
      role="toolbar"
      aria-label="Task actions toolbar"
    >
      <div className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-full" tabIndex={0}>
        {activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining
      </div>

      <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Task filters">
        {(['all', 'active', 'completed'] as const).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(filterOption)}
            disabled={loading}
            className={`px-3 ${
              filter === filterOption
                ? 'gradient-hero text-white font-semibold border-0'
                : 'font-normal'
            }`}
            aria-label={
              filterOption === 'all'
                ? `Show all tasks (${activeCount + completedCount} total)`
                : filterOption === 'active'
                ? `Show active tasks (${activeCount} remaining)`
                : `Show completed tasks (${completedCount} completed)`
            }
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={clearCompleted}
        disabled={loading || completedCount === 0}
        className="text-destructive hover:text-destructive/80"
        aria-label={`Clear ${completedCount} completed tasks`}
      >
        Clear Completed
      </Button>
    </motion.div>
  );
};

export default TodoActions;
