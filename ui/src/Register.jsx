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
        <div className="auth-title-block">
          <h1 className="logo">StepMood</h1>
          <p className="auth-subtitle">Skapa ett nytt konto</p>
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
          <div className={`error-banner auth-message ${message.includes("skapat") ? "success-banner" : ""}`}>
            {message}
          </div>
        )}

        <div className="auth-footer">
          <p>
            Har du redan ett konto? {" "}
            <button type="button" className="link-btn" onClick={onSwitchToLogin}>
              Logga in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}