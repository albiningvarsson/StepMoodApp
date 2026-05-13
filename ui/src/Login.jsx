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
      const actualId = user.id || user.Id;
      if (actualId) onLoginSuccess(actualId);
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
          <p className="auth-subtitle">Logga in på ditt konto</p>
        </div>

        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-group">
            <label>Användarnamn</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Skriv ditt namn..."
              required 
            />
          </div>
          <div className="form-group">
            <label>Lösenord</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        {message && <div className="error-banner auth-message">{message}</div>}

        <div className="auth-footer">
          <p>
            Inget konto? {" "}
            <button type="button" className="link-btn" onClick={onSwitchToRegister}>
              Skapa konto
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}