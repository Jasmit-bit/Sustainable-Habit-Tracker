import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import logo from './logo_image.jpg'
import './Auth.css'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('') 
  const [name, setName] = useState('')
  
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  // I want to make the passwords meet the criteria so I need these variables 
  const isValidLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = isValidLength && hasLetter && hasNumber;

  // to check if the username is valid or not
  const [usernameStatus, setUsernameStatus] = useState(null)


  useEffect(function() {
    
    if (!isSignUp || !username.trim()) {
      setUsernameStatus(null);
      return;
    }

    setUsernameStatus('checking');
    const delayDebounceFn = setTimeout(async function() {
      const { data: isAvailable, error } = await supabase
        .rpc('check_username_available', { test_username: username.trim() });

      if (error) {
        console.error("Error checking username:", error);
        setUsernameStatus(null);
        return;
      }

      if (isAvailable) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('taken');
      }
    }, 500);

    return function() {
      clearTimeout(delayDebounceFn);
    };
    
  }, [username, isSignUp]);



  async function handleAuth() {
    setMessage('');
    setIsError(false);


    if(isSignUp)
    {
      if(!username.trim())
      {
        setMessage('Error: Username cannot be empty.');
        setIsError(true);
        return
      }
      if (!isPasswordValid) {
        setMessage('Error: Please ensure your password meets all requirements.')
        setIsError(true)
        return
      }

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
        if (error.message.includes('Database error saving new user')) {
          setMessage('Error: That username is already taken. Please choose another.');
        }
        else{
        setMessage(`Error: ${error.message}`);
        }
        setIsError(true);
      } else {
        setMessage(`Sign up successful! Welcome, ${data.user.user_metadata.name || 'friend'}.`)
        setIsError(false);
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

  function toggleMode()
  {
    setIsSignUp(!isSignUp);
    setMessage('');

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
            <div style={{ marginBottom: '15px' }}>
              <input type="text" 
              placeholder='Username' 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              style={{ marginBottom: '4px' }} 
              />
              
              <div style={{ textAlign: 'left', fontSize: '0.8rem', marginLeft: '5px', height: '15px' }}>
                {usernameStatus === 'checking' && <span style={{ color: '#666' }}>⏳ Checking availability...</span>}
                {usernameStatus === 'available' && <span className="text-valid">✅ Username is available!</span>}
                {usernameStatus === 'taken' && <span className="text-invalid">❌ Username is already taken</span>}
              </div>
            </div>
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
          
          {isSignUp && (
            <div className="password-checklist">
              <div className={`checklist-item ${isValidLength ? 'text-valid' : 'text-invalid'}`}>
                {isValidLength ? '✅' : '❌'} At least 8 characters
              </div>
              <div className={`checklist-item ${hasLetter ? 'text-valid' : 'text-invalid'}`}>
                {hasLetter ? '✅' : '❌'} Contains a letter
              </div>
              <div className={`checklist-item ${hasNumber ? 'text-valid' : 'text-invalid'}`}>
                {hasNumber ? '✅' : '❌'} Contains a number
              </div>
            </div>
          )}

          <button onClick={handleAuth}>{isSignUp ? 'Sign Up' : 'Log In'}</button>

          {message && (
            <p className={`auth-message ${isError ? 'text-invalid' : 'text-valid'}`}>
              {message}
            </p>
          )}

          <p onClick={toggleMode} className="toggle-link">
            {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </p>
        </div>
      </div>
    </>
  )
}