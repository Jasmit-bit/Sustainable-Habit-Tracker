import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Settings() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')

  const [nameMessage, setNameMessage] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (user) {
        setName(user.user_metadata.name || '')
        setUsername(user.user_metadata.username || '')
      }
    }

    loadUser()
  }, [])

  const updateName = async () => {
    setNameMessage('')
    const { error } = await supabase.auth.updateUser({
      data: { name },
    })

    if (error) {
      setNameMessage('Error updating name')
    } else {
      setNameMessage('Name updated successfully ✅')
    }
  }

  const updateUsername = async () => {
    setUsernameMessage('')
    const { error } = await supabase.auth.updateUser({
      data: { username },
    })

    if (error) {
      setUsernameMessage('Error updating username')
    } else {
      setUsernameMessage('Username updated successfully ✅')
    }
  }

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      'Are you sure you want to log out?'
    )

    if (!confirmLogout) return

    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <h2>Name</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={updateName} disabled={!name.trim()}>
        Update Name
      </button>
      {nameMessage && <p>{nameMessage}</p>}

      <h2 style={{ marginTop: '25px' }}>Username</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={updateUsername} disabled={!username.trim()}>
        Update Username
      </button>
      {usernameMessage && <p>{usernameMessage}</p>}

      <h2 style={{ marginTop: '25px' }}>Accessibility</h2>
      <button onClick={() => navigate('/settings/accessibility')}>
        Open Accessibility Settings
      </button>

      <h2 style={{ marginTop: '35px' }}>Account</h2>
      <button className="logout-btn" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  )
}