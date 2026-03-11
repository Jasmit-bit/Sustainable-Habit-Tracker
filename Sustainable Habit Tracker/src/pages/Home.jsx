import { supabase } from '../supabaseClient'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom' 

export default function Home() {
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* 1. Welcoming Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
        <h1 style={{ color: '#2E8B57', fontSize: '2rem', marginBottom: '5px' }}>Hello, {userName}! 🌍</h1>
        <p style={{ color: '#666', fontSize: '1rem', marginTop: 0 }}>Ready to make an impact today?</p>
      </div>

      {/* 2. Quick Stats Widget (Mock data for now!) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <div style={{ flex: 1, backgroundColor: '#E8F5E9', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#2E8B57', fontSize: '1.8rem' }}>12.5</h3>
          <p style={{ margin: '5px 0 0', color: '#555', fontSize: '0.9rem', fontWeight: 'bold' }}>kg CO₂ Saved</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#FFF3E0', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#E65100', fontSize: '1.8rem' }}>📝 3</h3>
          <p style={{ margin: '5px 0 0', color: '#555', fontSize: '0.9rem', fontWeight: 'bold' }}>Activities Logged</p>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <h2 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px' }}>Quick Actions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        <Link to="/log-habit" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#2E8B57', color: 'white', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>➕ Log a New Habit</span>
            <span style={{ fontSize: '1.5rem' }}>→</span>
          </div>
        </Link>
        <Link to="/analytics" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#ffffff', border: '2px solid #eee', color: '#333', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>📊 View My Progress</span>
            <span style={{ fontSize: '1.5rem', color: '#2E8B57' }}>→</span>
          </div>
        </Link>
      </div>

      {/* 4. Daily Eco-Tip Card */}
      <div style={{ backgroundColor: '#E3F2FD', padding: '20px', borderRadius: '15px', borderLeft: '6px solid #2196F3', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1565C0', fontSize: '1.1rem' }}>💡 Daily Eco-Tip</h4>
        <p style={{ margin: 0, color: '#333', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Unplugging devices when not in use can save up to 10% on your energy bill and significantly reduce your baseline carbon emissions over a year!
        </p>
      </div>

    </div>
  )
}