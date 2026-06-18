const THEME_KEY = "novastore_theme";

/**
 * Applies the selected theme and saves it in localStorage
 */
function applyTheme(theme) {
    /* Only allow "light" or "dark", default to "dark" for any other value */
    const safeTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", safeTheme);
    localStorage.setItem(THEME_KEY, safeTheme);

    /* Update the theme icon on every element with the class "theme-icon" */
    document.querySelectorAll(".theme-icon").forEach((icon) => {
        icon.textContent = safeTheme === "light" ? "☀️" : "🌙";
    });
}

/**
 * Loads saved theme or falls back to OS preference
 */
function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
        /* Use the previously saved theme */
        applyTheme(stored);
    } else {
        /* No saved preference — check the OS color scheme */
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

/**
 * Switches between dark and light theme
 */
function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
}

/**
 * Initializes navbar, cart sidebar and theme button
 */
function initHeader() {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    const themeToggle = document.getElementById("theme-toggle");
    const cartToggle = document.getElementById("cart-toggle");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartClose = document.getElementById("cart-close");

    /* Burger button toggles the mobile navigation menu open/closed */
    if (burger && nav) {
        burger.addEventListener("click", () => {
            nav.classList.toggle("open");
        });
    }

    /* Theme button calls toggleTheme on every click */
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    /* Cart icon in the navbar opens the cart sidebar */
    if (cartToggle && cartSidebar) {
        cartToggle.addEventListener("click", () => {
            cartSidebar.classList.add("open");
        });
    }

    /* Close button removes the "open" class to hide the cart sidebar */
    if (cartClose && cartSidebar) {
        cartClose.addEventListener("click", () => {
            cartSidebar.classList.remove("open");
        });
    }
}

/**
 * Hides the page loader after all resources have finished loading
 */
function initLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    /* Wait for the "load" event, then hide the loader after a short delay */
    window.addEventListener("load", () => {
        setTimeout(() => loader.classList.add("hidden"), 400);
    });
}

/**
 * Inserts the current year into the footer
 */
function initYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/**
 * Returns the product description for the currently selected language
 */
function productDesc(p) {
    const lang = localStorage.getItem("lang") || "en";
    /* Use German description if language is "de" and one exists, otherwise English */
    return (lang === "de" && p.description_de) ? p.description_de : p.description;
}

/**
 * Shows a temporary toast notification with the given message
 */
