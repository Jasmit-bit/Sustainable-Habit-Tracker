import {useState, useEffect} from 'react';
import {supabase} from '../supabaseClient';

export default function Analytics() {
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs()
}, [])

  async function fetchLogs() {
    const {data: {user}} = await supabase.auth.getUser();

    const {data} = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id);

    setHabitLogs(data);
  }





  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1> Analytics</h1>
    </div>
  )
}