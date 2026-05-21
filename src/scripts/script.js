const DATA_URL = "./data/prices.json";

const fallbackData = {
    currency: "EUR",
    lastUpdated: "2026-05-08T10:20:00+02:00",
    marketplaces: [
        { id: "steam", name: "Steam Market", shortName: "Steam", accent: "#66c0f4", searchUrl: "https://steamcommunity.com/market/search?appid=730&q={query}" },
        { id: "skinport", name: "Skinport", shortName: "Skinport", accent: "#ffb648", searchUrl: "https://skinport.com/market?cat=CS2&search={query}" },
        { id: "marketcsgo", name: "Market.csgo", shortName: "Market.csgo", accent: "#45d483", searchUrl: "https://market.csgo.com/en/?search={query}" },
        { id: "csfloat", name: "CSFloat", shortName: "CSFloat", accent: "#9b8cff", searchUrl: "https://csfloat.com/search?market_hash_name={query}" }
    ],
    skins: []
};

const state = {
    data: fallbackData,
    query: "",
    mode: "buy",
    sort: "spread",
    activeMarkets: new Set()
};

const elements = {
    lastUpdated: document.querySelector("#lastUpdated"),
    search: document.querySelector("#skinSearch"),
    sort: document.querySelector("#sortSelect"),
    marketFilters: document.querySelector("#marketFilters"),
    priceHead: document.querySelector("#priceHead"),
    priceBody: document.querySelector("#priceBody"),
    emptyState: document.querySelector("#emptyState"),
    modeButtons: document.querySelectorAll("[data-mode]"),
    matchCount: document.querySelector("#matchCount"),
    bestOpportunity: document.querySelector("#bestOpportunity"),
    activeMarkets: document.querySelector("#activeMarkets"),
    freshestQuote: document.querySelector("#freshestQuote")
};

const rarityColors = {
    "Consumer Grade": "#7d8b8a",
    "Industrial Grade": "#5f9ee6",
    "Mil-Spec": "#4a69ff",
    "Restricted": "#8847ff",
    "Classified": "#d32ce6",
    "Covert": "#eb4b4b",
    "High Grade": "#4fd1c5"
};

let currencyFormatter = createCurrencyFormatter(fallbackData.currency);

function createCurrencyFormatter(currency) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getSkinTitle(skin) {
    return `${skin.weapon} | ${skin.skin}`;
}

function getMarketplaces() {
    return state.data.marketplaces.filter((market) => state.activeMarkets.has(market.id));
}

function getPriceEntries(skin) {
    return getMarketplaces()
        .map((market) => ({
            market,
            quote: skin.prices[market.id] || { price: null, volume: 0, updatedAt: null }
        }))
        .filter((entry) => Number.isFinite(entry.quote.price));
}

function getBestEntry(skin) {
    const entries = getPriceEntries(skin);
    if (!entries.length) {
        return null;
    }

    return entries.reduce((best, entry) => {
        if (state.mode === "buy") {
            return entry.quote.price < best.quote.price ? entry : best;
        }

        return entry.quote.price > best.quote.price ? entry : best;
    });
}

function getSpread(skin) {
    const prices = getPriceEntries(skin).map((entry) => entry.quote.price);
    if (prices.length < 2) {
        return 0;
    }

    return Math.max(...prices) - Math.min(...prices);
}

function getFreshestDate(skin) {
    const timestamps = getMarketplaces()
        .map((market) => skin.prices[market.id]?.updatedAt)
        .filter(Boolean)
        .map((value) => new Date(value).getTime())
        .filter(Number.isFinite);

    return timestamps.length ? Math.max(...timestamps) : 0;
}

function matchesQuery(skin) {
    const query = state.query.trim().toLowerCase();
    if (!query) {
        return true;
    }

    return [
        skin.weapon,
        skin.skin,
        skin.wear,
        skin.rarity,
        skin.category,
        skin.pattern
    ].join(" ").toLowerCase().includes(query);
}

function getFilteredSkins() {
    return state.data.skins
        .filter(matchesQuery)
        .filter((skin) => getPriceEntries(skin).length)
        .sort((left, right) => {
            if (state.sort === "name") {
                return getSkinTitle(left).localeCompare(getSkinTitle(right));
            }

            if (state.sort === "fresh") {
                return getFreshestDate(right) - getFreshestDate(left);
            }

            if (state.sort === "best") {
                const leftBest = getBestEntry(left)?.quote.price ?? Number.POSITIVE_INFINITY;
                const rightBest = getBestEntry(right)?.quote.price ?? Number.POSITIVE_INFINITY;
                return state.mode === "buy" ? leftBest - rightBest : rightBest - leftBest;
            }

            return getSpread(right) - getSpread(left);
        });
}

function formatPrice(value) {
    if (!Number.isFinite(value)) {
        return "-";
    }

    return currencyFormatter.format(value);
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value));
}

