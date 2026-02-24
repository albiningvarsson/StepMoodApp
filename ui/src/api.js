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

// DIN BEFINTLIGA TJÄNST FÖR DAGAR
export const dayService = {
  async getAll(userId) {
    if (!userId) return [];
    // Denna var redan rätt!
    const res = await fetch(`${API_URL}/days?userId=${userId}`);
    return handleResponse(res);
  },

  async create(payload) {
    // VIKTIGT: Vi måste lägga till ?userId= här också för att matcha backenden
    const res = await fetch(`${API_URL}/days?userId=${payload.userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async delete(date, userId) {
    // VIKTIGT: Backenden kräver både datum i URL:en och userId i query-strängen
    const res = await fetch(`${API_URL}/days/${date}?userId=${userId}`, {
      method: "DELETE"
    });
    return handleResponse(res);
  }
};