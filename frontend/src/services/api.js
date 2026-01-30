const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
    credentials: "include",
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const logout = () =>
  fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).then(handleResponse);

export const listTickets = (params = {}) => {
  const query = new URLSearchParams(params);
  return fetch(`${API_URL}/api/admin/tickets?${query.toString()}`, {
    credentials: "include",
  }).then(handleResponse);
};

export const getAdminTicket = (id) =>
  fetch(`${API_URL}/api/admin/tickets/${id}`, {
    credentials: "include",
  }).then(handleResponse);

export const addAdminMessage = (id, payload) =>
  fetch(`${API_URL}/api/admin/tickets/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateTicket = (id, payload) =>
  fetch(`${API_URL}/api/admin/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  }).then(handleResponse);
