import { APP_CONFIG } from "./config.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

export function readDb() {
  const raw = localStorage.getItem(APP_CONFIG.storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeDb(db) {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(db));
}

export function updateDb(mutator) {
  const current = readDb();
  if (!current) {
    throw new Error("Database is not initialized.");
  }

  const draft = clone(current);
  const next = mutator(draft) || draft;
  writeDb(next);
  return next;
}

export function clearDb() {
  localStorage.removeItem(APP_CONFIG.storageKey);
}
