import { supabase } from '../supabaseClient.js'

export async function logNormalHabit(userID, habitID) {
    // Extracting totalCo2 and totalPlastic
    const { data: habitData, error: habitError } = await getHabit(habitID);

    const totalCo2 = habitData[0].co2Saved;
    const totalPlastic = habitData[0].plasticSaved;

    // Inserting into habits_log table
    const { data, error } = await supabase
    .from('habit_logs')
    .insert({
        user_id: userID,
        habit_id: habitID,
        total_co2_saved: totalCo2,
        total_plastic_saved: totalPlastic
    }
    )
    
    return { data, error };
}

export async function logTransportHabit(userID, habitID, distance) {
    // Calculating totalCo2 and plasticSaved
    const { data: habitData, error: habitError } = await getHabit(habitID);

    const totalCo2 = habitData[0].co2Saved * distance;
    const totalPlastic = habitData[0].plasticSaved;

    // Inserting into habits_log table
    const { data, error } = await supabase
    .from('habit_logs')
    .insert({
        user_id: userID,
        habit_id: habitID,
        total_co2_saved: totalCo2,
        total_plastic_saved: totalPlastic
    }
    )
    
    return { data, error };
}

export async function getHabit(habitID) {
    const { data, error } = await supabase
    .from('habit')
    .select('*')
    .eq('id', habitID)

    return { data, error };
}


export async function getHabitsByCategory(category) {
    const { data, error } = await supabase
        .from('habit')
        .select('*')
        .eq('category', category)

    return { data, error }
}


// Transport function - calculating Co2 saved per km ccompared to a petrol car
export async function calculateTransportCo2Saved(transportName, distanceKm) {
    const { data, error } = await supabase
    .from('habit')
    .select('co2Saved')
    .eq('category', 'transport')
    .eq('habit_name', transportName)

    if (error) {
        console.log(error);
        return null;
    }

    if (data && data.length > 0) {
        const co2PerKm = data[0].co2Saved;
        const totalCo2Saved = co2PerKm * distanceKm;

        return totalCo2Saved;
    }
}

