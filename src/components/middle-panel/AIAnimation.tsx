import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '@/store/useStore';

const AIAnimation: React.FC = () => {
  const isAIListening = useStore((state) => state.isAIListening);
  const [mood, setMood] = useState<'happy' | 'thinking' | 'surprised'>('happy');

  // Change mood randomly when listening
  useEffect(() => {
    if (isAIListening) {
      const moods: Array<'happy' | 'thinking' | 'surprised'> = ['happy', 'thinking', 'surprised'];
      const interval = setInterval(() => {
        setMood(moods[Math.floor(Math.random() * moods.length)]);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setMood('happy');
    }
  }, [isAIListening]);

  // Animation variants for the circular AI
  const circleVariants = {
    idle: {
      y: [0, -8, 0],
      scale: [1, 1.03, 1],
      rotate: [0, 3, 0, -3, 0],
      transition: {
        y: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        scale: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    listening: {
      y: [0, -12, 0],
      scale: [1, 1.08, 1],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        y: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        scale: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  };

  // Animation variants for the particles
  const particleVariants = {
    idle: (i: number) => ({
      opacity: [0, 0.7, 0],
      y: [0, -30 - (i * 5)],
      x: [0, (i % 2 === 0 ? 15 : -15) * (1 + i * 0.2)],
      transition: {
        duration: 2 + i * 0.3,
        repeat: Infinity,
        ease: "easeOut",
        delay: i * 0.4
      }
    }),
    listening: (i: number) => ({
      opacity: [0, 0.9, 0],
      y: [0, -50 - (i * 8)],
      x: [0, (i % 2 === 0 ? 25 : -25) * (1 + i * 0.3)],
      transition: {
        duration: 1.2 + i * 0.2,
        repeat: Infinity,
        ease: "easeOut",
        delay: i * 0.2
      }
    })
  };

  // Animation variants for the wave
  const waveVariants = {
    idle: {
      opacity: 0.3
    },
    listening: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Animation variants for the wave bars
  const barVariants = {
    idle: {
      height: "20%"
    },
    listening: (i: number) => ({
      height: ["20%", "90%", "40%", "70%", "20%"],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.1
      }
    })
  };

  // Eye expressions based on mood
  const renderEyes = () => {
    switch (mood) {
      case 'happy':
        return (
          <div className="absolute w-full px-8 top-1/3 flex justify-between">
            <motion.div 
              className="w-7 h-7 rounded-full bg-black flex items-center justify-center"
              animate={{ 
                scaleY: isAIListening ? [1, 0.6, 1] : [1, 0.8, 1],
                transition: {
                  duration: isAIListening ? 1 : 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white absolute top-1 right-1"></div>
            </motion.div>
            <motion.div 
              className="w-7 h-7 rounded-full bg-black flex items-center justify-center"
              animate={{ 
                scaleY: isAIListening ? [1, 0.6, 1] : [1, 0.8, 1],
                transition: {
                  duration: isAIListening ? 1 : 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white absolute top-1 right-1"></div>
            </motion.div>
          </div>
        );
      case 'thinking':
        return (
          <div className="absolute w-full px-8 top-1/3 flex justify-between">
            <motion.div 
              className="w-7 h-7 bg-black rounded-full"
              animate={{ 
                scaleX: [1, 1.2, 1],
                scaleY: [1, 0.7, 1],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
            <motion.div 
              className="w-8 h-8 flex items-center justify-center"
              animate={{ 
                rotate: [0, -10, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="w-7 h-2 bg-black rounded-full"></div>
            </motion.div>
          </div>
        );
      case 'surprised':
        return (
          <div className="absolute w-full px-8 top-1/3 flex justify-between">
            <motion.div 
              className="w-8 h-8 rounded-full border-4 border-black bg-white"
              animate={{ 
                scale: [1, 1.15, 1],
                transition: {
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
            <motion.div 
              className="w-8 h-8 rounded-full border-4 border-black bg-white"
              animate={{ 
                scale: [1, 1.15, 1],
                transition: {
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Mouth expressions based on mood and listening state
  const renderMouth = () => {
    if (isAIListening) {
      return (
        <motion.div 
          className="w-12 h-12 rounded-full bg-black"
          animate={{ 
            scaleY: [0.3, 0.7, 0.3],
            scaleX: [0.8, 0.9, 0.8],
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      );
    }
    
    switch (mood) {
      case 'happy':
        return (
          <motion.div 
            className="w-16 h-8 overflow-hidden relative"
            animate={{ 
              scaleX: [1, 1.1, 1],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="w-16 h-16 rounded-full border-4 border-black absolute bottom-0"></div>
          </motion.div>
        );
      case 'thinking':
        return (
          <motion.div 
            className="w-8 h-2 bg-black rounded-full"
            animate={{ 
              x: [0, 5, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        );
      case 'surprised':
        return (
          <motion.div 
            className="w-10 h-10 rounded-full border-4 border-black" 
            animate={{ 
              scale: [1, 1.1, 1],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex items-center justify-center h-full">
      <div className="relative w-80 h-80">
        {/* Particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-400 rounded-full opacity-0"
            style={{
              boxShadow: '0 0 8px rgba(52, 211, 153, 0.7)',
            }}
            custom={i}
            variants={particleVariants}
            animate={isAIListening ? "listening" : "idle"}
          />
        ))}

        {/* Circular character */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48"
          variants={circleVariants}
          animate={isAIListening ? "listening" : "idle"}
        >
          {/* Main circle body */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-emerald-700 shadow-lg"
               style={{
                 boxShadow: '0 0 20px rgba(52, 211, 153, 0.7), inset 0 -10px 15px rgba(0,0,0,0.2), inset 0 10px 15px rgba(255,255,255,0.3)',
               }}>
            
            {/* Eyes */}
            {renderEyes()}

            {/* Mouth */}
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 flex justify-center">
              {renderMouth()}
            </div>

            {/* Blush spots */}
            <div className="absolute w-full px-6 top-1/2 flex justify-between">
              <div className="w-6 h-3 rounded-full bg-pink-400 opacity-60"></div>
              <div className="w-6 h-3 rounded-full bg-pink-400 opacity-60"></div>
            </div>
          </div>

          {/* Text label */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-center w-full">
            <p className="font-bold text-xl mb-1" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>Orbit AI</p>
            <p className="text-sm opacity-90 font-mono">
              {isAIListening ? "Listening..." : "Ready to help!"}
            </p>
          </div>
        </motion.div>

        {/* Audio wave visualization */}
        <motion.div
          className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 flex items-end space-x-1 h-16 w-48"
          variants={waveVariants}
          animate={isAIListening ? "listening" : "idle"}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-3 bg-emerald-400 rounded-full"
              style={{
                height: "20%",
                boxShadow: '0 0 8px rgba(52, 211, 153, 0.7)',
              }}
              custom={i}
              variants={barVariants}
              animate={isAIListening ? "listening" : "idle"}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AIAnimation;