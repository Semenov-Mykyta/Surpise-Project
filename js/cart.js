const GUEST_CART_KEY = "novastore_guest_cart";

<<<<<<< Updated upstream
let cartCache = [];
let authUserId = null;

=======
/* In-memory cart data shared across all cart functions */
let cartCache = [];

/* ID of the currently logged-in user, or null for guests */
let authUserId = null;

/* Reads the guest cart from sessionStorage and returns it as an array */
>>>>>>> Stashed changes
function readGuestCart() {
    try {
        return JSON.parse(sessionStorage.getItem(GUEST_CART_KEY)) || [];
    } catch {
        return [];
    }
}

<<<<<<< Updated upstream
=======
/* Saves the current cart to sessionStorage (only for guests, skipped for logged-in users) */
>>>>>>> Stashed changes
function saveGuestCart() {
    if (authUserId) return;
    sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartCache));
}

<<<<<<< Updated upstream
=======
/* Returns the current Supabase user ID, or null if not authenticated */
>>>>>>> Stashed changes
async function getUserId() {
    const client = window.supabaseClient;
    if (!client) return null;

    const { data } = await client.auth.getUser();
    return data?.user?.id || null;
}

<<<<<<< Updated upstream
=======
/* Loads the user's cart from the Supabase database by user ID
   NOTE: Not working — server-side cart loading is disabled */
/*
>>>>>>> Stashed changes
async function loadCartFromServer(userId) {
    const client = window.supabaseClient;
    if (!client) return [];

    const { data, error } = await client
        .from("carts")
        .select("items")
        .eq("user_id", userId)
        .single();

    if (error) return [];
    return data?.items || [];
}
<<<<<<< Updated upstream

=======
*/

/* Saves the current cart to the Supabase database for the logged-in user
   NOTE: Not working — server-side cart saving is disabled */
/*
>>>>>>> Stashed changes
async function saveCartToServer() {
    if (!authUserId || !window.supabaseClient) return;

    await window.supabaseClient
        .from("carts")
        .upsert(
            {
                user_id: authUserId,
                items: cartCache,
                updated_at: new Date().toISOString()
            },
            { onConflict: "user_id" }
        );
}
<<<<<<< Updated upstream

=======
*/

/* Updates the cart count badge and sidebar, then saves cart to storage */
>>>>>>> Stashed changes
async function saveAndRender() {
    updateCartCount();
    renderCartSidebar();

    if (!authUserId) {
        saveGuestCart();
        return;
    }

<<<<<<< Updated upstream
=======
    /* Server save disabled — Supabase cart sync is not working
>>>>>>> Stashed changes
    clearTimeout(window.__cartTimer);

    window.__cartTimer = setTimeout(async () => {
        await saveCartToServer();
    }, 300);
<<<<<<< Updated upstream
=======
    */
>>>>>>> Stashed changes
}

/* Adds a product to the cart, or increases its quantity if it already exists */
function addToCart(product) {
    const existing = cartCache.find(i => i.id === product.id);

    if (existing) {
        /* Product already in cart — just increase the quantity */
        existing.qty += product.qty || 1;
    } else {
<<<<<<< Updated upstream
=======
        /* New product — push it to the end of the cart */
>>>>>>> Stashed changes
        cartCache.push({ ...product, qty: product.qty || 1 });
    }

    saveAndRender();
}

/* Removes a product from the cart by its ID */
function removeFromCart(id) {
    cartCache = cartCache.filter(i => i.id !== id);
    saveAndRender();
}

/* Sets the quantity of a specific cart item (minimum 1) */
function updateQty(id, qty) {
    const item = cartCache.find(i => i.id === id);
    if (!item) return;

    item.qty = Math.max(1, qty);
    saveAndRender();
}

/* Calculates and returns the total price of all items in the cart */
function getCartTotal() {
    return cartCache.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/* Updates the item count badge on the cart icon in the navbar */
function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;

    el.textContent = cartCache.reduce((s, i) => s + i.qty, 0);
}

