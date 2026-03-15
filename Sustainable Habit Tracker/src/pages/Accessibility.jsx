import { useEffect, useState } from 'react'

export default function Accessibility() {
  const [darkMode, setDarkMode] = useState(false)
  const [textSize, setTextSize] = useState(16)
  const [brightness, setBrightness] = useState(100)
  const [theme, setTheme] = useState('green')

  const themes = ['green', 'blue', 'sunset', 'warmsand']

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true'
    const savedSize = Number(localStorage.getItem('textSize')) || 16
    const savedBrightness = Number(localStorage.getItem('brightness')) || 100
    const savedTheme = localStorage.getItem('theme') || 'green'

    setDarkMode(savedDark)
    setTextSize(savedSize)
    setBrightness(savedBrightness)
    setTheme(savedTheme)

    applyStyles(savedDark, savedSize, savedBrightness, savedTheme)
  }, [])

  const applyStyles = (dark, size, bright, selectedTheme) => {
    document.body.classList.toggle('dark-mode', dark)
    document.documentElement.style.fontSize = `${size}px`

   // changed from filter to an overlay because the filter was breaking the ergonomic thumb zone

    let overlay = document.getElementById('brightness-overlay')
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = 'brightness-overlay'
      overlay.style.position = 'fixed'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.width = '100vw'
      overlay.style.height = '100vh'
      overlay.style.pointerEvents = 'none' 
      overlay.style.zIndex = '9999' 
      document.body.appendChild(overlay)
    }

    // work out how much darkness opacity needs to be added
    const darknessOpacity = 1 - (bright / 100);
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${darknessOpacity})`
    document.body.classList.remove(
      'theme-green',
      'theme-blue',
      'theme-sunset',
      'theme-warmsand'
    )

    document.body.classList.add(`theme-${selectedTheme}`)
  }

  const handleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem('darkMode', newValue)
    applyStyles(newValue, textSize, brightness, theme)
  }

  const handleTextSize = (e) => {
    const newSize = e.target.value
    setTextSize(newSize)
    localStorage.setItem('textSize', newSize)
    applyStyles(darkMode, newSize, brightness, theme)
  }

  const handleBrightness = (e) => {
    const newBrightness = e.target.value
    setBrightness(newBrightness)
    localStorage.setItem('brightness', newBrightness)
    applyStyles(darkMode, textSize, newBrightness, theme)
  }

  const handleThemeClick = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyStyles(darkMode, textSize, brightness, newTheme)
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