"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave, FaTimes } from 'react-icons/fa';
import useStore from '@/store/useStore';
import Input from './Input';

const SessionEndPrompt: React.FC = () => {
  const { sessionEndPrompt, hideSessionEndPrompt, saveSessionNotes } = useStore();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionEndPrompt.show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sessionEndPrompt.show]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    setSaving(true);
    
    // Simulate saving animation
    setTimeout(() => {
      saveSessionNotes(title);
      setSaving(false);
      setTitle('');
    }, 1500);
  };

  const handleCancel = () => {
    hideSessionEndPrompt();
    setTitle('');
  };

  if (!sessionEndPrompt.show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass p-6 rounded-xl w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Save Session Notes?</h2>
            <p className="text-foreground/70">
              Would you like to save the notes from this session to your profile?
            </p>
          </div>
          
          <div className="mb-6">
            <Input
              ref={inputRef}
              label="Session Title"
              placeholder="Enter a title for your notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4"
            />
            
            <div className="bg-white/5 p-3 rounded-lg max-h-40 overflow-y-auto text-sm text-foreground/70">
              <p>{sessionEndPrompt.sessionContent.substring(0, 200)}...</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <FaSave />
              )}
              <span>{saving ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>
          
          {saving && (
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5 }}
              className="mt-4 h-1 bg-primary rounded-full"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionEndPrompt;
