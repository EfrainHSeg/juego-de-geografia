const regionColors = {
    'Africa': '#f97316',
    'Americas': '#3b82f6',
    'Asia': '#ef4444',
    'Europe': '#22c55e',
    'Oceania': '#a855f7',
    'Antarctic': '#94a3b8'
};

let mapInstance = null;
let allMarkers = [];
let allCountriesMap = [];

async function initMapa() {
    mapInstance = L.map('leaflet-map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        worldCopyJump: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapInstance);

    allCountriesMap = await getCountriesForList();

    allCountriesMap.forEach(country => {
        if (!country.latlng || country.latlng.length < 2) return;

        const [lat, lng] = country.latlng;
        const color = regionColors[country.region] || '#94a3b8';
        const nombre = currentLang === 'es' && country.name.translations?.spa
            ? country.name.translations.spa.common : country.name.common;
        const capital = country.capital?.[0] || '—';
        const pobNum = country.population || 0;
        const poblacion = pobNum >= 1e9 ? `${(pobNum/1e9).toFixed(1)}B`
                        : pobNum >= 1e6 ? `${(pobNum/1e6).toFixed(1)}M`
                        : `${(pobNum/1e3).toFixed(0)}K`;

        const radius = Math.max(4, Math.min(14, Math.log10(pobNum + 1) * 2));

        const marker = L.circleMarker([lat, lng], {
            radius,
            fillColor: color,
            color: 'white',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85
        });

        marker.bindPopup(`
            <div style="text-align:center;min-width:160px;font-family:sans-serif">
                <img src="${country.flags.svg}" style="width:80px;height:52px;object-fit:contain;border-radius:6px;margin-bottom:8px;border:1px solid #e5e7eb">
                <div style="font-weight:800;font-size:15px;margin-bottom:3px">${nombre}</div>
                <div style="color:#6b7280;font-size:12px;margin-bottom:4px"><i class="fas fa-city" style="margin-right:4px"></i>${capital}</div>
                <div style="color:#6b7280;font-size:12px;margin-bottom:10px"><i class="fas fa-users" style="margin-right:4px"></i>${poblacion}</div>
                <a href="paises.html?pais=${encodeURIComponent(country.name.common)}"
                   style="display:inline-block;background:#2563eb;color:white;padding:6px 16px;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none">
                   Ver más →
                </a>
            </div>
        `, { maxWidth: 220 });

        marker.countryName = nombre;
        marker.countryNameEn = country.name.common;
        marker.addTo(mapInstance);
        allMarkers.push(marker);
    });
}

function searchOnMap(query) {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const found = allMarkers.find(m =>
        m.countryName.toLowerCase().includes(q) ||
        m.countryNameEn.toLowerCase().includes(q)
    );
    if (found) {
        mapInstance.flyTo(found.getLatLng(), 5, { duration: 1.2 });
        found.openPopup();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMapa();

    const searchInput = document.getElementById('map-search');
    const datalist = document.getElementById('map-search-datalist');

    // Llenar datalist cuando carguen los países
    getCountriesForList().then(countries => {
        countries.forEach(c => {
            const nombre = currentLang === 'es' && c.name.translations?.spa
                ? c.name.translations.spa.common : c.name.common;
            const opt = document.createElement('option');
            opt.value = nombre;
            datalist.appendChild(opt);
        });
    });

    searchInput.addEventListener('change', () => searchOnMap(searchInput.value));
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') searchOnMap(searchInput.value);
    });
});
