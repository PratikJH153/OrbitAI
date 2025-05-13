import React from 'react';
import { motion } from 'framer-motion';

interface ThinkingWidgetProps {
  className?: string;
}

const ThinkingWidget: React.FC<ThinkingWidgetProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className="relative w-20 h-20 mb-4">
        {/* Circular thinking animation */}
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
        
        {/* Inner pulsing circle */}
        <motion.div
          className="absolute inset-4 bg-emerald-500/20 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.p 
        className="text-emerald-400 font-medium"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Orbit is speaking...
      </motion.p>
    </div>
  );
};

export default ThinkingWidget;
