import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      alert(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>You are currently logged in.</p>
      
      <button 
        onClick={handleLogout} 
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Log Out
      </button>
    </div>
  )
}