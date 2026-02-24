import { useState } from "react";
import { authService } from "./api"; 

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const user = await authService.login(username, password);
    
    // 1. Debugga: Se exakt vad backenden skickade för data
    console.log("Inloggningssvar från backend:", user);

    // 2. Kolla både 'id' och 'Id' (utifall .NET ändrat case)
    const actualId = user.id || user.Id;

    if (actualId !== undefined && actualId !== null) {
      onLoginSuccess(actualId); 
    } else {
      // Om vi hamnar här skickade backenden ingen siffra
      throw new Error("Inloggning lyckades, men inget användar-ID hittades i svaret.");
    }

  } catch (err) {
    setMessage(`Fel: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <h2>Logga in</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input 
          type="text" 
          placeholder="Användarnamn" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Lösenord" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loggar in..." : "Logga in"}
        </button>
      </form>
      
      {message && <p style={{ marginTop: 15, color: "red" }}>{message}</p>}
      
      <p style={{ marginTop: 20 }}>
        Inget konto än? <br />
        <button type="button" onClick={onSwitchToRegister} style={{ background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}>
          Skapa konto här
        </button>
      </p>
    </div>
  );
}