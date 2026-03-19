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
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Verification Error')

      // 2. Update Auth metadata (keeps things in sync)
      await supabase.auth.updateUser({ data: { name } })

      //inserting into table becaus the family board pulls from there
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: name })
        .eq('id', user.id)

      if (profileError) throw profileError

      setNameMessage('Name updated successfully ✅')
    } catch (error) {
      console.error(error)
      setNameMessage('Error updating name')
    }
  }

  const updateUsername = async () => {
    setUsernameMessage('')
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Verification Error')

      await supabase.auth.updateUser({ data: { username } })
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: username })
        .eq('id', user.id)

      if (profileError) throw profileError

      setUsernameMessage('Username updated successfully ✅')
    } catch (error) {
      console.error(error)
      setUsernameMessage('Error updating username')
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

      <h2 style={{ marginTop: '25px' }}>History</h2>
      <button onClick={() => navigate('/settings/habit-history')}>
        View Habit History
      </button>

      <h2 style={{ marginTop: '35px' }}>Account</h2>
      <button className="logout-btn" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  )
}