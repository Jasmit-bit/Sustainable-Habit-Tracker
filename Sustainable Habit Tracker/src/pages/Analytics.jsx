import {useState, useEffect} from 'react';
import {supabase} from '../supabaseClient';

export default function Analytics() {
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchLogs()
  }, [])

  //fetch the habit log data from supabase 
  async function fetchLogs() {
    try {
      const {data: {user}} = await supabase.auth.getUser();

      const {data: logsData} = await supabase
        .from('habit_logs')
        .select('*', habit(habit_name))
        .eq('user_id', user.id);
        
      setHabitLogs(logsData);

    } catch (error) {
      setError(true);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  //pass the logs into the function to calculate the running total of all co2 saved in order to display "lifetime" stats
  function calculateCO2Saved(logs) {
    try {
      return logs.reduce((total, current) => {
        return total + current.total_co2_saved;
      }, 0)
    } catch (error) {
      return 0;
    } 
  }

  //do the same for total plastic saved
  function calculatePlasticSaved(logs) {
    try {
      return logs.reduce((total, current) => {
        return total + current.total_plastic_saved;
      }, 0)
    } catch (error) {
      return 0;
    }
  }

  //smart activity prediction
  //for now - will only focus on predicting the activity based on frequently logged habits but can progress into day/time based prediction at a later stage
  function predictActivity(logs) {
    
    if (logs.length == 0) return 'No habits logged yet. Visit the Habit Log page to start!';

    const freqs = logs.reduce((count, current) => {
      const habitName = current.habit.habit_name;
      count[habitName] = (count[habitName] || 0) + 1;
      return count;
    }, {})

    nameArray = Object.keys(freqs);
    
    let mostFrequent = nameArray[0];
    for (let i = 1; i < nameArray.length; i++) {
      if (freqs[nameArray[i]] > freqs[mostFrequent]) {
        mostFrequent = nameArray[i];
      }
    }
    return mostFrequent;
  }

  //check if in loading screen - styled to match code on other pages for consistency
  if (loading) {
      return <div className="loading-screen">Loading..</div>;
    }


  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* return for error message */}
      {error && <div>{errorMessage}</div>}

      <h1> Analytics: </h1>
      <p>Total CO2 Saved: {calculateCO2Saved(habitLogs)} kg </p>
      <p>Total Plastic Saved: {calculatePlasticSaved(habitLogs)} kg </p>
      <p>Total Habits Logged: {habitLogs.length}</p>
      <p>Suggested Habit Log: {predictActivity(habitLogs)}</p>
    </div>
  )
}