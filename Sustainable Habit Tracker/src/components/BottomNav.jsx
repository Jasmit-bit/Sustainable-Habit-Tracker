import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' 

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate() 

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
    } else {
      navigate('/') 
    }
  }

  const navContainerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between', 
    padding: '10px 0 20px 0', 
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    zIndex: 1000 
  }

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path
    return {
      textDecoration: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: isActive ? '#2E8B57' : '#888888', 
      fontWeight: isActive ? 'bold' : 'normal',
      padding: '5px',
      flex: 1, 
      textAlign: 'center'
    }
  }

  const logoutButtonStyle = {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#d9534f',
    padding: '5px',
    margin: 0, 
    flex: 1, 
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center', 
    lineHeight: 'normal' 
  }

  return (
    <nav style={navContainerStyle}>
      <Link to="/home" style={getLinkStyle('/home')}>
        <span style={{ fontSize: '20px', marginBottom: '4px' }}>🏠</span>
        <span style={{ fontSize: '10px' }}>Home</span>
      </Link>
      
      <Link to="/log-habit" style={getLinkStyle('/log-habit')}>
        <span style={{ fontSize: '20px', marginBottom: '4px' }}>➕</span>
        <span style={{ fontSize: '10px' }}>Log Habit</span>
      </Link>

      
      <Link to="/analytics" style={getLinkStyle('/analytics')}>
        <span style={{ fontSize: '20px', marginBottom: '4px' }}>📊</span>
        <span style={{ fontSize: '10px' }}>Analytics</span>
      </Link>

      
      <Link to="/family" style={getLinkStyle('/family')}>
        <span style={{ fontSize: '20px', marginBottom: '4px' }}>👥</span>
        <span style={{ fontSize: '10px' }}>Family</span>
      </Link>

      <Link to="/settings" style={getLinkStyle('/settings')}>
        <span style={{ fontSize: '20px', marginBottom: '4px' }}>⚙️</span>
        <span style={{ fontSize: '10px' }}>Settings</span>
      </Link>
      
    </nav>
  )
}