import { getApi } from "./api.js";
import { requireAuth } from "./auth.js";
import { mountAppShell, formatDate, getBookTitle, getMemberName } from "./ui.js";

const session = requireAuth();
if (!session) {
  throw new Error("Unauthorized");
}

mountAppShell({ page: "dashboard", session });

const api = getApi();
const stats = await api.getDashboardStats();
const loans = await api.listLoans();
const books = await api.listBooks();
const members = await api.listMembers();

const bindStat = (id, value) => {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = String(value);
  }
};

bindStat("stat-total-books", stats.totalBooks);
bindStat("stat-total-members", stats.totalMembers);
bindStat("stat-books-available", stats.booksAvailable);
bindStat("stat-active-loans", stats.activeLoans);
bindStat("stat-overdue", stats.overdueLoans);

const loanTableBody = document.getElementById("recent-loans-body");
loanTableBody.innerHTML = stats.recentLoans
  .map(
    (loan) => `
      <tr>
        <td>${getBookTitle(books, loan.bookId)}</td>
        <td>${getMemberName(members, loan.memberId)}</td>
        <td>${formatDate(loan.issueDate)}</td>
        <td>${formatDate(loan.dueDate)}</td>
        <td><span class="status ${loan.status}">${loan.status}</span></td>
      </tr>
    `
  )
  .join("");

const totalLoanCount = document.getElementById("all-loans-count");
if (totalLoanCount) {
  totalLoanCount.textContent = String(loans.length);
}
