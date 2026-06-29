// Enlace a tu Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbzaBo8lu9zLlHM39lslJP076mMnh1UnuxiiFaVpV5Xth0_mwngEsjqVoi1blWHclm-OOw/exec';

async function cargarProductos() {
    const container = document.getElementById('productos-container');
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        container.innerHTML = ''; 
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="loading">No hay productos disponibles por el momento.</p>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Validamos los datos en caso de que vengan vacíos
            const imagen = item['Link de la imagen'] || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            const whatsappLimpio = String(item['WhatsApp']).replace(/\D/g, ''); // Quita espacios o símbolos

            card.innerHTML = `
                <img src="${imagen}" alt="${item['Nombre del producto']}">
                <h3>${item['Nombre del producto']}</h3>
                <p><strong>Negocio:</strong> ${item['Nombre del negocio']}</p>
                <p>${item['Descripción']}</p>
                <p class="precio">$${item['Precio']}</p>
                <p><small><strong>Categoría:</strong> ${item['Categoría']} | <strong>Oferta:</strong> ${item['Oferta'] || 'Ninguna'}</small></p>
                <a href="https://wa.me/${whatsappLimpio}" target="_blank" class="btn-whatsapp">Contactar por WhatsApp</a>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar:', error);
        container.innerHTML = '<p class="loading" style="color: red;">Ocurrió un error al cargar los productos. Revisa tu conexión o la URL del script.</p>';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);