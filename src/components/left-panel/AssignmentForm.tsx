import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import useStore from '@/store/useStore';

interface AssignmentFormProps {
  onClose: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    dueDate: '',
  });

  const addAssignment = useStore((state) => state.addAssignment);

  const validateForm = () => {
    const newErrors = {
      title: '',
      dueDate: '',
    };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      addAssignment(title, description, dueDate);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass p-6 rounded-xl w-full"
    >
      <h2 className="text-xl font-semibold mb-4">New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
        
        <TextArea
          label="Description"
          placeholder="Enter assignment description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
          >
            Create Assignment
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AssignmentForm;
