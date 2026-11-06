
// ==========================================
// MISTÉ — SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL = "https://bizzcdgmyhutfldyxybt.supabase.co";
const SUPABASE_KEY = "sb_publishable_iS1M8xoWqLLhxy6f5w4DfA_QKWu8BwD";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ==========================================
// PRODUCTS
// ==========================================

const products = [
  {
    id: 1,
    name: "Lavender Dreams",
    category: "candles",
    price: 45,
    description: "A calming floral escape.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=700"
  },
  {
    id: 2,
    name: "Velvet Rose",
    category: "candles",
    price: 49,
    description: "A delicate romantic atmosphere.",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=700"
  },
  {
    id: 3,
    name: "Santal Essence",
    category: "diffusers",
    price: 65,
    description: "Warm woods and quiet luxury.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700"
  },
  {
    id: 4,
    name: "White Linen",
    category: "diffusers",
    price: 59,
    description: "Fresh, clean and effortless.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=700"
  },
  {
    id: 5,
    name: "Morning Mist",
    category: "sprays",
    price: 39,
    description: "A fresh start to every day.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700"
  },
  {
    id: 6,
    name: "Midnight Bloom",
    category: "sprays",
    price: 42,
    description: "A mysterious floral finish.",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=700"
  }
];

// ==========================================
// GENERAL ELEMENTS
// ==========================================

const productGrid = document.getElementById("product-grid");
const cartItemsElement = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const bagCountElement = document.getElementById("bag-count");

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("miste-cart")) || [];
  if (!Array.isArray(cart)) cart = [];
} catch {
  cart = [];
}

function saveCart() {
  localStorage.setItem("miste-cart", JSON.stringify(cart));
}

function formatPrice(price) {
  return "₾" + Number(price).toFixed(2);
}

// ==========================================
// PRODUCTS DISPLAY
// ==========================================

function renderProducts(category = "all", search = "") {
  if (!productGrid) return;

  productGrid.innerHTML = "";

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      category === "all" || product.category === category;

    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const resultsMessage = document.getElementById("results-message");

  if (resultsMessage) {
    resultsMessage.textContent =
      filteredProducts.length
        ? `${filteredProducts.length} products`
        : "No products found.";
  }

  filteredProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";

    const details = document.createElement("div");
    details.className = "product-details";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("strong");
    price.textContent = formatPrice(product.price);

    const button = document.createElement("button");
    button.className = "add-to-cart";
    button.textContent = "ADD TO BAG";
    button.addEventListener("click", () => addToCart(product.id));

    bottom.append(price, button);
    details.append(name, description, bottom);
    card.append(image, details);
    productGrid.appendChild(card);
  });
}

document.querySelectorAll(".category-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-button").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    renderProducts(button.dataset.category);
  });
});

// ==========================================
// SEARCH
// ==========================================

const searchToggle = document.getElementById("search-toggle");
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("search-input");

function performSearch() {
  if (!searchInput) return;
  showSearchResults(searchInput.value);
}

searchToggle?.addEventListener("click", () => {
  searchPanel?.classList.toggle("open");
  searchInput?.focus();
});

searchInput?.addEventListener("input", performSearch);
function showSearchResults(query) {
  const resultsBox = document.getElementById("search-results");
  if (!resultsBox) return;

  const text = query.trim().toLowerCase();

  if (!text) {
    resultsBox.innerHTML = "";
    resultsBox.classList.remove("open");
    return;
  }

  const matches = products.filter(product =>
    product.name.toLowerCase().includes(text) ||
    product.description.toLowerCase().includes(text)
  );

  resultsBox.classList.add("open");

  if (!matches.length) {
    resultsBox.innerHTML = "<p>No products found.</p>";
    return;
  }

  resultsBox.innerHTML = matches.map(product => `
    <button class="search-result-item" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <span>${product.name}</span>
      <strong>₾${product.price}</strong>
    </button>
  `).join("");

  resultsBox.querySelectorAll(".search-result-item").forEach(item => {
    item.addEventListener("click", () => {
      const product = products.find(p => p.id === Number(item.dataset.productId));
      if (product) openProductDetails(product);
    });
  });
}

searchInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    performSearch();
  }
});

document.getElementById("search-close")?.addEventListener("click", () => {
  searchPanel?.classList.remove("open");

  if (searchInput) {
    searchInput.value = "";
  }

  document.querySelectorAll(".category-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "all"
    );
  });

  renderProducts("all", "");
});

