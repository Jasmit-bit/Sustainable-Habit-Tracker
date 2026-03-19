import {useState, useEffect} from 'react';
import {supabase} from '../supabaseClient';
import './Analytics.css';
import {Link} from 'react-router-dom';
import { logNormalHabit, logTransportHabit } from '../services/habitlog.js';

export default function Analytics() {
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  //error message variables for quick log
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

  async function quickLog(habitName)
  {
    // first I need to find the specific log from the whole list 
    setQuickLogMessage('');
    setIsQuickLogError(false);

    try{
      const logEntry = habitLogs.find(function(log) {
        return log.habit && log.habit.habit_name === habitName;
      });
      if(!logEntry) return;

      const habitId = logEntry.habit.id;
      const category = logEntry.habit.category;
      const { data: { user } } = await supabase.auth.getUser();
      let result;

      if (category === 'transport') {
        const distanceStr = window.prompt(`How many kilometers for ${habitName}?`);
        
        if (!distanceStr || isNaN(distanceStr) || Number(distanceStr) <= 0) { // if the input isnt valid
          return; 
        }
        result = await logTransportHabit(user.id, habitId, parseFloat(distanceStr));
      } else {
        result = await logNormalHabit(user.id, habitId);
      }

      if (result.error) throw result.error;

      setQuickLogMessage(`✅ Successfully logged ${habitName}!`);
      setIsQuickLogError(false);
      
      fetchLogs(); //after logging i want to update the screen without the user having to refresh the page

      //like before this screen can get cramped so ill make the message dissapear after 3 seconds
      setTimeout(() => setQuickLogMessage(''), 3000);
    }
    catch(error){
      setQuickLogMessage('❌ Failed to quick log. Please try again.');
      setIsQuickLogError(true);
      setTimeout(() => setQuickLogMessage(''), 3000);
    }

  }

  //pass the logs into the function to calculate the running total of all co2 saved in order to display "lifetime" stats
  function calculateCO2Saved(logs) {
    try {
      const total = logs.reduce((sum, current) => sum + current.total_co2_saved, 0);
      return Number(total.toFixed(2)); // like on the lob habit page this added a small number so I fixed that
    } catch (error) {
      return 0;
    } 
  }

  //do the same for total plastic saved
  function calculatePlasticSaved(logs) {
    try {
      const total = logs.reduce((sum, current) => sum + current.total_plastic_saved, 0);
      return Number(total.toFixed(2)); // like on the lob habit page this added a small number so I fixed that
    } catch (error) {
      return 0;
    }
  }

  //smart activity prediction
  //updated function to suggest activity based on current time of day
  function predictActivity(logs) {

    if (logs.length === 0) return '';

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

  const predictedHabitName = predictActivity(habitLogs);

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
          <h3> {calculatePlasticSaved(habitLogs)} g </h3>
          <p> Plastic Saved </p>
        </div>

        <div className="stats-card">
          <h3> {habitLogs.length} </h3>
          <p> Total Habits Logged </p>
        </div>
      </div>

      {/* smart activity prediction */}
      <div className="predict-card">
        <h3> 🧠 Smart Quick Log </h3>
        {quickLogMessage && (// shows the error/sucess message depending on logerror status
          <div style={{ 
            marginBottom: '10px', 
            fontWeight: '600', 
            color: isQuickLogError ? '#b91c1c' : '#047857' 
          }}>
            {quickLogMessage}
          </div>
        )}
        {habitLogs.length === 0 ? (
          <>
            <p> No habits logged yet!</p>
            <Link to="/log-habit" className="analytics-button">Go to Habit Log </Link>
          </>
        ) : (
          <>
            <p>{predictActivity(habitLogs)}</p>
           <button 
              onClick={function() { quickLog(predictedHabitName); }} 
              className="analytics-button"
            >
              Log it now
            </button>
          </>
        )}
        </div>
      </div>
  )
}