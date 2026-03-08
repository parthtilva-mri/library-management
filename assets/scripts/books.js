import { getApi } from "./api.js";
import { requireAuth } from "./auth.js";
import { mountAppShell } from "./ui.js";

const session = requireAuth();
if (!session) {
  throw new Error("Unauthorized");
}

mountAppShell({ page: "books", session });

const api = getApi();
const tableBody = document.getElementById("books-table-body");
const form = document.getElementById("book-form");

function renderBooks(items) {
  tableBody.innerHTML = items
    .map(
      (book) => `
      <tr>
        <td>${book.id}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category}</td>
        <td>${book.availableCopies}/${book.totalCopies}</td>
      </tr>
    `
    )
    .join("");
}

async function refresh() {
  const books = await api.listBooks();
  renderBooks(books);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const totalCopies = Number(data.get("totalCopies"));

  const payload = {
    title: String(data.get("title") || "").trim(),
    author: String(data.get("author") || "").trim(),
    category: String(data.get("category") || "").trim(),
    totalCopies,
    availableCopies: totalCopies
  };

  await api.addBook(payload);
  form.reset();
  refresh();
});

refresh();
