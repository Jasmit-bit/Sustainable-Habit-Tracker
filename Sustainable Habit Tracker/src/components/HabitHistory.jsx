import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './HabitHistory.css'

export default function HabitHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Current user:', user?.id)
        
        if (!user) {
          navigate('/')
          return
        }
        setUserId(user.id)

        const { data, error } = await supabase
          .from('habit_logs')
          .select(`
            *,
            habit (
              id,
              habit_name,
              category
            )
          `)
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })

        console.log('User habit logs:', data)
        console.log('User habit logs error:', error)

        if (error) {
          console.error('Error:', error)
          return
        }

        setHistory(data || [])
      } catch (error) {
        console.error('Error loading history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [navigate])

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A'
    const date = new Date(isoString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="habit-history-container">
      <h1>Habit History</h1>

      <button 
        className="back-btn" 
        onClick={() => navigate('/settings')}
      >
        ← Back to Settings
      </button>

      {loading ? (
        <p className="loading-text">Loading history...</p>
      ) : history.length === 0 ? (
        <p className="empty-text">No habits logged yet</p>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <div key={entry.id} className="history-item">
              <div className="item-header">
                <h3>
                  {entry.habit?.habit_name || 'Unknown Habit'}
                </h3>
                <span className="item-date">
                  {formatDate(entry.timestamp)}
                </span>
              </div>

              <div className="item-details">
                <div className="item-stats">
                  {entry.habit?.category && (
                    <span className="stat category-badge">
                      🏷️ {entry.habit.category.charAt(0).toUpperCase() + 
                           entry.habit.category.slice(1)}
                    </span>
                  )}
                  {entry.total_co2_saved && (
                    <span className="stat">
                      🌍 CO₂ Saved: {entry.total_co2_saved.toFixed(2)} kg
                    </span>
                  )}
                  {entry.total_plastic_saved && (
                    <span className="stat">
                      ♻️ Plastic Saved: {entry.total_plastic_saved.toFixed(2)} g
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}