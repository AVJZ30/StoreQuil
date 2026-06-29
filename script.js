// =========================================================
// StoreQuil — Lógica Principal
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Set current year in footer ---
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // --- 2. Navbar & Mobile Menu ---
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // --- 3. Scroll Reveal Animations ---
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 60) {
        el.classList.add('visible');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger on load


  // --- 4. Lógica de la Tienda (Solo se ejecuta en tienda.html) ---
  const categoriesGrid = document.getElementById('categoriesGrid');
  if(categoriesGrid) {
    
    // Categorías (Las que me enviaste)
    const categorias = [
      { id: 'comida', name: 'Comida', emoji: '🍔' },
      { id: 'ropa', name: 'Ropa', emoji: '👕' },
      { id: 'belleza', name: 'Belleza', emoji: '💄' },
      { id: 'tecnologia', name: 'Tecnología', emoji: '📱' },
      { id: 'hogar', name: 'Hogar', emoji: '🏠' },
      { id: 'mascotas', name: 'Mascotas', emoji: '🐶' },
      { id: 'regalos', name: 'Regalos', emoji: '🎁' },
      { id: 'servicios', name: 'Servicios', emoji: '🛠' },
      { id: 'educacion', name: 'Educación', emoji: '📚' },
      { id: 'automotriz', name: 'Automotriz', emoji: '🚗' },
      { id: 'videojuegos', name: 'Videojuegos', emoji: '🎮' },
      { id: 'otros', name: 'Otros', emoji: '📦' }
    ];

    // Renderizar Categorías en la grilla y en el select
    const filterSelect = document.getElementById('filterCategory');
    categorias.forEach(cat => {
      // Cards
      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `<span class="emoji">${cat.emoji}</span><span class="name">${cat.name}</span>`;
      card.onclick = () => {
        filterSelect.value = cat.id;
        // Aquí puedes agregar la función para filtrar productos si los tuvieras.
        alert(`Filtrar por: ${cat.name}`);
      };
      categoriesGrid.appendChild(card);

      // Select
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      filterSelect.appendChild(option);
    });

    // Simular carga de productos y quitar skeletons
    setTimeout(() => {
      const productsGrid = document.getElementById('productsGrid');
      productsGrid.innerHTML = ''; // Limpiamos skeletons

      // Mensaje de que no hay productos todavía
      const emptyState = document.getElementById('emptyState');
      emptyState.classList.remove('hidden');

      const resultsCount = document.getElementById('resultsCount');
      resultsCount.textContent = "0 resultados";
    }, 1500);
  }
});