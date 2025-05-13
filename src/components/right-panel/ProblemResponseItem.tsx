import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import ProblemImageSequence from '../ui/ProblemImageSequence';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface ProblemResponseItemProps {
  content: string;
  reasoning?: string;
}

const ProblemResponseItem: React.FC<ProblemResponseItemProps> = ({ content, reasoning }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  // Simulate streaming effect for the text
  useEffect(() => {
    if (!analysisComplete) return;
    
    const analysisText = [
      "I've analyzed the problem in detail. ",
      "This is a projectile motion problem involving an object launched at an angle. ",
      "The key variables are initial velocity, launch angle, and gravitational acceleration. ",
      "We need to calculate the maximum height and range of the projectile. ",
      "Let's break this down step by step..."
    ];
    
    let index = 0;
    let currentText = '';
    
    const streamingInterval = setInterval(() => {
      if (index < analysisText.length) {
        currentText += analysisText[index];
        setStreamingText(currentText);
        index++;
      } else {
        clearInterval(streamingInterval);
      }
    }, 1200);
    
    return () => clearInterval(streamingInterval);
  }, [analysisComplete]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card>
        <p className="text-sm mb-3">
          {content}
          {!analysisComplete && <span className="animate-pulse">|</span>}
        </p>
        
        <div className="mb-4">
          <ProblemImageSequence onComplete={() => setAnalysisComplete(true)} />
        </div>
        
        {analysisComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm mb-3"
          >
            {streamingText}
            <span className="animate-pulse">|</span>
          </motion.p>
        )}
        
        {reasoning && (
          <div className="mb-3">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center text-xs text-foreground/70 hover:text-foreground transition-colors"
            >
              {showReasoning ? (
                <>
                  <FaChevronUp className="mr-1" size={10} />
                  Hide reasoning
                </>
              ) : (
                <>
                  <FaChevronDown className="mr-1" size={10} />
                  Show reasoning
                </>
              )}
            </button>
            
            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-xs text-foreground/70 bg-white/5 p-2 rounded"
                >
                  {reasoning}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ProblemResponseItem;
