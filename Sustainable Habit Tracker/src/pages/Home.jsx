import { supabase } from '../supabaseClient'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCombinedSuggestions } from '../services/activityPrediction'
import { logNormalHabit, logTransportHabit } from '../services/habitlog.js'
// emojis used have come from emojipedia.org so full credits for those go to them

export function calculateTotalCO2(habitLogs) {
  return habitLogs.reduce((total, current) => total + current.total_co2_saved, 0)
}

export function getRandomTipContent(tips) {
  const randomIndex = Math.floor(Math.random() * tips.length)
  return tips[randomIndex].content
}

export function getUsername(user_metadata) {
  return user_metadata.name || user_metadata.username || 'Eco Warrior'
}

export default function Home() {
  const [userName, setUserName] = useState('')
  const [tip, setTip] = useState('')
  const [totalCO2Saved, setTotalCO2Saved] = useState('0')
  const [activityCount, setActivityCount] = useState('0')
  const [predictedHabits, setPredictedHabits] = useState([])
  const [quickLogMessage, setQuickLogMessage] = useState('')
  const [quickLogError, setQuickLogError] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(getUsername(user_metadata))
      }
    }
    fetchUser()

    const fetchTips = async () => {
      const { data: tips } = await supabase.from('tips').select('*')
      if (tips) {
        setTip(getRandomTipContent(tips))
      }
    }
    fetchTips()

    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: habitLogs } = await supabase.from('habit_logs').select('*').eq('user_id', user.id);
        console.log(habitLogs)
        if (habitLogs) {
          const totalCO2 = calculateTotalCO2(habitLogs)
          setActivityCount(habitLogs.length)
          setTotalCO2Saved(Number(totalCO2.toFixed(2))); // added this line to prevent js from breaking and showing a really small number
        }
      }
    }
    fetchStats()

    // Fetch smart activity predictions
    const fetchPredictions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await getCombinedSuggestions(user.id)
        if (!error) {
          setPredictedHabits(data)
        }
      }
    }
    fetchPredictions()
  }, [])

  const handleQuickLog = async (habit) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let result
    if (habit.category === 'transport') {
      const distanceValue = window.prompt(`Enter distance for "${habit.name}" (km):`, '1.0')
      if (!distanceValue || isNaN(distanceValue) || Number(distanceValue) <= 0) return
      result = await logTransportHabit(user.id, habit.id, Number(distanceValue))
    } else {
      result = await logNormalHabit(user.id, habit.id)
    }

    if (result.error) {
      setQuickLogMessage('Failed to log habit. Please try again.')
      setQuickLogError(true)
    } else {
      setQuickLogMessage('Habit logged successfully! ✅')
      setQuickLogError(false)
    }
    setTimeout(() => setQuickLogMessage(''), 3000)
  }

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
          <h3 style={{ margin: 0, color: '#2E8B57', fontSize: '1.8rem' }}>{totalCO2Saved}</h3>
          <p style={{ margin: '5px 0 0', color: '#555', fontSize: '0.9rem', fontWeight: 'bold' }}>kg CO₂ Saved</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#FFF3E0', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#E65100', fontSize: '1.8rem' }}>📝 {activityCount}</h3>
          <p style={{ margin: '5px 0 0', color: '#555', fontSize: '0.9rem', fontWeight: 'bold' }}>Activities Logged</p>
        </div>
      </div>

      {/* 3. Quick Logs */}
      {predictedHabits.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.2rem', color: '#1b4332', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>⚡ Quick Logs</h2>
          {quickLogMessage && (
            <p style={{ textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: quickLogError ? '#DC2626' : '#2E8B57', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
              {quickLogMessage}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginBottom: '25px' }}>
            {predictedHabits.map((habit) => (
              <div key={habit.id} style={{
                flex: 1,
                backgroundColor: '#E8F5E9',
                border: '1px solid #95d5b2',
                borderRadius: '10px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'Inter, sans-serif'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1b4332', textAlign: 'center' }}>{habit.name}</span>
                <span style={{ fontSize: '0.68rem', color: '#2d6a4f', textAlign: 'center' }}>
                  {habit.source === 'timed' ? '🕐 Usually logged at this time' : '🔁 Frequently logged'}
                </span>
                <button
                  onClick={() => handleQuickLog(habit)}
                  style={{ border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #2d6a4f, #40916c)', color: 'white', padding: '4px 14px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', width: 'auto', marginTop: '0' }}
                >
                  Log Now
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 4. Quick Action Buttons */}
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
        <p style={{ margin: 0, color: '#333', fontSize: '0.95rem', lineHeight: '1.5' }}>{tip}</p>
      </div>

    </div>
  )
}