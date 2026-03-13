import { getHabit } from '../services/habitlog.js'
import { logHabit } from '../services/habitlog.js'
import { calculateTransportCo2Saved } from '../services/habitlog.js'

export default function HabitLog() {

  async function handleClick() {
        const result = await calculateTransportCo2Saved('Walked', 1000);
        console.log(result)
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Log a Habit</h1>
            <button onClick={handleClick}>Test</button>
        </div>
    )

}