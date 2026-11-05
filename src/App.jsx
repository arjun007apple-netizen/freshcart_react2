import { useState } from "react";
import {
  getCurrentUser,
  readData,
  saveData
} from "./storage.js";

const money = (amount) => `₹${Number(amount).toFixed(2)}`;

function Header({ user }) {
  function logout() {
    localStorage.removeItem("freshcart-react-current-user");
    window.location.href = "/index.html";
  }

  return (
    <header className="site-header">
      <a className="brand" href="/index.html">🛒 FreshCart</a>
      <nav>
        <a href="/index.html">Home</a>
        {user ? (
          <>
            <a href={user.role === "admin" ? "/admin.html" : "/user.html"}>
              {user.role === "admin" ? "Admin panel" : "Shop"}
            </a>
            <button className="link-button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <a href="/login.html">Login</a>
            <a className="nav-cta" href="/signup.html">Create account</a>
          </>
        )}
      </nav>
    </header>
  );
}

function HomePage() {
  const user = getCurrentUser();
  return (
    <>
      <Header user={user} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">FRESH PICKS, EVERY DAY</p>
            <h1>Good food, delivered with care.</h1>
            <p>Shop fresh fruit, vegetables, dairy, and everyday essentials from FreshCart.</p>
            <a className="button" href={user?.role === "admin" ? "/admin.html" : user ? "/user.html" : "/login.html"}>
              {user ? "Open your dashboard" : "Start shopping"}
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">🥬 🍊 🥑</div>
        </section>

        <section className="section">
          <p className="eyebrow">MADE FOR YOUR PROJECT REVIEW</p>
          <h2>One store, two clear modules</h2>
          <div className="module-grid">
            <article className="card module-card">
              <span className="module-icon">🧺</span>
              <h3>User module</h3>
              <p>Browse products, add items to a cart, place orders, and check order status.</p>
              <a href="/login.html">Go to user login →</a>
            </article>
            <article className="card module-card">
              <span className="module-icon">🧑‍💼</span>
              <h3>Admin module</h3>
              <p>View store totals, add or remove products, and update customer orders.</p>
              <a href="/login.html">Go to admin login →</a>
            </article>
          </div>
        </section>
      </main>
      <footer>FreshCart · A beginner-friendly React + Vite project</footer>
    </>
  );
}

