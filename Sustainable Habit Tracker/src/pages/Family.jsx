import { useState, useEffect, use} from 'react';
import {supabase} from '../supabaseClient';
import './Family.css';

export default function Family() {

  // base variables
  const [loading, setLoading] = useState(true);
  const [hasHousehold, setHasHousehold] = useState(false); 
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState(''); 
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  // variables for creating the household only
  const [isCreating, setIsCreating] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  // variable used for joining only
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  //list for holding all the family membs for the dashboard
  const[members, setMembers] = useState([]);
  // goal setting variables 
  const [co2Goal, setCo2Goal] = useState(0);
  const [draftGoal,setDraftGoal] = useState('');// I was having a bug where the even if i press cancel it would already update the goal
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // I want to to make the leaderboard a bit more clearer and I want to highlight the current user so I need to know who the current user is 
  const[currentUserId,setCurrentUserId] = useState(null);
  

  useEffect(() => {
    checkHouseExists();
  }, []);

  // because every user starts off with no household I need to check if they have a household or not, if they do then I set that otherwise I show I different screen 
  // which tells them to create or join a household
  async function getMembers(householdId)
  {
    const{data:list,error} = await supabase.
    from('profiles')
    .select('id, name, username, co2_saved')
    .eq('household_id',householdId)
    .order('co2_saved', { ascending: false, nullsFirst: false }); // by doing this i can make the users be sorted by 
    if(error)
    {
      // this error isnt really going to be able to be fixed by the user so I am just going to put in the console instead of showing it to the user and I might change it later but cba atm
      console.error("error getting member:", error);
    }
    else
    {
      setMembers(list);
    }
  }

  // the achievement share feature

  async function shareProgress()
  {
    // because the list I saved for the leaderboard is ordered I can just get their position by going through the members list
    let userPosition = -1;

    for(let i = 0;  i<members.length; i++)
    {
      if(members[i].id === currentUserId)
      {
        userPosition = i;
        break;
      }
    }

    if(userPosition === -1)
    {
      console.log("Issue  please fix the code"); // error message while im coding if i see this it probably means that the user isnt loaded yet
      return;
    }

    const userStats = members[userPosition];
    userPosition++;// need to account for the lists starting at 0
    const saved = userStats.co2_saved;

    const textToShare = `I have saved ${saved} kg of CO2 this month and I'm currently rank #${userPosition} in my household on the Sustainable Habit Tracker App! Can you beat me? Message me to get my family code, lets Compete!!!`

    // most new browsers have the sharing feature built in so in theory this should bring the pop up screen with the socials
    if(navigator.share)
    {
      try
      {
        await navigator.share({
          title: 'My Eco Progress',
          text : textToShare
        });
      }
      catch(error)
      {
        console.log("Sharing cancelled or failed :", error);
      }
    }
    else
    { 
      // if its not a new browser being used just save it to the clipboard
       try
       {
        await navigator.clipboard.writeText(textToShare);
        alert("Progress copied to clipboard.")
       }
       catch(error)
       {
        alert("Failed to copy text.")

       }

    }




  }

 async function updateGoal(e) {
    e.preventDefault();

    const goalNumber = Number(draftGoal);
      if(goalNumber<=0) // in theory you should never be able to hit this if statement because I added the html constraint but just in case
      {
        setError(true);
        setMessage("Please enter a positive goal");
        return;
      }
      else if(goalNumber>=1000000)
      {
        setError(true);
        setMessage("Please set a realistic goal");
        return;
      }

   try {
      setLoading(true);
      setError(false); 
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('households')
        .update({ co2_goal: goalNumber })
        .eq('admin_id', user.id); 

      if (error) throw error;

      setCo2Goal(goalNumber);
      setIsEditingGoal(false);
    } catch (error) {
      setError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkHouseExists() {
    try {
      setMessage('');
  
      // get the current user 
      const {data : {user}} = await supabase.auth.getUser();

      // this screen is locked behind a log in screen but just incase the user does manage to get to this page without being logged in I am going to add a error message
      if(!user) throw new Error("No user logged in")

        setCurrentUserId(user.id);



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
        .select('name, inviteCode,admin_id,co2_goal') 
        .eq('id', profile.household_id)
        .single();

        if(householdError) {throw householdError;}
      
        // set the houshold name and the invite code for the household to share it with someone else
        if(household){
          setHouseholdName(household.name);
          setInviteCode(household.inviteCode);
          setCo2Goal(household.co2_goal);

          if(user.id===household.admin_id)
          {
            setIsAdmin(true);
          }

          await getMembers(profile.household_id)
        }
      }
      else 
      {      
        setHasHousehold(false);
      }
    } catch (error) { 
      setError(true);
      setMessage(error.message || "Something went wrong fetching your household.");
    } finally {
      // loading finshed so I can stop showing the loading screen
      setLoading(false);
    } 
  }

  async function handleCreateHousehold(e)
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
        // I could have done this in Supabase now that I think about it but its easier this way so I dont need to create a household to get an invite code
        generatedInvCode = Math.random().toString(36).substring(2,8).toUpperCase();

        // need to check if this code exists already its very unlikely but just in cas e it does
        const {data:existingHouseholds, error: searchError } = await supabase
        .from('households')
        .select('inviteCode')
        .eq('inviteCode',generatedInvCode);

        if(searchError) throw searchError;

        
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
          admin_id: user.id 
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
        setIsAdmin(true);
        await getMembers(newHousehold.id)
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

  async function handleJoinHousehold(e)
  {
    e.preventDefault();

    try {
      setLoading(true);
      setError(false);
      setMessage('');

      const{data: {user}} = await supabase.auth.getUser();
      if (!user) 
        {
          throw new Error("No user logged in");
        }
      
        //look for the household with the entered invite code
        const { data: household, error: searchError } = await supabase
        .from('households')
        .select('id, name, inviteCode,co2_goal, admin_id')
        .eq('inviteCode', joinCode.toUpperCase())
        .single();

        // on reddit I found that if supabase doesnt find a match, the error code is PGRST116

        if (searchError) {
        if (searchError.code === 'PGRST116') {
          throw new Error("Invalid invite code, Please check and try again.");
        }
        throw searchError;
      }

      //if found add the update the profile to link to the household

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ household_id: household.id })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setHouseholdName(household.name);
      setInviteCode(household.inviteCode);
      setHasHousehold(true);
      setIsJoining(false);

      if(user.id===household.admin_id)
      {
        setIsAdmin(true);
      }
      
      setCo2Goal(household.co2_goal||0);

      await getMembers(household.id);
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

  async function leaveHousehold()
  {
    // im going to add a warning first to let the user confirm that they want to leave

    if(!window.confirm("Are you sure you want to leave?"))
    {
      return;
    }

    try{
      setLoading(true);
      setError(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");
      // to leave its simple im just going to remove the id of the houshold its linked to
        const { error: updateError } = await supabase
        .from('profiles')
        .update({ household_id: null })
        .eq('id', user.id);
        if (updateError) throw updateError;
        //now that I have left i need to update the screen and the variables I made at the top
        setHasHousehold(false);
        setHouseholdName('');
        setInviteCode('');
        setMembers([]);
        setCo2Goal(0);
        setIsAdmin(false);
    }
    catch(error)
    {
      setError(true);
      setMessage(error.message);
    }finally{
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading..</div>;
  }


  return (
    <div className="family-container">
      {/* error message for the errors thrown above */}
      {error && <div className="error-message">{message}</div>}

      {/* if they do have a family I am going to render the dashboard otherwise the no household screen gets shown */}
      {hasHousehold ? (
        <div className="household-dashboard">
          <div className="dashboard-header">
            <h2>{householdName}</h2>
            <p>Invite Code: <span className="invite-badge">{inviteCode}</span></p>
            <button
              onClick={() =>
              {navigator.clipboard.writeText(inviteCode);
                alert("Invite code copied!");
              }}
            >Copy</button>
          </div>

          <div className="co2-goal-section">
            <h3>Monthly CO2 Goal</h3>
            
            {isEditingGoal && isAdmin ? (
              <form onSubmit={updateGoal} className="goal-form">
                <input 
                  type="number" 
                  min="1"
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                />
                <button type="submit">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditingGoal(false)}>Cancel</button>
              </form>
            ) : (
              <div className="goal-display">
                <p className="goal-number">{co2Goal} kg</p>
                {isAdmin && (
                  <button onClick={() => {
                    setDraftGoal(co2Goal); 
                    setIsEditingGoal(true); 
                  }}>
                    Edit Goal
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="members-section">
            <div className="members-section-header">
              <h3>Family Members</h3>
              <button className="share-btn" onClick={shareProgress}>
                Share My Rank
              </button>
            </div>
            {members.length > 0 ? (
              <ul className="members-list">
                {members.map((member, index) => {
                  const saved = member.co2_saved || 0;
                  const goal = co2Goal || 0;
                  const progressPercent = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;

                  const isCurrentUser = (member.id ===currentUserId);

                  return (
                    <li key={index} className={`member-item ${isCurrentUser ? 'current-user-card' : ''}`}>
                      <div className="member-avatar">
                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      
                      <div className="member-info-container">
                        <div className="member-info-header">
                          <span className="member-name">
                            {member.name} 
                            {isCurrentUser && <span className="you-badge">(You)</span>}
                          </span> 
                          <span className="member-username">@{member.username}</span>
                        </div>
                        
                        <div className="progress-section">
                          <div className="progress-stats">
                            <span>{saved} kg saved</span>
                            <span>{goal} kg goal</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>Loading members...</p>
            )}
          </div>
          <div className="dashboard-footer">
            <button 
              className="leave-btn" 
              onClick={leaveHousehold}
            >
              Leave Household
            </button>
          </div>
        </div>
      ) : (
        <div className="no-household-screen">
          <h2>You don't have a household yet!</h2>
          <p>Create a new household or join an existing one.</p>
          
          {/* initial buttons */}
          {!isCreating && !isJoining && (
            <div className="action-buttons">
              <button onClick={() => setIsCreating(true)}>Create a Household</button>
              <button onClick={() => setIsJoining(true)}>Join a Household</button>
            </div>
          )}

          {/*form to create a household */}
          {isCreating && (
            <form onSubmit={handleCreateHousehold} className="create-form">
              <input 
                type="text" 
                placeholder="Enter Household Name" 
                value={newHouseholdName}
                onChange={(e) => setNewHouseholdName(e.target.value)}
                required
              />
              <button type="submit">Submit</button>
              <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
            </form>
          )}

          {isJoining && (
            <form onSubmit={handleJoinHousehold} className="join-form">
              <input 
                type="text" 
                placeholder="Enter 6 Digit Invite Code" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={6} 
                required
              />
              <button type="submit">Join</button>
              <button type="button" className="cancel-btn" onClick={() => setIsJoining(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}