import { supabase } from '../supabaseClient';

/**
 * Get user's predicted next habits based on completion patterns
 * Analyzes historical data to recommend most likely habits to complete
 */
export async function getPredictedActivities(userId) {
  try {
    // Fetch user's habit completion history
    const { data: habitHistory, error: historyError } = await supabase
      .from('habit_logs')
      .select('habit_id, timestamp, habit(id, habit_name, category)')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100); // Get last 100 logs for analysis

    if (historyError) throw historyError;
    if (!habitHistory || habitHistory.length === 0) {
      return { data: [], message: 'No habit history found' };
    }

    // Calculate completion frequency per habit
    const habitScores = {};
    
    habitHistory.forEach((log) => {
      if (log.habit) {
        const habitId = log.habit.id;
        const habitName = log.habit.habit_name;
        const category = log.habit.category;
        
        if (!habitScores[habitId]) {
          habitScores[habitId] = {
            id: habitId,
            name: habitName,
            category: category,
            completions: 0,
            lastCompleted: null,
          };
        }
        
        habitScores[habitId].completions++;
        if (!habitScores[habitId].lastCompleted) {
          habitScores[habitId].lastCompleted = log.timestamp;
        }
      }
    });

    // Convert to array and sort by completion count (popularity)
    const predictedHabits = Object.values(habitScores)
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 3) // Top 3 predictions
      .map((habit) => ({
        ...habit,
        predictionScore: habit.completions, // Simple score based on frequency
      }));

    return { data: predictedHabits, error: null };
  } catch (error) {
    console.error('Error predicting activities:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Get habits the user hasn't completed yet this week
 * For suggesting "fresh" habits
 */
export async function getUnloggedHabitsThisWeek(userId) {
  try {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    
    // Get all habits
    const { data: allHabits, error: habitsError } = await supabase
      .from('habit')
      .select('id, habit_name, category');

    if (habitsError) throw habitsError;

    // Get habits logged this week
    const { data: loggedThisWeek, error: logError } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('user_id', userId)
      .gte('timestamp', weekStart.toISOString());

    if (logError) throw logError;

    const loggedHabitIds = new Set(loggedThisWeek.map((log) => log.habit_id));

    // Find unlogged habits
    const unloggedHabits = allHabits
      .filter((habit) => !loggedHabitIds.has(habit.id))
      .slice(0, 3);

    return { data: unloggedHabits, error: null };
  } catch (error) {
    console.error('Error getting unlogged habits:', error);
    return { data: [], error: error.message };
  }
}
