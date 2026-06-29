// =========================================================
// StoreQuil — Lógica Completa para Tienda
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const productsGrid = document.getElementById('productsGrid');
    const filterCategory = document.getElementById('filterCategory');
    const sortPrice = document.getElementById('sortPrice');
    const onlyOffers = document.getElementById('onlyOffers');
    const resultsCount = document.getElementById('resultsCount');

    let allProducts = [];

    // 1. Obtener productos desde Google Sheets
    async function fetchProducts() {
        const API_URL = 'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            allProducts = await response.json();
            applyFilters();
        } catch (error) {
            console.error("Error al cargar productos:", error);
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #EF4444;"></i>
                    <p style="margin-top: 1rem;">Error al conectar con la tienda. Intenta recargar.</p>
                </div>`;
        }
    }

    // 2. Aplicar filtros y ordenamiento
    function applyFilters() {
        let filtered = [...allProducts];

        // Filtro por categoría
        const categoriaSeleccionada = filterCategory.value;
        if (categoriaSeleccionada) {
            filtered = filtered.filter(p => p['Categoria'] === categoriaSeleccionada);
        }

        // Filtro solo ofertas
        if (onlyOffers.checked) {
            filtered = filtered.filter(p => p['Oferta'] === 'Sí' || p['Oferta'] === 'true' || p['Oferta'] === true);
        }

        // Ordenamiento por precio
        if (sortPrice.value === 'asc') {
            filtered.sort((a, b) => parseFloat(a['Precio']) - parseFloat(b['Precio']));
        } else if (sortPrice.value === 'desc') {
            filtered.sort((a, b) => parseFloat(b['Precio']) - parseFloat(a['Precio']));
        }

        renderProducts(filtered);
    }

    // 3. Renderizar productos en pantalla
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        resultsCount.textContent = `${products.length} producto(s) encontrado(s)`;

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-store-slash" style="font-size: 2.5rem; color: #94A3B8;"></i>
                    <h3 style="margin-top: 1rem;">No se encontraron productos</h3>
                    <p>Intenta con otros filtros o categorías.</p>
                </div>`;
            return;
        }

        products.forEach(p => {
            const precio = parseFloat(p['Precio']).toFixed(2);
            const oferta = p['Oferta'] === 'Sí' || p['Oferta'] === 'true' || p['Oferta'] === true;
            const whatsapp = p['WhatsApp'] ? p['WhatsApp'].replace(/\D/g, '') : '';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    ${oferta ? '<span class="offer-badge">🔥 Oferta</span>' : ''}
                    <img src="${p['Link de la imagen']}" 
                         alt="${p['Nombre del producto']}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Imagen'">
                </div>
                <div class="product-body">
                    <span class="product-business">
                        <i class="fa-solid fa-store"></i> ${p['Nombre del negocio']}
                    </span>
                    <h3 class="product-name">${p['Nombre del producto']}</h3>
                    <p class="product-desc">${p['Descripción']}</p>
                    <div class="product-price">$${precio}</div>
                </div>
                <div class="product-foot">
                    <a href="https://wa.me/593${whatsapp}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="btn btn-whatsapp">
                        <i class="fa-brands fa-whatsapp"></i> Contactar
                    </a>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    // 4. Event listeners para filtros
    filterCategory.addEventListener('change', applyFilters);
    sortPrice.addEventListener('change', applyFilters);
    onlyOffers.addEventListener('change', applyFilters);

    // 5. Cargar productos al iniciar
    fetchProducts();
});
