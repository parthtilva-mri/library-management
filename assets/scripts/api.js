import { APP_CONFIG } from "./config.js";
import { seedDatabaseIfNeeded } from "./data-seed.js";
import { readDb, updateDb } from "./storage.js";

class LocalStorageLibraryApi {
  constructor() {
    seedDatabaseIfNeeded();
  }

  async getDashboardStats() {
    const db = readDb();
    const overdue = db.loans.filter((loan) => loan.status === "overdue").length;
    const issued = db.loans.filter((loan) => loan.status === "issued").length;

    return {
      totalBooks: db.books.length,
      totalMembers: db.members.length,
      booksAvailable: db.books.reduce((sum, book) => sum + book.availableCopies, 0),
      activeLoans: issued,
      overdueLoans: overdue,
      recentLoans: db.loans.slice().sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1)).slice(0, 5)
    };
  }

  async findUser(username, password) {
    const db = readDb();
    return db.users.find((u) => u.username === username && u.password === password) || null;
  }

  async listBooks() {
    return readDb().books;
  }

  async addBook(payload) {
    const id = `b-${Date.now().toString().slice(-6)}`;
    updateDb((db) => {
      db.books.unshift({ id, ...payload });
    });
    return { id, ...payload };
  }

  async listMembers() {
    return readDb().members;
  }

  async addMember(payload) {
    const id = `m-${Date.now().toString().slice(-6)}`;
    updateDb((db) => {
      db.members.unshift({ id, ...payload, activeLoans: 0 });
    });
    return { id, ...payload, activeLoans: 0 };
  }

  async listLoans() {
    return readDb().loans;
  }
}

class HttpLibraryApi {
  async getDashboardStats() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
  async findUser() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
  async listBooks() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
  async addBook() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
  async listMembers() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
  async addMember() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
  async listLoans() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
}

let apiInstance = null;

export function getApi() {
  if (apiInstance) {
    return apiInstance;
  }

  apiInstance = APP_CONFIG.dataMode === "http" ? new HttpLibraryApi() : new LocalStorageLibraryApi();
  return apiInstance;
}
