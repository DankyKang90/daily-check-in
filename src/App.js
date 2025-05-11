
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sentiment from 'sentiment';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sentimentAnalyzer = new Sentiment();

export default function DailyCheckIn() {
  const [checkInData, setCheckInData] = useState({
    physical: '',
    mental: '',
    emotional: '',
    sleep: '',
    stressors: ''
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('check_ins').select('*').order('timestamp', { ascending: false });
      if (error) console.error(error);
      else setHistory(data);
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const timestamp = new Date().toISOString();
    const moodScore = sentimentAnalyzer.analyze(Object.values(checkInData).join(' ')).score;

    const { error } = await supabase.from('check_ins').insert([
      { timestamp, ...checkInData, moodScore }
    ]);
    if (error) console.error(error);
    else {
      setHistory([{ timestamp, ...checkInData, moodScore }, ...history]);
      setCheckInData({ physical: '', mental: '', emotional: '', sleep: '', stressors: '' });
    }
  };

  return (
    <div>
      <h1>Daily Check-In</h1>
      <textarea placeholder="Physical State" value={checkInData.physical} onChange={(e) => setCheckInData({ ...checkInData, physical: e.target.value })} />
      <textarea placeholder="Mental State" value={checkInData.mental} onChange={(e) => setCheckInData({ ...checkInData, mental: e.target.value })} />
      <textarea placeholder="Emotional State" value={checkInData.emotional} onChange={(e) => setCheckInData({ ...checkInData, emotional: e.target.value })} />
      <textarea placeholder="Sleep and Rest" value={checkInData.sleep} onChange={(e) => setCheckInData({ ...checkInData, sleep: e.target.value })} />
      <textarea placeholder="External Stressors" value={checkInData.stressors} onChange={(e) => setCheckInData({ ...checkInData, stressors: e.target.value })} />
      <button onClick={handleSubmit}>Save Check-In</button>

      <h2>History</h2>
      {history.map((entry, index) => (
        <div key={index}>
          <p><strong>Date:</strong> {entry.timestamp}</p>
          <p><strong>Mood Score:</strong> {entry.moodScore}</p>
          <p><strong>Physical:</strong> {entry.physical}</p>
          <p><strong>Mental:</strong> {entry.mental}</p>
          <p><strong>Emotional:</strong> {entry.emotional}</p>
          <p><strong>Sleep:</strong> {entry.sleep}</p>
          <p><strong>Stressors:</strong> {entry.stressors}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}
