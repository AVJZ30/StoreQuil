/* =========================================================
   StoreQuil — Lógica principal
   ========================================================= */

// URL de la API (Google Apps Script). Cambia aquí si necesitas otra fuente.
const API_URL =
  'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';

// Catálogo de categorías predefinidas (mostradas en la grilla de categorías).
const CATEGORIES = [
  { name: 'Comida', emoji: '🍔' },
  { name: 'Ropa', emoji: '👕' },
  { name: 'Belleza', emoji: '💄' },
  { name: 'Tecnología', emoji: '📱' },
  { name: 'Hogar', emoji: '🏠' },
  { name: 'Mascotas', emoji: '🐶' },
  { name: 'Regalos', emoji: '🎁' },
  { name: 'Servicios', emoji: '🛠' },
  { name: 'Educación', emoji: '📚' },
  { name: 'Automotriz', emoji: '🚗' },
  { name: 'Videojuegos', emoji: '🎮' },
  { name: 'Otros', emoji: '📦' },
];

// Estado global de la app.
const state = {
  products: [],
  filtered: [],
  search: '',
  category: '',
  onlyOffers: false,
  sort: '',
};

/* ---------- Utilidades ---------- */

// Normaliza texto para búsquedas sin tildes/case.
function normalize(str) {
  return (str ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Formatea un precio en USD (Ecuador).
function formatPrice(value) {
  const n = Number(value);
  if (!isFinite(n)) return value || '';
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

// Limpia el número de WhatsApp dejando solo dígitos y código de país.
function cleanWhatsApp(num) {
  const digits = (num || '').toString().replace(/\D/g, '');
  // Si empieza por 0 (ej. 0991234567) lo convertimos al formato internacional Ecuador (+593).
  if (digits.startsWith('0')) return '593' + digits.slice(1);
  return digits;
}

// Genera la URL de wa.me con mensaje predeterminado.
function whatsappURL(num, productName) {
  const clean = cleanWhatsApp(num);
  const msg = encodeURIComponent(
    `Hola, vi tu producto "${productName}" en StoreQuil y me interesa.`
  );
  return `https://wa.me/${clean}?text=${msg}`;
}

// Devuelve el emoji de una categoría (o uno por defecto).
function emojiFor(category) {
  const found = CATEGORIES.find(
    (c) => normalize(c.name) === normalize(category)
  );
  return found ? found.emoji : '📦';
}

/* ---------- Navegación ---------- */
function setupNavbar() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const nav = document.getElementById('navbar');

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Cerrar menú móvil al hacer click en un enlace.
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
    })
  );

  // Sombra del navbar al hacer scroll.
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Reveal en scroll ---------- */
function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Categorías ---------- */
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = CATEGORIES.map(
    (c) => `
      <button class="category-card reveal" data-category="${c.name}" aria-label="Filtrar por ${c.name}">
        <span class="emoji" aria-hidden="true">${c.emoji}</span>
        <span class="name">${c.name}</span>
      </button>
    `
  ).join('');

  grid.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      state.category = state.category === cat ? '' : cat;
      document
        .querySelectorAll('.category-card')
        .forEach((c) => c.classList.toggle('active', c.dataset.category === state.category));
      // Sincroniza select de filtros.
      document.getElementById('filterCategory').value = state.category;
      applyFilters();
      document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ---------- Productos ---------- */
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error en la API');
    const data = await res.json();

    // Soporta múltiples formas: array o {data:[]}.
    const list = Array.isArray(data) ? data : data.data || data.products || [];
    state.products = list.map(mapProduct).filter((p) => p.name);
    populateFilters();
    updateStats();
    applyFilters();
  } catch (err) {
    console.error('Error cargando productos:', err);
    document.getElementById('productsGrid').innerHTML = '';
    showEmpty('No pudimos cargar los productos. Intenta de nuevo más tarde.');
  }
}

// Mapea una fila del Sheets a un objeto consistente.
function mapProduct(row) {
  // Acepta variantes con tildes/espacios.
  const get = (...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
    }
    return '';
  };
  return {
    name: get('Nombre del producto', 'nombre', 'Nombre'),
    business: get('Nombre del negocio', 'negocio', 'Negocio'),
    description: get('Descripción', 'Descripcion', 'descripcion'),
    image: get('Link de la imagen', 'Imagen', 'imagen'),
    whatsapp: get('WhatsApp', 'whatsapp', 'Whatsapp'),
    price: get('Precio', 'precio'),
    category: get('Categoría', 'Categoria', 'categoria'),
    offer: String(get('Oferta', 'oferta')).trim().toLowerCase(),
  };
}

