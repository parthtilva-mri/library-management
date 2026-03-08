import { seedDatabaseIfNeeded } from "./data-seed.js";
import { login, getSession } from "./auth.js";

seedDatabaseIfNeeded();

const activeSession = getSession();
if (activeSession) {
  window.location.href = "./pages/dashboard.html";
}

const form = document.getElementById("login-form");
const errorBox = document.getElementById("login-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  const formData = new FormData(form);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const user = await login(username, password);
  if (!user) {
    errorBox.textContent = "Invalid credentials. Try admin / admin123.";
    return;
  }

  window.location.href = "./pages/dashboard.html";
});
