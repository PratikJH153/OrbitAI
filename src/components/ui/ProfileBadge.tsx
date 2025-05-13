import React from 'react';
import { motion } from 'framer-motion';
import useStore from '@/store/useStore';
import Link from 'next/link';

const ProfileBadge: React.FC = () => {
  const { userProfile } = useStore();

  return (
    <Link href="/profile" className="flex items-center space-x-2 cursor-pointer">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50"
      >
        <img
          src={userProfile.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=orbit"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div>
        <p className="text-sm font-medium">{userProfile.name}</p>
        <p className="text-xs text-foreground/70">Level {userProfile.level}</p>
      </div>
    </Link>
  );
};

export default ProfileBadge;
