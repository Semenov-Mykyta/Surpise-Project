const THEME_KEY = "novastore_theme";

function applyTheme(theme) {
    const safeTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", safeTheme);
    localStorage.setItem(THEME_KEY, safeTheme);

    document.querySelectorAll(".theme-icon").forEach((icon) => {
        icon.textContent = safeTheme === "light" ? "☀️" : "🌙";
    });
}

function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
        applyTheme(stored);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
}

function initHeader() {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    const themeToggle = document.getElementById("theme-toggle");
    const cartToggle = document.getElementById("cart-toggle");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartClose = document.getElementById("cart-close");

    if (burger && nav) {
        burger.addEventListener("click", () => {
            nav.classList.toggle("open");
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    if (cartToggle && cartSidebar) {
        cartToggle.addEventListener("click", () => {
            cartSidebar.classList.add("open");
        });
    }

    if (cartClose && cartSidebar) {
        cartClose.addEventListener("click", () => {
            cartSidebar.classList.remove("open");
        });
    }
}

function initLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    window.addEventListener("load", () => {
        setTimeout(() => loader.classList.add("hidden"), 400);
    });
}

function initYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initRipple() {
    document.body.addEventListener("click", (e) => {
        const target = e.target.closest(".ripple");
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        target.style.setProperty("--ripple-x", `${x}px`);
        target.style.setProperty("--ripple-y", `${y}px`);
    });
}

/* Simple product data (could be replaced by Supabase later) */

const PRODUCTS = [
    { id: "1", title: "Aurora Wireless Headphones", price: 199, category: "tech" },
    { id: "2", title: "Nebula Smartwatch", price: 249, category: "tech" },
    { id: "3", title: "Lumen Minimal Sneakers", price: 129, category: "fashion" },
    { id: "4", title: "Orbit Leather Backpack", price: 179, category: "accessories" },
    { id: "5", title: "Flux Performance Hoodie", price: 89, category: "fashion" },
    { id: "6", title: "Pulse Fitness Band", price: 79, category: "tech" }
];

function renderShopProducts() {
    const container = document.getElementById("shop-products");
    if (!container) return;

    const searchInput = document.getElementById("product-search");
    const categoryFilter = document.getElementById("category-filter");
    const sortSelect = document.getElementById("sort-by");

    function applyFilters() {
        let list = [...PRODUCTS];

        const query = (searchInput?.value || "").toLowerCase();
        if (query) {
            list = list.filter((p) => p.title.toLowerCase().includes(query));
        }

        const category = categoryFilter?.value || "all";
        if (category !== "all") {
            list = list.filter((p) => p.category === category);
        }

        const sort = sortSelect?.value || "featured";
        if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
        if (sort === "price_desc") list.sort((a, b) => b.price - a.price);

        container.innerHTML = "";
        list.forEach((p) => {
            const card = document.createElement("article");
            card.className = "product-card glass-card hover-lift";
            card.innerHTML = `
        <div class="product-image skeleton"></div>
        <div class="product-body">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-category">${p.category}</p>
          <div class="product-meta">
            <span class="product-price">€${p.price}</span>
            <button class="btn small primary add-to-cart" data-id="${p.id}" data-title="${p.title}" data-price="${p.price}">
              Add to cart
            </button>
          </div>
        </div>
      `;
            card.addEventListener("click", (e) => {
                if (e.target.closest(".add-to-cart")) return;
                window.location.href = `product.html?id=${p.id}`;
            });
            container.appendChild(card);
        });

        container.querySelectorAll(".add-to-cart").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const title = btn.getAttribute("data-title");
                const price = Number(btn.getAttribute("data-price"));
                addToCart({ id, title, price, qty: 1 });
            });
        });
    }

    ["input", "change"].forEach((ev) => {
        searchInput?.addEventListener(ev, applyFilters);
        categoryFilter?.addEventListener(ev, applyFilters);
        sortSelect?.addEventListener(ev, applyFilters);
    });

    applyFilters();
}

function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "1";
    const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

    const titleEl = document.getElementById("product-title");
    const priceEl = document.querySelector(".product-price-large");
    const addBtn = document.getElementById("product-add-to-cart");
    const qtyInput = document.getElementById("product-qty");
    const relatedContainer = document.getElementById("related-products");

    if (titleEl) titleEl.textContent = product.title;
    if (priceEl) priceEl.textContent = `€${product.price}`;
    if (addBtn) addBtn.setAttribute("data-product-id", product.id);

    if (addBtn && qtyInput) {
        addBtn.addEventListener("click", () => {
            const qty = Number(qtyInput.value) || 1;
            addToCart({ id: product.id, title: product.title, price: product.price, qty });
        });
    }

    document.querySelector(".qty-minus")?.addEventListener("click", () => {
        const val = Math.max(1, Number(qtyInput.value) - 1);
        qtyInput.value = val;
    });

    document.querySelector(".qty-plus")?.addEventListener("click", () => {
        const val = Math.max(1, Number(qtyInput.value) + 1);
        qtyInput.value = val;
    });

    if (relatedContainer) {
        const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
        relatedContainer.innerHTML = "";
        related.forEach((p) => {
            const card = document.createElement("article");
            card.className = "product-card glass-card hover-lift";
            card.innerHTML = `
        <div class="product-image skeleton"></div>
        <div class="product-body">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-category">${p.category}</p>
          <div class="product-meta">
            <span class="product-price">€${p.price}</span>
            <button class="btn small primary add-to-cart" data-id="${p.id}" data-title="${p.title}" data-price="${p.price}">
              Add to cart
            </button>
          </div>
        </div>
      `;
            card.addEventListener("click", (e) => {
                if (e.target.closest(".add-to-cart")) return;
                window.location.href = `product.html?id=${p.id}`;
            });
            relatedContainer.appendChild(card);
        });

        relatedContainer.querySelectorAll(".add-to-cart").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const title = btn.getAttribute("data-title");
                const price = Number(btn.getAttribute("data-price"));
                addToCart({ id, title, price, qty: 1 });
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initHeader();
    initLoader();
    initYear();
    initRipple();

    if (document.getElementById("shop-products")) {
        renderShopProducts();
    }

    if (document.querySelector(".product-layout")) {
        initProductPage();
    }
});