function formatRelative(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.round(Math.abs(diffMs) / 60000);

    if (diffMs < 0 || minutes > 180) {
        return formatDate(value);
    }

    if (minutes < 1) {
        return "just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    return `${Math.round(minutes / 60)}h ago`;
}

function getMarketplaceUrl(market, skin) {
    const query = encodeURIComponent(`${getSkinTitle(skin)} (${skin.wear})`);
    return market.searchUrl.replace("{query}", query);
}

function getInitials(skin) {
    return skin.weapon
        .replace(/[^a-z0-9 ]/gi, " ")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function renderMarketFilters() {
    elements.marketFilters.innerHTML = state.data.marketplaces.map((market) => {
        const active = state.activeMarkets.has(market.id);
        const count = state.data.skins.filter((skin) => Number.isFinite(skin.prices[market.id]?.price)).length;

        return `
            <button class="market-button" type="button" data-market="${market.id}" aria-pressed="${active}" style="--market-color: ${market.accent}">
                <span class="market-button__name">
                    <span class="market-dot" aria-hidden="true"></span>
                    <span>${escapeHtml(market.shortName)}</span>
                </span>
                <span class="market-count">${count}</span>
            </button>
        `;
    }).join("");
}

function renderHead() {
    const marketHeaders = getMarketplaces()
        .map((market) => `<th scope="col">${escapeHtml(market.shortName)}</th>`)
        .join("");

    elements.priceHead.innerHTML = `
        <tr>
            <th scope="col">Skin</th>
            <th scope="col">Best ${state.mode === "buy" ? "buy" : "sell"}</th>
            <th scope="col">Spread</th>
            ${marketHeaders}
            <th scope="col">Updated</th>
        </tr>
    `;
}

function renderPriceCell(skin, market, bestEntry) {
    const quote = skin.prices[market.id] || { price: null, volume: 0, updatedAt: null };
    const isBest = bestEntry?.market.id === market.id;

    if (!Number.isFinite(quote.price)) {
        return `
            <td class="price-cell">
                <div class="price-link">
                    <span class="price price--empty">Unavailable</span>
                    <span class="volume">0 listed</span>
                </div>
            </td>
        `;
    }

    return `
        <td class="price-cell">
            <a class="price-link ${isBest ? "is-best" : ""}" href="${getMarketplaceUrl(market, skin)}" target="_blank" rel="noreferrer">
                <span class="price">${formatPrice(quote.price)}</span>
                    <span class="volume">${escapeHtml(quote.volume)} listed</span>
                <span class="updated">${formatRelative(quote.updatedAt)}</span>
            </a>
        </td>
    `;
}

function renderRows(skins) {
    elements.priceBody.innerHTML = skins.map((skin) => {
        const bestEntry = getBestEntry(skin);
        const spread = getSpread(skin);
        const rarityColor = rarityColors[skin.rarity] || "#7d8b8a";
        const marketCells = getMarketplaces()
            .map((market) => renderPriceCell(skin, market, bestEntry))
            .join("");

        return `
            <tr>
                <td>
                    <div class="skin-cell">
                        <div class="skin-thumb" style="--rarity-color: ${rarityColor}" aria-hidden="true">${getInitials(skin)}</div>
                        <div class="skin-meta">
                            <span>${escapeHtml(skin.category)} / ${escapeHtml(skin.rarity)}</span>
                            <strong>${escapeHtml(getSkinTitle(skin))}</strong>
                            <span>${escapeHtml(skin.wear)} / ${escapeHtml(skin.pattern)}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge badge--best">${bestEntry ? escapeHtml(bestEntry.market.shortName) : "None"}</span>
                    <div class="price">${bestEntry ? formatPrice(bestEntry.quote.price) : "-"}</div>
                </td>
                <td>
                    <div class="spread">
                        <strong>${formatPrice(spread)}</strong>
                        <span class="spread-label">${state.mode === "buy" ? "max saving" : "sell gap"}</span>
                    </div>
                </td>
                ${marketCells}
                <td><span class="updated">${formatRelative(getFreshestDate(skin))}</span></td>
            </tr>
        `;
    }).join("");
}

function renderStats(skins) {
    const opportunities = skins
        .map((skin) => ({ skin, spread: getSpread(skin) }))
        .sort((left, right) => right.spread - left.spread);
    const best = opportunities[0];
    const freshest = skins
        .map(getFreshestDate)
        .filter(Boolean)
        .sort((left, right) => right - left)[0];

    elements.matchCount.textContent = skins.length.toString();
    elements.activeMarkets.textContent = state.activeMarkets.size.toString();
    elements.bestOpportunity.textContent = best ? `${formatPrice(best.spread)} / ${best.skin.weapon}` : "-";
    elements.freshestQuote.textContent = freshest ? formatRelative(freshest) : "-";
}

function render() {
    const skins = getFilteredSkins();

    renderMarketFilters();
    renderHead();
    renderRows(skins);
    renderStats(skins);

    elements.emptyState.hidden = skins.length > 0;
    elements.lastUpdated.textContent = formatDate(state.data.lastUpdated);
}

function bindEvents() {
    elements.search.addEventListener("input", (event) => {
        state.query = event.target.value;
        render();
    });

    elements.sort.addEventListener("change", (event) => {
        state.sort = event.target.value;
        render();
    });

    elements.modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            state.mode = button.dataset.mode;
            elements.modeButtons.forEach((modeButton) => {
                const active = modeButton.dataset.mode === state.mode;
                modeButton.classList.toggle("is-active", active);
                modeButton.setAttribute("aria-pressed", active.toString());
            });
            render();
        });
    });

    elements.marketFilters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-market]");
        if (!button) {
            return;
        }

        const marketId = button.dataset.market;
        if (state.activeMarkets.has(marketId) && state.activeMarkets.size > 1) {
            state.activeMarkets.delete(marketId);
        } else {
            state.activeMarkets.add(marketId);
        }

        render();
    });
}

async function loadPrices() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`Unable to load ${DATA_URL}`);
        }

        state.data = await response.json();
    } catch (error) {
        console.warn(error);
        state.data = fallbackData;
    }

    currencyFormatter = createCurrencyFormatter(state.data.currency || "EUR");
    state.activeMarkets = new Set(state.data.marketplaces.map((market) => market.id));
    render();
}

bindEvents();
loadPrices();
