import { useState, useEffect, use} from 'react';
import {supabase} from '../supabaseClient';
import './Family.css';

export default function Family() {
  const [loading, setLoading] = useState(true);
  const [hasHousehold, setHasHousehold] = useState(false); 
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState(''); 
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  // variables for creating the household 
  const [isCreating, setIsCreating] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');


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

  async function createHousehold(e)
  {
    e.preventDefault();

    try{

      setLoading(true);
      setError(false);
      setMessage('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) 
        {
          throw new Error("No user logged in");
        }

        // want to create an invite code randomly I could do this in supabase but then I would have to let the
        // row to be made and then retrieve it which can be more complicated

        let isUnique = false; 
        let generatedInvCode = '';
        
       while(!isUnique)
       {
        generatedInvCode = Math.random().toString(36).substring(2,8).toUpperCase();

        // need to check if this code exists already its very unlikely but just in cas e it does
        const {data:existingHouseholds, error: searchError } = await supabase
        .from('households')
        .select('inviteCode')
        .eq('inviteCode',generatedInvCode);

        if(searchError) throw searchError;

        // no duplicate found
        if(existingHouseholds.length === 0)
        {
          isUnique = true;
        }
       }

        // now that I know that the code is unique I can add it to the database

        const {data:newHousehold, error: insertError } = await supabase
        .from('households')
        .insert([{
          name: newHouseholdName,
          inviteCode: generatedInvCode,
          amind_id: user.id
        }])
        .select()
        .single();

        if(insertError) throw insertError;

        //now that the household is created I want to update the user table with this information

        const{error:updateError} = await supabase
        .from('profiles')
        .update({household_id: newHousehold.id})
        .eq('id',user.id);

        if(updateError) throw updateError;

        setHouseholdName(newHousehold.name);
        setInviteCode(newHousehold.inviteCode);
        setHasHousehold(true);
        setIsCreating(false);
    }
    catch(error)
    {
      setError(true);
      setMessage(error.message);
    }
    finally
    {
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