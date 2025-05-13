import React from 'react';
import { motion } from 'framer-motion';
import { AIResponse } from '@/types';
import { FaListAlt, FaCheckCircle, FaQuestion, FaBook, FaUsers, FaPlus, FaSignOutAlt } from 'react-icons/fa';

interface ActionVisualizerProps {
  jsonResponse: AIResponse['jsonResponse'];
}

const ActionVisualizer: React.FC<ActionVisualizerProps> = ({ jsonResponse }) => {
  if (!jsonResponse || !jsonResponse.actions) {
    return null;
  }

  const { actions } = jsonResponse;

  // Check if any actions are true
  const hasActions = Object.values(actions).some(value =>
    value === true || (typeof value === 'object' && value !== null)
  );

  if (!hasActions) {
    return null;
  }

  return (
    <div className="mt-4 mb-2">
      <h3 className="text-sm font-medium mb-2 text-emerald-400">Actions Triggered:</h3>
      <div className="flex flex-wrap gap-2">
        {actions.showActionPanel && (
          <ActionBadge icon={<FaListAlt />} label="Show Action Panel" />
        )}

        {actions.addTask && (
          <ActionBadge
            icon={<FaPlus />}
            label={`Add Task: ${actions.addTask.title} (${actions.addTask.priority})`}
          />
        )}

        {actions.completeTask && (
          <ActionBadge icon={<FaCheckCircle />} label="Complete Task" />
        )}

        {actions.showProblem && (
          <ActionBadge icon={<FaQuestion />} label="Show Problem" />
        )}

        {actions.showResources && (
          <ActionBadge icon={<FaBook />} label="Show Resources" />
        )}

        {actions.openTeamMap && (
          <ActionBadge icon={<FaUsers />} label="Open Team Map" />
        )}

        {actions.closeSessionPrompt && (
          <ActionBadge icon={<FaSignOutAlt />} label="Close Session" />
        )}
      </div>
    </div>
  );
};

const ActionBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full"
    >
      <span className="mr-1">{icon}</span>
      <span>{label}</span>
    </motion.div>
  );
};

export default ActionVisualizer;
