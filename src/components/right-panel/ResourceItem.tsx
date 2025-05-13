import React from 'react';
import { motion } from 'framer-motion';
import { Resource } from '@/types';
import Card from '../ui/Card';

interface ResourceItemProps {
  resource: Resource;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ resource }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 hover:border-primary/30" hover>
        <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
        <div
          className="text-sm text-foreground/80 mb-2"
          dangerouslySetInnerHTML={{ __html: resource.content }}
        />

        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Learn more →
          </a>
        )}
      </Card>
    </motion.div>
  );
};

export default ResourceItem;
