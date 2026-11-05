const PREFIX = "shop:";

export function readData(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveData(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function getCurrentUser() {
  return readData("currentUser", null);
}

export function setupDemoData() {
  const users = readData("users", null);
  if (!users) {
    saveData("users", [
      { name: "Admin", email: "admin@shop.com", password: "admin123", role: "admin" },
      { name: "Demo User", email: "user@shop.com", password: "user123", role: "user" }
    ]);
  }

  if (!readData("products", null)) {
    saveData("products", [
      { id: 1, name: "Apples (1 kg)", category: "Fruits", price: 120, stock: 50 },
      { id: 2, name: "Spinach", category: "Vegetables", price: 30, stock: 40 },
      { id: 3, name: "Milk (1 L)", category: "Dairy", price: 60, stock: 30 },
      { id: 4, name: "Basmati Rice (5 kg)", category: "Groceries", price: 550, stock: 20 },
      { id: 5, name: "Cookies", category: "Snacks", price: 40, stock: 60 }
    ]);
  }

  if (!readData("orders", null)) {
    saveData("orders", []);
  }
}
