// --- SELECTORES DEL DOM ---
const contenedorPaises = document.getElementById('paises-container');
const buscadorInput = document.getElementById('searchInput');
const regionPillsContainer = document.getElementById('regionPills');

const modal = document.getElementById('countryModal');
const modalContent = document.getElementById('modalContent');
const cerrarModalBtn = document.getElementById('closeModalBtn');

// --- VARIABLES GLOBALES ---
let todosLosPaises = [];
let selectedRegion = 'all';

// --- FUNCIÓN PARA OBTENER DATOS ---
async function obtenerPaises() {
    try {
        todosLosPaises = await getCountriesForList();
        llenarFiltroRegiones(todosLosPaises);
        mostrarPaises(todosLosPaises);
    } catch (error) {
        console.error('Error al obtener los países:', error);
        contenedorPaises.innerHTML = `<p class="text-center text-red-500">${translations[currentLang]["paises.details_error"]}</p>`;
    }
}

// --- FUNCIÓN PARA LLENAR LAS PILLS DE REGIÓN ---
function llenarFiltroRegiones(paises) {
    const regiones = [...new Set(paises.map(p => p.region).filter(Boolean))].sort();

    regionPillsContainer.innerHTML = '';

    const crearPill = (label, value) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.dataset.region = value;
        btn.className = `region-pill${value === selectedRegion ? ' active' : ''}`;
        btn.addEventListener('click', () => {
            selectedRegion = value;
            document.querySelectorAll('.region-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            filtrarYBuscar();
        });
        return btn;
    };

    regionPillsContainer.appendChild(crearPill(translations[currentLang]['paises.all_regions'], 'all'));
    regiones.forEach(r => regionPillsContainer.appendChild(crearPill(r, r)));
}

// --- FUNCIÓN PARA MOSTRAR LA LISTA DE PAÍSES ---
function mostrarPaises(paises) {
    contenedorPaises.innerHTML = '';

    const counter = document.getElementById('results-count');
    if (counter) counter.textContent = paises.length;

    if (paises.length === 0) {
        contenedorPaises.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">${translations[currentLang]["paises.no_countries_found"]}</p>`;
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('card-enter-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    paises.forEach((pais, i) => {
        const nombre = currentLang === 'es' && pais.name.translations?.spa
                       ? pais.name.translations.spa.common
                       : pais.name.common;
        const capital = pais.capital?.[0] ?? translations[currentLang]["paises.not_available"];
        const region = pais.region || '—';
        const poblacion = pais.population
            ? pais.population >= 1e6
                ? `${(pais.population / 1e6).toFixed(1)}M`
                : `${(pais.population / 1e3).toFixed(0)}K`
            : '—';

        const wrapper = document.createElement('div');
        wrapper.classList.add('country-card-wrapper', 'card-enter');
        wrapper.style.transitionDelay = `${(i % 20) * 25}ms`;

        wrapper.innerHTML = `
            <div class="country-card-inner">
                <div class="country-card-front">
                    <div class="card-flag-area">
                        <img src="${pais.flags.svg}" alt="${nombre}">
                    </div>
                    <div class="card-info-area">
                        <h3 class="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">${nombre}</h3>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">${capital}</p>
                    </div>
                </div>
                <div class="country-card-back">
                    <img src="${pais.flags.svg}" alt="" class="h-10 object-contain rounded mb-3 border border-white/20">
                    <h3 class="font-bold text-sm mb-2 leading-tight">${nombre}</h3>
                    <div class="text-xs space-y-1.5 w-full">
                        <p><i class="fas fa-city opacity-70 mr-1"></i>${capital}</p>
                        <p><i class="fas fa-globe opacity-70 mr-1"></i>${region}</p>
                        <p><i class="fas fa-users opacity-70 mr-1"></i>${poblacion}</p>
                    </div>
                    <p class="text-xs mt-3 opacity-50">${translations[currentLang]["paises.click_details"] || 'Click para más info'}</p>
                </div>
            </div>
        `;

        wrapper.addEventListener('click', () => mostrarModal(pais.name.common));
        contenedorPaises.appendChild(wrapper);
        observer.observe(wrapper);
    });
}

