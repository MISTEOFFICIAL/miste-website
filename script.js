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

let products = [];

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

  if (!Array.isArray(cart)) {
    cart = [];
  }
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
// PRODUCT DETAILS
// ==========================================

function openProductDetails(product) {
  if (!product) return;

  let overlay = document.getElementById("product-detail-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "product-detail-overlay";
    overlay.className = "product-detail-overlay";

    overlay.innerHTML = `
      <div class="product-detail-box">
        <button class="product-detail-close" aria-label="Close">×</button>
        <img class="product-detail-image" src="" alt="">
        <div class="product-detail-content">
          <p class="eyebrow">THE MISTÉ COLLECTION</p>
          <h2 class="product-detail-name"></h2>
          <p class="product-detail-description"></p>
          <strong class="product-detail-price"></strong>
          <button class="product-detail-add">ADD TO BAG</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", event => {
      if (
        event.target === overlay ||
        event.target.closest(".product-detail-close")
      ) {
        overlay.classList.remove("open");
      }
    });

    overlay.querySelector(".product-detail-add").addEventListener("click", () => {
      const productId = Number(overlay.dataset.productId);
      addToCart(productId);
      overlay.classList.remove("open");
    });
  }

  overlay.dataset.productId = product.id;

  overlay.querySelector(".product-detail-image").src = product.image;
  overlay.querySelector(".product-detail-image").alt = product.name;
  overlay.querySelector(".product-detail-name").textContent = product.name;
  overlay.querySelector(".product-detail-description").textContent =
    product.description;
  overlay.querySelector(".product-detail-price").textContent =
    formatPrice(product.price);

  overlay.classList.add("open");
}

// ==========================================
// LOAD PRODUCTS FROM SUPABASE
// ==========================================

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Could not load products:", error.message);
    if (productGrid) {
      productGrid.innerHTML = "<p>Could not load products. Please try again.</p>";
    }
    return;
  }

  products = data.map(product => ({
    id: Number(product.id),
    name: product.name,
    category: product.category,
    price: Number(product.price),
    description: product.description || "",
    image: product.image_url || "",
    stock: Number(product.stock || 0)
  }));

  renderProducts();
  renderCart();

  if (searchInput?.value) {
    showSearchResults(searchInput.value);
  }
}

// ==========================================
// PRODUCTS DISPLAY
// ==========================================

function renderProducts(category = "all", search = "") {
  if (!productGrid) return;

  productGrid.innerHTML = "";

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      category === "all" || product.category === category;

    const matchesSearch =
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch);

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

    button.addEventListener("click", event => {
      event.stopPropagation();
      addToCart(product.id);
    });

    bottom.append(price, button);
    details.append(name, description, bottom);
    card.append(image, details);

    card.addEventListener("click", () => {
      openProductDetails(product);
    });

    productGrid.appendChild(card);
  });
}

// ==========================================
// CATEGORY FILTERS
// ==========================================

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
// MOBILE MENU
// ==========================================

const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const mobileMenuPanel = document.getElementById("mobile-menu-panel");

function openMobileMenu() {
  closeSearch();
  mobileMenuPanel?.classList.add("open");
  document.querySelector(".header")?.classList.add("menu-active");
}

function closeMobileMenu() {
  mobileMenuPanel?.classList.remove("open");
  document.querySelector(".header")?.classList.remove("menu-active");
}

mobileMenuToggle?.addEventListener("click", () => {
  if (mobileMenuPanel?.classList.contains("open")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

mobileMenuPanel?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMobileMenu);
});

// ==========================================
// SEARCH
// ==========================================

const searchToggle = document.getElementById("search-toggle");
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchClose = document.getElementById("search-close");

function openSearch() {
  searchPanel?.classList.add("open");
  document.querySelector(".header")?.classList.add("search-active");

  setTimeout(() => {
    searchInput?.focus();
  }, 150);
}

function closeSearch() {
  searchPanel?.classList.remove("open");
  document.querySelector(".header")?.classList.remove("search-active");

  if (searchInput) {
    searchInput.value = "";
  }

  if (searchResults) {
    searchResults.innerHTML = "";
    searchResults.classList.remove("open");
  }
}

searchToggle?.addEventListener("click", () => {
  if (searchPanel?.classList.contains("open")) {
    closeSearch();
  } else {
    openSearch();
  }
});

searchClose?.addEventListener("click", closeSearch);

function showSearchResults(query) {
  if (!searchResults) return;

  const text = query.trim().toLowerCase();

  if (!text) {
    searchResults.innerHTML = "";
    searchResults.classList.remove("open");
    return;
  }

  const matches = products.filter(product =>
    product.name.toLowerCase().includes(text) ||
    product.description.toLowerCase().includes(text) ||
    product.category.toLowerCase().includes(text)
  );

  searchResults.classList.add("open");

  if (!matches.length) {
    searchResults.innerHTML = "<p>No products found.</p>";
    return;
  }

  searchResults.innerHTML = matches.map(product => `
    <button
      type="button"
      class="search-result-item"
      data-product-id="${product.id}"
    >
      <img src="${product.image}" alt="${product.name}">
      <span>${product.name}</span>
      <strong>${formatPrice(product.price)}</strong>
    </button>
  `).join("");

  searchResults.querySelectorAll(".search-result-item").forEach(item => {
    item.addEventListener("click", () => {
      const productId = Number(item.dataset.productId);
      const product = products.find(p => p.id === productId);

      closeSearch();

      if (product) {
        openProductDetails(product);
      }
    });
  });
}

searchInput?.addEventListener("input", () => {
  showSearchResults(searchInput.value);
});

searchInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();

    const firstResult = searchResults?.querySelector(".search-result-item");

    if (firstResult) {
      firstResult.click();
    } else {
      showSearchResults(searchInput.value);
    }
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeSearch();

    document.getElementById("product-detail-overlay")
      ?.classList.remove("open");
  }
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
    minus.addEventListener("click", () => {
      changeQuantity(product.id, -1);
    });

    const number = document.createElement("span");
    number.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.addEventListener("click", () => {
      changeQuantity(product.id, 1);
    });

    quantity.append(minus, number, plus);

    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      removeFromCart(product.id);
    });

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

// ==========================================
// CART OPEN / CLOSE
// ==========================================

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

  if (element && value !== null && value !== undefined) {
    element.value = value;
  }
}

document.getElementById("place-order")?.addEventListener("click", () => {
  const message = document.getElementById("order-message");

  const firstName =
    document.getElementById("customer-first-name").value.trim();

  const lastName =
    document.getElementById("customer-last-name").value.trim();

  const email =
    document.getElementById("customer-email").value.trim();

  const phone =
    document.getElementById("customer-phone").value.trim();

  const address =
    document.getElementById("customer-address").value.trim();

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

let isAdmin = false;

async function checkAdminStatus() {
  const adminAccess = document.getElementById("admin-access");

  if (!currentUser) {
    isAdmin = false;
    if (adminAccess) adminAccess.hidden = true;
    return;
  }

  const { data, error } = await supabaseClient.rpc("is_admin");

  if (error) {
    console.error("Admin check error:", error);
    isAdmin = false;
  } else {
    isAdmin = data === true;
  }

  if (adminAccess) {
    adminAccess.hidden = !isAdmin;
  }
}

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

  document.getElementById("show-login")
    ?.addEventListener("click", showLogin);
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

  document.getElementById("show-signup")
    ?.addEventListener("click", showSignup);
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

document.getElementById("account-toggle")
  ?.addEventListener("click", openAccount);

document.getElementById("account-close")
  ?.addEventListener("click", closeAccount);

// ==========================================
// SIGN UP
// ==========================================

signupForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const firstName =
    document.getElementById("signup-first-name").value.trim();

  const lastName =
    document.getElementById("signup-last-name").value.trim();

  const email =
    document.getElementById("signup-email").value.trim();

  const password =
    document.getElementById("signup-password").value;

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
    updateAccountButton();
    showDashboard();
    accountMessage.textContent = "Your account has been created.";
  } else {
    showLogin();

    accountMessage.textContent =
      "Registration successful! Please check your email and confirm your account before signing in.";
  }
});

// ==========================================
// SIGN IN
// ==========================================

loginForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const email =
    document.getElementById("login-email").value.trim();

  const password =
    document.getElementById("login-password").value;

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
  updateAccountButton();
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
    accountMessage.textContent =
      "Could not load your profile: " + error.message;
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

  if (element) {
    element.textContent = value || "Not provided";
  }
}

// ==========================================
// EDIT PROFILE
// ==========================================

document.getElementById("profile-form")
  ?.addEventListener("submit", async event => {
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
      accountMessage.textContent =
        "Could not save changes: " + error.message;
      return;
    }

    currentProfile = { ...currentProfile, ...profileData };

    displayProfile(currentProfile);
    fillEditForm(currentProfile);

    accountMessage.textContent =
      "Your profile has been updated successfully.";

    switchAccountTab("profile");
  });

// ==========================================
// ACCOUNT TABS
// ==========================================

function switchAccountTab(tabName) {
  document.querySelectorAll(".account-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tab === tabName
    );
  });

  document.querySelectorAll(".account-panel").forEach(panel => {
    panel.classList.toggle(
      "active",
      panel.id === `${tabName}-panel`
    );
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
    ordersList.textContent =
      "Could not load orders: " + error.message;
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
    orderName.textContent = "Order #" + String(order.id).slice(0, 8);

    const status = document.createElement("span");
    status.className = "order-status";
    status.textContent = order.payment_status || "Pending";

    heading.append(orderName, status);

    const date = document.createElement("p");
    date.textContent = new Date(order.created_at).toLocaleDateString();

    const amount = document.createElement("p");
    amount.textContent =
      "Total: " + formatPrice(order.total_amount);

    const payment = document.createElement("p");
    payment.textContent =
      "Payment: " + (order.payment_method || "Not specified");

    card.append(heading, date, amount, payment);
    ordersList.appendChild(card);
  });
}

// ==========================================
// SIGN OUT
// ==========================================

document.getElementById("sign-out-button")
  ?.addEventListener("click", async () => {
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

  const label = button.querySelector(".account-label");

  if (label) {
    label.textContent = currentUser ? "My Account" : "Account";
  }

  button.setAttribute(
    "aria-label",
    currentUser ? "My Account" : "Account"
  );
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user ?? null;
  updateAccountButton();

  if (currentUser && accountOverlay?.classList.contains("open")) {
    showDashboard();
  }

  setTimeout(() => {
    checkAdminStatus();
  }, 0);
});

async function initializeAccount() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    return;
  }

  currentUser = data.session?.user || null;
  updateAccountButton();
  await checkAdminStatus();
}

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

loadProducts();
renderCart();
showSignup();
initializeAccount();


// ==========================================
// MISTÉ — ADMIN PANEL
// ==========================================

const adminOverlay = document.getElementById("admin-overlay");
const adminOpenButton = document.getElementById("admin-panel-open");
const adminCloseButton = document.getElementById("admin-close");
const adminSaveButton = document.getElementById("admin-save-product");
const adminCancelButton = document.getElementById("admin-cancel-edit");
const adminProductsList = document.getElementById("admin-products-list");
const adminMessage = document.getElementById("admin-message");

let editingProductId = null;

// OPEN ADMIN PANEL
adminOpenButton?.addEventListener("click", async () => {
  if (!isAdmin || !currentUser) return;

  adminOverlay?.classList.add("open");
  await loadAdminProducts();
});

// CLOSE ADMIN PANEL
function closeAdminPanel() {
  adminOverlay?.classList.remove("open");
}

adminCloseButton?.addEventListener("click", closeAdminPanel);

adminOverlay?.addEventListener("click", event => {
  if (event.target === adminOverlay) {
    closeAdminPanel();
  }
});

// RESET FORM
function resetAdminForm() {
  editingProductId = null;

  document.getElementById("admin-product-id").value = "";
  document.getElementById("admin-product-name").value = "";
  document.getElementById("admin-product-category").value = "candles";
  document.getElementById("admin-product-price").value = "";
  document.getElementById("admin-product-stock").value = "";
  document.getElementById("admin-product-description").value = "";
  document.getElementById("admin-product-image").value = "";

  adminSaveButton.textContent = "SAVE PRODUCT";
  adminCancelButton.hidden = true;
  adminMessage.textContent = "";
}

adminCancelButton?.addEventListener("click", resetAdminForm);

// LOAD ALL PRODUCTS
async function loadAdminProducts() {
  if (!isAdmin || !currentUser) return;

  adminProductsList.textContent = "Loading products...";

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    adminProductsList.textContent =
      "Could not load products: " + error.message;
    return;
  }

  adminProductsList.innerHTML = "";

  if (!data || data.length === 0) {
    adminProductsList.textContent = "No products yet.";
    return;
  }

  data.forEach(product => {
    const item = document.createElement("div");
    item.className = "admin-product-item";

    const info = document.createElement("div");
    info.className = "admin-product-info";

    const image = document.createElement("img");
    image.src = product.image_url || "";
    image.alt = product.name;
    image.onerror = () => {
      image.style.display = "none";
    };

    const text = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = product.name;

    const details = document.createElement("span");
    details.textContent =
      `${formatPrice(product.price)} · ${product.category} · Stock: ${product.stock} · ${product.is_active ? "Active" : "Inactive"}`;

    text.append(name, details);
    info.append(image, text);

    const actions = document.createElement("div");
    actions.className = "admin-product-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "EDIT";
    editButton.addEventListener("click", () => {
      editAdminProduct(product);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "DELETE";
    deleteButton.addEventListener("click", () => {
      deleteAdminProduct(product);
    });

    actions.append(editButton, deleteButton);
    item.append(info, actions);
    adminProductsList.appendChild(item);
  });
}

// EDIT PRODUCT
function editAdminProduct(product) {
  if (!isAdmin) return;

  editingProductId = product.id;

  document.getElementById("admin-product-id").value = product.id;
  document.getElementById("admin-product-name").value = product.name || "";
  document.getElementById("admin-product-category").value = product.category || "candles";
  document.getElementById("admin-product-price").value = product.price;
  document.getElementById("admin-product-stock").value = product.stock;
  document.getElementById("admin-product-description").value = product.description || "";
  document.getElementById("admin-product-image").value = "";

  adminSaveButton.textContent = "UPDATE PRODUCT";
  adminCancelButton.hidden = false;
  adminMessage.textContent = "";

  document.getElementById("admin-product-name").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

// SAVE PRODUCT
adminSaveButton?.addEventListener("click", async () => {
  if (!isAdmin || !currentUser) return;

  const name = document.getElementById("admin-product-name").value.trim();
  const category = document.getElementById("admin-product-category").value;
  const price = Number(document.getElementById("admin-product-price").value);
  const stock = Number(document.getElementById("admin-product-stock").value);
  const description = document.getElementById("admin-product-description").value.trim();
  const imageFile = document.getElementById("admin-product-image").files[0];

  if (!name || !description || !category) {
    adminMessage.textContent = "Please complete all product fields.";
    return;
  }

  if (
    document.getElementById("admin-product-price").value === "" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    adminMessage.textContent = "Please enter a valid price.";
    return;
  }

  if (
    document.getElementById("admin-product-stock").value === "" ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    adminMessage.textContent = "Please enter a valid stock quantity.";
    return;
  }

  if (imageFile && !imageFile.type.startsWith("image/")) {
    adminMessage.textContent = "Please select a valid image file.";
    return;
  }

  if (imageFile && imageFile.size > 5 * 1024 * 1024) {
    adminMessage.textContent = "Image must be smaller than 5 MB.";
    return;
  }

  adminSaveButton.disabled = true;
  adminMessage.textContent = "Saving product...";

  try {
    let imageUrl = "";

    // KEEP EXISTING IMAGE WHEN EDITING
    if (editingProductId) {
      const existingProduct = await supabaseClient
        .from("products")
        .select("image_url")
        .eq("id", editingProductId)
        .single();

      if (existingProduct.error) {
        throw existingProduct.error;
      }

      imageUrl = existingProduct.data.image_url || "";
    }

    // UPLOAD NEW IMAGE
    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabaseClient
        .storage
        .from("product-images")
        .upload(filePath, imageFile, {
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabaseClient
        .storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }

    if (!imageUrl) {
      throw new Error("Please upload a product image.");
    }

    const productData = {
      name,
      category,
      price,
      stock,
      description,
      image_url: imageUrl
    };

    let result;

    if (editingProductId) {
      result = await supabaseClient
        .from("products")
        .update(productData)
        .eq("id", editingProductId);
    } else {
      result = await supabaseClient
        .from("products")
        .insert({
          ...productData,
          is_active: true
        });
    }

    if (result.error) throw result.error;

    adminMessage.textContent = editingProductId
      ? "Product updated successfully."
      : "Product added successfully.";

    resetAdminForm();

    await loadProducts();
    await loadAdminProducts();

  } catch (error) {
    console.error("Admin save error:", error);
    adminMessage.textContent =
      "Could not save product: " + error.message;
  } finally {
    adminSaveButton.disabled = false;
  }
});

// DELETE PRODUCT
async function deleteAdminProduct(product) {
  if (!isAdmin || !currentUser) return;

  const confirmed = confirm(
    `Are you sure you want to delete "${product.name}"?`
  );

  if (!confirmed) return;

  adminMessage.textContent = "Deleting product...";

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", product.id);

  if (error) {
    adminMessage.textContent =
      "Could not delete product: " + error.message;
    return;
  }

  // Remove deleted product from cart
  cart = cart.filter(item => item.id !== Number(product.id));
  saveCart();

  await loadProducts();
  await loadAdminProducts();

  adminMessage.textContent = "Product deleted successfully.";
}


// ==========================================
// MISTÉ — JOURNAL ADMIN
// ==========================================

const journalTitleInput = document.getElementById("admin-journal-title");
const journalExcerptInput = document.getElementById("admin-journal-excerpt");
const journalContentInput = document.getElementById("admin-journal-content");
const journalImageInput = document.getElementById("admin-journal-image");
const journalStatusInput = document.getElementById("admin-journal-status");

const journalSaveButton = document.getElementById("admin-save-journal");
const journalCancelButton = document.getElementById("admin-cancel-journal");
const journalList = document.getElementById("admin-journal-list");
const journalMessage = document.getElementById("admin-journal-message");

let editingJournalId = null;

// LOAD ARTICLES
async function loadAdminJournal() {
  if (!isAdmin || !currentUser) return;

  journalList.textContent = "Loading articles...";

  const { data, error } = await supabaseClient
    .from("journal_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    journalList.textContent = "Could not load articles: " + error.message;
    return;
  }

  journalList.innerHTML = "";

  if (!data || data.length === 0) {
    journalList.textContent = "No articles yet.";
    return;
  }

  data.forEach(post => {
    const item = document.createElement("div");
    item.className = "admin-product-item";

    const info = document.createElement("div");
    info.className = "admin-product-info";

    if (post.image_url) {
      const image = document.createElement("img");
      image.src = post.image_url;
      image.alt = post.title;
      info.appendChild(image);
    }

    const details = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = post.title;

    const status = document.createElement("span");
    status.textContent =
      post.status === "published" ? "Published" : "Draft";

    details.append(title, status);
    info.appendChild(details);

    const actions = document.createElement("div");
    actions.className = "admin-product-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "EDIT";
    editButton.addEventListener("click", () => editJournalPost(post));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "DELETE";
    deleteButton.addEventListener("click", () => deleteJournalPost(post));

    actions.append(editButton, deleteButton);
    item.append(info, actions);
    journalList.appendChild(item);
  });
}

// RESET FORM
function resetJournalForm() {
  editingJournalId = null;

  document.getElementById("admin-journal-id").value = "";
  journalTitleInput.value = "";
  journalExcerptInput.value = "";
  journalContentInput.value = "";
  journalImageInput.value = "";
  journalStatusInput.value = "draft";

  journalSaveButton.textContent = "SAVE ARTICLE";
  journalCancelButton.hidden = true;
  journalMessage.textContent = "";
}

journalCancelButton?.addEventListener("click", resetJournalForm);

// EDIT ARTICLE
function editJournalPost(post) {
  if (!isAdmin) return;

  editingJournalId = post.id;

  document.getElementById("admin-journal-id").value = post.id;
  journalTitleInput.value = post.title || "";
  journalExcerptInput.value = post.excerpt || "";
  journalContentInput.value = post.content || "";
  journalImageInput.value = "";
  journalStatusInput.value = post.status || "draft";

  journalSaveButton.textContent = "UPDATE ARTICLE";
  journalCancelButton.hidden = false;
  journalMessage.textContent = "";

  journalTitleInput.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

// SAVE ARTICLE
journalSaveButton?.addEventListener("click", async () => {
  if (!isAdmin || !currentUser) return;

  const title = journalTitleInput.value.trim();
  const excerpt = journalExcerptInput.value.trim();
  const content = journalContentInput.value.trim();
  const status = journalStatusInput.value;
  const imageFile = journalImageInput.files[0];

  if (!title || !excerpt || !content) {
    journalMessage.textContent = "Please complete all article fields.";
    return;
  }

  if (imageFile && !imageFile.type.startsWith("image/")) {
    journalMessage.textContent = "Please select a valid image.";
    return;
  }

  if (imageFile && imageFile.size > 5 * 1024 * 1024) {
    journalMessage.textContent = "Image must be smaller than 5 MB.";
    return;
  }

  if (!["draft", "published"].includes(status)) {
    journalMessage.textContent = "Invalid publication status.";
    return;
  }

  journalSaveButton.disabled = true;
  journalMessage.textContent = "Saving article...";

  try {
    let imageUrl = "";

    if (editingJournalId) {
      const { data, error } = await supabaseClient
        .from("journal_posts")
        .select("image_url")
        .eq("id", editingJournalId)
        .single();

      if (error) throw error;
      imageUrl = data.image_url || "";
    }

    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabaseClient
        .storage
        .from("journal-images")
        .upload(filePath, imageFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabaseClient
        .storage
        .from("journal-images")
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }

    if (!imageUrl) {
      throw new Error("Please upload a cover image.");
    }

    const articleData = {
      title,
      excerpt,
      content,
      image_url: imageUrl,
      status,
      updated_at: new Date().toISOString()
    };

    let result;

    if (editingJournalId) {
      result = await supabaseClient
        .from("journal_posts")
        .update(articleData)
        .eq("id", editingJournalId);
    } else {
      result = await supabaseClient
        .from("journal_posts")
        .insert(articleData);
    }

    if (result.error) throw result.error;

    resetJournalForm();
    journalMessage.textContent = "Article saved successfully.";

    await loadAdminJournal();

  } catch (error) {
    console.error("Journal save error:", error);
    journalMessage.textContent = "Could not save article: " + error.message;
  } finally {
    journalSaveButton.disabled = false;
  }
});

// DELETE ARTICLE
async function deleteJournalPost(post) {
  if (!isAdmin || !currentUser) return;

  if (!confirm(`Delete "${post.title}"?`)) return;

  journalMessage.textContent = "Deleting article...";

  const { error } = await supabaseClient
    .from("journal_posts")
    .delete()
    .eq("id", post.id);

  if (error) {
    journalMessage.textContent = "Could not delete article: " + error.message;
    return;
  }

  await loadAdminJournal();
  journalMessage.textContent = "Article deleted successfully.";
}


