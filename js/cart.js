const GUEST_CART_KEY = "novastore_guest_cart";

let cartCache = [];
let authUserId = null;

function readGuestCart() {
    try {
        return JSON.parse(sessionStorage.getItem(GUEST_CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveGuestCart() {
    if (authUserId) return;
    sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartCache));
}

async function getUserId() {
    const client = window.supabaseClient;
    if (!client) return null;

    const { data } = await client.auth.getUser();
    return data?.user?.id || null;
}

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

async function saveAndRender() {
    updateCartCount();
    renderCartSidebar();

    if (!authUserId) {
        saveGuestCart();
        return;
    }

    clearTimeout(window.__cartTimer);

    window.__cartTimer = setTimeout(async () => {
        await saveCartToServer();
    }, 300);
}

function addToCart(product) {
    const existing = cartCache.find(i => i.id === product.id);

    if (existing) {
        existing.qty += product.qty || 1;
    } else {
        cartCache.push({ ...product, qty: product.qty || 1 });
    }

    saveAndRender();
}

function removeFromCart(id) {
    cartCache = cartCache.filter(i => i.id !== id);
    saveAndRender();
}

function updateQty(id, qty) {
    const item = cartCache.find(i => i.id === id);
    if (!item) return;

    item.qty = Math.max(1, qty);
    saveAndRender();
}

function getCartTotal() {
    return cartCache.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;

    el.textContent = cartCache.reduce((s, i) => s + i.qty, 0);
}

function renderCartSidebar() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total-amount");

    if (!container || !totalEl) return;

    container.innerHTML = "";

    if (cartCache.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>Cart is empty</p></div>`;
    } else {
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

    totalEl.textContent = "€" + getCartTotal().toFixed(2);

    container.querySelectorAll(".cart-minus").forEach(btn => {
        btn.onclick = () => {
            const item = cartCache.find(i => String(i.id) === String(btn.dataset.id));
            if (!item) return;

            item.qty = Math.max(1, item.qty - 1);
            saveAndRender();
        };
    });

    container.querySelectorAll(".cart-plus").forEach(btn => {
        btn.onclick = () => {
            const item = cartCache.find(i => String(i.id) === String(btn.dataset.id));
            if (!item) return;

            item.qty++;
            saveAndRender();
        };
    });

    container.querySelectorAll(".cart-remove").forEach(btn => {
        btn.onclick = () => removeFromCart(btn.dataset.id);
    });
}

async function initCart() {
    const userId = await getUserId();
    authUserId = userId;

    if (userId) {
        cartCache = await loadCartFromServer(userId);
    } else {
        cartCache = readGuestCart();
    }

    updateCartCount();
    renderCartSidebar();
}

window.initCart = initCart;

window.addEventListener("auth-change", async () => {
    await initCart();
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