const CART_KEY = "novastore_cart";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    renderCartSidebar();
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
        existing.qty += product.qty || 1;
    } else {
        cart.push({ ...product, qty: product.qty || 1 });
    }
    saveCart(cart);
}

function removeFromCart(id) {
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
}

function updateQty(id, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, qty);
    saveCart(cart);
}

function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    if (!countEl) return;
    const totalItems = getCart().reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = totalItems;
}

function renderCartSidebar() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total-amount");
    if (!container || !totalEl) return;

    const cart = getCart();
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🛒 Your cart is empty.</p>
                <a href="shop.html" class="btn ghost">Browse products</a>
            </div>`;
    } else {
        cart.forEach((item) => {
            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML = `
        <div>
          <div class="cart-item-title">${item.title}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);">€${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="btn-icon cart-minus" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button class="btn-icon cart-plus" data-id="${item.id}">+</button>
          <button class="btn-icon cart-remove" data-id="${item.id}">✕</button>
        </div>
      `;
            container.appendChild(row);
        });
    }

    totalEl.textContent = `€${getCartTotal().toFixed(2)}`;

    container.querySelectorAll(".cart-minus").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const cart = getCart();
            const item = cart.find((i) => i.id === id);
            if (!item) return;
            item.qty = Math.max(1, item.qty - 1);
            saveCart(cart);
        });
    });

    container.querySelectorAll(".cart-plus").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const cart = getCart();
            const item = cart.find((i) => i.id === id);
            if (!item) return;
            item.qty += 1;
            saveCart(cart);
        });
    });

    container.querySelectorAll(".cart-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            removeFromCart(id);
        });
    });
}

function initCheckout() {
    const btn = document.querySelector(".cart-footer .btn.primary");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const cart = getCart();
        if (cart.length === 0) return;
        const container = document.getElementById("cart-items");
        const totalEl = document.getElementById("cart-total-amount");
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        if (container) container.innerHTML = `
            <div class="checkout-success">
                <h3>Order placed! 🎉</h3>
                <p>Thank you for your purchase. You'll receive a confirmation shortly.</p>
            </div>`;
        if (totalEl) totalEl.textContent = "€0.00";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderCartSidebar();
    initCheckout();
});