function AuthPage({ signup = false }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    const users = readData("users", []);

    if (signup) {
      const name = String(form.get("name")).trim();
      if (users.some((user) => user.email === email)) {
        setMessage("That email already has an account. Please log in.");
        return;
      }

      users.push({ name, email, password, role: "user" });
      saveData("users", users);
      setMessage("Account created! You can now log in.");
      window.setTimeout(() => {
        window.location.href = "/login.html";
      }, 700);
      return;
    }

    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) {
      setMessage("Email or password is not correct.");
      return;
    }

    saveData("currentUser", {
      name: user.name,
      email: user.email,
      role: user.role
    });
    window.location.href = user.role === "admin" ? "/admin.html" : "/user.html";
  }

  return (
    <>
      <Header user={null} />
      <main className="auth-page">
        <section className="card auth-card">
          <p className="eyebrow">{signup ? "JOIN FRESHCART" : "WELCOME BACK"}</p>
          <h1>{signup ? "Create your account" : "Log in"}</h1>
          <p className="muted">{signup ? "Sign up as a shopper to get started." : "Use your account to open the right dashboard."}</p>
          <form onSubmit={handleSubmit}>
            {signup && (
              <label>
                Full name
                <input name="name" type="text" placeholder="Your name" autoComplete="name" required />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" placeholder="Enter your password" autoComplete={signup ? "new-password" : "current-password"} minLength="4" required />
            </label>
            <button className="button full-width" type="submit">{signup ? "Create account" : "Log in"}</button>
          </form>
          {message && <p className="form-message" role="status">{message}</p>}
          <p className="auth-switch">
            {signup ? "Already registered?" : "New to FreshCart?"}{" "}
            <a href={signup ? "/login.html" : "/signup.html"}>{signup ? "Log in" : "Create an account"}</a>
          </p>
          {!signup && (
            <div className="demo-note">
              <strong>Admin demo:</strong> admin@freshcart.com / Admin@123
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function UserPage() {
  const user = getCurrentUser();
  const [products, setProducts] = useState(() => readData("products", []));
  const [cart, setCart] = useState(() => readData(`cart-${user?.email}`, []));
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  if (!user || user.role !== "user") {
    window.location.replace(user ? "/admin.html" : "/login.html");
    return null;
  }

  function updateCart(nextCart) {
    setCart(nextCart);
    saveData(`cart-${user.email}`, nextCart);
  }

  function addToCart(product) {
    const currentItem = cart.find((item) => item.id === product.id);
    if (product.stock < 1 || (currentItem && currentItem.quantity >= product.stock)) {
      setNotice("Your cart already has all available stock for this product.");
      return;
    }
    const nextCart = currentItem
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    updateCart(nextCart);
    setNotice(`${product.name} added to your cart.`);
  }

  function changeQuantity(productId, amount) {
    const product = products.find((item) => item.id === productId);
    const cartItem = cart.find((item) => item.id === productId);
    if (amount > 0 && cartItem && product && cartItem.quantity >= product.stock) {
      setNotice("You have reached the available stock for this product.");
      return;
    }
    const nextCart = cart
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0);
    updateCart(nextCart);
  }

  function checkout() {
    if (cart.length === 0) {
      setNotice("Add a product to your cart before checking out.");
      return;
    }

    const latestProducts = readData("products", []);
    const unavailable = cart.find((item) => {
      const product = latestProducts.find((entry) => entry.id === item.id);
      return !product || product.stock < item.quantity;
    });

    if (unavailable) {
      setProducts(latestProducts);
      setNotice(`${unavailable.name} does not have enough stock. Please update your cart.`);
      return;
    }

    const updatedProducts = latestProducts.map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      return cartItem ? { ...product, stock: product.stock - cartItem.quantity } : product;
    });
    const orders = readData("orders", []);
    orders.unshift({
      id: Date.now(),
      customer: user.name,
      email: user.email,
      items: cart,
      total: cart.reduce((total, item) => total + item.price * item.quantity, 0),
      status: "Received",
      date: new Date().toLocaleDateString()
    });

    saveData("products", updatedProducts);
    saveData("orders", orders);
    updateCart([]);
    setProducts(updatedProducts);
    setNotice("Order placed! You can track it below.");
  }

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const myOrders = readData("orders", []).filter((order) => order.email === user.email);

  return (
    <>
      <Header user={user} />
      <main className="page-wrap">
        <section className="welcome-panel">
          <div><p className="eyebrow">USER MODULE</p><h1>Hi, {user.name} 👋</h1><p>Choose something fresh for today.</p></div>
          <a className="button button-light" href="#my-orders">My orders</a>
        </section>
        <section className="section compact-section">
          <div className="section-heading">
            <div><p className="eyebrow">THE FRESHCART SHELF</p><h2>Shop products</h2></div>
            <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." aria-label="Search products" />
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="card product-card" key={product.id}>
                <span className="product-emoji">{product.category === "Fruits" ? "🍎" : product.category === "Vegetables" ? "🥦" : product.category === "Dairy" ? "🥛" : product.category === "Snacks" ? "🍪" : "🛒"}</span>
                <p className="category-label">{product.category}</p>
                <h3>{product.name}</h3>
                <p className="product-meta">{money(product.price)} <span>· {product.stock} in stock</span></p>
                <button className="button full-width" disabled={product.stock < 1} onClick={() => addToCart(product)}>
                  {product.stock < 1 ? "Out of stock" : "Add to cart"}
                </button>
              </article>
            ))}
            {visibleProducts.length === 0 && <p className="empty-state">No matching products found.</p>}
          </div>
        </section>

        <section className="section compact-section" id="cart">
          <div className="section-heading"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Your cart</h2></div></div>
          <div className="card cart-card">
            {cart.length === 0 ? <p className="muted">Your cart is empty. Add a product to get started.</p> : cart.map((item) => (
              <div className="cart-row" key={item.id}>
                <div><strong>{item.name}</strong><p className="muted">{money(item.price)} each</p></div>
                <div className="quantity-control">
                  <button aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button aria-label={`Add one ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>+</button>
                </div>
                <strong>{money(item.price * item.quantity)}</strong>
              </div>
            ))}
            <div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div>
            <button className="button" onClick={checkout}>Place order</button>
            {notice && <p className="form-message" role="status">{notice}</p>}
          </div>
        </section>

        <section className="section compact-section" id="my-orders">
          <p className="eyebrow">YOUR PURCHASES</p><h2>Order history</h2>
          <OrderList orders={myOrders} emptyMessage="Your orders will show here after checkout." />
        </section>
      </main>
    </>
  );
}

function OrderList({ orders, emptyMessage, onStatusChange }) {
  if (orders.length === 0) return <div className="card empty-state">{emptyMessage}</div>;
  return (
    <div className="order-list">
      {orders.map((order) => (
        <article className="card order-card" key={order.id}>
          <div className="order-heading">
            <div><strong>Order #{String(order.id).slice(-6)}</strong><p className="muted">{order.customer} · {order.date}</p></div>
            <strong>{money(order.total)}</strong>
          </div>
          <p className="order-items">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
          {onStatusChange ? (
            <label className="status-control">Status
              <select value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>
                <option>Received</option><option>Packing</option><option>On the way</option><option>Delivered</option>
              </select>
            </label>
          ) : <span className="status-pill">{order.status}</span>}
        </article>
      ))}
    </div>
  );
}

function AdminPage() {
  const user = getCurrentUser();
  const [products, setProducts] = useState(() => readData("products", []));
  const [orders, setOrders] = useState(() => readData("orders", []));
  const [users] = useState(() => readData("users", []).filter((item) => item.role === "user"));
  const [notice, setNotice] = useState("");

  if (!user || user.role !== "admin") {
    window.location.replace(user ? "/user.html" : "/login.html");
    return null;
  }

  function addProduct(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const product = {
      id: Date.now(),
      name: String(form.get("name")).trim(),
      category: String(form.get("category")),
      price: Number(form.get("price")),
      stock: Number(form.get("stock"))
    };

    const nextProducts = [...products, product];
    setProducts(nextProducts);
    saveData("products", nextProducts);
    event.currentTarget.reset();
    setNotice(`${product.name} was added to the store.`);
  }

  function removeProduct(productId) {
    const nextProducts = products.filter((product) => product.id !== productId);
    setProducts(nextProducts);
    saveData("products", nextProducts);
  }

  function updateOrderStatus(orderId, status) {
    const nextOrders = orders.map((order) => order.id === orderId ? { ...order, status } : order);
    setOrders(nextOrders);
    saveData("orders", nextOrders);
  }

  return (
    <>
      <Header user={user} />
      <main className="page-wrap">
        <section className="welcome-panel admin-welcome">
          <div><p className="eyebrow">ADMIN MODULE</p><h1>Store dashboard</h1><p>Manage your products and customer orders.</p></div>
          <span className="admin-badge">Administrator</span>
        </section>
        <section className="stat-grid" aria-label="Store totals">
          <StatCard label="Products" value={products.length} icon="📦" />
          <StatCard label="Orders" value={orders.length} icon="🧾" />
          <StatCard label="Shoppers" value={users.length} icon="👥" />
        </section>

        <section className="section compact-section">
          <p className="eyebrow">INVENTORY</p><h2>Add a product</h2>
          <form className="card product-form" onSubmit={addProduct}>
            <label>Product name<input name="name" placeholder="e.g. Green grapes" required /></label>
            <label>Category<select name="category" required defaultValue=""><option value="" disabled>Choose category</option><option>Fruits</option><option>Vegetables</option><option>Dairy</option><option>Groceries</option><option>Snacks</option></select></label>
            <label>Price (₹)<input name="price" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label>
            <label>Stock<input name="stock" type="number" min="0" step="1" placeholder="0" required /></label>
            <button className="button" type="submit">Add product</button>
            {notice && <p className="form-message" role="status">{notice}</p>}
          </form>
        </section>

        <section className="section compact-section">
          <p className="eyebrow">CURRENT INVENTORY</p><h2>Manage products</h2>
          <div className="card table-card">
            {products.length === 0 ? <p className="muted">No products yet. Add one above.</p> : (
              <div className="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
                <tbody>{products.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.category}</td><td>{money(product.price)}</td><td>{product.stock}</td><td><button className="text-danger" onClick={() => removeProduct(product.id)}>Remove</button></td></tr>)}</tbody>
              </table></div>
            )}
          </div>
        </section>

        <section className="section compact-section">
          <p className="eyebrow">CUSTOMER ACTIVITY</p><h2>Manage orders</h2>
          <OrderList orders={orders} emptyMessage="No customer orders yet." onStatusChange={updateOrderStatus} />
        </section>
      </main>
    </>
  );
}

function StatCard({ label, value, icon }) {
  return <article className="card stat-card"><span>{icon}</span><div><p className="muted">{label}</p><strong>{value}</strong></div></article>;
}

export default function App() {
  const page = window.location.pathname.split("/").pop().toLowerCase();
  if (page === "login.html") return <AuthPage />;
  if (page === "signup.html") return <AuthPage signup />;
  if (page === "user.html") return <UserPage />;
  if (page === "admin.html") return <AdminPage />;
  return <HomePage />;
}
