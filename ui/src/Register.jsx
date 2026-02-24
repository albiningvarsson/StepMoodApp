import { useState } from "react";
import { authService } from "./api"; 

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(username, password);
      setMessage("Konto skapat! Skickar dig till loggin...");
      setTimeout(() => onRegisterSuccess(), 2000); 
    } catch (err) {
      setMessage(`Fel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 className="logo">StepMood</h1>
          <p style={{ color: "var(--muted)", marginTop: "5px" }}>Skapa ett nytt konto</p>
        </div>

        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-group">
            <label>Välj användarnamn</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Ditt namn"
              required 
            />
          </div>
          <div className="form-group">
            <label>Välj lösenord</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Minst 6 tecken"
              required 
            />
          </div>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Skapar konto..." : "Gå med nu"}
          </button>
        </form>

        {message && (
          <div className="error-banner" style={{ 
            marginTop: "20px", 
            background: message.includes("skapat") ? "#ecfdf5" : "#fee2e2",
            color: message.includes("skapat") ? "#047857" : "#b91c1c",
            borderColor: message.includes("skapat") ? "#10b981" : "#f87171"
          }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: "25px", textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            Har du redan ett konto? {" "}
            <button type="button" className="btn-logout" style={{ border: "none", color: "var(--primary)", padding: "0" }} onClick={onSwitchToLogin}>
              Logga in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}