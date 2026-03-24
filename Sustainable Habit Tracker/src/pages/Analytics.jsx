import {useState, useEffect} from 'react';
import {supabase} from '../supabaseClient';
import './Analytics.css';
import { calculateCO2Saved, calculatePlasticSaved, getMostFrequent, getTimePeriod, getWeeklyData, getHabitFrequency } from '../utils/analyticsUtils';
import { logNormalHabit, logTransportHabit } from '../services/habitlog.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

//smart activity prediction
//updated function to suggest activity based on current time of day
export function predictActivity(logs) {

  if (logs.length == 0) return '';

  //records the current date/time as the app is being used
  const instant = new Date();
  const currentHour = instant.getHours();

  const time = getTimePeriod(currentHour);

  //filter for the database logs based on the current time that the app is being used
  const filteredByTime = logs.filter( log => {
    const logTimestamp = new Date(log.timestamp).getHours();

    if (time == 'morning') {
      return logTimestamp >= 6 && logTimestamp < 12;
    }
    else if (time == 'afternoon') {
      return logTimestamp >= 12 && logTimestamp < 18;
    }
    else {
      return logTimestamp >= 18 || logTimestamp < 6;
    }
  })

  //handling what to do if there aren't any logs after the filter
  let useLogs;
  if (filteredByTime.length > 0) {
    useLogs = filteredByTime;
  } else {
    useLogs = logs;
  }

  //frequency counting based on whatever set of logs we are using
  return getMostFrequent(useLogs);

}

// Returns top 3 habits for current time window + window label info
export function getTimedHabits(logs) {
  if (logs.length === 0) return { habits: [], label: '', range: '' };

  const currentHour = new Date().getHours();
  let time = '';
  if (currentHour >= 6 && currentHour < 12) time = 'morning';
  else if (currentHour >= 12 && currentHour < 18) time = 'afternoon';
  else time = 'night';

  const labels = { morning: 'Morning Logs', afternoon: 'Afternoon Logs', night: 'Night Logs' };
  const ranges = { morning: '6am - 12pm', afternoon: '12pm - 6pm', night: '6pm - 6am' };

  const filteredByTime = logs.filter(log => {
    const h = new Date(log.timestamp).getHours();
    if (time === 'morning') return h >= 6 && h < 12;
    if (time === 'afternoon') return h >= 12 && h < 18;
    return h >= 18 || h < 6;
  });

  if (filteredByTime.length === 0) return { habits: [], label: labels[time], range: ranges[time] };

  const freqs = filteredByTime.reduce((count, current) => {
    const name = current.habit.habit_name;
    count[name] = (count[name] || 0) + 1;
    return count;
  }, {});

  const habits = Object.entries(freqs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count, timeLabel: time }));

  return { habits, label: labels[time], range: ranges[time] };
}

// Returns top 3 most logged habits overall, with this month's count
export function getTopHabits(logs) {
  if (logs.length === 0) return [];

  const now = new Date();
  const monthLogs = logs.filter(log => {
    const d = new Date(log.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalFreqs = logs.reduce((count, current) => {
    const name = current.habit.habit_name;
    count[name] = (count[name] || 0) + 1;
    return count;
  }, {});

  const monthFreqs = monthLogs.reduce((count, current) => {
    const name = current.habit.habit_name;
    count[name] = (count[name] || 0) + 1;
    return count;
  }, {});

  return Object.entries(totalFreqs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => ({ name, monthCount: monthFreqs[name] || 0 }));
}

export default function Analytics() {
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quickLogMessage, setQuickLogMessage] = useState('');
  const [isQuickLogError, setIsQuickLogError] = useState(false);



  useEffect(() => {
    fetchLogs()
  }, [])

  //fetch the habit log data from supabase 
  async function fetchLogs() {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {data: logsData} = await supabase
        .from('habit_logs')
        .select('*, habit(id,habit_name,category)') // modified the request to get things i need to log the habit
        .eq('user_id', user.id);
        
      setHabitLogs(logsData);

    } catch (error) {
      setError(true);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLog(habitName) {
    setQuickLogMessage('');
    setIsQuickLogError(false);
    try {
      const logEntry = habitLogs.find(log => log.habit && log.habit.habit_name === habitName);
      if (!logEntry) return;
      const habitId = logEntry.habit.id;
      const category = logEntry.habit.category;
      const { data: { user } } = await supabase.auth.getUser();
      let result;
      if (category === 'transport') {
        const distanceStr = window.prompt(`How many kilometers for ${habitName}?`);
        if (!distanceStr || isNaN(distanceStr) || Number(distanceStr) <= 0) return;
        result = await logTransportHabit(user.id, habitId, parseFloat(distanceStr));
      } else {
        result = await logNormalHabit(user.id, habitId);
      }
      if (result.error) throw result.error;
      setQuickLogMessage(`✅ Logged ${habitName}!`);
      setIsQuickLogError(false);
      fetchLogs();
      setTimeout(() => setQuickLogMessage(''), 3000);
    } catch (error) {
      setQuickLogMessage('❌ Failed to log. Please try again.');
      setIsQuickLogError(true);
      setTimeout(() => setQuickLogMessage(''), 3000);
    }
  }

  const topHabits = getTopHabits(habitLogs);
  const weeklyData = getWeeklyData(habitLogs);
  const habitFrequency = getHabitFrequency(habitLogs);
  const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

  return (
    <div className="analytics-container">

      {/* error message */}
      {error && <div className="error-message"> {errorMessage} </div>}

      {/* page header */}
      <div className="analytics-header">
        <h2> Your Analytics 📊 </h2>
        <p> Summary of your lifetime stats so far! This page works on your Quick Habit Logs, behind the scenes!</p>
      </div>

      {/* stats cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <h3> {calculateCO2Saved(habitLogs)} kg </h3>
          <p> CO₂ Saved </p>
        </div>
        <div className="stats-card">
          <h3> {calculatePlasticSaved(habitLogs)} g </h3>
          <p> Plastic Saved </p>
        </div>
        <div className="stats-card">
          <h3> {habitLogs.length} </h3>
          <p> Total Habits Logged </p>
        </div>
      </div>

      {quickLogMessage && (
        <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '0.9rem', color: isQuickLogError ? '#b91c1c' : '#047857', marginBottom: '12px' }}>
          {quickLogMessage}
        </div>
      )}

      {/* top 3 most logged overall */}
      {topHabits.length > 0 && (
        <div className="predict-card">
          <h3>⭐ Your Favourite Habits</h3>
          {topHabits.map(({ name, monthCount }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #a7f3d0', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#065f46', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#047857' }}>{monthCount} logs this month</p>
              </div>
              <button onClick={() => quickLog(name)} className="analytics-button" style={{ flexShrink: 0, width: '90px', padding: '6px 0', fontSize: '0.8rem', textAlign: 'center' }}>Log Now</button>
            </div>
          ))}
        </div>
      )}

      {/* weekly co2 vs plastic bar chart */}
      {weeklyData.length > 0 && (
        <div className="chart-card">
          <h3>📅 Weekly CO₂ vs Plastic</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="co2" name="CO₂ (kg)" fill="#10b981" />
              <Bar yAxisId="right" dataKey="plastic" name="Plastic (g)" fill="#065f46" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* habits logged pie chart*/}
      {habitFrequency.length > 0 && (
        <div className="chart-card">
          <h3> Habit Breakdown </h3>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={habitFrequency}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {habitFrequency.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}