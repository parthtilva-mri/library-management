import { APP_CONFIG } from "./config.js";
import { readDb, writeDb } from "./storage.js";

function todayOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function seedDatabaseIfNeeded() {
  const existing = readDb();
  if (existing) {
    return existing;
  }

  const db = {
    users: [
      {
        id: "u-admin",
        username: APP_CONFIG.defaultAdmin.username,
        password: APP_CONFIG.defaultAdmin.password,
        fullName: APP_CONFIG.defaultAdmin.fullName,
        role: "admin"
      }
    ],
    books: [
      { id: "b-101", title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Programming", totalCopies: 6, availableCopies: 4 },
      { id: "b-102", title: "Clean Code", author: "Robert C. Martin", category: "Programming", totalCopies: 5, availableCopies: 3 },
      { id: "b-103", title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Computer Science", totalCopies: 3, availableCopies: 1 },
      { id: "b-104", title: "Design of Everyday Things", author: "Don Norman", category: "Design", totalCopies: 4, availableCopies: 4 }
    ],
    members: [
      { id: "m-201", name: "Aarav Patel", email: "aarav@example.com", department: "BCA", activeLoans: 1 },
      { id: "m-202", name: "Siya Sharma", email: "siya@example.com", department: "BBA", activeLoans: 2 },
      { id: "m-203", name: "Rohan Das", email: "rohan@example.com", department: "B.Tech", activeLoans: 0 }
    ],
    loans: [
      { id: "l-301", bookId: "b-102", memberId: "m-202", issueDate: todayOffset(-5), dueDate: todayOffset(5), status: "issued" },
      { id: "l-302", bookId: "b-101", memberId: "m-201", issueDate: todayOffset(-12), dueDate: todayOffset(-1), status: "overdue" },
      { id: "l-303", bookId: "b-103", memberId: "m-202", issueDate: todayOffset(-3), dueDate: todayOffset(7), status: "issued" }
    ]
  };

  writeDb(db);
  return db;
}
