import { getHabit } from '../services/habitlog.js'
import { logFoodHabit, logShoppingHabit, logTransportHabit } from '../services/habitlog.js'
import { calculateTransportCo2Saved } from '../services/habitlog.js'

export default function HabitLog() {

  async function handleClick() {
        const result = await logTransportHabit('01550eaa-3f20-450c-b44a-fd957d042ba1', '556404db-2f85-47fd-8739-4855dc15cbb6', 100);
        console.log(result)
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Log a Habit</h1>
            <button onClick={handleClick}>Test</button>
        </div>
    )

}