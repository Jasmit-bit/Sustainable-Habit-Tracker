import {useState, useEffect} from 'react';
import {supabase} from '../supabaseClient';

export default function Analytics() {
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs()
}, [])

  //fetch the habit log data from supabase 
  async function fetchLogs() {
    const {data: {user}} = await supabase.auth.getUser();

    const {data} = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id);

    setHabitLogs(data);
    setLoading(false);
  }

  //pass the logs into the function to calculate the running total of all co2 saved in order to display "lifetime" stats
  function calculateCO2Saved(logs) {
    return logs.reduce((total, current) => {
      return total + current.total_co2_saved;
    }, 0)
  }

  //do the same for total plastic saved
  function calculatePlasticSaved(logs) {
    return logs.reduce((total, current) => {
      return total + current.total_plastic_saved;
    }, 0)
  }

  //check if in loading screen - styled to match code on other pages for consistency
  if (loading) {
      return <div className="loading-screen">Loading..</div>;
    }


  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1> Analytics: </h1>
      <p>Total CO2 Saved: {calculateCO2Saved(habitLogs)}</p>
      <p>Total Plastic Saved: {calculatePlasticSaved(habitLogs)}</p>
    </div>
  )
}