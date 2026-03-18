import {useState, useEffect} from 'react';
import {supabase} from '../supabaseClient';
import './Analytics.css';
import {Link} from 'react-router-dom'

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
        .select('*, habit(habit_name)')
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
  //updated function to suggest activity based on current time of day
  function predictActivity(logs) {
    
    if (logs.length == 0) return 'No habits logged yet. Visit the Habit Log page to start!';

    //records the current date/time as the app is being used 
    const instant = new Date();
    const currentHour = instant.getHours();
    let time = '';

    if (currentHour >= 6 && currentHour < 12) {
      time = 'morning';
    }
    else if (currentHour >= 12 && currentHour < 18) {
      time = 'afternoon';
    }
    else {
      time = 'night';
    }

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
    const freqs = useLogs.reduce((count, current) => {
      const habitName = current.habit.habit_name;
      count[habitName] = (count[habitName] || 0) + 1;
      return count;
    }, {})

    const nameArray = Object.keys(freqs);
    
    let mostFrequent = nameArray[0];
    for (let i = 1; i < nameArray.length; i++) {
      if (freqs[nameArray[i]] > freqs[mostFrequent]) {
        mostFrequent = nameArray[i];
      }
    }
    return mostFrequent;
    
  }

  return (
    <div className="analytics-container">

      {/* error message */}
      {error && <div className="error-message"> {errorMessage} </div>}

      {/* page header */}
      <div className="analytics-header">
        <h2> Your Analytics 📊 </h2>
        <p> Summary of your lifetime stats so far! </p>
      </div>

      {/* stats cards */}
      <div className="stats-grid">

        <div className="stats-card">
          <h3> {calculateCO2Saved(habitLogs)} kg </h3>
          <p> CO_2 Saved </p>
        </div>

        <div className="stats-card">
          <h3> {calculatePlasticSaved(habitLogs)} kg </h3>
          <p> Plastic Saved </p>
        </div>

        <div className="stats-card">
          <h3> {habitLogs.length} </h3>
          <p> Total Habits Logged </p>
        </div>
      </div>

      {/* smart activity prediction */}
      <div className="predict-card">
        <h3> Quick Log </h3>
        {habitLogs.length === 0 ? (
          <>
            <p> No habits logged yet!</p>
            <Link to="/log-habit" className="analytics-button">Go to Habit Log </Link>
          </>
        ) : (
          <>
            <p>{predictActivity(habitLogs)}</p>
            {/* Add logic here to quick add a habit once habit log page is completed */}
          </>
        )}
        </div>
      </div>
  )
}