import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Assignment } from '@/types';
import useStore from '@/store/useStore';

interface AssignmentItemProps {
  assignment: Assignment;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => {
  const { selectAssignment, selectedAssignment } = useStore();
  const isSelected = selectedAssignment?.id === assignment.id;
  
  const completedTasks = assignment.tasks.filter(task => task.completed).length;
  const totalTasks = assignment.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const formattedDate = format(new Date(assignment.dueDate), 'MMM dd, yyyy');
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`glass p-4 rounded-xl cursor-pointer transition-all ${
        isSelected ? 'border-primary border-2' : 'border-glass-border'
      }`}
      onClick={() => selectAssignment(assignment.id)}
    >
      <h3 className="font-semibold text-lg mb-1 truncate">{assignment.title}</h3>
      
      <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
        {assignment.description || 'No description'}
      </p>
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center">
          <span className="text-foreground/70">Due: </span>
          <span className="ml-1 font-medium">{formattedDate}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-foreground/70">Tasks: </span>
          <span className="ml-1 font-medium">{completedTasks}/{totalTasks}</span>
        </div>
      </div>
      
      <div className="mt-2 bg-white/10 h-1.5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default AssignmentItem;
