import { useCallback, useEffect, useMemo, useState } from "react";
import { authService, dayService } from "./api";
import { fetchWeather } from "./WeatherService";
import Register from "./Register";
import Login from "./Login";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const todayIso = () => new Date().toISOString().split("T")[0];
const chartPalette = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0ea5e9"];
const formatThousands = (value) => `${Math.round(value).toLocaleString("sv-SE")}`;
const avg = (numbers) =>
  numbers.length ? Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length) : 0;
const formatMonth = (monthKey) =>
  new Date(`${monthKey}-01`).toLocaleDateString("sv-SE", { month: "short", year: "2-digit" });

const getWeatherEmoji = (code) => {
  if (code === undefined || code === null) return "";
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  return "⛈️";
};

const moodLabel = (mood) => {
  if (mood <= 1) return "Tung dag";
  if (mood === 2) return "Lite seg";
  if (mood === 3) return "Stabil";
  if (mood === 4) return "Bra dag";
  return "Toppen";
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("90");
  const [date, setDate] = useState(todayIso());
  const [steps, setSteps] = useState(6000);
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const overview = useMemo(() => {
    if (!days.length) return null;

    const allSorted = [...days].sort((a, b) => new Date(a.date) - new Date(b.date));
    const scopeCount = period === "all" ? allSorted.length : Number(period);
    const scoped = allSorted.slice(-scopeCount);

    const monthlyMap = new Map();
    for (const day of scoped) {
      const key = day.date.slice(0, 7);
      if (!monthlyMap.has(key)) monthlyMap.set(key, []);
      monthlyMap.get(key).push(day);
    }

    const monthly = [...monthlyMap.entries()].map(([month, entries]) => ({
      month,
      monthLabel: formatMonth(month),
      avgSteps: avg(entries.map((d) => d.steps)),
      avgMood: Number((entries.reduce((sum, d) => sum + d.mood, 0) / entries.length).toFixed(1)),
    }));

    const niceWeather = scoped.filter((d) => d.weather && d.weather.weatherCode <= 3);
    const roughWeather = scoped.filter((d) => d.weather && d.weather.weatherCode > 3);
    const goodMood = scoped.filter((d) => d.mood >= 4);
    const lowMood = scoped.filter((d) => d.mood <= 2);

    const gymDays = scoped.filter((d) => (d.note || "").toLowerCase().includes("gym"));
    const runDays = scoped.filter((d) => {
      const text = (d.note || "").toLowerCase();
      return text.includes("löp") || text.includes("run");
    });

    const consistency = Math.round((scoped.filter((d) => d.steps >= 8000).length / scoped.length) * 100);
    const bestDay = scoped.reduce((best, d) => (d.steps > best.steps ? d : best), scoped[0]);

    const trendSeries = scoped.slice(-30).map((d) => ({
      date: d.date.slice(5),
      steps: d.steps,
      mood: d.mood,
    }));

    const moodBucketsForChart = Array.from({ length: 5 }, (_, index) => {
      const moodValue = index + 1;
      const entries = scoped.filter((d) => d.mood === moodValue);
      return {
        mood: moodValue,
        avgSteps: avg(entries.map((d) => d.steps)),
        days: entries.length,
      };
    }).filter((bucket) => bucket.days > 0);

    return {
      totalDaysAll: allSorted.length,
      totalDaysScope: scoped.length,
      avgSteps: avg(scoped.map((d) => d.steps)),
      avgMood: (scoped.reduce((sum, d) => sum + d.mood, 0) / scoped.length).toFixed(1),
      consistency,
      bestDay,
      weatherDelta: avg(niceWeather.map((d) => d.steps)) - avg(roughWeather.map((d) => d.steps)),
      moodDelta: avg(goodMood.map((d) => d.steps)) - avg(lowMood.map((d) => d.steps)),
      gymAvg: avg(gymDays.map((d) => d.steps)),
      runAvg: avg(runDays.map((d) => d.steps)),
      monthly,
      trendSeries,
      moodBucketsForChart,
      history: [...scoped].reverse(),
    };
  }, [days, period]);

  useEffect(() => {
    const session = authService.getSession();
    if (session?.user) {
      setUser(session.user);
      setView("dashboard");
    }
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    setDays([]);
    setView("login");
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const data = await dayService.getAll();
      setDays(data);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("401")) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [user, handleLogout]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, loadData]);

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
      () => {
        setError("Du måste tillåta GPS.");
        setWeatherLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await dayService.create({
        date,
        steps: Number(steps),
        mood: Number(mood),
        note,
        weather,
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
      await dayService.delete(targetDate);
      loadData();
    } catch (e) {
      setError(e.message);
    }
  };

  if (view === "register") {
    return <Register onRegisterSuccess={() => setView("login")} onSwitchToLogin={() => setView("login")} />;
  }

  if (view === "login") {
    return (
      <Login
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setView("dashboard");
        }}
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="logo">StepMood Intelligence</h1>
          <p className="subtitle">Professional wellness performance dashboard</p>
          {user && <p className="signed-in-as">Inloggad som {user.username}</p>}
        </div>
        <div className="header-actions">
          <div className="period-switch">
            {[
              { id: "30", label: "30d" },
              { id: "90", label: "90d" },
              { id: "365", label: "12m" },
              { id: "all", label: "All" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={`period-btn ${period === option.id ? "active" : ""}`}
                onClick={() => setPeriod(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logga ut
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-layout">
        <main className="dashboard-main">
          {overview && (
            <section className="kpi-grid">
              <article className="kpi-card">
                <span>Genomsnitt steg</span>
                <strong>{overview.avgSteps.toLocaleString("sv-SE")}</strong>
              </article>
              <article className="kpi-card">
                <span>Genomsnitt humör</span>
                <strong>{overview.avgMood}/5</strong>
              </article>
              <article className="kpi-card">
                <span>8k+ dagar</span>
                <strong>{overview.consistency}%</strong>
              </article>
              <article className="kpi-card">
                <span>Bästa dag</span>
                <strong>{overview.bestDay.steps.toLocaleString("sv-SE")}</strong>
              </article>
              <article className="kpi-card">
                <span>Loggar (visas / totalt)</span>
                <strong>{overview.totalDaysScope}/{overview.totalDaysAll}</strong>
              </article>
            </section>
          )}

          {overview && (
            <section className="card chart-card">
              <h2>Trend och samband</h2>
              <div className="chart-grid">
                <div className="chart-panel">
                  <h3>Steg och humör - senaste 30 loggar</h3>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <ComposedChart data={overview.trendSeries}>
                        <defs>
                          <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="steps" tickFormatter={formatThousands} />
                        <YAxis yAxisId="mood" orientation="right" domain={[1, 5]} allowDecimals={false} width={32} />
                        <Tooltip formatter={(value, name) => (name === "Steg" ? [formatThousands(value), name] : [value, name])} />
                        <Legend />
                        <Area yAxisId="steps" type="monotone" dataKey="steps" fill="url(#stepsGradient)" stroke="none" />
                        <Line yAxisId="steps" type="monotone" dataKey="steps" stroke="#2563eb" dot={false} strokeWidth={2.4} name="Steg" />
                        <Line yAxisId="mood" type="monotone" dataKey="mood" stroke="#f59e0b" dot={false} strokeWidth={2} name="Humör" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-panel">
                  <h3>Snittsteg per månad</h3>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={overview.monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis tickFormatter={formatThousands} />
                        <Tooltip formatter={(value) => [`${formatThousands(value)} steg`, "Snitt"]} />
                        <Bar dataKey="avgSteps" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-panel chart-panel-full">
                  <h3>Samband: humörnivå och aktivitetsnivå</h3>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={290}>
                      <ComposedChart data={overview.moodBucketsForChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="mood" tickFormatter={(value) => `${value}/5`} />
                        <YAxis yAxisId="steps" tickFormatter={formatThousands} />
                        <YAxis yAxisId="days" orientation="right" allowDecimals={false} width={30} />
                        <Tooltip formatter={(value, name) => (name === "Snittsteg" ? [`${formatThousands(value)} steg`, name] : [value, name])} />
                        <Legend />
                        <Bar yAxisId="steps" dataKey="avgSteps" name="Snittsteg" radius={[6, 6, 0, 0]}>
                          {overview.moodBucketsForChart.map((entry, index) => (
                            <Cell key={`mood-${entry.mood}`} fill={chartPalette[index]} />
                          ))}
                        </Bar>
                        <Line yAxisId="days" type="monotone" dataKey="days" stroke="#334155" strokeWidth={2} dot={{ r: 3 }} name="Antal dagar" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          )}

          {overview && (
            <section className="card insight-card">
              <h2>Analys</h2>
              <div className="insight-grid">
                <p>Fint väder gav i snitt <strong>{Math.max(overview.weatherDelta, 0).toLocaleString("sv-SE")} fler steg</strong> än sämre väder.</p>
                <p>Humör 4-5 gav <strong>{Math.max(overview.moodDelta, 0).toLocaleString("sv-SE")} fler steg</strong> än humör 1-2.</p>
                <p>Gymdagar låg i snitt på <strong>{overview.gymAvg.toLocaleString("sv-SE")} steg</strong>.</p>
                <p>Löpdagar låg i snitt på <strong>{overview.runAvg.toLocaleString("sv-SE")} steg</strong>.</p>
              </div>
            </section>
          )}

          {overview && (
            <section className="card history-card">
              <div className="history-header">
                <h2>Historik</h2>
                <span className="history-count">{overview.totalDaysScope} poster i valt intervall</span>
              </div>
              <div className="history-list">
                {overview.history.map((d) => (
                  <div key={d.date} className="history-item">
                    <div className="history-main">
                      <div className="history-top-row">
                        <span className="date">{d.date}</span>
                        <span className="mood-pill">{moodLabel(d.mood)} ({d.mood}/5)</span>
                      </div>
                      <div className="steps-row">
                        <span className="metric-label">Steg</span>
                        <span className="steps">{d.steps.toLocaleString("sv-SE")}</span>
                      </div>
                      {d.weather && <div className="weather-meta subtle">{getWeatherEmoji(d.weather?.weatherCode)} {d.weather.temperature}°C</div>}
                      {d.note && <p className="note-text">{d.note}</p>}
                    </div>
                    <button className="delete-btn" onClick={() => handleDelete(d.date)} title="Radera dag">✕</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="dashboard-side">
          <section className="card form-card">
            <h2>Ny dagslogg</h2>
            <form onSubmit={handleSubmit} className="form-layout">
              <div className="form-group">
                <label>Datum</label>
                <input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Antal steg</label>
                <input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Humör (1-5)</label>
                <select value={mood} onChange={(e) => setMood(e.target.value)}>
                  <option value="1">1 - Tung dag</option>
                  <option value="2">2 - Låg energi</option>
                  <option value="3">3 - Stabil</option>
                  <option value="4">4 - Bra dag</option>
                  <option value="5">5 - Toppdag</option>
                </select>
              </div>
              <div className="form-group">
                <label>Anteckning</label>
                <input type="text" placeholder="Ex: gym, löpning, stressig dag" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className="weather-section">
                {weather ? (
                  <div className="weather-active">
                    <span>{getWeatherEmoji(weather.weatherCode)} {weather.temperature.toFixed(1)}°C</span>
                    <button type="button" className="btn-clear-weather" onClick={() => setWeather(null)}>✕</button>
                  </div>
                ) : (
                  <button type="button" className="secondary-btn" onClick={handleGetWeather} disabled={weatherLoading}>
                    {weatherLoading ? "Hämtar..." : "Hämta väder automatiskt"}
                  </button>
                )}
              </div>
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Sparar..." : "Spara dag"}</button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}