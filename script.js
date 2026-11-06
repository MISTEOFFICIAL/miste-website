
const products = [
  {
    id: 1,
    name: "Lavender Fields",
    category: "candles",
    label: "CANDLE",
    price: 45,
    description: "A soft floral fragrance with calming lavender notes.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 2,
    name: "Midnight Bloom",
    category: "candles",
    label: "CANDLE",
    price: 49,
    description: "An elegant evening scent for a peaceful atmosphere.",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 3,
    name: "Velvet Woods",
    category: "diffusers",
    label: "DIFFUSER",
    price: 65,
    description: "Warm woody notes that make a space feel inviting.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 4,
    name: "Lavender Mist",
    category: "diffusers",
    label: "DIFFUSER",
    price: 59,
    description: "A delicate lavender fragrance for everyday living.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 5,
    name: "Soft Linen",
    category: "sprays",
    label: "ROOM SPRAY",
    price: 35,
    description: "Fresh, clean notes inspired by freshly washed linen.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 6,
    name: "Blush Garden",
    category: "sprays",
    label: "ROOM SPRAY",
    price: 39,
    description: "A gentle floral fragrance for your favourite room.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=85"
  }
];

let activeCategory = "all";
let searchTerm = "";
let cart = [];

const productGrid = document.getElementById("product-grid");
const cartDrawer = document.getElementById("cart-drawer");
const backdrop = document.getElementById("drawer-backdrop");

function money(amount) {
  return "₾" + amount.toFixed(2);
}

/* PRODUCTS */

function renderProducts() {
  const filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "all" || product.category === activeCategory;

    const matchesSearch =
      (product.name + " " + product.description + " " + product.label)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = "";

  document.getElementById("results-message").textContent =
    filtered.length ? `${filtered.length} products` : "No products found.";

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <span class="product-category">${product.label}</span>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <p class="product-price">${money(product.price)}</p>
        <button class="add-button" data-add="${product.id}">ADD TO BAG</button>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

/* CART */

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  renderCart();
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

function getTotal() {
  return cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);
    return total + product.price * item.quantity;
  }, 0);
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.getElementById("bag-count").textContent = count;
  document.getElementById("cart-total").textContent = money(getTotal());

  if (cart.length === 0) {
    container.innerHTML =
      '<p class="empty-cart">Your bag is waiting for something beautiful.</p>';
    return;
  }

  container.innerHTML = "";

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div>
        <h3>${product.name}</h3>
        <p>${money(product.price)}</p>
        <div class="quantity-controls">
          <button data-minus="${product.id}">−</button>
          <span>${item.quantity}</span>
          <button data-plus="${product.id}">+</button>
        </div>
      </div>
      <button class="remove-item" data-remove="${product.id}">Remove</button>
    `;

    container.appendChild(row);
  });
}

/* DRAWER */

function openCart() {
  cartDrawer.classList.add("open");
  backdrop.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("open");
}

/* CHECKOUT */

function openCheckout() {
  if (cart.length === 0) {
    alert("Your bag is empty. Add a product first.");
    return;
  }

  closeCart();

  const summary = document.getElementById("checkout-summary");

  summary.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return `<div>${product.name} × ${item.quantity} — ${money(product.price * item.quantity)}</div>`;
  }).join("");

  summary.innerHTML += `<strong>Total: ${money(getTotal())}</strong>`;

  document.getElementById("order-message").textContent = "";
  document.getElementById("checkout-overlay").classList.add("open");
}

function closeCheckout() {
  document.getElementById("checkout-overlay").classList.remove("open");
}

/* CATEGORY FILTERS */

document.querySelectorAll(".category-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-button").forEach(btn =>
      btn.classList.remove("active")
    );

    button.classList.add("active");
    activeCategory = button.dataset.category;
    searchTerm = "";
    document.getElementById("search-input").value = "";

    renderProducts();
  });
});

/* PRODUCT AND CART BUTTONS */

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  const remove = event.target.closest("[data-remove]");

  if (add) addToCart(Number(add.dataset.add));
  if (plus) changeQuantity(Number(plus.dataset.plus), 1);
  if (minus) changeQuantity(Number(minus.dataset.minus), -1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

/* SEARCH */

document.getElementById("search-toggle").addEventListener("click", () => {
  document.getElementById("search-panel").classList.add("open");
  document.getElementById("search-input").focus();
});

document.getElementById("search-close").addEventListener("click", () => {
  document.getElementById("search-panel").classList.remove("open");
  document.getElementById("search-input").value = "";
  searchTerm = "";
  renderProducts();
});

document.getElementById("search-input").addEventListener("input", event => {
  searchTerm = event.target.value;
  activeCategory = "all";

  document.querySelectorAll(".category-button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === "all");
  });

  renderProducts();
});

/* OPEN AND CLOSE CONTROLS */

document.getElementById("bag-toggle").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

document.getElementById("checkout-open").addEventListener("click", openCheckout);
document.getElementById("checkout-close").addEventListener("click", closeCheckout);

/* CHECKOUT VALIDATION */

document.getElementById("place-order").addEventListener("click", () => {
  const firstName = document.getElementById("customer-first-name").value.trim();
  const lastName = document.getElementById("customer-last-name").value.trim();
  const emailInput = document.getElementById("customer-email");
  const email = emailInput.value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();

  const payment = document.querySelector('input[name="payment"]:checked').value;
  const message = document.getElementById("order-message");

  if (!firstName || !lastName || !email || !phone || !address) {
    message.textContent = "Please complete all required fields.";
    return;
  }

  if (!emailInput.checkValidity()) {
    message.textContent = "Please enter a valid email address.";
    return;
  }

  const order = {
    customer: {
      firstName,
      lastName,
      email,
      phone,
      address
    },
    paymentMethod: payment,
    items: cart.map(item => {
      const product = products.find(p => p.id === item.id);

      return {
        name: product.name,
        quantity: item.quantity,
        price: product.price
      };
    }),
    total: getTotal(),
    notificationEmail: "support.miste@gmail.com"
  };

  console.log("MISTÉ demo order:", order);

  message.textContent =
    `Thank you, ${firstName}! Your details have been validated. ` +
    `Selected payment: ${payment}. This is still a demo: no payment was taken and no email was sent.`;

  // Cart stays intact until real payment integration is activated.
});

/* INITIAL DISPLAY */

renderProducts();
renderCart();
