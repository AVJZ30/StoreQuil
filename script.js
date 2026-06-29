// =========================================================
// StoreQuil — Lógica para Tienda
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // ========== ELEMENTOS DEL DOM ==========
    const productsGrid = document.getElementById('productsGrid');
    const filterCategory = document.getElementById('filterCategory');
    const sortPrice = document.getElementById('sortPrice');
    const onlyOffers = document.getElementById('onlyOffers');
    const resultsCount = document.getElementById('resultsCount');

    // Si no existe el grid, no ejecutar nada (estamos en index.html)
    if (!productsGrid) {
        console.log('📄 Página de inicio - sin productos');
        initMobileMenu();
        return;
    }

    console.log('🛒 Página de tienda - cargando productos');
    let allProducts = [];

    // ========== 1. OBTENER PRODUCTOS ==========
    async function fetchProducts() {
        const API_URL = 'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';
        
        try {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #2563EB;"></i>
                    <p style="margin-top: 1rem;">Cargando productos...</p>
                </div>`;

            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const data = await response.json();
            console.log('✅ Productos cargados:', data.length, 'productos');
            
            allProducts = Array.isArray(data) ? data : [];
            applyFilters();
            
        } catch (error) {
            console.error('❌ Error:', error);
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: #EF4444;"></i>
                    <h3 style="margin-top: 1rem;">Error de conexión</h3>
                    <p>No pudimos cargar los productos.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #2563EB; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fa-solid fa-rotate"></i> Reintentar
                    </button>
                </div>`;
        }
    }

    // ========== 2. APLICAR FILTROS ==========
    function applyFilters() {
        let filtered = [...allProducts];

        // Filtro categoría
        if (filterCategory && filterCategory.value) {
            filtered = filtered.filter(p => {
                const cat = (p['Categoria'] || p['Categoría'] || '').trim();
                return cat === filterCategory.value.trim();
            });
        }

        // Filtro ofertas
        if (onlyOffers && onlyOffers.checked) {
            filtered = filtered.filter(p => {
                const oferta = p['Oferta'] || '';
                return oferta === 'Sí' || oferta === 'true' || oferta === true;
            });
        }

        // Ordenar precio
        if (sortPrice && sortPrice.value === 'asc') {
            filtered.sort((a, b) => (parseFloat(a['Precio']) || 0) - (parseFloat(b['Precio']) || 0));
        } else if (sortPrice && sortPrice.value === 'desc') {
            filtered.sort((a, b) => (parseFloat(b['Precio']) || 0) - (parseFloat(a['Precio']) || 0));
        }

        renderProducts(filtered);
    }

    // ========== 3. RENDERIZAR PRODUCTOS ==========
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        
        if (resultsCount) {
            resultsCount.textContent = `${products.length} producto(s) encontrado(s)`;
        }

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-store-slash" style="font-size: 3rem; color: #94A3B8;"></i>
                    <h3 style="margin-top: 1rem;">Sin resultados</h3>
                    <p>No se encontraron productos con esos filtros.</p>
                </div>`;
            return;
        }

        products.forEach(p => {
            const precio = (parseFloat(p['Precio']) || 0).toFixed(2);
            const oferta = (p['Oferta'] === 'Sí' || p['Oferta'] === 'true' || p['Oferta'] === true);
            const whatsapp = (p['WhatsApp'] || '').toString().replace(/\D/g, '');
            const imagen = p['Link de la imagen'] || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            const nombre = p['Nombre del producto'] || 'Sin nombre';
            const negocio = p['Nombre del negocio'] || 'Negocio';
            const desc = p['Descripción'] || '';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    ${oferta ? '<span class="offer-badge">🔥 Oferta</span>' : ''}
                    <img src="${imagen}" alt="${nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Imagen'">
                </div>
                <div class="product-body">
                    <span class="product-business"><i class="fa-solid fa-store"></i> ${negocio}</span>
                    <h3 class="product-name">${nombre}</h3>
                    <p class="product-desc">${desc}</p>
                    <div class="product-price">$${precio}</div>
                </div>
                <div class="product-foot">
                    ${whatsapp ? 
                        `<a href="https://wa.me/593${whatsapp}" target="_blank" rel="noopener" class="btn btn-whatsapp">
                            <i class="fa-brands fa-whatsapp"></i> Contactar
                        </a>` : 
                        '<span style="color:#94A3B8;">Sin WhatsApp</span>'}
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    // ========== 4. EVENTOS ==========
    if (filterCategory) filterCategory.addEventListener('change', applyFilters);
    if (sortPrice) sortPrice.addEventListener('change', applyFilters);
    if (onlyOffers) onlyOffers.addEventListener('change', applyFilters);

    // ========== 5. INICIAR ==========
    fetchProducts();
});

// ========== MENÚ MÓVIL (para ambas páginas) ==========
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Ejecutar menú en todas las páginas
document.addEventListener('DOMContentLoaded', initMobileMenu);
