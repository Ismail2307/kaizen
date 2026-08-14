export type Difficulty = 'tiny' | 'easy' | 'medium' | 'hard' | 'epic';
export type Priority = 'low' | 'medium' | 'high';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived' | 'behind' | 'at_risk';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  tiny: 5,
  easy: 10,
  medium: 25,
  hard: 50,
  epic: 100,
};

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  level: number;
  xp: number;
  streak: number;
  longest_streak: number;
  kaizen_score: number;
  total_tasks_completed: number;
  total_goals_completed: number;
  total_habits_completed: number;
  league: League;
  timezone: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: Priority;
  status: GoalStatus;
  deadline: string | null;
  current_value: number;
  target_value: number;
  unit: string | null;
  progress: number;
  color: string;
  icon: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string | null;
  order_index: number;
  status: MilestoneStatus;
  progress: number;
  deadline: string | null;
  xp_reward: number;
  created_at: string;
  completed_at: string | null;
  tasks?: Task[];
}

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  milestone_id: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  difficulty: Difficulty;
  status: TaskStatus;
  deadline: string | null;
  estimated_duration: number | null;
  xp_reward: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: HabitFrequency;
  target_days: number;
  color: string;
  icon: string | null;
  xp_reward: number;
  streak: number;
  longest_streak: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
}

export interface XpTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  source_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  color: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  duration_days: number;
  xp_reward: number;
  start_date: string | null;
  end_date: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  joined_at: string;
  completed_at: string | null;
}

export interface Reflection {
  id: string;
  user_id: string;
  content: string;
  mood: string | null;
  tags: string[] | null;
  week_start: string | null;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  tasks_completed: number;
  xp_earned: number;
  goals_progressed: number;
  habits_completed: number;
  streak_at_week: number;
  strongest_area: string | null;
  weakest_area: string | null;
  kaizen_score: number;
  kaizen_score_change: number;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  profile: Profile;
}
