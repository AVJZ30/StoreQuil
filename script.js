// =========================================================
// StoreQuil — Código Completo
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Menú Móvil ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
    }

    // --- 2. Lógica de Tienda ---
    const productsGrid = document.getElementById('productsGrid');
    const filterCategory = document.getElementById('filterCategory');
    const sortPrice = document.getElementById('sortPrice');
    const onlyOffers = document.getElementById('onlyOffers');
    const resultsCount = document.getElementById('resultsCount');
    const emptyState = document.getElementById('emptyState');

    let allProducts = [];

    async function fetchProducts() {
        const API_URL = 'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';
        try {
            const response = await fetch(API_URL);
            allProducts = await response.json();
            applyFilters();
        } catch (error) {
            console.error("Error al cargar:", error);
            if (productsGrid) productsGrid.innerHTML = '<p>Error al cargar productos.</p>';
        }
    }

    function applyFilters() {
        let filtered = [...allProducts];
        if (filterCategory?.value && filterCategory.value !== "Todas") {
            filtered = filtered.filter(p => p['Categoría'] === filterCategory.value);
        }
        if (onlyOffers?.checked) {
            filtered = filtered.filter(p => p['Oferta'] === "Sí" || p['Oferta'] === true);
        }
        if (sortPrice?.value === 'asc') filtered.sort((a, b) => parseFloat(a['Precio']) - parseFloat(b['Precio']));
        if (sortPrice?.value === 'desc') filtered.sort((a, b) => parseFloat(b['Precio']) - parseFloat(a['Precio']));
        
        renderProducts(filtered);
    }

    function renderProducts(products) {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        if (resultsCount) resultsCount.textContent = `${products.length} resultados`;
        
        if (products.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-image">
                        ${(p['Oferta'] === "Sí" || p['Oferta'] === true) ? '<span class="offer-badge">Oferta</span>' : ''}
                        <img src="${p['Link de la imagen']}" alt="${p['Nombre del producto']}">
                    </div>
                    <div class="product-body">
                        <span class="product-business">${p['Nombre del negocio']}</span>
                        <h3 class="product-name">${p['Nombre del producto']}</h3>
                        <p class="product-desc">${p['Descripción']}</p>
                        <div class="product-price">$${p['Precio']}</div>
                    </div>
                    <div class="product-foot">
                        <a href="https://wa.me/${p['WhatsApp']}" target="_blank" class="btn btn-whatsapp">
                            <i class="fa-brands fa-whatsapp"></i> Contactar
                        </a>
                    </div>
                `;
                productsGrid.appendChild(card);
            });
        }
    }

    if (productsGrid) {
        [filterCategory, sortPrice, onlyOffers].forEach(el => el?.addEventListener('change', applyFilters));
        fetchProducts();
    }
});
