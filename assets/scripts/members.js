import { getApi } from "./api.js";
import { requireAuth } from "./auth.js";
import { mountAppShell } from "./ui.js";

const session = requireAuth();
if (!session) {
  throw new Error("Unauthorized");
}

mountAppShell({ page: "members", session });

const api = getApi();
const tableBody = document.getElementById("members-table-body");
const form = document.getElementById("member-form");

function renderMembers(items) {
  tableBody.innerHTML = items
    .map(
      (member) => `
      <tr>
        <td>${member.id}</td>
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.department}</td>
        <td>${member.activeLoans}</td>
      </tr>
    `
    )
    .join("");
}

async function refresh() {
  const members = await api.listMembers();
  renderMembers(members);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    department: String(data.get("department") || "").trim()
  };

  await api.addMember(payload);
  form.reset();
  refresh();
});

refresh();
