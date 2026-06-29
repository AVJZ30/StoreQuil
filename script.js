// =========================================================
// StoreQuil — Lógica Completa para Tienda
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Variables de los elementos del DOM
    const productsGrid = document.getElementById('productsGrid');
    const filterCategory = document.getElementById('filterCategory');
    const sortPrice = document.getElementById('sortPrice');
    const onlyOffers = document.getElementById('onlyOffers');
    const resultsCount = document.getElementById('resultsCount');
    const emptyState = document.getElementById('emptyState');

    let allProducts = []; // Aquí almacenaremos la data cruda

    // 1. Obtener los productos desde Google Sheets
    async function fetchProducts() {
        const API_URL = 'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';
        try {
            const response = await fetch(API_URL);
            allProducts = await response.json();
            applyFilters(); // Renderizar una vez cargados
        } catch (error) {
            console.error("Error al cargar productos:", error);
            productsGrid.innerHTML = '<p>Error al conectar con la tienda. Intenta recargar.</p>';
        }
    }

    // 2. Lógica para filtrar y ordenar
    function applyFilters() {
        let filtered = [...allProducts];

        // Filtro por Categoría
        if (filterCategory.value && filterCategory.value !== "Todas") {
            filtered = filtered.filter(p => p['Categoría'] === filterCategory.value);
        }

        // Filtro Solo Ofertas
        if (onlyOffers.checked) {
            filtered = filtered.filter(p => p['Oferta'] === "Sí" || p['Oferta'] === true);
        }

        // Ordenamiento por Precio
        if (sortPrice.value === 'asc') {
            filtered.sort((a, b) => parseFloat(a['Precio']) - parseFloat(b['Precio']));
        } else if (sortPrice.value === 'desc') {
            filtered.sort((a, b) => parseFloat(b['Precio']) - parseFloat(a['Precio']));
        }

        renderProducts(filtered);
    }

    // 3. Renderizar productos en el HTML
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        resultsCount.textContent = `${products.length} resultados encontrados`;
        
        if (products.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
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

    // 4. Listeners para detectar cambios en los filtros
    [filterCategory, sortPrice, onlyOffers].forEach(el => {
        el.addEventListener('change', applyFilters);
    });

    // Ejecutar inicialización
    fetchProducts();
});