function showToast(msg) {
    let toast = document.getElementById("nova-toast");
    /* Create the toast element if it does not yet exist on the page */
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "nova-toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    /* Clear any existing timer so the toast does not disappear too early */
    clearTimeout(toast._timer);
    /* Auto-hide the toast after 2.2 seconds */
    toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/**
 * Generates an HTML star rating string for the given numeric rating
 */
function starRating(rating) {
    const full = Math.round(rating);
    /* Filled stars + empty stars, always totalling 5 */
    return "★".repeat(full) + "☆".repeat(5 - full);
}

/**
 * Attaches a ripple animation to all elements with the "ripple" class
 */
function initRipple() {
    document.body.addEventListener("click", (e) => {
        const target = e.target.closest(".ripple");
        if (!target) return;
        /* Calculate click position relative to the element for the CSS animation */
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
    {
        id: "1",
        title: "SoundWave Pro Headphones",
        description: "Over-ear wireless headphones with 40mm drivers, active noise cancellation, and 30-hour battery life. Foldable design with premium cushioning for all-day comfort.",
        description_de: "Over-Ear-Funkkopfhörer mit 40-mm-Treibern, aktiver Geräuschunterdrückung und 30 Stunden Akkulaufzeit. Faltbares Design mit Premium-Polsterung für ganztägigen Tragekomfort.",
        price: 189,
        category: "tech",
        image: "assets/products/headphones1.jpg",
        rating: 5
    },
    {
        id: "2",
        title: "AirBass Studio Headphones",
        description: "Professional studio-grade headphones with flat frequency response, detachable cable, and 50mm neodymium drivers. Ideal for mixing and critical listening.",
        description_de: "Professionelle Studio-Kopfhörer mit linearem Frequenzgang, abnehmbarem Kabel und 50-mm-Neodym-Treibern. Ideal zum Mischen und kritischen Hören.",
        price: 229,
        category: "tech",
        image: "assets/products/headphones2.jpg",
        rating: 4
    },
    {
        id: "3",
        title: "NovaSound Wireless",
        description: "Lightweight on-ear Bluetooth headphones with 25-hour playback, built-in mic, and multipoint pairing. Perfect for commutes and work calls.",
        description_de: "Leichte On-Ear-Bluetooth-Kopfhörer mit 25 Stunden Wiedergabe, integriertem Mikrofon und Multipoint-Pairing. Perfekt für den Pendlerweg und Geschäftsgespräche.",
        price: 129,
        category: "tech",
        image: "assets/products/headphones3.jpg",
        rating: 4
    },
    {
        id: "4",
        title: "PureAudio Elite",
        description: "Audiophile-grade over-ear headphones with hand-tuned 45mm drivers, memory foam ear cups, and hi-res audio certification. For the true music lover.",
        description_de: "Audiophile Over-Ear-Kopfhörer mit handabgestimmten 45-mm-Treibern, Memory-Foam-Ohrmuscheln und Hi-Res-Audio-Zertifizierung. Für wahre Musikliebhaber.",
        price: 299,
        category: "tech",
        image: "assets/products/headphones4.jpg",
        rating: 5
    },
    {
        id: "5",
        title: "BeatDrop Foldable",
        description: "Compact foldable headphones with deep bass enhancement, 20-hour battery, and fast-charge USB-C. Great sound in a pocket-friendly package.",
        description_de: "Kompakte faltbare Kopfhörer mit verbessertem Bassklang, 20 Stunden Akku und USB-C-Schnellladung. Toller Klang in einem taschenfreundlichen Format.",
        price: 99,
        category: "tech",
        image: "assets/products/headphones5.jpg",
        rating: 4
    },
    {
        id: "6",
        title: "ZenAir Sport Headphones",
        description: "Sport-focused wireless headphones with sweat resistance, secure fit, and 5-minute quick charge for 2 hours of playback. Built for active lifestyles.",
        description_de: "Sportorientierte Funkkopfhörer mit Schweißbeständigkeit, sicherem Sitz und 5-Minuten-Schnellladung für 2 Stunden Wiedergabe. Für aktive Lebensstile gebaut.",
        price: 149,
        category: "tech",
        image: "assets/products/headphones6.jpg",
        rating: 5
    },
    {
        id: "7",
        title: "NovaPower 65W GaN Charger",
        description: "Ultra-compact 65W GaN wall charger with dual USB-C and one USB-A port. Simultaneously charge a laptop, phone, and tablet without the bulk.",
        description_de: "Ultrakompaktes 65-W-GaN-Wandladegerät mit zwei USB-C- und einem USB-A-Anschluss. Lade gleichzeitig Laptop, Smartphone und Tablet – ohne den üblichen Klotz.",
        price: 49,
        category: "accessories",
        image: "assets/products/charger1.jpg",
        rating: 4
    },
    {
        id: "8",
        title: "SwiftCharge 30W PD Charger",
        description: "Single-port 30W USB-C Power Delivery charger. Fills your smartphone to 50% in under 30 minutes. Universal compatibility with all PD devices.",
        description_de: "Einanschluss-30-W-USB-C-Power-Delivery-Ladegerät. Lädt dein Smartphone in unter 30 Minuten auf 50 % auf. Universell kompatibel mit allen PD-Geräten.",
        price: 29,
        category: "accessories",
        image: "assets/products/charger2.jpg",
        rating: 4
    },
    {
        id: "9",
        title: "TurboPlug 100W Desktop Charger",
        description: "4-port 100W desktop charging station with two USB-C (100W + 45W) and two USB-A ports. One charger for your entire workspace.",
        description_de: "4-Port-100-W-Desktop-Ladestation mit zwei USB-C- (100 W + 45 W) und zwei USB-A-Anschlüssen. Ein Ladegerät für deinen gesamten Arbeitsplatz.",
        price: 69,
        category: "accessories",
        image: "assets/products/charger3.jpg",
        rating: 5
    },
    {
        id: "10",
        title: "NovaBank Slim 10000",
        description: "10,000 mAh slim power bank with 22.5W fast charge output and USB-C PD input. Charges most phones twice. Fits in any pocket.",
        description_de: "Schlanke 10.000-mAh-Powerbank mit 22,5-W-Schnellladungsausgang und USB-C-PD-Eingang. Lädt die meisten Smartphones zweimal auf. Passt in jede Tasche.",
        price: 39,
        category: "accessories",
        image: "assets/products/powerbank1.jpg",
        rating: 4
    },
    {
        id: "11",
        title: "PowerVault Pro 20000",
        description: "20,000 mAh high-capacity power bank with 65W USB-C output — capable of charging a laptop on the go. LED battery indicator and dual output ports.",
        description_de: "20.000-mAh-Hochkapazitäts-Powerbank mit 65-W-USB-C-Ausgang – kann unterwegs einen Laptop aufladen. LED-Batterieanzeige und zwei Ausgänge.",
        price: 69,
        category: "accessories",
        image: "assets/products/powerbank2.jpg",
        rating: 5
    },
    {
        id: "12",
        title: "MagCharge Wireless Bank 8000",
        description: "8,000 mAh MagSafe-compatible wireless power bank. Snap onto your iPhone and charge at 15W wirelessly, or use USB-C for any device.",
        description_de: "8.000-mAh-MagSafe-kompatible kabellose Powerbank. Einfach ans iPhone einrasten und mit 15 W kabellos laden oder USB-C für jedes andere Gerät nutzen.",
        price: 59,
        category: "accessories",
        image: "assets/products/powerbank3.jpg",
        rating: 4
    }
];

/**
 * Renders all products on the shop page with search, category filter and sorting
 */
function renderShopProducts() {
    const container = document.getElementById("shop-products");
    if (!container) return;

    const searchInput = document.getElementById("product-search");
    const categoryFilter = document.getElementById("category-filter");
    const sortSelect = document.getElementById("sort-by");

    /**
     * Filters and sorts the product list, then re-renders all cards
     */
    function applyFilters() {
        let list = [...PRODUCTS];

        /* Filter by search query — match against the product title */
        const query = (searchInput?.value || "").toLowerCase();
        if (query) {
            list = list.filter((p) => p.title.toLowerCase().includes(query));
        }

        /* Filter by selected category, skip if "all" is selected */
        const category = categoryFilter?.value || "all";
        if (category !== "all") {
            list = list.filter((p) => p.category === category);
        }

        /* Sort the filtered list by the chosen criterion */
        const sort = sortSelect?.value || "featured";
        if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
        if (sort === "price_desc") list.sort((a, b) => b.price - a.price);

        /* Show a "no results" message with a reset link if nothing matched */
        container.innerHTML = "";
        if (list.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No products found.</p><a href="shop.html" class="btn ghost">Clear search</a></div>`;
            return;
        }
        /* Build a card element for each product in the filtered list */
        list.forEach((p) => {
            const stars = starRating(p.rating || 4);
            const card = document.createElement("article");
            card.className = "product-card glass-card hover-lift";
            card.innerHTML = `
        <div class="product-image">
          <img src="${p.image}" alt="${p.title}" loading="lazy" />
        </div>
        <div class="product-body">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-category">${p.category.toUpperCase()}</p>
          <p class="product-stars">${stars}</p>
          <p class="product-desc">${productDesc(p)}</p>
          <div class="product-meta">
            <span class="product-price">€${p.price}</span>
            <button class="btn small primary add-to-cart" data-id="${p.id}" data-title="${p.title}" data-price="${p.price}">
              Add to cart
            </button>
          </div>
        </div>
      `;
            /* Clicking the card body (not the button) navigates to the product page */
            card.addEventListener("click", (e) => {
                if (e.target.closest(".add-to-cart")) return;
                window.location.href = `product.html?id=${p.id}`;
            });
            container.appendChild(card);
        });

        /* Attach click handlers to every "Add to cart" button */
        container.querySelectorAll(".add-to-cart").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const title = btn.getAttribute("data-title");
                const price = Number(btn.getAttribute("data-price"));
                addToCart({ id, title, price, qty: 1 });
                showToast(`✓ ${title} added to cart`);
            });
        });
    }

    /* Re-run filters whenever the search input, category or sort selection changes */
    ["input", "change"].forEach((ev) => {
        searchInput?.addEventListener(ev, applyFilters);
        categoryFilter?.addEventListener(ev, applyFilters);
        sortSelect?.addEventListener(ev, applyFilters);
    });

    applyFilters();
}

/**
 * Populates and initializes the individual product detail page
 */
function initProductPage() {
    /* Read the product ID from the URL query string, default to the first product */
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "1";
    const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

    /* Get all DOM elements used on the product page */
    const titleEl = document.getElementById("product-title");
    const priceEl = document.getElementById("product-price");
    const categoryEl = document.getElementById("product-category");
    const descEl = document.getElementById("product-description");
    const imgEl = document.getElementById("product-main-img");
    const addBtn = document.getElementById("product-add-to-cart");
    const qtyInput = document.getElementById("product-qty");
    const relatedContainer = document.getElementById("related-products");

    /* Populate the main product details on the page */
    if (titleEl) titleEl.textContent = product.title;
    if (priceEl) priceEl.textContent = `€${product.price}`;
    if (categoryEl) categoryEl.textContent = product.category.toUpperCase();
    if (descEl) descEl.textContent = productDesc(product);

    const starsEl = document.getElementById("product-stars");
    if (starsEl) starsEl.textContent = starRating(product.rating || 4);
    if (imgEl && product.image) { imgEl.src = product.image; imgEl.alt = product.title; }
    if (addBtn) addBtn.setAttribute("data-product-id", product.id);

    /* Add to cart with the selected quantity when the button is clicked */
    if (addBtn && qtyInput) {
        addBtn.addEventListener("click", () => {
            const qty = Number(qtyInput.value) || 1;
            addToCart({ id: product.id, title: product.title, price: product.price, qty });
        });
    }

    /* Minus button decreases the quantity input value, minimum 1 */
    document.querySelector(".qty-minus")?.addEventListener("click", () => {
        const val = Math.max(1, Number(qtyInput.value) - 1);
        qtyInput.value = val;
    });

    /* Plus button increases the quantity input value */
    document.querySelector(".qty-plus")?.addEventListener("click", () => {
        const val = Math.max(1, Number(qtyInput.value) + 1);
        qtyInput.value = val;
    });

    /* Render the "Related products" section (all except current, first 3) */
    if (relatedContainer) {
        const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
        relatedContainer.innerHTML = "";
        related.forEach((p) => {
            const card = document.createElement("article");
            card.className = "product-card glass-card hover-lift";
            card.innerHTML = `
        <div class="product-image">
          <img src="${p.image}" alt="${p.title}" loading="lazy" />
        </div>
        <div class="product-body">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-category">${p.category}</p>
          <p class="product-desc">${productDesc(p)}</p>
          <div class="product-meta">
            <span class="product-price">€${p.price}</span>
            <button class="btn small primary add-to-cart" data-id="${p.id}" data-title="${p.title}" data-price="${p.price}">
              Add to cart
            </button>
          </div>
        </div>
      `;
        /* Attach cart handlers to "Add to cart" buttons in related products */
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

/**
 * Renders three hand-picked featured products on the homepage
 */
function renderFeaturedProducts() {
    const container = document.getElementById("featured-products");
    if (!container) return;

    const featured = [PRODUCTS[0], PRODUCTS[6], PRODUCTS[9]]; // headphones1, charger1, powerbank1
    featured.forEach((p) => {
        const card = document.createElement("article");
        card.className = "product-card glass-card hover-lift";
        card.innerHTML = `
            <div class="product-image">
                <img src="${p.image}" alt="${p.title}" loading="lazy" />
            </div>
            <div class="product-body">
                <h3 class="product-title">${p.title}</h3>
                <p class="product-category">${p.category.toUpperCase()}</p>
                <p class="product-stars">${starRating(p.rating || 4)}</p>
                <p class="product-desc">${productDesc(p)}</p>
                <div class="product-meta">
                    <span class="product-price">€${p.price}</span>
                    <a href="product.html?id=${p.id}" class="btn small primary">View</a>
                </div>
            </div>
        `;
        /* Clicking the card (not the "View" button) also navigates to the product page */
        card.addEventListener("click", (e) => {
            if (e.target.closest(".btn")) return;
            window.location.href = `product.html?id=${p.id}`;
        });
        container.appendChild(card);
    });
}

/* Initialize all page components once the DOM is ready */
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initHeader();
    initLoader();
    initYear();
    initRipple();

    /* Only run each section initializer if the relevant element exists on this page */
    if (document.getElementById("featured-products")) {
        renderFeaturedProducts();
    }

    if (document.getElementById("shop-products")) {
        renderShopProducts();
    }

    if (document.querySelector(".product-layout")) {
        initProductPage();
    }
});
