
export function calculateCO2Saved(logs) {
    try {
        const total = logs.reduce((sum, current) => sum + current.total_co2_saved, 0);
        return Number(total.toFixed(2)); // like on the lob habit page this added a small number so I fixed that
    } catch (error) {
        return 0;
    } 
}

export function calculatePlasticSaved(logs) {
  try {
    const total = logs.reduce((sum, current) => sum + current.total_plastic_saved, 0);
    return Number(total.toFixed(2)); // like on the lob habit page this added a small number so I fixed that
  } catch (error) {
    return 0;
  }
}

export function getTimePeriod(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    else if (hour >= 12 && hour < 18) return 'afternoon';
    else return 'night';
}

export function getMostFrequent(logs) {

    if (logs.length == 0) return null;

    const freqs = logs.reduce((count, current) => {
        const habitName = current.habit.habit_name;
        count[habitName] = (count[habitName] || 0) + 1;
        return count;
    }, {})

    const nameArray = Object.keys(freqs);

    let mostFrequent = nameArray[0];
    for (let i = 1; i < nameArray.length; i++) {
        if (freqs[nameArray[i]] > freqs[mostFrequent]) {
            mostFrequent = nameArray[i];
        }
    }
    return mostFrequent;

}