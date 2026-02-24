const API_URL = import.meta.env.VITE_API_BASE_URL;

// En gemensam hjälpare för att hantera svar och fel
async function handleResponse(res) {
  if (!res.ok) {
    let errorMessage = `Felkod: ${res.status}`;
    try {
      const data = await res.json();
      errorMessage = typeof data === 'string' ? data : (data.detail || data.title || errorMessage);
    } catch (e) {
      const fallbackText = await res.text().catch(() => "");
      if (fallbackText) errorMessage = fallbackText;
    }
    throw new Error(errorMessage);
  }
  return res.status !== 204 ? res.json() : null;
}

// TJÄNST FÖR INLOGG OCH REGISTRERING
export const authService = {
  async register(username, password) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  }
};

export const dayService = {
  async getAll(userId) {
    if (!userId) return [];
    const res = await fetch(`${API_URL}/days?userId=${userId}`);
    return handleResponse(res);
  },

  async create(userId, dayData) {
    // dayData innehåller: { date, steps, mood, note }
    // userId skickas som en query parameter
    const res = await fetch(`${API_URL}/days?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dayData), // Här skickas nu bara det som finns i DayCreateDto!
    });
    return handleResponse(res);
  },

  async update(userId, date, dayData) {
    // Matchar din: app.MapPut("/days/{date}", ...)
    const res = await fetch(`${API_URL}/days/${date}?userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dayData),
    });
    return handleResponse(res);
  },

  async delete(date, userId) {
    console.log("Försöker radera:", `${API_URL}/days/${date}?userId=${userId}`); // <--- LÄGG TILL DENNA
    const res = await fetch(`${API_URL}/days/${date}?userId=${userId}`, {
      method: "DELETE"
    });
    return handleResponse(res);
  }
};