function populateFilters() {
  const select = document.getElementById('filterCategory');
  const cats = Array.from(
    new Set(state.products.map((p) => p.category).filter(Boolean))
  ).sort();
  select.innerHTML =
    '<option value="">Todas</option>' +
    cats.map((c) => `<option value="${c}">${c}</option>`).join('');
}

function updateStats() {
  document.getElementById('statProducts').textContent = state.products.length;
  const businesses = new Set(state.products.map((p) => p.business).filter(Boolean));
  document.getElementById('statBusiness').textContent = businesses.size;
}

function applyFilters() {
  const q = normalize(state.search);
  let list = state.products.filter((p) => {
    const matchSearch =
      !q ||
      normalize(p.name).includes(q) ||
      normalize(p.business).includes(q) ||
      normalize(p.description).includes(q) ||
      normalize(p.category).includes(q);
    const matchCat = !state.category || normalize(p.category) === normalize(state.category);
    const isOffer = ['si', 'sí', 'yes', 'true', '1'].includes(p.offer);
    const matchOffer = !state.onlyOffers || isOffer;
    return matchSearch && matchCat && matchOffer;
  });

  if (state.sort === 'asc') list.sort((a, b) => Number(a.price) - Number(b.price));
  if (state.sort === 'desc') list.sort((a, b) => Number(b.price) - Number(a.price));

  state.filtered = list;
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const count = document.getElementById('resultsCount');
  count.textContent = `${state.filtered.length} producto${state.filtered.length === 1 ? '' : 's'}`;

  if (state.filtered.length === 0) {
    grid.innerHTML = '';
    showEmpty();
    return;
  }
  hideEmpty();

  grid.innerHTML = state.filtered.map(productCardHTML).join('');
}

function productCardHTML(p) {
  const isOffer = ['si', 'sí', 'yes', 'true', '1'].includes(p.offer);
  const img =
    p.image ||
    'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#F1F5F9" width="400" height="300"/><text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">${emojiFor(p.category)}</text></svg>`
      );

  return `
    <article class="product-card">
      <div class="product-image">
        <img loading="lazy" src="${img}" alt="${escapeHtml(p.name)}"
             onerror="this.src='data:image/svg+xml;utf8,${encodeURIComponent(
               `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#F1F5F9" width="400" height="300"/><text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">${emojiFor(p.category)}</text></svg>`
             )}'"/>
        ${isOffer ? '<span class="offer-badge">🔥 OFERTA</span>' : ''}
        ${p.category ? `<span class="category-badge">${escapeHtml(p.category)}</span>` : ''}
      </div>
      <div class="product-body">
        ${p.business ? `<span class="product-business">${escapeHtml(p.business)}</span>` : ''}
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        ${p.description ? `<p class="product-desc">${escapeHtml(p.description)}</p>` : ''}
        <div class="product-price">${formatPrice(p.price)}</div>
      </div>
      <div class="product-foot">
        <a class="btn btn-whatsapp" href="${whatsappURL(p.whatsapp, p.name)}" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> Contactar por WhatsApp
        </a>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  return (str ?? '')
    .toString()
    .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showEmpty(msg) {
  const el = document.getElementById('emptyState');
  if (msg) el.querySelector('p').textContent = msg;
  el.classList.remove('hidden');
}
function hideEmpty() {
  document.getElementById('emptyState').classList.add('hidden');
}

/* ---------- Filtros (eventos) ---------- */
function setupFilters() {
  // Búsqueda en tiempo real.
  const input = document.getElementById('searchInput');
  let t;
  input.addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.search = e.target.value;
      applyFilters();
    }, 120);
  });

  document.getElementById('filterCategory').addEventListener('change', (e) => {
    state.category = e.target.value;
    document
      .querySelectorAll('.category-card')
      .forEach((c) => c.classList.toggle('active', c.dataset.category === state.category));
    applyFilters();
  });

  document.getElementById('sortPrice').addEventListener('change', (e) => {
    state.sort = e.target.value;
    applyFilters();
  });

  document.getElementById('onlyOffers').addEventListener('change', (e) => {
    state.onlyOffers = e.target.checked;
    applyFilters();
  });

  // Submit del hero search.
  document.getElementById('heroSearch').addEventListener('submit', () => {
    document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  setupNavbar();
  renderCategories();
  setupFilters();
  setupReveal();
  loadProducts();
});
