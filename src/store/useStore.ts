import { create } from 'zustand';
import { Assignment, Task, AIResponse, UserProfile, Tab, SessionNote, LearningProgress, SessionEndPrompt } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIMessage } from '@/lib/openai';

interface StoreState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  aiResponses: AIResponse[];
  isAIListening: boolean;
  isRightPanelVisible: boolean;
  userProfile: UserProfile;
  showRewardAnimation: boolean;
  lastPointsEarned: number;
  tabs: Tab[];
  activeTabIndex: number;
  showMap: boolean;
  sessionEndPrompt: SessionEndPrompt;
  conversationHistory: OpenAIMessage[];
  isPlayingAudio: boolean;

  // Assignment actions
  addAssignment: (title: string, description: string, dueDate: string) => void;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  selectAssignment: (id: string) => void;

  // Task actions
  addTask: (assignmentId: string, title: string, priority: Task['priority']) => void;
  updateTask: (assignmentId: string, task: Task) => void;
  deleteTask: (assignmentId: string, taskId: string) => void;
  toggleTaskCompletion: (assignmentId: string, taskId: string) => void;

  // AI actions
  setAIListening: (isListening: boolean) => void;
  setRightPanelVisible: (isVisible: boolean) => void;
  addAIResponse: (
    content: string,
    resources?: AIResponse['resources'],
    reasoning?: string,
    isStreaming?: boolean,
    hasVideo?: boolean,
    videoUrl?: string,
    images?: string[],
    streamingStage?: number,
    isProblemResponse?: boolean,
    jsonResponse?: AIResponse['jsonResponse']
  ) => void;
  updateStreamingResponse: (content: string, advanceStage?: boolean) => void;
  addToConversationHistory: (message: OpenAIMessage) => void;
  clearConversationHistory: () => void;
  setIsPlayingAudio: (isPlaying: boolean) => void;

  // Tab actions
  addTab: (id: string, title: string) => void;
  removeTab: (id: string) => void;
  setActiveTabIndex: (index: number) => void;
  setShowMap: (show: boolean) => void;

  // User profile actions
  addPoints: (points: number) => void;
  setShowRewardAnimation: (show: boolean) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Session notes actions
  addSessionNote: (title: string, content: string) => void;
  deleteSessionNote: (id: string) => void;
  updateLearningProgress: (subject: string, progress: number, hours: number) => void;

  // Session end actions
  showSessionEndPrompt: (sessionContent: string) => void;
  hideSessionEndPrompt: () => void;
  saveSessionNotes: (title: string) => void;
}

