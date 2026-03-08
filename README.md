# ShelfWise Library Management

A presentation-ready library management frontend project with a modern UI and clean architecture.

## Features

- Login page with session handling
- Dashboard with key metrics and recent loan activity
- Books management page (add + view books)
- Members management page (add + view members)
- Data persistence using browser `localStorage`
- API abstraction layer ready for future backend integration
- Responsive design for desktop and mobile

## Project Structure

- `index.html`: Login page
- `pages/dashboard.html`: Dashboard overview
- `pages/books.html`: Books management
- `pages/members.html`: Members management
- `assets/styles/main.css`: Shared styling
- `assets/scripts/api.js`: Data service interface and provider selection
- `assets/scripts/storage.js`: `localStorage` persistence helpers
- `assets/scripts/data-seed.js`: Demo data initialization
- `assets/scripts/auth.js`: Authentication/session logic

## Demo Login

- Username: `admin`
- Password: `admin123`

## How To Run

Do not open `index.html` directly with `file://` because ES module scripts are blocked by browser CORS/security rules.

Run a local HTTP server from project root:

```powershell
npx serve .
```

Then open the URL shown in terminal (usually `http://localhost:3000`).

Alternative options:

```powershell
# Python (if installed)
python -m http.server 5500
```

Then open: `http://localhost:5500`

Or use VS Code extension `Live Server` and click `Go Live`.

## Future API Upgrade Path

1. Open `assets/scripts/config.js` and change `dataMode` from `"local"` to `"http"`.
2. Implement API calls inside `HttpLibraryApi` in `assets/scripts/api.js`.
3. Keep page scripts unchanged, because they already use `getApi()` abstraction.

This keeps the UI and business flow stable while replacing storage with real endpoints.
