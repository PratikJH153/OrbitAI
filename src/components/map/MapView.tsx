"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const MapView: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass p-4 rounded-xl w-full h-full max-h-full overflow-hidden flex flex-col"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Team Location Map</h2>
        <div className="relative flex-grow w-full h-full">
          <Image
            src="/MAP/map.png"
            alt="Team Location Map"
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-lg"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
};

export default MapView;
