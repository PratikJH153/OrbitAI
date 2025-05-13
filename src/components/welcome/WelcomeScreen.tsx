import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import AIAnimation from '../middle-panel/AIAnimation';
import Button from '../ui/Button';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  // Add keyboard event listener for Enter key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEnter]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Minecraft-style dirt blocks border */}
      <div className="absolute top-0 left-0 w-full h-8 bg-dirt-dark border-b-4 border-wood-dark"></div>
      <div className="absolute bottom-0 left-0 w-full h-8 bg-dirt-dark border-t-4 border-wood-dark"></div>
      <div className="absolute top-8 left-0 w-8 h-[calc(100%-16px)] bg-dirt-dark border-r-4 border-wood-dark"></div>
      <div className="absolute top-8 right-0 w-8 h-[calc(100%-16px)] bg-dirt-dark border-l-4 border-wood-dark"></div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16 z-10"
      >
        <h1 className="text-6xl font-bold mb-4 text-accent  mt-25" style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #3b2616' }}>
          ORBIT STUDY ROOM
        </h1>
        <div className="glass p-4 max-w-xl mx-auto">
          <p className="text-xl text-foreground">
            Your AI-powered learning companion for academic success
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="flex-1 flex flex-col items-center justify-center z-10"
      >
        <div className="glass p-8 mb-8 border-4 border-wood-dark">
          <AIAnimation />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-8"
        >
          {/* <p className="text-foreground mb-4">Press <span className="font-semibold text-accent">Enter</span> to continue</p>
          <Button
            variant="primary"
            size="lg"
            onClick={onEnter}
            className="px-8 py-3 text-lg uppercase font-bold"
          >
            Start Adventure
          </Button> */}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
