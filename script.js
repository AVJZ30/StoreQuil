// =========================================================
// StoreQuil — Script completo (FULL RESPONSIVE)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ========== 1. MENÚ MÓVIL MEJORADO ==========
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
            
            // Prevenir scroll cuando el menú está abierto
            if (isOpen) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
            
            // Actualizar aria-expanded
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });
    }

    // ========== 2. NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    if (navbar) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
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

    // ========== 4. ESTADÍSTICAS EN TIEMPO REAL (HOME) ==========
    const homeProductCount = document.getElementById('homeProductCount');
    const API_URL = 'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';

    if (homeProductCount) {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                const total = Array.isArray(data) ? data.length : 0;
                homeProductCount.textContent = `+${total}`;
            })
            .catch(err => {
                console.error('Error cargando estadísticas:', err);
                homeProductCount.textContent = '+100'; // fallback
            });
    }

    // ========== 5. TIENDA ==========
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        return; // No seguir si no estamos en la página de la tienda
    }

    console.log('🛒 Página de tienda - cargando productos');

    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');
    const sortPrice = document.getElementById('sortPrice');
    const onlyOffers = document.getElementById('onlyOffers');
    const resultsCount = document.getElementById('resultsCount');

    let allProducts = [];

    async function fetchProducts() {
        try {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #2563EB;"></i>
                    <p style="margin-top: 1rem;">Cargando productos...</p>
                </div>`;

            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const data = await response.json();
            allProducts = Array.isArray(data) ? data : [];
            applyFilters();
            
        } catch (error) {
            console.error('❌ Error:', error);
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: #EF4444;"></i>
                    <h3>Error de conexión</h3>
                    <p>No pudimos cargar los productos. Verifica tu conexión a internet.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #2563EB; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        <i class="fa-solid fa-rotate"></i> Reintentar
                    </button>
                </div>`;
        }
    }

    function applyFilters() {
        let filtered = [...allProducts];

        // Filtro por Búsqueda (Texto)
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase().trim();
            filtered = filtered.filter(p => {
                const nombre = (p['Nombre del producto'] || '').toLowerCase();
                const negocio = (p['Nombre del negocio'] || '').toLowerCase();
                const desc = (p['Descripción'] || '').toLowerCase();
                return nombre.includes(searchTerm) || negocio.includes(searchTerm) || desc.includes(searchTerm);
            });
        }

        // Filtro por Categoría
        if (filterCategory && filterCategory.value) {
            filtered = filtered.filter(p => {
                const cat = (p['Categoria'] || p['Categoría'] || '').trim();
                return cat === filterCategory.value.trim();
            });
        }

        // Filtro Solo Ofertas
        if (onlyOffers && onlyOffers.checked) {
            filtered = filtered.filter(p => {
                const oferta = p['Oferta'] || '';
                return oferta === 'Sí' || oferta === 'true' || oferta === true;
            });
        }

        // Ordenamiento de Precio
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
                    <p>No se encontraron productos con esos filtros o términos de búsqueda.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #2563EB; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Mostrar todos los productos
                    </button>
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
                    ${imagen ? 
                        `<img src="${imagen}" alt="${nombre}" loading="lazy" onerror="this.parentElement.style.background='#F1F5F9'; this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                        `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; font-size:3rem;">📦</div>`
                    }
                </div>
                <div class="product-body">
                    ${negocio ? `<span class="product-business">${negocio}</span>` : ''}
                    <h3 class="product-name">${nombre}</h3>
                    ${desc ? `<p class="product-desc">${desc}</p>` : ''}
                    <div class="product-price">$${precio}</div>
                </div>
                <div class="product-foot">
                    ${whatsapp ? 
                        `<a href="https://wa.me/593${whatsapp}" target="_blank" rel="noopener" class="btn btn-whatsapp" aria-label="Contactar por WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i> Contactar
                        </a>` : 
                        `<button class="btn btn-whatsapp" disabled style="opacity: 0.5; cursor: not-allowed;">
                            <i class="fa-solid fa-phone-slash"></i> Sin contacto
                        </button>`
                    }
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    // Listeners de los filtros con debounce para mejor rendimiento
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applyFilters, 300);
        });
    }
    if (filterCategory) filterCategory.addEventListener('change', applyFilters);
    if (sortPrice) sortPrice.addEventListener('change', applyFilters);
    if (onlyOffers) onlyOffers.addEventListener('change', applyFilters);

    // Cargar productos
    fetchProducts();
});
