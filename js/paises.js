// --- SELECTORES DEL DOM ---
const contenedorPaises = document.getElementById('paises-container');
const buscadorInput = document.getElementById('searchInput');
const filtroRegion = document.getElementById('regionFilter');

const modal = document.getElementById('countryModal');
const modalContent = document.getElementById('modalContent');
const cerrarModalBtn = document.getElementById('closeModalBtn');

// --- VARIABLES GLOBALES ---
let todosLosPaises = [];

// --- FUNCIÓN PARA OBTENER DATOS DE LA API (Lista inicial) ---
async function obtenerPaises() {
    try {
        const respuesta = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,region,subregion,population,area,languages,currencies,latlng');
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        const paises = await respuesta.json();
        
        todosLosPaises = paises.sort((a, b) => a.name.common.localeCompare(b.name.common));
        
        llenarFiltroRegiones(todosLosPaises);
        mostrarPaises(todosLosPaises);
        
    } catch (error) {
        console.error('Error al obtener los países:', error);
        contenedorPaises.innerHTML = `<p class="text-center text-red-500">${translations[currentLang]["paises.details_error"]}</p>`;
    }
}

// --- FUNCIÓN PARA LLENAR EL SELECT DE FILTROS ---
function llenarFiltroRegiones(paises) {
    const regiones = new Set();
    paises.forEach(pais => {
        if (pais.region) regiones.add(pais.region);
        if (pais.subregion) regiones.add(pais.subregion);
    });

    const regionesOrdenadas = Array.from(regiones).sort();

    filtroRegion.innerHTML = `<option value="all">${translations[currentLang]["paises.all_regions"]}</option>`;
    regionesOrdenadas.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        filtroRegion.appendChild(option);
    });
}

// --- FUNCIÓN PARA MOSTRAR LA LISTA DE PAÍSES ---
function mostrarPaises(paises) {
    contenedorPaises.innerHTML = '';
    
    if (paises.length === 0) {
        contenedorPaises.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400">${translations[currentLang]["paises.no_countries_found"]}</p>`;
        return;
    }

    paises.forEach(pais => {
        // Seleccionamos el nombre del país en el idioma correcto
        const nombrePais = currentLang === 'es' && pais.name.translations && pais.name.translations.spa 
                           ? pais.name.translations.spa.common 
                           : pais.name.common;
        const capital = pais.capital && pais.capital.length > 0 ? pais.capital[0] : translations[currentLang]["paises.not_available"];
        const bandera = pais.flags.svg;

        const tarjeta = document.createElement('div');
        tarjeta.classList.add('bg-white', 'dark:bg-gray-800', 'p-6', 'rounded-lg', 'shadow-lg', 'card', 'text-center', 'cursor-pointer');
        tarjeta.dataset.nombre = pais.name.common;
        
        tarjeta.innerHTML = `
            <img src="${bandera}" alt="Bandera de ${nombrePais}" class="w-full h-24 object-contain border border-gray-200 dark:border-gray-700 rounded-md mb-4">
            <h3 class="text-xl font-bold mb-1">${nombrePais}</h3>
            <p class="text-gray-600 dark:text-gray-400">${translations[currentLang]["paises.capital"]} <strong>${capital}</strong></p>
        `;

        tarjeta.addEventListener('click', () => mostrarModal(pais.name.common));
        contenedorPaises.appendChild(tarjeta);
    });
}

// --- FUNCIÓN PARA FILTRAR Y BUSCAR ---
function filtrarYBuscar() {
    const textoBusqueda = buscadorInput.value.toLowerCase();
    const filtroSeleccionado = filtroRegion.value;
    
    const paisesFiltrados = todosLosPaises.filter(pais => {
        const nombreEnEspanol = pais.name.translations && pais.name.translations.spa ? pais.name.translations.spa.common.toLowerCase() : '';
        const nombreEnIngles = pais.name.common.toLowerCase();
        const capital = pais.capital && pais.capital[0] ? pais.capital[0].toLowerCase() : '';
        
        const cumpleBusqueda = nombreEnEspanol.includes(textoBusqueda) ||
                               nombreEnIngles.includes(textoBusqueda) ||
                               capital.includes(textoBusqueda);
        
        const cumpleFiltro = filtroSeleccionado === 'all' || pais.region === filtroSeleccionado || pais.subregion === filtroSeleccionado;
        
        return cumpleBusqueda && cumpleFiltro;
    });
    
    mostrarPaises(paisesFiltrados);
}

