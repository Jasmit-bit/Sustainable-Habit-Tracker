import {useState, useEffect} from 'react';
import {supabase} from '../supabaseClient';
import './Analytics.css';

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

    </div>
  )
}