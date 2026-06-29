/* StoreQuil — Lógica del formulario de publicación.
 *
 * NOTA: La integración con Google Apps Script (POST al Sheets) se dejará
 * preparada aquí. Sólo hay que descomentar el bloque fetch() y configurar
 * la URL del endpoint cuando esté listo.
 */

// URL del endpoint para enviar nuevos productos (reemplazar cuando esté listo).
const PUBLISH_URL = ''; // ej: 'https://script.google.com/macros/s/.../exec'

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  setupNav();
  setupForm();
});

function setupNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('active', open);
  });
}

function setupForm() {
  const form = document.getElementById('publishForm');
  const success = document.getElementById('successState');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    // Estructura preparada para enviar al Sheets vía Apps Script:
    // try {
    //   await fetch(PUBLISH_URL, {
    //     method: 'POST',
    //     mode: 'no-cors', // requerido por Apps Script
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       'Nombre del producto': data.nombre,
    //       'Nombre del negocio': data.negocio,
    //       'Descripción': data.descripcion,
    //       'Link de la imagen': data.imagen,
    //       'WhatsApp': data.whatsapp,
    //       'Precio': data.precio,
    //       'Categoría': data.categoria,
    //       'Oferta': data.oferta,
    //     }),
    //   });
    // } catch (err) { console.error(err); }

    console.log('Producto a publicar:', data);

    form.style.display = 'none';
    success.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
