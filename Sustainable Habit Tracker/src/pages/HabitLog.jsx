import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabitsByCategory, logNormalHabit, logTransportHabit } from '../services/habitlog.js';
import { supabase } from '../supabaseClient';
import './HabitLog.css'; 

function HabitLog() {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [selectedHabit, setSelectedHabit] = useState('');
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  // building on what philip made I am going to add messages like on different pages so that it shows
  // as text on the screen instead of alerts
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);


  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        navigate('/');
      }
    };
    getUser();
  }, [navigate]);

  // Fetch habits when category changes
  useEffect(() => {
    const fetchHabits = async () => {
      if (!selectedCategory) return;
      
      setLoading(true);
      const { data, error } = await getHabitsByCategory(selectedCategory);
      
      if (error) {
        console.error('Error fetching habits:', error);
      } else {
        setHabits(data || []);
      }
      setLoading(false);
    };

    fetchHabits();
  }, [selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedHabit(''); 
    setDistance(''); 
  };

  const handleHabitSelect = (habitId) => {
    setSelectedHabit(habitId);
  };

  const handleSave = async () => {

    setMessage('');
    setIsError(false);

    if (!selectedHabit || !userId) {
      setMessage('Please select a habit and ensure you are logged in');
      setIsError(true);
      return;
    }

    try {
      let result;
      
      if (selectedCategory === 'transport') {
        if (!distance || distance <= 0) {
          setMessage('Please enter a valid distance');
          setIsError(true);
          return;
        }
        result = await logTransportHabit(userId, selectedHabit, parseFloat(distance));
      } else {
        result = await logNormalHabit(userId, selectedHabit);
      }

      if (result.error) {
        console.error('Error logging habit:', result.error);
        setMessage('Failed to log habit. Please try again.');
        setIsError(true);
      } else {
        setMessage('Habit logged successfully! ✅');
        // changed the code here because philips code sent me back to the home page once I logged the habit which could be annoying if logging multiple activities
        setIsError(false); // Because I want this one to be green I will make it false, and handle it in the return statement
        setSelectedHabit('');
        setDistance('');

      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage("An unexpected error occoured");
      setIsError(true);
    }

    // this page can get cramped with the dropped down so i want it to be minimalistic so I will just make it so that the message dissapears after a bit
     setTimeout(() => setMessage(''), 3000);


  };

  const handleCancel = () => {
    navigate('/home');
  };

  const isSaveDisabled = !selectedHabit || (selectedCategory === 'transport' && !distance);

  return (
    <div className="habit-container">
      <h1 className="habit-header">Log Activity</h1>

      {/* 1. Modern Category Selection Cards */}
      <div className="habit-section">
        <span className="habit-label">Category</span>
        
        <div className="category-group">
          <label className={`category-card ${selectedCategory === 'food' ? 'active' : ''}`}>
            <input
              type="radio"
              name="category"
              value="food"
              checked={selectedCategory === 'food'}
              onChange={() => handleCategoryChange('food')}
            />
            🍎 ♻️ Food Waste Recycling
          </label>
          
          <label className={`category-card ${selectedCategory === 'transport' ? 'active' : ''}`}>
            <input
              type="radio"
              name="category"
              value="transport"
              checked={selectedCategory === 'transport'}
              onChange={() => handleCategoryChange('transport')}
            />
            🚲 Transport
          </label>
          
          <label className={`category-card ${selectedCategory === 'shopping' ? 'active' : ''}`}>
            <input
              type="radio"
              name="category"
              value="shopping"
              checked={selectedCategory === 'shopping'}
              onChange={() => handleCategoryChange('shopping')}
            />
            🛍️ Shopping Alternatives
          </label>
        </div>
      </div>

      {/* 2. Modern Habit Dropdown */}
      <div className="habit-section">
        <span className="habit-label">Select Habit</span>
        
        {loading ? (
          <div className="loading-text">Loading habits...</div>
        ) : (
          <select
            className="habit-select"
            value={selectedHabit}
            onChange={(e) => handleHabitSelect(e.target.value)}
            disabled={habits.length === 0}
          >
            <option value="">-- Choose a habit --</option>
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.habit_name}                                
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3. Distance Input (Transport only) */}
      {selectedCategory === 'transport' && (
        <div className="habit-section">
          <span className="habit-label">Distance travelled (km)</span>
          <input
            className="habit-input"
            type="number"
            min="0"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g., 5.5"
          />
        </div>
      )}

      {message && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '15px', 
          fontWeight: '600', 
          color: isError ? '#d9534f' : '#10b981' 
        }}>
          {message}
        </div>
      )}

      {/* 4. Save/Cancel Buttons */}
      <div className="habit-actions">
        <button className="btn btn-cancel" onClick={handleCancel}>
          Cancel
        </button>
        <button 
          className="btn btn-save" 
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          Save Activity
        </button>
      </div>
    </div>
  );
}

export default HabitLog;