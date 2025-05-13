export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  points?: number; // Points awarded for completing the task
}

export interface UserProfile {
  points: number;
  level: number;
  name: string;
  avatar?: string;
  notes?: SessionNote[];
  learningProgress?: LearningProgress;
  completedSessions?: number;
}

export interface Tab {
  id: string;
  title: string;
  active: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  tasks: Task[];
}

export interface AIResponse {
  id: string;
  content: string;
  resources?: Resource[];
  reasoning?: string;
  isStreaming?: boolean;
  hasVideo?: boolean;
  videoUrl?: string;
  images?: string[];
  streamingStage?: number; // 0: text only, 1: first image, 2: second image, 3: video
  isProblemResponse?: boolean; // Flag to indicate this is a problem response
  jsonResponse?: {
    text: string;
    actions?: {
      showActionPanel?: boolean;
      addTask?: {
        title: string;
        priority: 'low' | 'medium' | 'high';
      };
      completeTask?: boolean;
      showProblem?: boolean;
      showResources?: boolean;
      openTeamMap?: boolean;
      closeSessionPrompt?: boolean;
    };
  };
}

export interface Resource {
  id: string;
  title: string;
  content: string;
  url?: string;
}

export interface SessionNote {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: string;
}

export interface LearningPathMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date?: string; // completion date
  icon: string; // icon name from react-icons
}

export interface DailyActivity {
  date: string;
  hours: number;
  intensity: number; // 0-4 for heatmap intensity
}

export interface LearningProgress {
  subjects: {
    [key: string]: {
      progress: number;
      lastStudied: string;
    }
  };
  skills?: Skill[];
  learningPath?: LearningPathMilestone[];
  weeklyActivity?: DailyActivity[];
  totalHours: number;
  streak: number;
}

export interface SessionEndPrompt {
  show: boolean;
  sessionContent: string;
}
