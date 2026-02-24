import { useState } from "react";
// 1. Vi importerar authService från din api.js-fil
import { authService } from "./api"; 

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 2. Istället för en krånglig fetch, använder vi tjänsten vi skapade
      // Denna kommer automatiskt använda rätt URL från din api.js
      await authService.register(username, password);

      setMessage("Konto skapat! Du kan nu logga in.");
      
      // Vänta 2 sekunder så användaren hinner se meddelandet, sen byt vy
      setTimeout(() => onRegisterSuccess(), 2000); 

    } catch (err) {
      // Om backenden skickar ett fel (t.ex. "Användaren finns redan") 
      // så hamnar det här tack vare vår handleResponse i api.js
      setMessage(`Fel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <h2>Skapa konto</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input 
          type="text" 
          placeholder="Välj användarnamn" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Välj lösenord" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Skapar konto..." : "Registrera mig"}
        </button>
      </form>
      
      {message && (
        <p style={{ marginTop: 15, color: message.includes("Fel") ? "red" : "green" }}>
          {message}
        </p>
      )}
      
      <p style={{ marginTop: 20 }}>
        Har du redan ett konto? <br />
        <button 
          type="button" // Viktigt så den inte submittar formuläret
          onClick={onSwitchToLogin} 
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}
        >
          Logga in här
        </button>
      </p>
    </div>
  );
}