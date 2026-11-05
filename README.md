# FreshCart React project

FreshCart is an online grocery store project built with React and Vite. Its pages and code are separated so the project is easy to explore:

- `index.html` — public home page and module introduction
- `login.html` and `signup.html` — login and shopper registration
- `user.html` — product search, cart, checkout, and order history
- `admin.html` — store totals, product management, and order status
- `src/App.jsx` — page components and simple application behavior
- `src/storage.js` — Local Storage helpers and starter demo data
- `src/style.css` — shared responsive styles

## Run on your computer

Open a terminal in the `react` folder and run:

```bash
npm install
npm run dev
```

Vite prints a local address; open it in your browser. The production files can be checked with `npm run build`.

## Demo accounts

- Admin: `admin@freshcart.com`
- Password: `Admin@123`
- Shopper: create an account from the signup page

The app stores users, products, cart contents, orders, and the current login in the browser's Local Storage. This is a classroom demo only: Local Storage is not secure authentication and should not be used to protect a real admin panel or real customer passwords.

## Vercel deployment

Import the GitHub repository into Vercel. Set the **Root Directory** to `react`, use `npm run build` as the build command, and use `dist` as the output directory. No environment variables are needed. The five `.html` pages are built as separate Vite entry pages.
