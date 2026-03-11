import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

import Auth from './Auth' 
import Home from './pages/Home' 
import HabitLog from './pages/HabitLog' 

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Default route: Always starts at Login. If logged in, jump to Home */}
        <Route 
          path="/" 
          element={!session ? <Auth /> : <Navigate to="/home" />} 
        />
        
        {/* Protected Home Route */}
        <Route 
          path="/home" 
          element={session ? <Home /> : <Navigate to="/" />} 
        />

        {/* Other pages your team might build */}
        <Route 
          path="/log-habit" 
          element={session ? <HabitLog /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App