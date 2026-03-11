import { useState } from 'react'
import { supabase } from './supabaseClient'
import logo from './logo_image.jpg'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('') 
  const [name, setName] = useState('')
  
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleAuth = async () => {
    setMessage('')
    
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
      if(error) {
        setMessage(`Error: ${error.message}`)
        setIsError(true)
      } else {
        setMessage(`Sign up successful! Welcome, ${data.user.user_metadata.name || 'friend'}.`)
        setIsError(false)
      }
    } 
    else {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if(error) {
        setMessage(`Error: ${error.message}`)
        setIsError(true)
      } else {
        setMessage('') 
      }
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setMessage('')
  }

  return (
    <>
      <div className="logo-container">
        <img src={logo} className="logo-icon" alt="Logo" />
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

          {message && (
            <p style={{ 
              color: isError ? '#d9534f' : '#2E8B57', 
              fontWeight: 'bold',
              marginTop: '15px',
              marginBottom: '0'
            }}>
              {message}
            </p>
          )}

          <p onClick={toggleMode} style={{cursor: 'pointer', color: 'green', marginTop: '20px'}}>
          {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </p>
        </div>
      </div>
    </>
  )
}