const API_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "stepmood_token";
const USER_KEY = "stepmood_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createHeaders(withJson = false) {
  const headers = {};
  const token = getToken();

  if (withJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// En gemensam hjälpare för att hantera svar och fel
async function handleResponse(res) {
  if (!res.ok) {
    let errorMessage = `Felkod: ${res.status}`;
    try {
      const data = await res.json();
      errorMessage = typeof data === 'string' ? data : (data.detail || data.title || errorMessage);
    } catch {
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
      headers: createHeaders(true),
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(res);
    if (!data?.token || !data?.user) {
      throw new Error("Ogiltigt svar från servern.");
    }
    saveSession(data.token, data.user);
    return data.user;
  },

  logout() {
    clearSession();
  },

  getSession() {
    const token = getToken();
    const user = getCurrentUser();
    if (!token || !user) return null;
    return { token, user };
  }
};

export const dayService = {
  async getAll() {
    const res = await fetch(`${API_URL}/days`, {
      headers: createHeaders()
    });
    return handleResponse(res);
  },

  async create(dayData) {
    const res = await fetch(`${API_URL}/days`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(dayData),
    });
    return handleResponse(res);
  },

  async update(date, dayData) {
    const res = await fetch(`${API_URL}/days/${date}`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify(dayData),
    });
    return handleResponse(res);
  },

  async delete(date) {
    const res = await fetch(`${API_URL}/days/${date}`, {
      method: "DELETE",
      headers: createHeaders()
    });
    return handleResponse(res);
  }
};