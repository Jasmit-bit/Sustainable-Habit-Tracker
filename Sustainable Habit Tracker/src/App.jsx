import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'


import Auth from './Auth' 
import Home from './pages/Home' 
import HabitLog from './pages/HabitLog' 
import Analytics from './pages/Analytics'
import Family from './pages/Family'      
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
import Accessibility from './pages/Accessibility'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <div style={{ paddingBottom: '80px' }}> 
        <Routes>
          {/* Authentication page by standard */}
          <Route path="/" element={!session ? <Auth /> : <Navigate to="/home" />} />
          
          {/* Featres Available once logged in */}
          <Route path="/home" element={session ? <Home /> : <Navigate to="/" />} />
          <Route path="/log-habit" element={session ? <HabitLog /> : <Navigate to="/" />} />
          <Route path="/analytics" element={session ? <Analytics /> : <Navigate to="/" />} />
          <Route path="/family" element={session ? <Family /> : <Navigate to="/" />} />
          <Route path="/settings" element={session ? <Settings /> : <Navigate to="/" />} />
          <Route path="/settings/accessibility" element={session ? <Accessibility /> : <Navigate to="/" />} />
        </Routes>
      </div>

      {session && <BottomNav />}
    </BrowserRouter>
  )
}

export default App