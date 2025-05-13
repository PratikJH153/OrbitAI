import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@/store/useStore';
import confetti from 'canvas-confetti';

interface RewardAnimationProps {
  points: number;
}

const RewardAnimation: React.FC<RewardAnimationProps> = ({ points }) => {
  const { setShowRewardAnimation } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Trigger confetti effect when component mounts
  useEffect(() => {
    // Create confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Play confetti sound
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sound/confetti-sound.mp3');
      audioRef.current.volume = 0.5; // Set volume to 50%
      audioRef.current.play().catch(err => {
        // Handle autoplay restrictions
        console.log('Audio playback failed:', err);
      });
    }
    
    // Hide animation after 2.5 seconds
    const timer = setTimeout(() => {
      setShowRewardAnimation(false);
    }, 2500);
    
    return () => {
      clearTimeout(timer);
      // Stop audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [setShowRewardAnimation]);
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-background p-8 rounded-xl text-center border border-primary/20 shadow-lg p-50"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ 
            scale: 1, 
            y: 0,
            transition: { 
              type: "spring", 
              stiffness: 300, 
              damping: 15 
            } 
          }}
          exit={{ scale: 0.5, y: 50 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: 1,
              transition: { delay: 0.2, duration: 0.5 }
            }}
          >
            <h2 className="text-2xl font-bold mb-2">Task Completed!</h2>
            <div className="text-4xl font-bold text-primary mb-2">+{points}</div>
            <p className="text-foreground/70">points earned</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RewardAnimation;
