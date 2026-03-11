import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata.name || user.user_metadata.username || 'Eco Warrior')
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/') 
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2E8B57' }}>Welcome Home, {userName}! 🌍</h1>
      <p>This is your main hub for tracking sustainable habits.</p>
      
      {/* Template*/}
      <div style={{ margin: '40px auto', maxWidth: '400px' }}>
        <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h3>Habit Tracker Area</h3>
          <p></p>
        </div>
      </div>

      <button 
        onClick={handleLogout} 
        style={{ padding: '10px 20px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Log Out
      </button>
    </div>
  )
}