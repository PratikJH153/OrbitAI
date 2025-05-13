"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProfilePage from '@/components/profile/ProfilePage';
import { FaArrowLeft } from 'react-icons/fa';

export default function Profile() {
  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-foreground/70 hover:text-foreground transition-colors">
            <FaArrowLeft />
            <span>Back to Orbit AI</span>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-white">
            My Profile
          </h1>
        </div>
      </header>

      <main className="glass p-6 rounded-xl overflow-hidden">
        <ProfilePage />
      </main>
    </div>
  );
}