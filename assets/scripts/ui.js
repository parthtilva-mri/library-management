import { logout } from "./auth.js";

export function setGreeting(fullName) {
  const element = document.querySelector("[data-user-greeting]");
  if (element) {
    element.textContent = fullName;
  }
}

export function setActiveNav(currentPage) {
  const links = document.querySelectorAll("[data-nav-link]");
  links.forEach((link) => {
    const page = link.getAttribute("data-nav-link");
    link.classList.toggle("active", page === currentPage);
  });
}

export function wireLogout() {
  const btn = document.querySelector("[data-logout-btn]");
  if (btn) {
    btn.addEventListener("click", logout);
  }
}

export function mountAppShell({ page, session }) {
  setGreeting(session.fullName);
  setActiveNav(page);
  wireLogout();
}

export function formatDate(isoDate) {
  const dt = new Date(isoDate);
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function getBookTitle(books, bookId) {
  return books.find((book) => book.id === bookId)?.title || "Unknown Book";
}

export function getMemberName(members, memberId) {
  return members.find((member) => member.id === memberId)?.name || "Unknown Member";
}
