import { APP_CONFIG } from "./config.js";
import { seedDatabaseIfNeeded } from "./data-seed.js";
import { readDb, updateDb } from "./storage.js";

class LocalStorageLibraryApi {
  constructor() {
    seedDatabaseIfNeeded();
  }

  syncLoanStatuses() {
    const today = new Date().toISOString().slice(0, 10);

    updateDb((db) => {
      db.loans.forEach((loan) => {
        if (loan.status === "returned") {
          return;
        }

        loan.status = loan.dueDate < today ? "overdue" : "issued";
      });
    });
  }

  async getDashboardStats() {
    this.syncLoanStatuses();
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
    this.syncLoanStatuses();
    return readDb().loans.slice().sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1));
  }

  async issueBook({ bookId, memberId, dueDate }) {
    const issueDate = new Date().toISOString().slice(0, 10);
    const id = `l-${Date.now().toString().slice(-6)}`;

    updateDb((db) => {
      const book = db.books.find((item) => item.id === bookId);
      const member = db.members.find((item) => item.id === memberId);

      if (!book) {
        throw new Error("Book not found.");
      }
      if (!member) {
        throw new Error("Member not found.");
      }
      if (book.availableCopies < 1) {
        throw new Error("No available copies for this book.");
      }

      book.availableCopies -= 1;
      member.activeLoans += 1;
      db.loans.unshift({
        id,
        bookId,
        memberId,
        issueDate,
        dueDate,
        status: dueDate < issueDate ? "overdue" : "issued"
      });
    });

    return { id, bookId, memberId, issueDate, dueDate };
  }

  async returnLoan(loanId) {
    updateDb((db) => {
      const loan = db.loans.find((item) => item.id === loanId);
      if (!loan) {
        throw new Error("Loan not found.");
      }

      if (loan.status === "returned") {
        return;
      }

      loan.status = "returned";

      const book = db.books.find((item) => item.id === loan.bookId);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      }

      const member = db.members.find((item) => item.id === loan.memberId);
      if (member) {
        member.activeLoans = Math.max(0, member.activeLoans - 1);
      }
    });
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
  async issueBook() {
    throw new Error("HTTP API mode is not implemented yet.");
  }
  async returnLoan() {
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