// --- FUNCIÓN PARA FILTRAR Y BUSCAR ---
function filtrarYBuscar() {
    const textoBusqueda = buscadorInput.value.toLowerCase();
    const paisesFiltrados = todosLosPaises.filter(pais => {
        const nombreEnEspanol = pais.name.translations && pais.name.translations.spa ? pais.name.translations.spa.common.toLowerCase() : '';
        const nombreEnIngles = pais.name.common.toLowerCase();
        const capital = pais.capital && pais.capital[0] ? pais.capital[0].toLowerCase() : '';

        const cumpleBusqueda = nombreEnEspanol.includes(textoBusqueda) ||
                               nombreEnIngles.includes(textoBusqueda) ||
                               capital.includes(textoBusqueda);

        const cumpleFiltro = selectedRegion === 'all' || pais.region === selectedRegion || pais.subregion === selectedRegion;

        return cumpleBusqueda && cumpleFiltro;
    });

    mostrarPaises(paisesFiltrados);
}

// --- FUNCIÓN PARA MOSTRAR EL MODAL CON DETALLES ---
async function mostrarModal(nombrePais) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalContent.innerHTML = `
        <div class="w-full flex flex-col items-center justify-center py-12 text-gray-400">
            <svg class="animate-spin h-8 w-8 mb-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>${translations[currentLang]["paises.details_loading"]}</span>
        </div>`;

    try {
        const detalles = await getCountryDetails(nombrePais);

        const nombre = currentLang === 'es' && detalles.name.translations?.spa
                       ? detalles.name.translations.spa.common
                       : detalles.name.common;
        const capital = detalles.capital?.[0] ?? '—';
        const region = detalles.region || '—';
        const subregion = detalles.subregion || '—';

        // Población abreviada
        const pobNum = detalles.population || 0;
        const poblacion = pobNum >= 1e9 ? `${(pobNum/1e9).toFixed(1)}B`
                        : pobNum >= 1e6 ? `${(pobNum/1e6).toFixed(1)}M`
                        : pobNum >= 1e3 ? `${(pobNum/1e3).toFixed(0)}K`
                        : pobNum.toString();

        // Área abreviada
        const areaNum = detalles.area || 0;
        const area = areaNum >= 1e6 ? `${(areaNum/1e6).toFixed(2)}M km²`
                   : `${areaNum.toLocaleString()} km²`;

        const idiomas = detalles.languages ? Object.values(detalles.languages).join(' · ') : '—';
        const monedaObj = detalles.currencies ? Object.values(detalles.currencies)[0] : null;
        const monedaCodigo = detalles.currencies ? Object.keys(detalles.currencies)[0] : '';
        const monedaSimbolo = monedaObj?.symbol || '';
        const moneda = monedaObj ? `${monedaSimbolo} ${monedaCodigo}`.trim() : '—';
        const mapsUrl = detalles.maps?.googleMaps || '';
        const anthemSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(nombre + ' himno nacional')}`;

        // Foto capital + QID del país (para Wikidata) en paralelo
        const [capitalWikiPhoto, countryWikiEn] = await Promise.all([
            capital !== '—' ? getWikipediaSummary(capital, 'en') : Promise.resolve(null),
            getWikipediaSummary(detalles.name.common, 'en')
        ]);
        const capitalImg = capitalWikiPhoto?.thumbnail?.source || '';

        // Líder actual desde Wikidata (usa el QID de Wikipedia)
        const qid = countryWikiEn?.wikibase_item;
        const leader = await getCountryLeader(qid, currentLang);

        const t = translations[currentLang];

        modalContent.innerHTML = `
            <!-- Hero: foto capital + bandera ondeando -->
            <div class="modal-hero">
                ${capitalImg ? `<img src="${capitalImg}" alt="${capital}" class="modal-hero-img">` : ''}
                <div class="modal-hero-overlay">
                    <img src="${detalles.flags.svg}" alt="${nombre}" class="flag-wave-hero">
                    <div class="min-w-0">
                        <h2 class="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow">${nombre}</h2>
                        <div class="flex flex-wrap gap-2 mt-2">
                            <button onclick="filtrarPorRegion('${region}')" class="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 hover:bg-white/40 transition-colors cursor-pointer">
                                <i class="fas fa-globe-americas"></i> ${region}
                            </button>
                            <button onclick="filtrarPorRegion('${subregion}')" class="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 hover:bg-white/40 transition-colors cursor-pointer">
                                <i class="fas fa-map-pin"></i> ${subregion}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cuerpo -->
            <div class="modal-body">

                <!-- Stats grid: iconos grandes + número prominente -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="modal-stat-big">
                        <i class="fas fa-city modal-stat-icon" style="color:#3b82f6"></i>
                        <p class="modal-stat-num">${capital}</p>
                        <p class="modal-stat-lbl">${t["paises.details_capital"]}</p>
                    </div>
                    <div class="modal-stat-big">
                        <i class="fas fa-users modal-stat-icon" style="color:#22c55e"></i>
                        <p class="modal-stat-num">${poblacion}</p>
                        <p class="modal-stat-lbl">${t["paises.details_population"]}</p>
                    </div>
                    <div class="modal-stat-big">
                        <i class="fas fa-ruler-combined modal-stat-icon" style="color:#a855f7"></i>
                        <p class="modal-stat-num">${area}</p>
                        <p class="modal-stat-lbl">${t["paises.details_area"]}</p>
                    </div>
                    <div class="modal-stat-big">
                        <i class="fas fa-coins modal-stat-icon" style="color:#eab308"></i>
                        <p class="modal-stat-num">${moneda}</p>
                        <p class="modal-stat-lbl">${t["paises.details_currency"]}</p>
                    </div>
                    <div class="modal-stat-big col-span-2">
                        <i class="fas fa-language modal-stat-icon" style="color:#ef4444"></i>
                        <p class="modal-stat-num">${idiomas}</p>
                        <p class="modal-stat-lbl">${t["paises.details_languages"]}</p>
                    </div>
                </div>

                <!-- Fila extra: presidente + coordenadas -->
                <div class="flex gap-3 mb-5">
                    ${leader ? `
                    <div class="modal-stat flex-1">
                        <i class="fas fa-user-tie text-indigo-500 text-base"></i>
                        <div><p class="stat-label">${currentLang === 'es' ? 'Jefe de Gobierno' : 'Head of Gov.'}</p><p class="stat-value">${leader}</p></div>
                    </div>` : ''}
                    ${detalles.latlng ? `
                    <div class="modal-stat flex-1">
                        <i class="fas fa-location-dot text-gray-400 text-base"></i>
                        <div><p class="stat-label">Coords</p><p class="stat-value">${detalles.latlng[0].toFixed(1)}°, ${detalles.latlng[1].toFixed(1)}°</p></div>
                    </div>` : ''}
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-3">
                    ${mapsUrl ? `
                    <a href="${mapsUrl}" target="_blank" rel="noopener"
                        class="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
                        <i class="fas fa-map-location-dot"></i> Google Maps
                    </a>` : ''}
                    <a href="${anthemSearch}" target="_blank" rel="noopener"
                        class="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
                        <i class="fab fa-youtube"></i> Himno Nacional
                    </a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        modalContent.innerHTML = `<p class="text-center text-red-500 py-8">${translations[currentLang]["paises.details_error"]}</p>`;
    }
}

// --- FILTRAR POR REGIÓN DESDE EL MODAL ---
function filtrarPorRegion(region) {
    cerrarModal();
    selectedRegion = region;
    document.querySelectorAll('.region-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.region === region);
    });
    filtrarYBuscar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- FUNCIÓN PARA CERRAR EL MODAL ---
function cerrarModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    modalContent.innerHTML = '';
}

// --- EVENT LISTENERS ---
buscadorInput.addEventListener('input', filtrarYBuscar);
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
