// La misma URL para recibir los datos
const PUBLISH_URL = 'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';

document.getElementById('publicar-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    
    const btn = document.getElementById('btn-submit');
    const mensaje = document.getElementById('mensaje-estado');
    
    // Estado de carga
    btn.disabled = true;
    btn.textContent = 'Publicando...';
    mensaje.textContent = '';
    mensaje.style.color = 'inherit';

    // Recopilar los datos del formulario
    const data = {
        nombre: document.getElementById('nombre').value,
        negocio: document.getElementById('negocio').value,
        descripcion: document.getElementById('descripcion').value,
        imagen: document.getElementById('imagen').value,
        whatsapp: document.getElementById('whatsapp').value,
        precio: document.getElementById('precio').value,
        categoria: document.getElementById('categoria').value,
        oferta: document.getElementById('oferta').value || 'Ninguna'
    };

    try {
        // Enviar petición POST
        await fetch(PUBLISH_URL, {
            method: 'POST',
            mode: 'no-cors', // Fundamental para enviar a Google Apps Script desde el frontend
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'Nombre del producto': data.nombre,
                'Nombre del negocio': data.negocio,
                'Descripción': data.descripcion,
                'Link de la imagen': data.imagen,
                'WhatsApp': data.whatsapp,
                'Precio': data.precio,
                'Categoría': data.categoria,
                'Oferta': data.oferta,
            }),
        });
        
        // Al usar no-cors, el fetch no devuelve un "status 200" legible por JS, 
        // pero si pasa por esta línea sin entrar al catch, es un éxito.
        mensaje.style.color = 'green';
        mensaje.textContent = '¡Producto publicado con éxito!';
        
        // Limpiar formulario
        document.getElementById('publicar-form').reset();
        
    } catch (err) {
        console.error(err);
        mensaje.style.color = 'red';
        mensaje.textContent = 'Hubo un error al publicar. Intenta nuevamente.';
    } finally {
        // Restaurar botón
        btn.disabled = false;
        btn.textContent = 'Publicar Producto';
    }
});