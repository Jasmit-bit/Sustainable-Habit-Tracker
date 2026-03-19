import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HabitHistory.css'

export default function HabitHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

   useEffect(() => {})


}