// Create the store
const useStore = create<StoreState>((set) => ({
  assignments: [],
  selectedAssignment: null,
  aiResponses: [],
  isAIListening: false,
  isRightPanelVisible: false,
  conversationHistory: [],
  isPlayingAudio: false,
  userProfile: {
    points: 135,
    level: 3,
    name: 'Student',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=orbit',
    notes: [],
    learningProgress: {
      subjects: {
        'Machine Learning': {
          progress: 68,
          lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        'Web Development': {
          progress: 85,
          lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        'Data Science': {
          progress: 42,
          lastStudied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        'Mobile Development': {
          progress: 25,
          lastStudied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
        },
        'Cloud Computing': {
          progress: 55,
          lastStudied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        }
      },
      skills: [
        { name: 'JavaScript', level: 80, category: 'Programming' },
        { name: 'Python', level: 65, category: 'Programming' },
        { name: 'React', level: 75, category: 'Frontend' },
        { name: 'Node.js', level: 60, category: 'Backend' },
        { name: 'SQL', level: 50, category: 'Database' },
        { name: 'AWS', level: 40, category: 'Cloud' },
        { name: 'TensorFlow', level: 30, category: 'AI' },
        { name: 'UI/UX', level: 70, category: 'Design' }
      ],
      learningPath: [
        {
          id: '1',
          title: 'Getting Started',
          description: 'Complete your first learning session',
          completed: true,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          icon: 'FaFlag'
        },
        {
          id: '2',
          title: 'Consistent Learner',
          description: 'Maintain a 3-day streak',
          completed: true,
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          icon: 'FaCalendarAlt'
        },
        {
          id: '3',
          title: 'Knowledge Explorer',
          description: 'Study 3 different subjects',
          completed: true,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          icon: 'FaCompass'
        },
        {
          id: '4',
          title: 'Skill Master',
          description: 'Reach 70% in any subject',
          completed: false,
          icon: 'FaStar'
        },
        {
          id: '5',
          title: 'Learning Champion',
          description: 'Complete 10 learning sessions',
          completed: false,
          icon: 'FaTrophy'
        }
      ],
      weeklyActivity: [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), hours: 1.5, intensity: 2 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), hours: 2.0, intensity: 3 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), hours: 0.5, intensity: 1 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), hours: 0, intensity: 0 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), hours: 3.0, intensity: 4 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), hours: 1.0, intensity: 2 },
        { date: new Date().toISOString(), hours: 0.5, intensity: 1 }
      ],
      totalHours: 42,
      streak: 3
    },
    completedSessions: 8
  },
  showRewardAnimation: false,
  lastPointsEarned: 0,
  tabs: [{ id: 'orbit', title: 'OrbitAI', active: true }],
  activeTabIndex: 0,
  showMap: false,
  sessionEndPrompt: {
    show: false,
    sessionContent: ''
  },

  // Assignment actions
  addAssignment: (title, description, dueDate) => set((state) => {
    const newAssignment: Assignment = {
      id: uuidv4(),
      title,
      description,
      dueDate,
      tasks: [],
    };

    return {
      assignments: [...state.assignments, newAssignment],
      selectedAssignment: newAssignment,
    };
  }),

  updateAssignment: (updatedAssignment) => set((state) => ({
    assignments: state.assignments.map((assignment) =>
      assignment.id === updatedAssignment.id ? updatedAssignment : assignment
    ),
    selectedAssignment: state.selectedAssignment?.id === updatedAssignment.id
      ? updatedAssignment
      : state.selectedAssignment,
  })),

  deleteAssignment: (id) => set((state) => ({
    assignments: state.assignments.filter((assignment) => assignment.id !== id),
    selectedAssignment: state.selectedAssignment?.id === id
      ? null
      : state.selectedAssignment,
  })),

  selectAssignment: (id) => set((state) => ({
    selectedAssignment: state.assignments.find((assignment) => assignment.id === id) || null,
  })),

  // Task actions
  addTask: (assignmentId, title, priority) => set((state) => {
    // Calculate points based on priority
    const pointValues = {
      low: 5,
      medium: 10,
      high: 15
    };

    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      priority,
      points: pointValues[priority],
    };

    const updatedAssignments = state.assignments.map((assignment) => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          tasks: [...assignment.tasks, newTask],
        };
      }
      return assignment;
    });

    const updatedSelectedAssignment = state.selectedAssignment?.id === assignmentId
      ? {
          ...state.selectedAssignment,
          tasks: [...state.selectedAssignment.tasks, newTask],
        }
      : state.selectedAssignment;

    return {
      assignments: updatedAssignments,
      selectedAssignment: updatedSelectedAssignment,
    };
  }),

  updateTask: (assignmentId, updatedTask) => set((state) => {
    const updatedAssignments = state.assignments.map((assignment) => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          tasks: assignment.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        };
      }
      return assignment;
    });

    const updatedSelectedAssignment = state.selectedAssignment?.id === assignmentId
      ? {
          ...state.selectedAssignment,
          tasks: state.selectedAssignment.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        }
      : state.selectedAssignment;

    return {
      assignments: updatedAssignments,
      selectedAssignment: updatedSelectedAssignment,
    };
  }),

  deleteTask: (assignmentId, taskId) => set((state) => {
    const updatedAssignments = state.assignments.map((assignment) => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          tasks: assignment.tasks.filter((task) => task.id !== taskId),
        };
      }
      return assignment;
    });

    const updatedSelectedAssignment = state.selectedAssignment?.id === assignmentId
      ? {
          ...state.selectedAssignment,
          tasks: state.selectedAssignment.tasks.filter((task) => task.id !== taskId),
        }
      : state.selectedAssignment;

    return {
      assignments: updatedAssignments,
      selectedAssignment: updatedSelectedAssignment,
    };
  }),

  toggleTaskCompletion: (assignmentId, taskId) => set((state) => {
    // Find the task to check if it's being completed or uncompleted
    const task = state.assignments
      .find(a => a.id === assignmentId)?.tasks
      .find(t => t.id === taskId);

    if (!task) return state;

    // Check if the task is being completed (not already completed)
    const isCompleting = !task.completed;
    const pointsToAward = isCompleting ? (task.points || 0) : 0;

    const updatedAssignments = state.assignments.map((assignment) => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          tasks: assignment.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        };
      }
      return assignment;
    });

    const updatedSelectedAssignment = state.selectedAssignment?.id === assignmentId
      ? {
          ...state.selectedAssignment,
          tasks: state.selectedAssignment.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        }
      : state.selectedAssignment;

    // If completing the task, update points and trigger animation
    if (isCompleting && pointsToAward > 0) {
      const currentPoints = state.userProfile.points;
      const newPoints = currentPoints + pointsToAward;

      // Calculate level (1 level per 50 points)
      const newLevel = Math.floor(newPoints / 50) + 1;

      return {
        assignments: updatedAssignments,
        selectedAssignment: updatedSelectedAssignment,
        userProfile: {
          ...state.userProfile,
          points: newPoints,
          level: newLevel,
        },
        showRewardAnimation: true,
        lastPointsEarned: pointsToAward,
      };
    }

    return {
      assignments: updatedAssignments,
      selectedAssignment: updatedSelectedAssignment,
    };
  }),

  // AI actions
  setAIListening: (isListening) => set({ isAIListening: isListening }),

  setRightPanelVisible: (isVisible) => set({ isRightPanelVisible: isVisible }),

  addAIResponse: (content, resources, reasoning, isStreaming, hasVideo, videoUrl, images, streamingStage = 0, isProblemResponse = false, jsonResponse) => set((state) => ({
    aiResponses: [
      ...state.aiResponses,
      {
        id: uuidv4(),
        content,
        resources,
        reasoning,
        isStreaming,
        hasVideo,
        videoUrl,
        images,
        streamingStage,
        isProblemResponse,
        jsonResponse,
      },
    ],
    // Don't automatically set isRightPanelVisible to true here
    // Let ChatInterface control this state
  })),

  updateStreamingResponse: (content, advanceStage = false) => set((state) => {
    const responses = [...state.aiResponses];
    if (responses.length > 0) {
      const lastResponse = responses[responses.length - 1];
      if (lastResponse.isStreaming) {
        const currentStage = lastResponse.streamingStage || 0;
        const newStage = advanceStage ? currentStage + 1 : currentStage;

        // Check if this is a problem-related response
        const isProblemResponse = lastResponse.content.includes("problem");

        // For problem responses, replace the content after the initial prompt
        // For other responses, append the content
        let newContent;
        if (isProblemResponse) {
          // Keep only the initial prompt and replace the rest
          const initialPrompt = "Let me take a look at your problem...";
          newContent = initialPrompt + content;
        } else {
          // For other responses, append as before
          newContent = lastResponse.content + content;
        }

        responses[responses.length - 1] = {
          ...lastResponse,
          content: newContent,
          streamingStage: newStage,
        };
      }
    }
    return { aiResponses: responses };
  }),

  // User profile actions
  addPoints: (points) => set((state) => {
    const currentPoints = state.userProfile.points;
    const newPoints = currentPoints + points;

    // Calculate level (1 level per 50 points)
    const newLevel = Math.floor(newPoints / 50) + 1;

    return {
      userProfile: {
        ...state.userProfile,
        points: newPoints,
        level: newLevel,
      },
      showRewardAnimation: true,
      lastPointsEarned: points,
    };
  }),

  setShowRewardAnimation: (show) => set({
    showRewardAnimation: show
  }),

  updateUserProfile: (profile) => set((state) => ({
    userProfile: {
      ...state.userProfile,
      ...profile,
    }
  })),

  // Tab actions
  addTab: (id, title) => set((state) => {
    // Check if tab already exists
    if (state.tabs.some(tab => tab.id === id)) {
      // If it exists, just set it as active
      const updatedTabs = state.tabs.map(tab => ({
        ...tab,
        active: tab.id === id
      }));

      // Find the index of the tab to activate
      const tabIndex = updatedTabs.findIndex(tab => tab.id === id);

      return {
        tabs: updatedTabs,
        activeTabIndex: tabIndex >= 0 ? tabIndex : state.activeTabIndex
      };
    }

    // Otherwise add a new tab
    const newTab = { id, title, active: true };
    const updatedTabs = state.tabs.map(tab => ({
      ...tab,
      active: false
    }));

    return {
      tabs: [...updatedTabs, newTab],
      activeTabIndex: updatedTabs.length
    };
  }),

  removeTab: (id) => set((state) => {
    // Don't remove the last tab
    if (state.tabs.length <= 1) return {};

    const tabIndex = state.tabs.findIndex(tab => tab.id === id);
    if (tabIndex === -1) return {};

    const newTabs = state.tabs.filter(tab => tab.id !== id);

    // If we're removing the active tab, set the first tab as active
    let newActiveIndex = state.activeTabIndex;
    if (tabIndex === state.activeTabIndex) {
      newActiveIndex = 0;
    } else if (tabIndex < state.activeTabIndex) {
      // If we're removing a tab before the active one, adjust the index
      newActiveIndex--;
    }

    return {
      tabs: newTabs,
      activeTabIndex: newActiveIndex
    };
  }),

  setActiveTabIndex: (index) => set({
    activeTabIndex: index
  }),

  setShowMap: (show) => set({
    showMap: show
  }),

  // Session notes actions
  addSessionNote: (title, content) => set((state) => {
    const newNote: SessionNote = {
      id: uuidv4(),
      title,
      content,
      date: new Date().toISOString(),
      tags: []
    };

    const updatedNotes = [...(state.userProfile.notes || []), newNote];
    const completedSessions = (state.userProfile.completedSessions || 0) + 1;

    return {
      userProfile: {
        ...state.userProfile,
        notes: updatedNotes,
        completedSessions
      },
      // Add points for completing a session
      showRewardAnimation: true,
      lastPointsEarned: 20
    };
  }),

  deleteSessionNote: (id) => set((state) => {
    const updatedNotes = (state.userProfile.notes || []).filter(note => note.id !== id);

    return {
      userProfile: {
        ...state.userProfile,
        notes: updatedNotes
      }
    };
  }),

  updateLearningProgress: (subject, progress, hours) => set((state) => {
    const currentProgress = state.userProfile.learningProgress || {
      subjects: {},
      totalHours: 0,
      streak: 0
    };

    const updatedSubjects = {
      ...currentProgress.subjects,
      [subject]: {
        progress,
        lastStudied: new Date().toISOString()
      }
    };

    return {
      userProfile: {
        ...state.userProfile,
        learningProgress: {
          ...currentProgress,
          subjects: updatedSubjects,
          totalHours: currentProgress.totalHours + hours
        }
      }
    };
  }),

  // Session end actions
  showSessionEndPrompt: (sessionContent) => set({
    sessionEndPrompt: {
      show: true,
      sessionContent
    }
  }),

  hideSessionEndPrompt: () => set({
    sessionEndPrompt: {
      show: false,
      sessionContent: ''
    }
  }),

  saveSessionNotes: (title) => set((state) => {
    if (!state.sessionEndPrompt.sessionContent) return state;

    const newNote: SessionNote = {
      id: uuidv4(),
      title,
      content: state.sessionEndPrompt.sessionContent,
      date: new Date().toISOString(),
      tags: []
    };

    const updatedNotes = [...(state.userProfile.notes || []), newNote];
    const completedSessions = (state.userProfile.completedSessions || 0) + 1;

    // Add points for saving session notes
    const currentPoints = state.userProfile.points;
    const newPoints = currentPoints + 20;
    const newLevel = Math.floor(newPoints / 50) + 1;

    return {
      userProfile: {
        ...state.userProfile,
        notes: updatedNotes,
        completedSessions,
        points: newPoints,
        level: newLevel
      },
      sessionEndPrompt: {
        show: false,
        sessionContent: ''
      },
      showRewardAnimation: true,
      lastPointsEarned: 20
    };
  }),

  // Conversation history actions
  addToConversationHistory: (message) => set((state) => ({
    conversationHistory: [...state.conversationHistory, message]
  })),

  clearConversationHistory: () => set({
    conversationHistory: []
  }),

  // Audio playback state
  setIsPlayingAudio: (isPlaying) => set({
    isPlayingAudio: isPlaying
  }),
}));

export default useStore;
