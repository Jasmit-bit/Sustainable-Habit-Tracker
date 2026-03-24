
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

export function getWeeklyData(logs) {
    if (logs.length == 0) return [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= sevenDaysAgo;
    })

    const groupByDay = weeklyLogs.reduce((count, current) => {
        const day = dayNames[new Date(current.timestamp).getDay()];

        if (!count[day]) {
            count[day] = {day: day, co2: 0, plastic: 0};
        }

        count[day].co2 += current.total_co2_saved;
        count[day].plastic += current.total_plastic_saved;

        return count;
    }, {}) 

    return Object.values(groupByDay);
}

export function getHabitFrequency(logs) {
    if (logs.length == 0) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= sevenDaysAgo;
    }) 

    const freqs = weeklyLogs.reduce((count, current) => {
        const habitName = current.habit.habit_name;
        count[habitName] = (count[habitName] || 0) + 1;
        return count;
    }, {})

    //Adapted from getTopHabits
    return Object.entries(freqs)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({habit: name, count: count}))
}