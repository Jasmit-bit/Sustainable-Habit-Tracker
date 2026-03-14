import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Settings() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')

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
      <button>Update Name</button>

      <h2 style={{ marginTop: '25px' }}>Username</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button>Update Username</button>
    </div>
  )
}