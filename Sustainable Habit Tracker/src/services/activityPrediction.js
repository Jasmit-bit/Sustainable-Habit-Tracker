import { supabase } from '../supabaseClient';
import { predictActivity } from '../pages/Analytics';

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
 * Combined suggestion logic:
 * 1. Use Gabriella's time-of-day approach to get habits most logged at this time of day
 * 2. Fill remaining slots (up to 3 total) with overall most-logged habits
 */
export async function getCombinedSuggestions(userId) {
  try {
    const { data: habitHistory, error: historyError } = await supabase
      .from('habit_logs')
      .select('habit_id, timestamp, habit(id, habit_name, category)')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (historyError) throw historyError;
    const logs = (habitHistory || []).filter(l => l.habit);
    if (logs.length === 0) return { data: [], error: null };

    // Gabriella's algorithm — returns the habit name for current time of day
    const timedName = predictActivity(logs);
    const timedLog = logs.find(l => l.habit.habit_name === timedName);
    const timedPick = timedLog
      ? { id: timedLog.habit.id, name: timedLog.habit.habit_name, category: timedLog.habit.category, source: 'timed' }
      : null;

    // Overall most frequent (skip if same as Gabriella's pick)
    const allFreqs = logs.reduce((count, log) => {
      const id = log.habit.id;
      count[id] = (count[id] || 0) + 1;
      return count;
    }, {});

    const allSorted = Object.keys(allFreqs).sort((a, b) => allFreqs[b] - allFreqs[a]);
    const overallTopId = allSorted.find(id => !timedPick || String(id) !== String(timedPick.id));
    const overallLog = logs.find(l => String(l.habit.id) === String(overallTopId));
    const overallPick = overallLog
      ? { id: overallLog.habit.id, name: overallLog.habit.habit_name, category: overallLog.habit.category, source: 'frequent' }
      : null;

    const result = [timedPick, overallPick].filter(Boolean);
    return { data: result, error: null };
  } catch (error) {
    console.error('Error getting combined suggestions:', error);
    return { data: [], error: error.message };
  }
}
