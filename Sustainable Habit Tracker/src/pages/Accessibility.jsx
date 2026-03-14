import { useState } from 'react'

export default function Accessibility() {
  const [darkMode, setDarkMode] = useState(false)

  const handleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    document.body.classList.toggle('dark-mode', newValue)
  }

  return (
    <div className="settings-container">
      <h1>Accessibility</h1>

      <h3>Dark Mode</h3>
      <button onClick={handleDarkMode}>
        {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
      </button>
    </div>
  )
}