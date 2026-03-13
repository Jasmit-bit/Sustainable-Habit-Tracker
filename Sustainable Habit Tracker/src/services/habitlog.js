import { supabase } from '../supabaseClient.js'

export async function logHabit(userID, habitID) {
    const { data, error } = await supabase
    .from('habit_logs')
    .insert({
        user_id: userID,
        habit_id: habitID
    }
    )
    
    return { data, error };
}

export async function getHabit(habitName) {
    const { data, error } = await supabase
    .from('habit')
    .select('*')
    .eq('habit_name', habitName)

    return { data, error };
}


// Transport functions - calculating Co2 saved per km ccompared to a petrol car

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
