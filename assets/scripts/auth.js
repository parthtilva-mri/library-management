import { APP_CONFIG } from "./config.js";
import { getApi } from "./api.js";

export function getSession() {
  const raw = localStorage.getItem(APP_CONFIG.sessionKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem(
    APP_CONFIG.sessionKey,
    JSON.stringify({
      userId: user.id,
      fullName: user.fullName,
      username: user.username,
      loggedAt: Date.now()
    })
  );
}

export function clearSession() {
  localStorage.removeItem(APP_CONFIG.sessionKey);
}

export async function login(username, password) {
  const api = getApi();
  const user = await api.findUser(username, password);
  if (!user) {
    return null;
  }
  setSession(user);
  return user;
}

export function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = "../index.html";
    return null;
  }
  return session;
}

export function logout() {
  clearSession();
  window.location.href = "../index.html";
}
