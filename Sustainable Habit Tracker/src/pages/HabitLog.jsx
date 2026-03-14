import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabitsByCategory, logNormalHabit, logTransportHabit } from '../services/habitlog.js';
import { supabase } from '../supabaseClient';

function HabitLog() {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [selectedHabit, setSelectedHabit] = useState('');
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // Redirect to login if no user
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
    setSelectedHabit(''); // Reset habit when category changes
    setDistance(''); // Reset distance when category changes
  };

  const handleHabitSelect = (habitId) => {
    setSelectedHabit(habitId);
  };

  const handleSave = async () => {
    if (!selectedHabit || !userId) {
      alert('Please select a habit and ensure you are logged in');
      return;
    }

    try {
      let result;
      
      if (selectedCategory === 'transport') {
        if (!distance || distance <= 0) {
          alert('Please enter a valid distance');
          return;
        }
        result = await logTransportHabit(userId, selectedHabit, parseFloat(distance));
      } else {
        result = await logNormalHabit(userId, selectedHabit);
      }

      if (result.error) {
        console.error('Error logging habit:', result.error);
        alert('Failed to log habit. Please try again.');
      } else {
        alert('Habit logged successfully!');
        navigate('/home'); // Navigate back to home after success
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    }
  };

  const handleCancel = () => {
    navigate('/home');
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      minHeight: '80vh',                  // CHANGE MADE HERE
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      textAlign: 'center',
      color: '#333',
      fontSize: '24px',
      marginBottom: '30px'
    },
    section: {
      marginBottom: '25px'
    },
    label: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px',
      display: 'block'
    },
    divider: {
      border: 'none',
      borderTop: '2px solid #4CAF50',
      margin: '5px 0 20px 0',
      width: '100%'
    },
    radioGroup: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '10px',
      marginTop: '10px'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      cursor: 'pointer',
      flex: 1
    },
    radio: {
      width: '16px',
      height: '16px',
      accentColor: '#4CAF50',
      cursor: 'pointer'
    },
    radioText: {
      fontSize: '14px',
      color: '#333'
    },
    select: {
      width: '100%',
      padding: '8px',                 // CHANGES MADE HERE
      fontSize: '14px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      boxSizing: 'border-box',
      marginTop: '10px',
      backgroundColor: '#449e58',   // CHANGE MADE HERE
      cursor: 'pointer'
    },
    selectDisabled: {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    input: {
      width: '100%',
      padding: '8px',
      fontSize: '14px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      boxSizing: 'border-box',
      marginTop: '0px'
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      marginTop: 'auto',
      paddingTop: '10px'
    },
    button: {
      flex: 1,
      padding: '14px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase'
    },
    cancelButton: {
      backgroundColor: '#f44336',
      color: 'white'
    },
    saveButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    saveButtonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    loading: {
      textAlign: 'center',
      color: '#666',
      padding: '20px'
    },
    distanceSection: {
      marginTop: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Log Habit</h1>

      {/* Category Selection */}
      <div style={styles.section}>
        <span style={styles.label}>Category:</span>
        <hr style={styles.divider} />
        
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="category"
              value="food"
              checked={selectedCategory === 'food'}
              onChange={() => handleCategoryChange('food')}
              style={styles.radio}
            />
            <span style={styles.radioText}>Food Recycling</span>
          </label>
          
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="category"
              value="transport"
              checked={selectedCategory === 'transport'}
              onChange={() => handleCategoryChange('transport')}
              style={styles.radio}
            />
            <span style={styles.radioText}>Transport</span>
          </label>
          
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="category"
              value="shopping"
              checked={selectedCategory === 'shopping'}
              onChange={() => handleCategoryChange('shopping')}
              style={styles.radio}
            />
            <span style={styles.radioText}>Shopping</span>
          </label>
        </div>
      </div>

      {/* Habit Selection Dropdown - CHANGE MADE HERE - removed co2 stats */}
      <div style={styles.section}>
        <span style={styles.label}>Select Habit:</span>
        <hr style={styles.divider} />
        
        {loading ? (
          <div style={styles.loading}>Loading habits...</div>
        ) : (
          <select
            value={selectedHabit}
            onChange={(e) => handleHabitSelect(e.target.value)}
            style={{
              ...styles.select,
              ...(habits.length === 0 ? styles.selectDisabled : {})
            }}
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

      {/* Distance Input (Transport only) */}
      {selectedCategory === 'transport' && (
        <div style={{...styles.section, ...styles.distanceSection}}>
          <span style={styles.label}>Distance travelled (km):</span>
          <hr style={styles.divider} />
          <input
            type="number"
            min="0"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g., 5.5"
            style={styles.input}
          />
        </div>
      )}

      {/* Save/Cancel Buttons */}
      <div style={styles.buttonContainer}>
        <button
          onClick={handleCancel}
          style={{...styles.button, ...styles.cancelButton}}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            ...styles.button,
            ...styles.saveButton,
            ...(!selectedHabit || (selectedCategory === 'transport' && !distance) ? styles.saveButtonDisabled : {})
          }}
          disabled={!selectedHabit || (selectedCategory === 'transport' && !distance)}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default HabitLog;