import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useStore from '@/store/useStore';
import { Priority } from '@/types';

interface TaskFormProps {
  assignmentId: string;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ assignmentId, onClose }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState('');

  const addTask = useStore((state) => state.addTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    addTask(assignmentId, title, priority);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass p-4 rounded-xl w-full mb-4"
    >
      <h3 className="text-lg font-medium mb-3">Add New Task</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
        />
        
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">
            Priority
          </label>
          <div className="flex space-x-2">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                  priority === p
                    ? p === 'low'
                      ? 'bg-green-500/20 text-green-300'
                      : p === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                    : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                }`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            size="sm"
          >
            Add Task
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default TaskForm;
