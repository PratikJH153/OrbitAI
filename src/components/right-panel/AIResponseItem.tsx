import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIResponse } from '@/types';
import Card from '../ui/Card';
import ImageLoader from '../ui/ImageLoader';
import ProblemResponseItem from './ProblemResponseItem';
import ThinkingWidget from './ThinkingWidget';
import ActionVisualizer from './ActionVisualizer';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useStore from '@/store/useStore';

interface AIResponseItemProps {
  response: AIResponse;
  isAISpeaking?: boolean;
}

const AIResponseItem: React.FC<AIResponseItemProps> = ({ response, isAISpeaking = false }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const { updateStreamingResponse } = useStore();

  // Simulate streaming effect for streaming responses
  useEffect(() => {
    // Only run the streaming effect if this is not a problem response and is streaming
    if (!response.isProblemResponse && response.isStreaming) {
      // Different content based on the response content
      let streamingInfo: string[] = [];
      let stageAdvancePoints: number[] = [];

      if (response.content.includes("centrifugal force")) {
        // Centrifugal force content
        streamingInfo = [
          " Centrifugal force is a fictitious force that appears to act on objects moving in a circular path, pulling them away from the center of the circle. ",
          "It's not a real force in the sense of Newton's laws, but rather an apparent force that arises in rotating reference frames. ",
          "When an object moves in a circular path, it constantly changes direction, which means it's accelerating toward the center of the circle. ",
          "This acceleration is caused by a real force called centripetal force. ",
          "The centrifugal force is what we feel pushing us outward when we're in a spinning car or amusement park ride. ",
          "It's the result of our body's inertia trying to keep us moving in a straight line while the vehicle moves in a circle. ",
          "Applications of centrifugal force include centrifuges used in laboratories, washing machines, and even the design of curved roads and railway tracks. ",
          "The formula for centrifugal force is F = mω²r, where m is mass, ω is angular velocity, and r is the radius of the circular path."
        ];
        stageAdvancePoints = [2, 5, 7]; // After these indices, advance to next stage
      } else if (response.content.includes("problem")) {
        // Problem analysis content
        streamingInfo = [
          " I can see this is a projectile motion problem. ",
          "Let me analyze what we're looking at here. ",
          "This diagram shows an object being launched at an angle and following a parabolic trajectory. ",
          "The key variables we need to consider are the initial velocity, launch angle, and gravitational acceleration. ",
          "For projectile motion, we can separate the motion into horizontal and vertical components. ",
          "The horizontal component of velocity remains constant (assuming no air resistance). ",
          "The vertical component is affected by gravity, causing the parabolic path. "
        ];
        stageAdvancePoints = [1]; // Show image after the second segment
      } else {
        // Default content
        streamingInfo = [
          " Let me think about this... ",
          "I'm analyzing the information... ",
          "Here's what I can tell you... "
        ];
        stageAdvancePoints = [1]; // Show image after the second segment
      }

      let index = 0;
      const streamingInterval = setInterval(() => {
        if (index < streamingInfo.length) {
          // Check if we should advance to the next stage
          const shouldAdvanceStage = stageAdvancePoints.includes(index);

          updateStreamingResponse(streamingInfo[index], shouldAdvanceStage);
          index++;
        } else {
          clearInterval(streamingInterval);
        }
      }, 1200); // Slightly faster for better user experience

      return () => clearInterval(streamingInterval);
    }
  }, [response.isProblemResponse, response.isStreaming, response.content, updateStreamingResponse]);

  // If this is a problem response, render the ProblemResponseItem
  if (response.isProblemResponse) {
    return <ProblemResponseItem content={response.content} reasoning={response.reasoning} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card>
        <AnimatePresence mode="wait">
          {response.isStreaming && !isAISpeaking ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ThinkingWidget />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Display the text content */}
              <p className="text-lg mb-3">
                {response.jsonResponse ? response.jsonResponse.text : response.content}
                {response.isStreaming && <span className="animate-pulse">|</span>}
              </p>

              {/* Display action visualizer if there are actions */}
              {response.jsonResponse && response.jsonResponse.actions && (
                <ActionVisualizer jsonResponse={response.jsonResponse} />
              )}

              {response.images && response.images.length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-4">
                  {(response.streamingStage ?? 0) >= 1 && (
                    <motion.div
                      key="image-1"
                      className="rounded-lg overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ImageLoader
                        src={response.images[0]}
                        alt="Problem illustration 1"
                        className="w-full h-auto"
                      />
                    </motion.div>
                  )}

                  {(response.streamingStage ?? 0) >= 2 && response.images.length > 1 && (
                    <motion.div
                      key="image-2"
                      className="rounded-lg overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ImageLoader
                        src={response.images[1]}
                        alt="Problem illustration 2"
                        className="w-full h-auto"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {response.hasVideo && response.videoUrl && (response.streamingStage ?? 0) >= 3 && (
                <motion.div
                  className="mb-4 rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <iframe
                    width="100%"
                    height="200"
                    src={response.videoUrl}
                    title="YouTube video player"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </motion.div>
              )}

              {response.reasoning && (
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
                        {response.reasoning}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default AIResponseItem;
