import { useState, useEffect, use} from 'react';
import {supabase} from '../supabaseClient';
//import './Family.css';

export default function Family() {
  const [loading, setLoading] = useState(true);
  const [hasHousehold, setHasHousehold] = useState(false); 
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState(''); 
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    checkHouseExists();
  }, []);

  // because every user starts off with no household I need to check if they have a household or not, if they do then I set that otherwise I show I different screen 
  // which tells them to create or join a household

  async function checkHouseExists() {
    try {
      setMessage('');
  
      // get the current user 
      const {data : {user}} = await supabase.auth.getUser();

      // this screen is locked behind a log in screen but just incase the user does manage to get to this page without being logged in I am going to add a error message

      if(!user) throw new Error("No user logged in")

      // check if the user has an household already
      const { data : profile, error } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('id', user.id)
        .single();

      // if there is an error throw it
      if(error) {throw error;}

      // if the user has a household then set it to true and get the household object  
      if(profile.household_id) {
        setHasHousehold(true);
        const{data:household, error:householdError} = await supabase
        .from('households')
        .select('name, inviteCode') 
        .eq('id', profile.household_id)
        .single();

        if(householdError) {throw householdError;}
      
        // set the houshold name and the invite code for the household if you want to share it with someone else
        if(household){
          setHouseholdName(household.name);
          setInviteCode(household.inviteCode);
        }
      }
      else 
      {      
        setHasHousehold(false);
      }
    } catch (error) { 
      // Handle errors thrown in the try block
      setError(true);
      setMessage(error.message || "Something went wrong fetching your household.");
    } finally {
      // loading finshed so I can stop showing the loading screen
      setLoading(false);
    } 
  }

  if (loading) {
    return <div className="loading-screen">Loading..</div>;
  }

  return (
    <div className="family-container">
      {/* Error message for the errors thrown above */}
      {error && <div className="error-message">{message}</div>}

      {/* if they do have a family I am going to render the dashboard otherwise the no household screen gets shown */}
      {hasHousehold ? (
        <div className="household-dashboard">
          <h2>Welcome to the {householdName} Household</h2>
          <p>Invite Code: <strong>{inviteCode}</strong></p>
        </div>
      ) : (
        <div className="no-household-screen">
          <h2>You don't have a household yet!</h2>
          <p>Create a new household or join an existing one.</p>
          <button>Create a Household</button>
          <button>Join a Household</button>
        </div>
      )}
    </div>
  );
}