// ==========================================
// CART
// ==========================================

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function changeQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  if (!cartItemsElement) return;

  cartItemsElement.innerHTML = "";

  let total = 0;
  let count = 0;

  cart.forEach(item => {
    const product = products.find(product => product.id === item.id);
    if (!product) return;

    total += product.price * item.quantity;
    count += item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = formatPrice(product.price);

    const quantity = document.createElement("div");
    quantity.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.addEventListener("click", () => changeQuantity(product.id, -1));

    const number = document.createElement("span");
    number.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.addEventListener("click", () => changeQuantity(product.id, 1));

    quantity.append(minus, number, plus);

    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeFromCart(product.id));

    info.append(name, price, quantity, remove);
    row.append(image, info);
    cartItemsElement.appendChild(row);
  });

  if (cartTotalElement) {
    cartTotalElement.textContent = formatPrice(total);
  }

  if (bagCountElement) {
    bagCountElement.textContent = count;
  }

  const checkoutSummary = document.getElementById("checkout-summary");

  if (checkoutSummary) {
    checkoutSummary.textContent =
      `Your order total: ${formatPrice(total)}`;
  }
}

document.getElementById("bag-toggle")?.addEventListener("click", () => {
  document.getElementById("cart-drawer")?.classList.add("open");
  document.getElementById("drawer-backdrop")?.classList.add("open");
});

function closeCart() {
  document.getElementById("cart-drawer")?.classList.remove("open");
  document.getElementById("drawer-backdrop")?.classList.remove("open");
}

document.getElementById("cart-close")?.addEventListener("click", closeCart);
document.getElementById("drawer-backdrop")?.addEventListener("click", closeCart);

// ==========================================
// CHECKOUT
// ==========================================

const checkoutOverlay = document.getElementById("checkout-overlay");

document.getElementById("checkout-open")?.addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("Your bag is empty.");
    return;
  }

  closeCart();

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (user) {
    await loadProfileIntoCheckout(user);
  }

  renderCart();
  checkoutOverlay?.classList.add("open");
});

document.getElementById("checkout-close")?.addEventListener("click", () => {
  checkoutOverlay?.classList.remove("open");
});

async function loadProfileIntoCheckout(user) {
  const { data } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return;

  setValue("customer-first-name", data.first_name);
  setValue("customer-last-name", data.last_name);
  setValue("customer-email", user.email);
  setValue("customer-phone", data.phone);
  setValue("customer-address", data.delivery_address);
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && value) element.value = value;
}

document.getElementById("place-order")?.addEventListener("click", () => {
  const message = document.getElementById("order-message");

  const firstName = document.getElementById("customer-first-name").value.trim();
  const lastName = document.getElementById("customer-last-name").value.trim();
  const email = document.getElementById("customer-email").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();

  if (!firstName || !lastName || !email || !phone || !address) {
    message.textContent = "Please complete all required fields.";
    return;
  }

  if (cart.length === 0) {
    message.textContent = "Your bag is empty.";
    return;
  }

  message.textContent =
    "Online payment is not active yet. Your order has not been submitted or saved. No payment has been taken.";
});

// ==========================================
// ACCOUNT ELEMENTS
// ==========================================

const accountOverlay = document.getElementById("account-overlay");
const accountTitle = document.getElementById("account-title");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const dashboard = document.getElementById("account-dashboard");
const accountMessage = document.getElementById("account-message");
const accountSwitch = document.getElementById("account-switch");

let currentUser = null;
let currentProfile = null;

// ==========================================
// ACCOUNT VIEW HELPERS
// ==========================================

function showSignup() {
  accountTitle.textContent = "Create Account";
  signupForm.hidden = false;
  loginForm.hidden = true;
  dashboard.hidden = true;
  accountSwitch.hidden = false;
  accountMessage.textContent = "";
  accountSwitch.innerHTML =
    'Already have an account? <button type="button" id="show-login">Sign in</button>';

  document.getElementById("show-login")?.addEventListener("click", showLogin);
}

function showLogin() {
  accountTitle.textContent = "Welcome Back";
  signupForm.hidden = true;
  loginForm.hidden = false;
  dashboard.hidden = true;
  accountSwitch.hidden = false;
  accountMessage.textContent = "";
  accountSwitch.innerHTML =
    'Don’t have an account? <button type="button" id="show-signup">Create account</button>';

  document.getElementById("show-signup")?.addEventListener("click", showSignup);
}

function showDashboard() {
  signupForm.hidden = true;
  loginForm.hidden = true;
  dashboard.hidden = false;
  accountSwitch.hidden = true;
  accountTitle.textContent = "My Account";
  accountMessage.textContent = "";

  document.getElementById("dashboard-email").textContent =
    currentUser?.email || "";

  loadProfile();
  loadOrders();
}

function openAccount() {
  accountOverlay?.classList.add("open");
  accountMessage.textContent = "";

  if (currentUser) {
    showDashboard();
  } else {
    showSignup();
  }
}

function closeAccount() {
  accountOverlay?.classList.remove("open");
}

document.getElementById("account-toggle")?.addEventListener("click", openAccount);
document.getElementById("account-close")?.addEventListener("click", closeAccount);

// ==========================================
// SIGN UP
// ==========================================

signupForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const firstName = document.getElementById("signup-first-name").value.trim();
  const lastName = document.getElementById("signup-last-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  accountMessage.textContent = "Creating your account...";

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });

  if (error) {
    accountMessage.textContent = error.message;
    return;
  }

  if (data.session) {
    currentUser = data.user;
    accountMessage.textContent = "Your account has been created.";
    showDashboard();
  } else {
    accountMessage.textContent =
      "Registration successful! Please check your email and confirm your account before signing in.";
    showLogin();
  }
});

// ==========================================
// SIGN IN
// ==========================================

loginForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  accountMessage.textContent = "Signing in...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    accountMessage.textContent = error.message;
    return;
  }

  currentUser = data.user;
  showDashboard();
});

// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    accountMessage.textContent = "Could not load your profile: " + error.message;
    return;
  }

  currentProfile = data || {};

  displayProfile(currentProfile);
  fillEditForm(currentProfile);
}

function displayProfile(profile) {
  setText("profile-first-name", profile.first_name);
  setText("profile-last-name", profile.last_name);
  setText("profile-email", currentUser?.email);
  setText("profile-phone", profile.phone);
  setText("profile-address", profile.delivery_address);
}

function fillEditForm(profile) {
  setValue("edit-first-name", profile.first_name);
  setValue("edit-last-name", profile.last_name);
  setValue("edit-email", currentUser?.email);
  setValue("edit-phone", profile.phone);
  setValue("edit-address", profile.delivery_address);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "Not provided";
}

// ==========================================
// EDIT PROFILE
// ==========================================

document.getElementById("profile-form")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser) return;

  const profileData = {
    first_name: document.getElementById("edit-first-name").value.trim(),
    last_name: document.getElementById("edit-last-name").value.trim(),
    phone: document.getElementById("edit-phone").value.trim(),
    delivery_address: document.getElementById("edit-address").value.trim()
  };

  accountMessage.textContent = "Saving your changes...";

  const { error } = await supabaseClient
    .from("profiles")
    .update(profileData)
    .eq("id", currentUser.id);

  if (error) {
    accountMessage.textContent = "Could not save changes: " + error.message;
    return;
  }

  currentProfile = { ...currentProfile, ...profileData };

  displayProfile(currentProfile);
  fillEditForm(currentProfile);

  accountMessage.textContent = "Your profile has been updated successfully.";
  switchAccountTab("profile");
});

// ==========================================
// ACCOUNT TABS
// ==========================================

function switchAccountTab(tabName) {
  document.querySelectorAll(".account-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  document.querySelectorAll(".account-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `${tabName}-panel`);
  });
}

document.querySelectorAll(".account-tab").forEach(button => {
  button.addEventListener("click", () => {
    switchAccountTab(button.dataset.tab);
  });
});

// ==========================================
// ORDER HISTORY
// ==========================================

async function loadOrders() {
  const ordersList = document.getElementById("orders-list");

  if (!ordersList || !currentUser) return;

  ordersList.textContent = "Loading your orders...";

  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    ordersList.textContent = "Could not load orders: " + error.message;
    return;
  }

  if (!data || data.length === 0) {
    ordersList.innerHTML =
      '<p class="empty-orders">You have no orders yet.</p>';
    return;
  }

  ordersList.innerHTML = "";

  data.forEach(order => {
    const card = document.createElement("article");
    card.className = "order-card";

    const heading = document.createElement("div");
    heading.className = "order-card-heading";

    const orderName = document.createElement("strong");
    orderName.textContent = "Order #" + order.id.slice(0, 8);

    const status = document.createElement("span");
    status.className = "order-status";
    status.textContent = order.payment_status;

    heading.append(orderName, status);

    const date = document.createElement("p");
    date.textContent = new Date(order.created_at).toLocaleDateString();

    const amount = document.createElement("p");
    amount.textContent =
      "Total: " + formatPrice(order.total_amount);

    const payment = document.createElement("p");
    payment.textContent = "Payment: " + order.payment_method;

    card.append(heading, date, amount, payment);
    ordersList.appendChild(card);
  });
}

// ==========================================
// SIGN OUT
// ==========================================

document.getElementById("sign-out-button")?.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    accountMessage.textContent = error.message;
    return;
  }

  currentUser = null;
  currentProfile = null;

  updateAccountButton();
  showLogin();
  accountMessage.textContent = "You have signed out.";
});

// ==========================================
// AUTH STATE
// ==========================================

function updateAccountButton() {
  const button = document.getElementById("account-toggle");

  if (!button) return;

  button.textContent = currentUser ? "My Account" : "Account";
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null;
  updateAccountButton();

  if (currentUser && accountOverlay?.classList.contains("open")) {
    showDashboard();
  }
});

async function initializeAccount() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    return;
  }

  currentUser = data.session?.user || null;
  updateAccountButton();
}

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

renderProducts();
renderCart();
showSignup();
initializeAccount();
