import { supabase } from '../supabaseClient.js'

export async function logNormalHabit(userID, habitID) {
    // Extracting totalCo2 and totalPlastic
    const { data: habitData, error: habitError } = await getHabit(habitID);

    const totalCo2 = habitData[0].co2Saved;
    const totalPlastic = habitData[0].plasticSaved;

    // Inserting into habits_log table
    const { data, error:logError } = await supabase
    .from('habit_logs')
    .insert({
        user_id: userID,
        habit_id: habitID,
        total_co2_saved: totalCo2,
        total_plastic_saved: totalPlastic
    }
    )
    if (logError) return { error: logError };


    // philip's code didnt update the profiles table so I am going to do that here
    // first I pull from the table then i update it and push it back
    const { data: user } = await supabase
        .from('profiles')
        .select('co2_saved')
        .eq('id', userID)
        .single();

    // js was breaking and adding a 0.000000002 so this fixes that
    const newTotal = Number(((user.co2_saved || 0) + totalCo2).toFixed(2));
    const { error: updateError } = await supabase
    .from('profiles')
    .update({ co2_saved: newTotal })
    .eq('id', userID);

    return { error: updateError };
}   

export async function logTransportHabit(userID, habitID, distance) {
    // Calculating totalCo2 and plasticSaved
    const { data: habitData, error: habitError } = await getHabit(habitID);

    // js was breaking and adding a 0.000000002 so this fixes that
    const totalCo2 = Number((habitData[0].co2Saved * distance).toFixed(2));;
    const totalPlastic = habitData[0].plasticSaved;

    // Inserting into habits_log table
    const { data, error:logError } = await supabase
    .from('habit_logs')
    .insert({
        user_id: userID,
        habit_id: habitID,
        total_co2_saved: totalCo2,
        total_plastic_saved: totalPlastic
    }
    )
    
    if(logError)
    {
        return {error: logError};
    }
    
    // philip's code didnt update the profiles table so I am going to do that here
    // first I pull from the table then i update it and push it back
    const { data: user } = await supabase
        .from('profiles')
        .select('co2_saved')
        .eq('id', userID)
        .single();

    const newTotal = Number(((user.co2_saved || 0) + totalCo2).toFixed(2));
    const { error: updateError } = await supabase
    .from('profiles')
    .update({ co2_saved: newTotal })
    .eq('id', userID);

    return { error: updateError };
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

