"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import useStore from '@/store/useStore';
import {
  FaTrash, FaBook, FaChartLine, FaStar, FaTasks, FaGraduationCap,
  FaFlag, FaCalendarAlt, FaCompass, FaTrophy, FaCode, FaDatabase,
  FaServer, FaCloud, FaReact, FaPython, FaJs, FaPalette
} from 'react-icons/fa';
import { SessionNote } from '@/types';

const ProfilePage: React.FC = () => {
  const { userProfile, deleteSessionNote, assignments } = useStore();
  const [activeTab, setActiveTab] = useState<'notes' | 'progress' | 'points' | 'tasks'>('notes');

  const renderNotes = () => {
    if (!userProfile.notes || userProfile.notes.length === 0) {
      return (
        <div className="text-center py-10">
          <FaBook className="mx-auto text-4xl text-foreground/30 mb-4" />
          <p className="text-foreground/50">No session notes yet</p>
          <p className="text-sm text-foreground/30 mt-2">
            Complete a session with Orbit and save your notes to see them here
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userProfile.notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={deleteSessionNote} />
        ))}
      </div>
    );
  };

  const renderProgress = () => {
    const { learningProgress } = userProfile;
    const subjects = learningProgress?.subjects || {};
    const subjectEntries = Object.entries(subjects);
    const skills = learningProgress?.skills || [];
    const learningPath = learningProgress?.learningPath || [];
    const weeklyActivity = learningProgress?.weeklyActivity || [];

    if (subjectEntries.length === 0) {
      return (
        <div className="text-center py-10">
          <FaChartLine className="mx-auto text-4xl text-foreground/30 mb-4" />
          <p className="text-foreground/50">No learning progress yet</p>
          <p className="text-sm text-foreground/30 mt-2">
            Complete sessions with Orbit to track your learning progress
          </p>
        </div>
      );
    }

    // Helper function to get icon component by name
    const getIconComponent = (iconName: string) => {
      const iconMap: Record<string, React.ReactNode> = {
        'FaFlag': <FaFlag />,
        'FaCalendarAlt': <FaCalendarAlt />,
        'FaCompass': <FaCompass />,
        'FaStar': <FaStar />,
        'FaTrophy': <FaTrophy />
      };
      return iconMap[iconName] || <FaStar />;
    };

    // Helper function to get skill icon by category
    const getSkillIcon = (category: string) => {
      const categoryMap: Record<string, React.ReactNode> = {
        'Programming': <FaCode />,
        'Frontend': <FaReact />,
        'Backend': <FaServer />,
        'Database': <FaDatabase />,
        'Cloud': <FaCloud />,
        'AI': <FaPython />,
        'Design': <FaPalette />
      };
      return categoryMap[category] || <FaCode />;
    };

    return (
      <div className="space-y-6">
        {/* Learning Stats */}
        <div className="glass p-4 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Learning Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-4 rounded-lg text-center">
              <p className="text-foreground/70 text-sm">Total Hours</p>
              <p className="text-2xl font-bold text-primary">{learningProgress?.totalHours || 0}</p>
            </div>
            <div className="glass p-4 rounded-lg text-center">
              <p className="text-foreground/70 text-sm">Sessions</p>
              <p className="text-2xl font-bold text-primary">{userProfile.completedSessions || 0}</p>
            </div>
            <div className="glass p-4 rounded-lg text-center">
              <p className="text-foreground/70 text-sm">Streak</p>
              <p className="text-2xl font-bold text-primary">{learningProgress?.streak || 0} days</p>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="glass p-4 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Weekly Activity</h3>
          <div className="flex justify-between items-end h-24 mb-2">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                <div className="text-xs text-foreground/70 mb-1">{format(parseISO(day.date), 'EEE')}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.intensity * 25)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`w-8 rounded-t-md ${
                    day.intensity === 0
                      ? 'bg-white/5'
                      : day.intensity === 1
                        ? 'bg-primary/30'
                        : day.intensity === 2
                          ? 'bg-primary/50'
                          : day.intensity === 3
                            ? 'bg-primary/70'
                            : 'bg-primary'
                  }`}
                />
                <div className="text-xs mt-1 text-foreground/70">{day.hours}h</div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div className="glass p-4 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Learning Path</h3>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/10 z-0"></div>

            {/* Milestones */}
            <div className="space-y-6 relative z-10">
              {learningPath.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-start space-x-4 ${milestone.completed ? '' : 'opacity-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.completed ? 'bg-primary text-white' : 'bg-white/10 text-foreground/50'
                  }`}>
                    {getIconComponent(milestone.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{milestone.title}</h4>
                      {milestone.completed && (
                        <span className="text-xs text-foreground/70">
                          {format(parseISO(milestone.date!), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/70">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="glass p-4 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-primary">
                    {getSkillIcon(skill.category)}
                  </div>
                  <div>
                    <h4 className="font-medium">{skill.name}</h4>
                    <p className="text-xs text-foreground/70">{skill.category}</p>
                  </div>
                </div>
                <div className="bg-white/10 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-foreground/70">Beginner</span>
                  <span className="text-xs text-primary font-medium">{skill.level}%</span>
                  <span className="text-xs text-foreground/70">Expert</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subjects with enhanced UI */}
        <div className="glass p-4 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Subjects</h3>
          <div className="space-y-4">
            {subjectEntries.map(([subject, data], index) => (
              <motion.div
                key={subject}
                className="glass p-3 rounded-lg space-y-2 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">{subject}</p>
                  <p className="text-sm text-foreground/70">
                    Last studied: {format(parseISO(data.lastStudied), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-white/10 h-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.progress}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        data.progress < 30
                          ? 'bg-red-500'
                          : data.progress < 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    />
                  </div>

                  {/* Milestone markers */}
                  <div className="absolute top-0 left-1/4 w-0.5 h-3 bg-white/30"></div>
                  <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-white/30"></div>
                  <div className="absolute top-0 left-3/4 w-0.5 h-3 bg-white/30"></div>

                  {/* Progress percentage */}
                  <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {data.progress}
                  </div>
                </div>

                <div className="flex justify-between text-xs text-foreground/70 mt-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                  <span>Expert</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPoints = () => {
    return (
      <div className="space-y-6">
        <div className="glass p-6 rounded-xl text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <div className="w-28 h-28 rounded-full glass flex items-center justify-center">
                <div>
                  <p className="text-4xl font-bold">{userProfile.points}</p>
                  <p className="text-sm text-foreground/70">points</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center">
              {userProfile.level}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium">Level {userProfile.level}</h3>
            <p className="text-sm text-foreground/70 mt-1">
              {50 - (userProfile.points % 50)} points until next level
            </p>
          </div>

          <div className="mt-4 bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(userProfile.points % 50) * 2}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AchievementCard
              title="First Session"
              icon={<FaGraduationCap />}
              unlocked={(userProfile.completedSessions || 0) > 0}
            />
            <AchievementCard
              title="Note Taker"
              icon={<FaBook />}
              unlocked={(userProfile.notes?.length || 0) >= 5}
            />
            <AchievementCard
              title="Task Master"
              icon={<FaTasks />}
              unlocked={userProfile.points >= 100}
            />
            <AchievementCard
              title="Scholar"
              icon={<FaStar />}
              unlocked={userProfile.level >= 3}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    if (assignments.length === 0) {
      return (
        <div className="text-center py-10">
          <FaTasks className="mx-auto text-4xl text-foreground/30 mb-4" />
          <p className="text-foreground/50">No assignments yet</p>
          <p className="text-sm text-foreground/30 mt-2">
            Create assignments and tasks to track your progress
          </p>
        </div>
      );
    }

    // Calculate overall completion percentage
    const totalTasks = assignments.reduce((acc, assignment) => acc + assignment.tasks.length, 0);
    const completedTasks = assignments.reduce(
      (acc, assignment) => acc + assignment.tasks.filter(task => task.completed).length,
      0
    );
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="glass p-4 rounded-xl">
          <h3 className="text-lg font-medium mb-2">Overall Progress</h3>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-foreground/70">
              {completedTasks} of {totalTasks} tasks completed
            </p>
            <p className="text-sm font-medium">{Math.round(completionPercentage)}%</p>
          </div>
          <div className="bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          {assignments.map(assignment => {
            const assignmentCompletedTasks = assignment.tasks.filter(task => task.completed).length;
            const assignmentTotalTasks = assignment.tasks.length;
            const assignmentProgress = assignmentTotalTasks > 0
              ? (assignmentCompletedTasks / assignmentTotalTasks) * 100
              : 0;

            return (
              <div key={assignment.id} className="glass p-4 rounded-xl">
                <h4 className="font-medium">{assignment.title}</h4>
                <p className="text-sm text-foreground/70 mb-2">{assignment.description}</p>

                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-foreground/70">
                    {assignmentCompletedTasks} of {assignmentTotalTasks} tasks
                  </p>
                  <p className="text-xs font-medium">
                    Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div className="bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${assignmentProgress}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <img
              src={userProfile.avatar}
              alt="User avatar"
              className="w-20 h-20 rounded-full border-2 border-primary"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center">
              {userProfile.level}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold">{userProfile.name}</h2>
            <div className="flex items-center space-x-1">
              <span className="text-primary font-semibold">{userProfile.points}</span>
              <span className="text-foreground/70">points</span>
              <span className="mx-2">•</span>
              <span className="text-foreground/70">{userProfile.completedSessions || 0} sessions</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <TabButton
            active={activeTab === 'notes'}
            onClick={() => setActiveTab('notes')}
            icon={<FaBook />}
            label="Notes"
          />
          <TabButton
            active={activeTab === 'progress'}
            onClick={() => setActiveTab('progress')}
            icon={<FaChartLine />}
            label="Progress"
          />
          <TabButton
            active={activeTab === 'points'}
            onClick={() => setActiveTab('points')}
            icon={<FaStar />}
            label="Points"
          />
          <TabButton
            active={activeTab === 'tasks'}
            onClick={() => setActiveTab('tasks')}
            icon={<FaTasks />}
            label="Tasks"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'notes' && renderNotes()}
          {activeTab === 'progress' && renderProgress()}
          {activeTab === 'points' && renderPoints()}
          {activeTab === 'tasks' && renderTasks()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface NoteCardProps {
  note: SessionNote;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      className="glass p-4 rounded-xl relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setShowDelete(true)}
      onHoverEnd={() => setShowDelete(false)}
    >
      <h3 className="font-medium mb-1">{note.title}</h3>
      <p className="text-xs text-foreground/70 mb-2">
        {format(new Date(note.date), 'MMM dd, yyyy')}
      </p>

      <p className="text-sm line-clamp-3">{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20"
            onClick={() => onDelete(note.id)}
          >
            <FaTrash size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-white/5 text-foreground/70 hover:bg-white/10'
      }`}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

interface AchievementCardProps {
  title: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ title, icon, unlocked }) => {
  return (
    <div className={`glass p-3 rounded-lg text-center ${
      unlocked ? 'border-primary/50 border' : 'opacity-50'
    }`}>
      <div className={`text-2xl mb-2 ${unlocked ? 'text-primary' : 'text-foreground/50'}`}>
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-foreground/70">
        {unlocked ? 'Unlocked' : 'Locked'}
      </p>
    </div>
  );
};

export default ProfilePage;
