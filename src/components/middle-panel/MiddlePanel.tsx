import React from 'react';
import AIAnimation from './AIAnimation';
import ChatInterface from './ChatInterface';

interface MiddlePanelProps {
  onShowActionPlan?: () => void;
  onGroupProjectQuestion?: () => void;
  onAddTask?: (title: string, priority: 'low' | 'medium' | 'high') => void;
  onCompleteTask?: () => void;
  onShowProblem?: () => void;
  onShowResources?: () => void;
  onCloseSession?: () => void;
}

const MiddlePanel: React.FC<MiddlePanelProps> = ({
  onShowActionPlan,
  onGroupProjectQuestion,
  onAddTask,
  onCompleteTask,
  onShowProblem,
  onShowResources,
  onCloseSession
}) => {
  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex-1 flex items-center justify-center">
        <AIAnimation />
      </div>

      <div className="mt-auto">
        <ChatInterface
          onShowActionPlan={onShowActionPlan}
          onGroupProjectQuestion={onGroupProjectQuestion}
          onAddTask={onAddTask}
          onCompleteTask={onCompleteTask}
          onShowProblem={onShowProblem}
          onShowResources={onShowResources}
          onCloseSession={onCloseSession}
        />
      </div>
    </div>
  );
};

export default MiddlePanel;
