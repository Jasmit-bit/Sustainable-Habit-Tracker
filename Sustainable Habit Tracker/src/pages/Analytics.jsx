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
        .select('*')
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

  //check if in loading screen - styled to match code on other pages for consistency
  if (loading) {
      return <div className="loading-screen">Loading..</div>;
    }


  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* return for error message */}
      {error && <div>{errorMessage}</div>}

      <h1> Analytics: </h1>
      <p>Total CO2 Saved: {calculateCO2Saved(habitLogs)}</p>
      <p>Total Plastic Saved: {calculatePlasticSaved(habitLogs)}</p>
    </div>
  )
}