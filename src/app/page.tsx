"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import ProfileBadge from '@/components/ui/ProfileBadge';
import { Navbar, addMapTab } from '@/components/ui/Navbar';
import useStore from '@/store/useStore';

// Dynamically import components to avoid hydration issues
const LeftPanel = dynamic(() => import("@/components/left-panel/LeftPanel"), {
  ssr: false,
});
const MiddlePanel = dynamic(() => import("@/components/middle-panel/MiddlePanel"), {
  ssr: false,
});
const RightPanel = dynamic(() => import("@/components/right-panel/RightPanel"), {
  ssr: false,
});
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
});
const SessionEndPrompt = dynamic(() => import("@/components/ui/SessionEndPrompt"), {
  ssr: false,
});
const WelcomeScreen = dynamic(() => import("@/components/welcome/WelcomeScreen"), {
  ssr: false,
});

export default function Home() {
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showProblem, setShowProblem] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const { activeTabIndex, addTask, toggleTaskCompletion, setRightPanelVisible } = useStore();

  // Function to handle showing the action plan
  const handleShowActionPlan = () => {
    setShowActionPlan(true);
  };

  // Function to hide the action plan
  const handleHideActionPlan = () => {
    setShowActionPlan(false);
  };

  // Function to handle group project questions and show map
  const handleGroupProjectQuestion = () => {
    // Add the map tab if it doesn't exist
    addMapTab();
  };

  // Function to handle adding a task
  const handleAddTask = (title: string, priority: 'low' | 'medium' | 'high') => {
    // Find the first assignment or create one if none exists
    const assignments = useStore.getState().assignments;
    if (assignments.length > 0) {
      const assignmentId = assignments[0].id;
      addTask(assignmentId, title, priority);
    } else {
      // Create a new assignment first, then add the task
      useStore.getState().addAssignment(
        "Today's Tasks",
        "Tasks for today",
        new Date().toISOString()
      );
      // Get the newly created assignment
      const newAssignmentId = useStore.getState().assignments[0].id;

      // Now add the task to the new assignment
      addTask(newAssignmentId, title, priority);
    }
  };

  // Function to handle completing a task
  const handleCompleteTask = () => {
    // Find the first incomplete task and complete it
    const assignments = useStore.getState().assignments;
    if (assignments.length > 0) {
      const assignment = assignments[0];
      const incompleteTasks = assignment.tasks.filter(task => !task.completed);

      if (incompleteTasks.length > 0) {
        toggleTaskCompletion(assignment.id, incompleteTasks[0].id);
      }
    }
  };

  // Function to handle showing a problem
  const handleShowProblem = () => {
    setRightPanelVisible(true);
    setShowProblem(true);
    setShowResources(false);

    // Add a problem image to the right panel
    useStore.getState().addAIResponse(
      "Here's the physics problem you're working on:",
      [
        {
          id: '1',
          title: 'Physics Problem',
          content: 'This problem involves calculating the trajectory of a projectile.',
        }
      ],
      "Showing the physics problem",
      false,
      false,
      undefined,
      ["https://www.physicsclassroom.com/Class/vectors/u3l2a4.gif"]
    );
  };

  // Function to handle showing resources
  const handleShowResources = () => {
    setRightPanelVisible(true);
    setShowResources(true);
    setShowProblem(false);

    // Add resources to the right panel with highlighted formulas
    useStore.getState().addAIResponse(
      "Here are some resources that might help you:",
      [
        {
          id: '1',
          title: 'Projectile Motion Formulas',
          content: 'In projectile motion, the relationship between velocity (v), displacement (d), and time (t) is described by kinematic equations. For constant velocity in the x-direction, the displacement is <span class="font-bold text-primary">d = v * t</span>. In the y-direction, where gravity acts, the displacement is <span class="font-bold text-primary">d = v₀ * t + (1/2) * a * t²</span>, where v₀ is the initial velocity, and a is the acceleration due to gravity.',
        },
        {
          id: '2',
          title: 'Visual Representation',
          content: '<div class="mt-2 mb-2"><img src="https://s3-us-west-2.amazonaws.com/courses-images/wp-content/uploads/sites/5667/2021/08/21163018/3-4-6.jpeg" alt="Projectile Motion Diagram" class="rounded-lg w-full" /></div>',
        },
        {
          id: '3',
          title: 'Additional Resources',
          content: 'For more detailed explanations and examples of projectile motion problems',
          url: 'https://www.khanacademy.org/science/physics/two-dimensional-motion/two-dimensional-projectile-mot/a/what-is-projectile-motion'
        }
      ],
      "Showing educational resources on projectile motion",
      false,
      true,
      "https://www.youtube.com/embed/fvS9ZGk_HlY"
    );
  };

  // Function to handle Enter key press on welcome screen
  const handleEnterPress = () => {
    setShowWelcome(false);
  };

  // Function to handle closing the session and showing welcome screen
  const handleCloseSession = () => {
    setShowWelcome(true);
  };

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <WelcomeScreen onEnter={handleEnterPress} />
        </motion.div>
      ) : (
        <motion.div
          key="main-interface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen p-6"
        >
          <header className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-white">
              Welcome Back, Michael!
            </h1>
            <ProfileBadge />
          </header>

          <Navbar />

          <main className="relative h-[calc(100vh-200px)]">
            {activeTabIndex === 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 h-full transition-all duration-500"
                  style={{
                    marginLeft: showActionPlan ? '520px' : '0',
                    width: showActionPlan ? 'calc(100% - 520px)' : '100%'
                  }}
                >
                  <section className="glass p-6 rounded-xl overflow-hidden">
                    <MiddlePanel
                      onShowActionPlan={handleShowActionPlan}
                      onGroupProjectQuestion={handleGroupProjectQuestion}
                      onAddTask={handleAddTask}
                      onCompleteTask={handleCompleteTask}
                      onShowProblem={handleShowProblem}
                      onShowResources={handleShowResources}
                      onCloseSession={handleCloseSession}
                    />
                  </section>

                  <AnimatePresence>
                    <section className="glass p-6 rounded-xl overflow-hidden">
                      <RightPanel />
                    </section>
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {showActionPlan && (
                    <motion.div
                      initial={{ x: -350, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -350, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-0 left-0 h-full w-[500px]"
                    >
                      <div className="glass p-6 rounded-xl overflow-hidden h-full">
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={handleHideActionPlan}
                            className="text-foreground/50 hover:text-foreground transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <LeftPanel />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : activeTabIndex === 1 ? (
              <MapView />
            ) : null}
          </main>

          {/* Session End Prompt */}
          <SessionEndPrompt />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