/* Renders the full cart sidebar: all items, quantity controls, and total price */
function renderCartSidebar() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total-amount");

    if (!container || !totalEl) return;

    container.innerHTML = "";

<<<<<<< Updated upstream
    if (cartCache.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>Cart is empty</p></div>`;
    } else {
=======
    /* Show an empty state message if there are no items in the cart */
    if (cartCache.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>Cart is empty</p></div>`;
    } else {
        /* Create a row for each cart item with its title, price and controls */
>>>>>>> Stashed changes
        cartCache.forEach(item => {
            const row = document.createElement("div");
            row.className = "cart-item";

            row.innerHTML = `
                <div>
                    <div class="cart-item-title">${item.title}</div>
                    <div>€${Number(item.price).toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-minus" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="cart-plus" data-id="${item.id}">+</button>
                    <button class="cart-remove" data-id="${item.id}">x</button>
                </div>
            `;

            container.appendChild(row);
        });
    }

<<<<<<< Updated upstream
    totalEl.textContent = "€" + getCartTotal().toFixed(2);

=======
    /* Display the combined total price of all cart items */
    totalEl.textContent = "€" + getCartTotal().toFixed(2);

    /* Minus buttons: decrease item quantity by 1, minimum 1 */
>>>>>>> Stashed changes
    container.querySelectorAll(".cart-minus").forEach(btn => {
        btn.onclick = () => {
            const item = cartCache.find(i => String(i.id) === String(btn.dataset.id));
            if (!item) return;

            item.qty = Math.max(1, item.qty - 1);
            saveAndRender();
        };
    });

<<<<<<< Updated upstream
=======
    /* Plus buttons: increase item quantity by 1 */
>>>>>>> Stashed changes
    container.querySelectorAll(".cart-plus").forEach(btn => {
        btn.onclick = () => {
            const item = cartCache.find(i => String(i.id) === String(btn.dataset.id));
            if (!item) return;

            item.qty++;
            saveAndRender();
        };
    });

<<<<<<< Updated upstream
=======
    /* Remove buttons: delete the item from the cart entirely */
>>>>>>> Stashed changes
    container.querySelectorAll(".cart-remove").forEach(btn => {
        btn.onclick = () => removeFromCart(btn.dataset.id);
    });
}

<<<<<<< Updated upstream
=======
/* Initializes the cart — was meant to load from server when logged in,
   now always falls back to sessionStorage since server sync is disabled */
>>>>>>> Stashed changes
async function initCart() {
    const userId = await getUserId();
    authUserId = userId;

<<<<<<< Updated upstream
=======
    /* Server cart loading disabled — Supabase sync not working, always use local storage
>>>>>>> Stashed changes
    if (userId) {
        cartCache = await loadCartFromServer(userId);
    } else {
        cartCache = readGuestCart();
    }
<<<<<<< Updated upstream
=======
    */
    cartCache = readGuestCart();
>>>>>>> Stashed changes

    updateCartCount();
    renderCartSidebar();
}

window.initCart = initCart;

<<<<<<< Updated upstream
window.addEventListener("auth-change", async () => {
    await initCart();
=======
/* Re-initialize the cart whenever the user logs in or out */
window.addEventListener("auth-change", async () => {
    await initCart();
});

/* Re-initialize the cart once the authentication system is ready */
window.addEventListener("auth-ready", async () => {
    await initCart();
});

/* On page load: immediately read cart from sessionStorage, then re-check after auth */
document.addEventListener("DOMContentLoaded", async () => {
    cartCache = readGuestCart();
    updateCartCount();
    renderCartSidebar();

    /* Small delay to let auth.js initialize first */
    setTimeout(async () => {
        await initCart();
    }, 300);
>>>>>>> Stashed changes
});

window.addEventListener("auth-ready", async () => {
    await initCart();
});

document.addEventListener("DOMContentLoaded", async () => {
    cartCache = readGuestCart();
    updateCartCount();
    renderCartSidebar();

    setTimeout(async () => {
        await initCart();
    }, 300);
});