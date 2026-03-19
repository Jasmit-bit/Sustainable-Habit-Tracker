import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabitsByCategory, logNormalHabit, logTransportHabit } from '../services/habitlog.js';
import { getPredictedActivities } from '../services/activityPrediction';
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
  const [predictedHabits, setPredictedHabits] = useState([]);
  const [predictedError, setPredictedError] = useState('');
  const [predictedLoading, setPredictedLoading] = useState(false);


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

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!userId) return;
      setPredictedError('');
      setPredictedLoading(true);
      const { data, error } = await getPredictedActivities(userId);
      if (error) {
        setPredictedError(error);
      } else {
        setPredictedHabits(data || []);
      }
      setPredictedLoading(false);
    };
    fetchPredictions();
  }, [userId]);

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

  const handleQuickPrediction = async (habit) => {
    if (!userId || !habit) {
      return;
    }

    try {
      let result;
      if (habit.category === 'transport') {
        const distanceValue = window.prompt(`Enter travel distance for ${habit.name} (km):`, '1.0');
        if (!distanceValue || isNaN(distanceValue) || Number(distanceValue) <= 0) {
          setMessage('Please enter a valid distance to log predicted transport habit.');
          setIsError(true);
          return;
        }
        result = await logTransportHabit(userId, habit.id, Number(distanceValue));
      } else {
        result = await logNormalHabit(userId, habit.id);
      }

      if (result.error) {
        setMessage('Failed to log predicted habit. Please try again.');
        setIsError(true);
      } else {
        setMessage('Habit logged successfully! ✅');
        setIsError(false);
        setDistance('');
        setSelectedHabit('');

        // refresh category habits and predictions after logging
        const { data, error } = await getPredictedActivities(userId);
        if (!error) setPredictedHabits(data || []);
      }
    } catch (error) {
      setMessage('Unexpected error while logging predicted habit.');
      setIsError(true);
      console.error(error);
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const isSaveDisabled = !selectedHabit || (selectedCategory === 'transport' && !distance);

  return (
    <div className="habit-container">
      <h1 className="habit-header">Log Activity</h1>

      {/* Smart Suggestion Box */}
      <div className="habit-suggestion-card" style={{ marginBottom: '20px', border: '1px solid #CBD5E1', borderRadius: '12px', backgroundColor: '#ECFDF5', padding: '14px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: '#065F46' }}>🤖 Smart Suggestions</h2>
        {predictedLoading ? (
          <p style={{ margin: 0 }}>Loading suggestions...</p>
        ) : predictedError ? (
          <p style={{ margin: 0, color: '#DC2626' }}>{predictedError}</p>
        ) : predictedHabits.length === 0 ? (
          <p style={{ margin: 0 }}>No suggestions yet. Log habits to get suggestions.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            {predictedHabits.slice(0, 3).map((habit, index) => (
              <div key={habit.id} style={{ width: '100%', maxWidth: '450px', textAlign: 'center', padding: '6px 8px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#065F46', fontSize: '0.9rem' }}>{habit.name}</p>
                <button
                  onClick={() => handleQuickPrediction(habit)}
                  style={{ border: 'none', borderRadius: '6px', background: '#10B981', color: 'white', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', width: '70%' }}
                >
                  Log it now
                </button>
                <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize: '0.78rem' }}>Logged {habit.completions} times</p>
              </div>
            ))}
          </div>
        )}
      </div>

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
            🚌 Transport
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