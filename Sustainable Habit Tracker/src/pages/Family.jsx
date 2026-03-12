import { useState, useEffect, use} from 'react';
import {supabase} from '../supabaseClient';
import './Family.css';

export default function Family() {
  const[loading,setLoading] = useState(true);
  const [hasHousehld, setHasHousehold] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState(''); 

  useEffect(() => {
    checkHouseExists();
  }, []);

  // because every user starts off with no household I need to check if they have a household or not, if they do then I set that otherwise I show I different screen 
  // which tells them to create or join a household

  async function checkHouseExists() {
    const user = supabase.auth.user();
    



