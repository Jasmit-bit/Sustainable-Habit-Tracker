import './App.css'
import {supabase} from './supabaseClient'
import { useState } from 'react'
import logo from './logo_image.jpg'

function App() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('') 
  const [name,  setName] = useState('')

  const handleAuth = async () => {
    if(isSignUp){
      const {data, error} = await supabase.auth.signUp({  
        email,
        password,
        options: {
          data: {
            username : username,
            name : name
          }
        }
      })
      if(error) alert(`Error signing up: ${error.message}`)
      else alert(`Sign up successful: ${data.name}`)
    } 
    else
     {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if(error) {alert(`Error logging in: ${error.message}`)}
      else {
        const usernameToDisplay = data.user.user_metadata.username || 'unknown'
        const nameToDisplay = data.user.user_metadata.name || 'unknown'
        alert(`Logged in Welcome back: ${nameToDisplay}`)
      }
    }
  }

  return (
    <>
      <div className="logo-container">
        <img src={logo} className="logo-icon" />
        <span className="logo-text">Sustainable Habit Tracker</span>
      </div>

      <div className="App">
        <h1>{isSignUp ? 'Sign Up' : 'Log In'}</h1>
        <div>
          {isSignUp && (
            <input type="text" 
            placeholder='Username' 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            />
          )}
          {isSignUp && (
            <input type="text" 
            placeholder='Name' 
            value={name}
            onChange={(e) => setName(e.target.value)} 
            />
          )}
          <input type="email" 
          placeholder='Email' 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />

          <input type="password" 
          placeholder='Password' 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleAuth}>{isSignUp ? 'Sign Up' : 'Log In'}</button>
          <p onClick={() => setIsSignUp(!isSignUp)} style={{cursor: 'pointer', color: 'green'}}>
          {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </p>
        </div>
      </div>
    </>
  )
    
}

export default App