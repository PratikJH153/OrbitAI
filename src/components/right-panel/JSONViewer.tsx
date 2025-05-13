import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface JSONViewerProps {
  data: any;
  className?: string;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Format the JSON with proper indentation
  const formattedJSON = JSON.stringify(data, null, 2);

  return (
    <div className={`mt-4 ${className}`}>
      <button
        onClick={toggleExpand}
        className="flex items-center text-xs text-foreground/70 hover:text-foreground transition-colors mb-2"
      >
        {isExpanded ? (
          <>
            <FaChevronUp className="mr-1" size={10} />
            Hide JSON Response
          </>
        ) : (
          <>
            <FaChevronDown className="mr-1" size={10} />
            Show JSON Response
          </>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <pre className="text-xs bg-black/30 p-3 rounded-lg overflow-x-auto max-h-60 overflow-y-auto">
              <code className="text-emerald-400">{formattedJSON}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JSONViewer;
