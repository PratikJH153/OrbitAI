import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import useStore from '@/store/useStore';
import { FaCheck, FaTrash, FaStar } from 'react-icons/fa';

interface TaskItemProps {
  task: Task;
  assignmentId: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, assignmentId }) => {
  const [showCompletionEffect, setShowCompletionEffect] = useState(false);
  const { toggleTaskCompletion, deleteTask } = useStore();

  const priorityColors = {
    low: 'bg-green-500/20 text-green-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    high: 'bg-red-500/20 text-red-300',
  };

  // Handle task completion with animation
  const handleTaskCompletion = () => {
    // Only show animation when completing a task, not when uncompleting
    if (!task.completed) {
      setShowCompletionEffect(true);

      // Hide the effect after animation completes
      setTimeout(() => {
        setShowCompletionEffect(false);
      }, 1000);
    }

    // Toggle task completion in the store
    toggleTaskCompletion(assignmentId, task.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="glass p-3 rounded-lg flex items-center justify-between mb-2"
    >
      <div className="flex items-center flex-1">
        <button
          onClick={handleTaskCompletion}
          className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 border ${
            task.completed
              ? 'bg-primary border-primary'
              : 'border-glass-border bg-white/5'
          }`}
        >
          {task.completed && <FaCheck className="text-xs text-white" />}
        </button>

        <div className="flex-1 relative">
          <p className={`text-sm ${task.completed ? 'line-through text-foreground/50' : ''}`}>
            {task.title}
          </p>

          {/* Task completion animation */}
          <AnimatePresence>
            {showCompletionEffect && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-1 text-yellow-400">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {/* Points badge */}
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
          {task.points || 0} pts
        </span>

        <button
          onClick={() => deleteTask(assignmentId, task.id)}
          className="text-foreground/50 hover:text-red-400 transition-colors"
        >
          <FaTrash size={12} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;
