"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import useStore from '@/store/useStore';

interface NavbarProps {
  onTabChange?: (index: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onTabChange }) => {
  const { tabs, activeTabIndex, setActiveTabIndex, addTab } = useStore();

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Only trigger if 'm' is pressed without modifiers and not in an input field
        if (event.key === 'm' && !event.ctrlKey && !event.altKey &&
            !event.metaKey && document.activeElement?.tagName !== 'INPUT') {
              if (activeTabIndex !== 0) {
                setActiveTabIndex(0);
              }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, ); // Add dependencies to ensure we have the latest state


  return (
    <div className="glass mb-4 rounded-xl overflow-hidden">
      <Tab.Group selectedIndex={activeTabIndex} onChange={handleTabChange}>
        <Tab.List className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                `w-full py-3 text-base font-medium leading-6 rounded-lg transition-all
                ${selected
                  ? 'bg-primary text-white shadow'
                  : 'text-foreground/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {tab.title}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  );
};

// Export these functions so they can be used elsewhere
export const addMapTab = () => {
  // Get the store directly to avoid closure issues
  const store = useStore.getState();
  store.addTab('map', 'Team Map');
};

export { Navbar, type NavbarProps };