// --- FUNCIÓN PARA MOSTRAR EL MODAL CON DETALLES ---
async function mostrarModal(nombrePais) {
    modal.classList.remove('hidden');
    modalContent.innerHTML = `<p class="text-center text-gray-500">${translations[currentLang]["paises.details_loading"]}</p>`;

    try {
        const respuesta = await fetch(`https://restcountries.com/v3.1/name/${nombrePais}?fullText=true&fields=name,capital,flags,region,subregion,population,area,languages,currencies,latlng`);
        if (!respuesta.ok) throw new Error('No se encontraron detalles del país.');

        const [detalles] = await respuesta.json();
        
        const nombre = currentLang === 'es' && detalles.name.translations && detalles.name.translations.spa 
                       ? detalles.name.translations.spa.common 
                       : detalles.name.common;
        const capital = detalles.capital && detalles.capital.length > 0 ? detalles.capital[0] : translations[currentLang]["paises.not_available"];
        const region = detalles.region || translations[currentLang]["paises.not_available"];
        const subregion = detalles.subregion || translations[currentLang]["paises.not_available"];
        const poblacion = detalles.population ? detalles.population.toLocaleString('es-ES') : translations[currentLang]["paises.not_available"];
        const area = detalles.area ? `${detalles.area.toLocaleString('es-ES')} km²` : translations[currentLang]["paises.not_available"];
        const idiomas = detalles.languages ? Object.values(detalles.languages).join(', ') : translations[currentLang]["paises.not_available"];
        const moneda = detalles.currencies ? Object.values(detalles.currencies)[0].name : translations[currentLang]["paises.not_available"];
        const lat = detalles.latlng ? detalles.latlng[0] : null;
        const lng = detalles.latlng ? detalles.latlng[1] : null;

        modalContent.innerHTML = `
            <img src="${detalles.flags.svg}" alt="Bandera de ${nombre}" class="w-full md:w-1/3 h-48 object-cover rounded-md shadow-lg">
            <div class="flex-1">
                <h3 class="text-3xl font-bold mb-2">${nombre}</h3>
                <p><strong>${translations[currentLang]["paises.details_capital"]}</strong> ${capital}</p>
                <p><strong>${translations[currentLang]["paises.details_region"]}</strong> ${region}</p>
                <p><strong>${translations[currentLang]["paises.details_subregion"]}</strong> ${subregion}</p>
                <p><strong>${translations[currentLang]["paises.details_population"]}</strong> ${poblacion}</p>
                <p><strong>${translations[currentLang]["paises.details_area"]}</strong> ${area}</p>
                <p><strong>${translations[currentLang]["paises.details_currency"]}</strong> ${moneda}</p>
                <p><strong>${translations[currentLang]["paises.details_languages"]}</strong> ${idiomas}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        modalContent.innerHTML = `<p class="text-center text-red-500">${translations[currentLang]["paises.details_error"]}</p>`;
    }
}

// --- FUNCIÓN PARA CERRAR EL MODAL ---
function cerrarModal() {
    modal.classList.add('hidden');
    modalContent.innerHTML = `<p class="text-center text-gray-500">${translations[currentLang]["paises.details_loading"]}</p>`;
}

// --- EVENT LISTENERS ---
buscadorInput.addEventListener('input', filtrarYBuscar);
filtroRegion.addEventListener('change', filtrarYBuscar);
cerrarModalBtn.addEventListener('click', cerrarModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        cerrarModal();
    }
});

// --- INICIAMOS LA APLICACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    obtenerPaises();
    buscadorInput.value = '';
});