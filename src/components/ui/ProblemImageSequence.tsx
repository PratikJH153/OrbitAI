import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProblemImageSequenceProps {
  onComplete?: () => void;
}

const ProblemImageSequence: React.FC<ProblemImageSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'analyze' | 'loading' | 'main'>('analyze');
  
  useEffect(() => {
    // After 3 seconds, show the loading overlay
    const analyzeTimer = setTimeout(() => {
      setStage('loading');
      
      // After 2 seconds of loading, show the main problem
      const loadingTimer = setTimeout(() => {
        setStage('main');
        if (onComplete) {
          onComplete();
        }
      }, 2000);
      
      return () => clearTimeout(loadingTimer);
    }, 3000);
    
    return () => clearTimeout(analyzeTimer);
  }, [onComplete]);
  
  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      {/* Analysis image */}
      <AnimatePresence>
        {stage === 'analyze' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <img 
              src="/problem/analyze_problem.jpg" 
              alt="Problem Analysis" 
              className="w-full h-auto rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading overlay */}
      <AnimatePresence>
        {stage === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg"
          >
            <div className="relative w-24 h-24">
              {/* Circular loading animation */}
              <motion.div
                className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "linear" 
                  },
                  scale: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                }}
              />
              <motion.div
                className="absolute inset-0 border-t-4 border-emerald-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1,
                  ease: "linear" 
                }}
              />
            </div>
            <p className="mt-3 text-sm text-emerald-400 font-medium">Analyzing problem...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main problem image */}
      <AnimatePresence>
        {stage === 'main' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <img 
              src="/problem/main_problem.jpg" 
              alt="Main Problem" 
              className="w-full h-auto rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProblemImageSequence;
