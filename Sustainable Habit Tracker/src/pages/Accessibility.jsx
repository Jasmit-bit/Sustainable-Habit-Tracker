import { useState } from 'react'

export default function Accessibility() {
  const [darkMode, setDarkMode] = useState(false)
  const [textSize, setTextSize] = useState(16)

  const handleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    document.body.classList.toggle('dark-mode', newValue)
  }

  const handleTextSize = (e) => {
    const newSize = e.target.value
    setTextSize(newSize)
    document.documentElement.style.fontSize = `${newSize}px`
  }

  return (
    <div className="settings-container">
      <h1>Accessibility</h1>

      <h3>Dark Mode</h3>
      <button onClick={handleDarkMode}>
        {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
      </button>

      <h3 style={{ marginTop: '25px' }}>Text Size</h3>
      <input
        type="range"
        min="14"
        max="24"
        step="1"
        value={textSize}
        onChange={handleTextSize}
      />
      <p>Current Size: {textSize}px</p>
    </div>
  )
}