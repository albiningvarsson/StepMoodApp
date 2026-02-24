import { useEffect, useState } from "react";
import { dayService } from "./api";
import { fetchWeather } from "./WeatherService"; 
import Register from "./Register";
import Login from "./Login";
import "./App.css";

const todayIso = () => new Date().toISOString().split('T')[0];

const getWeatherEmoji = (code) => {
  if (code === undefined || code === null) return "";
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  return "⛈️";
};

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
  
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

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

  const handleGetWeather = () => {
    setWeatherLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchWeather(latitude, longitude, date); 
          setWeather(data);
        } catch (e) {
          setError("Kunde inte hämta väder: " + e.message);
        } finally {
          setWeatherLoading(false);
        }
      },
      (err) => {
        setError("Du måste tillåta GPS.");
        setWeatherLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await dayService.create(Number(userId), { 
        date, 
        steps: Number(steps), 
        mood: Number(mood), 
        note,
        weather 
      });
      setNote(""); 
      setWeather(null);
      loadData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (targetDate) => {
    if (!confirm(`Ta bort ${targetDate}?`)) return;
    try {
      await dayService.delete(targetDate, userId);
      loadData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = () => {
    setUserId(null);
    setView("login");
  };

  if (view === "register") {
    return <Register onRegisterSuccess={() => setView("login")} onSwitchToLogin={() => setView("login")} />;
  }

  if (view === "login") {
    return <Login onLoginSuccess={(id) => { setUserId(id); setView("dashboard"); }} onSwitchToRegister={() => setView("register")} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="logo">StepMood</h1>
          <p className="subtitle">Följ din hälsa och ditt humör</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logga ut
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="content-grid">
        {/* FORMULÄR - Fast till vänster */}
        <section className="card form-card">
          <h2>Hur var din dag?</h2>
          <form onSubmit={handleSubmit} className="form-layout">
            <div className="form-group">
              <label>Datum</label>
              <input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Antal steg</label>
              <input
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Humör (1-5)</label>
              <select
                className="custom-select"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                <option value="1">1 - Riktigt segt</option>
                <option value="2">2 - Inte på topp</option>
                <option value="3">3 - Helt okej</option>
                <option value="4">4 - Riktigt bra</option>
                <option value="5">5 - Magiskt!</option>
              </select>
            </div>
            <div className="form-group">
              <label>Anteckning</label>
              <input
                type="text"
                placeholder="Något särskilt som hände?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="weather-section">
              {weather ? (
                <div className="weather-active">
                  <span>
                    {getWeatherEmoji(weather.weatherCode)}{" "}
                    {weather.temperature.toFixed(1)}°C
                  </span>
                  <button
                    type="button"
                    className="btn-clear-weather"
                    onClick={() => setWeather(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleGetWeather}
                  disabled={weatherLoading}
                >
                  {weatherLoading ? "Hämtar..." : "📍 Hämta väder automatiskt"}
                </button>
              )}
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sparar..." : "Spara dag"}
            </button>
          </form>
        </section>

        {/* HISTORIK - Scrollbar till höger */}
        <section className="history-section">
          <div className="history-header">
            <h2>Historik</h2>
            <span className="history-count">{days.length} loggade dagar</span>
          </div>

          <div className="history-list">
            {days.length === 0 && !loading && (
              <p className="empty">Ingen data än. Ut och gå!</p>
            )}

            {days.map((d) => (
              <div key={d.date} className="history-item">
                <div className="history-main">
                  <div className="history-header">
                    <span className="date">{d.date}</span>
                    <span className="weather-emoji">
                      {getWeatherEmoji(d.weather?.weatherCode)}
                    </span>
                  </div>

                  <div className="steps-row">
                    <span className="steps">
                      {d.steps.toLocaleString()} steg
                    </span>
                    <span className="mood-badge">Mådde {d.mood}/5</span>
                  </div>

                  {/* Här kommer temperaturen in! */}
                  {d.weather && (
                    <div className="weather-meta">
                      {d.weather.temperature}°C | {d.weather.windSpeed} m/s
                    </div>
                  )}

                  {d.note && <p className="note-text">"{d.note}"</p>}
                </div>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(d.date)}
                  title="Radera dag"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}