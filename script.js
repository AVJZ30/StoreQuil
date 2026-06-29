// =========================================================
// StoreQuil — Script completo
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ========== 1. MENÚ MÓVIL ==========
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }

    // ========== 2. NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ========== 3. ANIMACIONES REVEAL ==========
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // ========== 4. TIENDA ==========
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.log('📄 Página de inicio');
        return; // No seguir si no hay grid de productos
    }

    console.log('🛒 Página de tienda - cargando productos');

    const filterCategory = document.getElementById('filterCategory');
    const sortPrice = document.getElementById('sortPrice');
    const onlyOffers = document.getElementById('onlyOffers');
    const resultsCount = document.getElementById('resultsCount');

    let allProducts = [];

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
            console.log('✅ Productos:', data.length);
            
            allProducts = Array.isArray(data) ? data : [];
            applyFilters();
            
        } catch (error) {
            console.error('❌ Error:', error);
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: #EF4444;"></i>
                    <h3>Error de conexión</h3>
                    <p>No pudimos cargar los productos.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #2563EB; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>`;
        }
    }

    function applyFilters() {
        let filtered = [...allProducts];

        if (filterCategory && filterCategory.value) {
            filtered = filtered.filter(p => {
                const cat = (p['Categoria'] || p['Categoría'] || '').trim();
                return cat === filterCategory.value.trim();
            });
        }

        if (onlyOffers && onlyOffers.checked) {
            filtered = filtered.filter(p => {
                const oferta = p['Oferta'] || '';
                return oferta === 'Sí' || oferta === 'true' || oferta === true;
            });
        }

        if (sortPrice && sortPrice.value === 'asc') {
            filtered.sort((a, b) => (parseFloat(a['Precio']) || 0) - (parseFloat(b['Precio']) || 0));
        } else if (sortPrice && sortPrice.value === 'desc') {
            filtered.sort((a, b) => (parseFloat(b['Precio']) || 0) - (parseFloat(a['Precio']) || 0));
        }

        renderProducts(filtered);
    }

    function renderProducts(products) {
        productsGrid.innerHTML = '';
        
        if (resultsCount) {
            resultsCount.textContent = `${products.length} producto(s)`;
        }

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-store-slash"></i>
                    <h3>Sin resultados</h3>
                    <p>No se encontraron productos con esos filtros.</p>
                </div>`;
            return;
        }

        products.forEach((p, index) => {
            const precio = (parseFloat(p['Precio']) || 0).toFixed(2);
            const oferta = (p['Oferta'] === 'Sí' || p['Oferta'] === 'true' || p['Oferta'] === true);
            const whatsapp = (p['WhatsApp'] || '').toString().replace(/\D/g, '');
            const imagen = p['Link de la imagen'] || '';
            const nombre = p['Nombre del producto'] || 'Sin nombre';
            const negocio = p['Nombre del negocio'] || '';
            const desc = p['Descripción'] || '';
            const categoria = p['Categoria'] || p['Categoría'] || '';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.animationDelay = `${index * 0.05}s`;
            card.innerHTML = `
                <div class="product-image">
                    ${oferta ? '<span class="offer-badge">🔥 Oferta</span>' : ''}
                    ${categoria ? `<span class="category-badge">${categoria}</span>` : ''}
                    <img src="${imagen}" alt="${nombre}" loading="lazy" onerror="this.style.display='none'">
                </div>
                <div class="product-body">
                    ${negocio ? `<span class="product-business">${negocio}</span>` : ''}
                    <h3 class="product-name">${nombre}</h3>
                    ${desc ? `<p class="product-desc">${desc}</p>` : ''}
                    <div class="product-price">$${precio}</div>
                </div>
                <div class="product-foot">
                    ${whatsapp ? 
                        `<a href="https://wa.me/593${whatsapp}" target="_blank" rel="noopener" class="btn btn-whatsapp">
                            <i class="fa-brands fa-whatsapp"></i> Contactar
                        </a>` : ''}
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    if (filterCategory) filterCategory.addEventListener('change', applyFilters);
    if (sortPrice) sortPrice.addEventListener('change', applyFilters);
    if (onlyOffers) onlyOffers.addEventListener('change', applyFilters);

    fetchProducts();
});
