import { useState } from 'react'

export default function Accessibility() {
  const [darkMode, setDarkMode] = useState(false)
  const [textSize, setTextSize] = useState(16)
  const [brightness, setBrightness] = useState(100)
  const [theme, setTheme] = useState('green')

  const themes = ['green', 'blue', 'sunset', 'warmsand']

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

  const handleBrightness = (e) => {
    const newBrightness = e.target.value
    setBrightness(newBrightness)
    document.body.style.filter = `brightness(${newBrightness}%)`
  }

  const handleThemeClick = (newTheme) => {
    setTheme(newTheme)

    document.body.classList.remove(
      'theme-green',
      'theme-blue',
      'theme-sunset',
      'theme-warmsand'
    )

    document.body.classList.add(`theme-${newTheme}`)
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

      <h3 style={{ marginTop: '25px' }}>Brightness</h3>
      <input
        type="range"
        min="30"
        max="100"
        step="5"
        value={brightness}
        onChange={handleBrightness}
      />
      <p>Brightness: {brightness}%</p>

      <h3 style={{ marginTop: '25px' }}>Theme Style</h3>
      <div className="theme-options">
        {themes.map((color) => (
          <div
            key={color}
            className={`theme-circle ${theme === color ? 'active' : ''} preview-${color}`}
            onClick={() => handleThemeClick(color)}
          />
        ))}
      </div>
    </div>
  )
}