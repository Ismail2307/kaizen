-- ============================================
-- SEED DATA
-- ============================================

-- Default achievements
INSERT INTO achievements (title, description, icon, xp_reward, requirement_type, requirement_value) VALUES
  ('First Steps', 'Complete your first task', 'footprints', 10, 'tasks_completed', 1),
  ('Task Master', 'Complete 10 tasks', 'check-circle', 50, 'tasks_completed', 10),
  ('Task Legend', 'Complete 100 tasks', 'crown', 200, 'tasks_completed', 100),
  ('Goal Setter', 'Create your first goal', 'target', 10, 'goals_created', 1),
  ('Goal Crusher', 'Complete 5 goals', 'trophy', 100, 'goals_completed', 5),
  ('Habit Starter', 'Maintain a 3-day streak', 'flame', 25, 'habits_streak', 3),
  ('Habit Hero', 'Maintain a 30-day streak', 'zap', 150, 'habits_streak', 30),
  ('Level Up', 'Reach level 5', 'arrow-up-circle', 50, 'level_reached', 5),
  ('Grandmaster', 'Reach level 25', 'star', 500, 'level_reached', 25),
  ('Social Butterfly', 'Add your first friend', 'users', 25, 'friends_added', 1),
  ('Challenge Accepted', 'Join your first challenge', 'sword', 25, 'challenges_joined', 1),
  ('XP Hunter', 'Earn 1000 XP total', 'coins', 100, 'xp_earned', 1000);

-- Default challenges
INSERT INTO challenges (title, description, category, duration_days, xp_reward, is_public) VALUES
  ('30-Day Coding Challenge', 'Code for at least 30 minutes every day for 30 days', 'coding', 30, 300, true),
  ('Morning Routine Master', 'Complete a morning routine for 21 days', 'wellness', 21, 200, true),
  ('Fitness Starter', 'Exercise 3 times a week for 4 weeks', 'fitness', 28, 250, true),
  ('Reading Challenge', 'Read 20 pages every day for 30 days', 'learning', 30, 300, true),
  ('Meditation Streak', 'Meditate 10 minutes daily for 14 days', 'mindfulness', 14, 150, true);
