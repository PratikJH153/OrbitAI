import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '@/store/useStore';
import ResourceItem from './ResourceItem';
import AIResponseItem from './AIResponseItem';
import Card from '../ui/Card';
import { Maximize2, Minimize2 } from 'lucide-react';

const RightPanel: React.FC = () => {
  const { aiResponses, isRightPanelVisible, isPlayingAudio } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasImages, setHasImages] = useState(false);

  // Get the latest AI response
  const latestResponse = aiResponses.length > 0 ? aiResponses[aiResponses.length - 1] : null;

  // Check if response contains images
  useEffect(() => {
    if (latestResponse) {
      // Check if the response content or resources contain images
      // This assumes there's some way to detect images in your response structure
      // Adjust this logic based on your actual data structure
      const hasImagesInContent = latestResponse.content?.includes('<img') || false;
      const hasImagesInResources = latestResponse.resources?.some(r => r.content.includes('<img')) || false;
      setHasImages(hasImagesInContent || hasImagesInResources);
    } else {
      setHasImages(false);
    }
  }, [latestResponse]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isRightPanelVisible) {
    return null;
  }

  return (
    <motion.div
      className={`h-full flex flex-col ${isExpanded ? 'fixed right-0 z-50 w-3/4 bg-background shadow-xl p-6' : ''}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">AI Insights</h2>
        {hasImages && (
          <button
            onClick={toggleExpand}
            className="p-1 rounded-md hover:bg-secondary"
            aria-label={isExpanded ? "Minimize panel" : "Expand panel"}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <AnimatePresence>
          { !latestResponse ? (
            <Card className="p-6 text-center">
              <p className="text-foreground/70">No insights yet</p>
              <p className="text-sm text-foreground/50 mt-1">
                Ask the AI a question to get started
              </p>
            </Card>
          ) : (
            <>
              <AIResponseItem response={latestResponse} isAISpeaking={isPlayingAudio} />

              {latestResponse.resources && latestResponse.resources.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-3">Resources</h3>

                  {latestResponse.resources.map((resource) => (
                    <ResourceItem key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RightPanel;
