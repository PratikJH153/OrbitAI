import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import Button from '../ui/Button';
import Card from '../ui/Card';
import AssignmentForm from './AssignmentForm';
import AssignmentItem from './AssignmentItem';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import RewardAnimation from '../ui/RewardAnimation';
import useStore from '@/store/useStore';

const LeftPanel: React.FC = () => {
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const { assignments, selectedAssignment, showRewardAnimation, lastPointsEarned } = useStore();

  return (
    <div className="h-full flex flex-col">
      {/* Show reward animation when a task is completed */}
      {showRewardAnimation && <RewardAnimation points={lastPointsEarned} />}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAssignmentForm(true)}
        >
          <FaPlus className="mr-1" size={12} />
          New
        </Button>
      </div>

      <AnimatePresence>
        {showAssignmentForm && (
          <AssignmentForm onClose={() => setShowAssignmentForm(false)} />
        )}
      </AnimatePresence>

      {!showAssignmentForm && (
        <>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4">
            {assignments.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-foreground/70">No Tasks yet</p>
                <p className="text-sm text-foreground/50 mt-1">
                  Create your first task to get started
                </p>
              </Card>
            ) : (
              assignments.map((assignment) => (
                <AssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                />
              ))
            )}
          </div>

          {selectedAssignment && (
            <div className="mt-auto">
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Tasks for {selectedAssignment.title}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTaskForm(true)}
                  >
                    <FaPlus size={10} />
                    Task
                  </Button>
                </div>

                <AnimatePresence>
                  {showTaskForm && (
                    <TaskForm
                      assignmentId={selectedAssignment.id}
                      onClose={() => setShowTaskForm(false)}
                    />
                  )}
                </AnimatePresence>

                <div className="min-h-[400px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {selectedAssignment.tasks.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-foreground/50 text-center py-4"
                      >
                        No tasks yet
                      </motion.p>
                    ) : (
                      selectedAssignment.tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          assignmentId={selectedAssignment.id}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeftPanel;
