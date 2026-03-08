import { getApi } from "./api.js";
import { requireAuth } from "./auth.js";
import { mountAppShell, formatDate, getBookTitle, getMemberName } from "./ui.js";

const session = requireAuth();
if (!session) {
  throw new Error("Unauthorized");
}

mountAppShell({ page: "dashboard", session });

const api = getApi();
const loanTableBody = document.getElementById("recent-loans-body");
const issueForm = document.getElementById("issue-form");
const issueBookSelect = document.getElementById("issue-book");
const issueMemberSelect = document.getElementById("issue-member");
const dueDateInput = document.getElementById("issue-due-date");
const issueMessage = document.getElementById("issue-message");
let books = [];
let members = [];

const bindStat = (id, value) => {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = String(value);
  }
};

function setDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  dueDateInput.value = date.toISOString().slice(0, 10);
}

function populateIssueOptions() {
  issueBookSelect.innerHTML = books
    .filter((book) => book.availableCopies > 0)
    .map((book) => `<option value="${book.id}">${book.title} (${book.availableCopies} available)</option>`)
    .join("");

  issueMemberSelect.innerHTML = members
    .map((member) => `<option value="${member.id}">${member.name} (${member.department})</option>`)
    .join("");

  if (!issueBookSelect.innerHTML) {
    issueBookSelect.innerHTML = '<option value="">No books available</option>';
  }
}

function renderLoans(loans) {
  loanTableBody.innerHTML = loans
    .slice(0, 8)
    .map(
      (loan) => `
      <tr>
        <td>${loan.id}</td>
        <td>${getBookTitle(books, loan.bookId)}</td>
        <td>${getMemberName(members, loan.memberId)}</td>
        <td>${formatDate(loan.issueDate)}</td>
        <td>${formatDate(loan.dueDate)}</td>
        <td><span class="status ${loan.status}">${loan.status}</span></td>
        <td>
          ${
            loan.status === "returned"
              ? "-"
              : `<button class="secondary-btn" data-return-loan-id="${loan.id}">Mark Returned</button>`
          }
        </td>
      </tr>
    `
    )
    .join("");
}

async function refreshDashboard() {
  const stats = await api.getDashboardStats();
  const loans = await api.listLoans();
  books = await api.listBooks();
  members = await api.listMembers();

  bindStat("stat-total-books", stats.totalBooks);
  bindStat("stat-total-members", stats.totalMembers);
  bindStat("stat-books-available", stats.booksAvailable);
  bindStat("stat-active-loans", stats.activeLoans);
  bindStat("stat-overdue", stats.overdueLoans);
  bindStat("all-loans-count", loans.length);

  populateIssueOptions();
  renderLoans(loans);
}

loanTableBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const loanId = target.getAttribute("data-return-loan-id");
  if (!loanId) {
    return;
  }

  await api.returnLoan(loanId);
  issueMessage.textContent = "Book marked as returned.";
  await refreshDashboard();
});

issueForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  issueMessage.textContent = "";

  const formData = new FormData(issueForm);
  const bookId = String(formData.get("bookId") || "");
  const memberId = String(formData.get("memberId") || "");
  const dueDate = String(formData.get("dueDate") || "");

  if (!bookId || !memberId || !dueDate) {
    issueMessage.textContent = "Please select all fields before issuing.";
    return;
  }

  try {
    await api.issueBook({ bookId, memberId, dueDate });
    issueMessage.textContent = "Book issued successfully.";
    await refreshDashboard();
    setDefaultDueDate();
  } catch (error) {
    issueMessage.textContent = error instanceof Error ? error.message : "Could not issue book.";
  }
});

setDefaultDueDate();
await refreshDashboard();
