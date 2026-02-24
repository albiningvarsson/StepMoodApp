import { useEffect, useState } from "react";
import { dayService } from "./api";
import Register from "./Register";
import Login from "./Login"; // <-- 1. Glöm inte denna import!

const todayIso = () => new Date().toISOString().split('T')[0];

export default function App() {
  const [userId, setUserId] = useState(null); 
  const [view, setView] = useState("register");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState(todayIso());
  const [steps, setSteps] = useState(6000);
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");

  const loadData = async () => {
    if (!userId) return;
    setError("");
    setLoading(true);
    try {
      const data = await dayService.getAll(userId);
      setDays(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("DEBUG: userId just nu är:", userId);
    setError("");
    try {
      await dayService.create({ userId: Number(userId), date, steps: Number(steps), mood: Number(mood), note });
      setNote(""); 
      loadData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (date) => {
    if (!confirm(`Ta bort ${date}?`)) return;
    try {
      // Vi måste skicka med userId här så api.js kan bygga rätt URL
      await dayService.delete(date, userId); 
      loadData();
    } catch (e) {
      setError(e.message);
    }
  };

  // --- LOGIK FÖR VILKEN VY SOM SKA VISAS ---

  if (view === "register") {
    return <Register onRegisterSuccess={() => setView("login")} onSwitchToLogin={() => setView("login")} />;
  }

  if (view === "login") {
    // 2. Här tog jag bort den extra måsvingen }
    return (
      <Login 
        onLoginSuccess={(id) => { setUserId(id); setView("dashboard"); }} 
        onSwitchToRegister={() => setView("register")} 
      />
    );
  }

  // Om vi är inloggade (view === "dashboard")
  return (
    <div style={{ fontFamily: "system-ui", padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <h1>StepMood</h1>
         <button onClick={() => { setUserId(null); setView("login"); }}>Logga ut</button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fff5f5", border: "1px solid #f99", color: "#c00", marginBottom: 20 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, background: "#f9f9f9", padding: 20, borderRadius: 8 }}>
        <input type="date" value={date} max={todayIso()} onChange={e => { setDate(e.target.value); setError(""); }} />
        <input type="number" placeholder="Steps" value={steps} onChange={e => { setSteps(e.target.value); setError(""); }} />
        <select value={mood} onChange={e => { setMood(e.target.value); setError(""); }} >
          {[1,2,3,4,5].map(m => <option key={m} value={m}>Mood: {m}</option>)}
        </select>
        <input type="text" placeholder="Note" value={note} onChange={e => { setNote(e.target.value); setError(""); }} />
        <button type="submit" disabled={loading}>Spara dag</button>
      </form>

      <h2 style={{ marginTop: 40 }}>Historik</h2>
      {loading ? <p>Laddar...</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {days.map(d => (
            <li key={d.date} style={{ padding: "10px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>{d.date}</strong>: {d.steps} steg (Mådde {d.mood}/5)
                <br /> <small style={{ color: "#666" }}>{d.note}</small>
              </span>
              <button onClick={() => handleDelete(d.date)} style={{ color: "red" }}>Radera</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}