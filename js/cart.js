const CART_KEY = "novastore_cart";

/* Returns the current Supabase user ID, or undefined if not logged in */
async function getUserId() {
    const { data } = await window.supabaseClient.auth.getUser();
    return data?.user?.id;
}

/* Fetches the cart items stored in the Supabase database for the given user */
async function loadCartFromServer(userId) {
    const { data } = await window.supabaseClient
        .from('carts')
        .select('items')
        .eq('user_id', userId)
        .single();
    return data?.items || [];
}

/* Saves the given cart array to the Supabase database for the given user */
async function saveCartToServer(userId, cart) {
    await window.supabaseClient
        .from('carts')
        .upsert({ user_id: userId, items: cart, updated_at: new Date() });
}

/* Reads the current local cart and syncs it to the server if the user is logged in */
async function syncCart() {
    const userId = await getUserId();
    /* Do nothing if no user is authenticated */
    if (!userId) return;
    const cart = getCart();
    await saveCartToServer(userId, cart);
}

/* Reads the cart from localStorage and returns it as an array */
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

/* Saves the cart to localStorage, syncs it to the server and refreshes the UI */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    syncCart();
    updateCartCount();
    renderCartSidebar();
}

/* Adds a product to the cart, or increases its quantity if it already exists */
function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
        /* Product already in cart — just increase the quantity */
        existing.qty += product.qty || 1;
    } else {
        /* New product — push it to the end of the cart */
        cart.push({ ...product, qty: product.qty || 1 });
    }
    saveCart(cart);
}

/* Removes a product from the cart by its ID */
function removeFromCart(id) {
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
}

/* Sets the quantity of a specific cart item (minimum 1) */
function updateQty(id, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, qty);
    saveCart(cart);
}

/* Calculates and returns the total price of all items in the cart */
function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

/* Updates the item count badge on the cart icon in the navbar */
function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    if (!countEl) return;
    const totalItems = getCart().reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = totalItems;
}

/* Renders the full cart sidebar: all items, quantity controls, and total price */
function renderCartSidebar() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total-amount");
    if (!container || !totalEl) return;

    const cart = getCart();
    container.innerHTML = "";

    /* Show an empty state message if there are no items in the cart */
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🛒 Your cart is empty.</p>
                <a href="shop.html" class="btn ghost">Browse products</a>
            </div>`;
    } else {
        /* Create a row for each cart item with its title, price and controls */
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

    /* Display the combined total price of all cart items */
    totalEl.textContent = `€${getCartTotal().toFixed(2)}`;

    /* Minus buttons: decrease item quantity by 1, minimum 1 */
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

    /* Plus buttons: increase item quantity by 1 */
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

    /* Remove buttons: delete the item from the cart entirely */
    container.querySelectorAll(".cart-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            removeFromCart(id);
        });
    });
}

/* Sets up the checkout button to clear the cart and show a success message */
function initCheckout() {
    const btn = document.querySelector(".cart-footer .btn.primary");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const cart = getCart();
        /* Do nothing if the cart is empty */
        if (cart.length === 0) return;
        const container = document.getElementById("cart-items");
        const totalEl = document.getElementById("cart-total-amount");
        /* Clear cart from localStorage after placing the order */
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        /* Replace cart items with an order confirmation message */
        if (container) container.innerHTML = `
            <div class="checkout-success">
                <h3>Order placed! 🎉</h3>
                <p>Thank you for your purchase. You'll receive a confirmation shortly.</p>
            </div>`;
        if (totalEl) totalEl.textContent = "€0.00";
    });
}

/* Initialize cart UI as soon as the DOM is ready */
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderCartSidebar();
    initCheckout();
});
