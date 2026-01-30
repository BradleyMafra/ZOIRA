const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const ADMIN_PASS_KEY = "adminPass";

const handleResponse = async (response) => {
  if (response.ok) {
    return response.json();
  }
  const payload = await response.json().catch(() => ({}));
  const error = payload?.error || "Erro ao processar sua solicitação.";
  throw new Error(error);
};

export const createTicket = (data) =>
  fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getTicket = (id) =>
  fetch(`${API_URL}/api/tickets/${id}`).then(handleResponse);

export const addUserMessage = (id, payload) =>
  fetch(`${API_URL}/api/tickets/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const login = (payload) =>
  fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const logout = () => {
  localStorage.removeItem(ADMIN_PASS_KEY);
  return fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
  }).then(handleResponse);
};

export const setAdminPassword = (password) => {
  if (password) {
    localStorage.setItem(ADMIN_PASS_KEY, password);
  }
};

export const getAdminPassword = () => localStorage.getItem(ADMIN_PASS_KEY);

const getAdminHeaders = () => {
  const password = getAdminPassword();
  return password ? { "X-Admin-Password": password } : {};
};

export const listTickets = (params = {}) => {
  const query = new URLSearchParams(params);
  return fetch(`${API_URL}/api/admin/tickets?${query.toString()}`, {
    headers: getAdminHeaders(),
  }).then(handleResponse);
};

export const getAdminTicket = (id) =>
  fetch(`${API_URL}/api/admin/tickets/${id}`, {
    headers: getAdminHeaders(),
  }).then(handleResponse);

export const addAdminMessage = (id, payload) =>
  fetch(`${API_URL}/api/admin/tickets/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAdminHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateTicket = (id, payload) =>
  fetch(`${API_URL}/api/admin/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAdminHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);
