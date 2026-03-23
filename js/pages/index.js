// --- PAÍS DEL DÍA ---

async function renderDailyCountry() {
    const container = document.getElementById('daily-country-card');
    if (!container) return;

    try {
        const countries = await getCountriesForList();

        // Mismo país para todos durante el día (basado en día UTC)
        const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const country = countries[dayIndex % countries.length];

        const nombre = currentLang === 'es' && country.name.translations?.spa
            ? country.name.translations.spa.common
            : country.name.common;
        const capital = country.capital?.[0] || '—';
        const region  = country.region || '—';

        const pobNum = country.population || 0;
        const poblacion = pobNum >= 1e9 ? `${(pobNum/1e9).toFixed(1)}B`
                        : pobNum >= 1e6 ? `${(pobNum/1e6).toFixed(1)}M`
                        : `${(pobNum/1e3).toFixed(0)}K`;
        const area = country.area
            ? country.area >= 1e6
                ? `${(country.area/1e6).toFixed(2)}M km²`
                : `${country.area.toLocaleString()} km²`
            : '—';

        const wikiLang  = currentLang === 'es' ? 'es' : 'en';
        const wikiNombre = currentLang === 'es' && country.name.translations?.spa
            ? country.name.translations.spa.common
            : country.name.common;

        const [wikiTexto, wikiCapital] = await Promise.all([
            getWikipediaSummary(wikiNombre, wikiLang),
            getWikipediaSummary(capital, 'en')
        ]);

        // Primeras 2 frases como dato curioso
        const extracto = wikiTexto?.extract || '';
        const desc = extracto
            ? extracto.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
            : '';

        const fotoUrl = wikiCapital?.thumbnail?.source || '';

        const fechaLabel = new Date().toLocaleDateString(
            currentLang === 'es' ? 'es-ES' : 'en-US',
            { weekday: 'long', day: 'numeric', month: 'long' }
        );

        const t = translations[currentLang];

        container.className = '';
        container.innerHTML = `
            <div class="daily-card" ${fotoUrl ? `style="background-image:url('${fotoUrl}')"` : ''}>
                <div class="daily-overlay">
                    <div class="daily-content">

                        <!-- Badge + fecha -->
                        <div class="flex items-center justify-between flex-wrap gap-2 mb-5">
                            <span class="daily-badge">
                                <i class="fas fa-star mr-1 text-yellow-300"></i>
                                ${t['home.daily_country']}
                            </span>
                            <span class="text-white/60 text-xs capitalize">${fechaLabel}</span>
                        </div>

                        <!-- Bandera + info -->
                        <div class="flex items-end gap-5 flex-wrap">
                            <img src="${country.flags.svg}" alt="${nombre}" class="flag-wave-hero">

                            <div class="flex-1 min-w-0">
                                <h2 class="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">${nombre}</h2>

                                <div class="flex flex-wrap gap-2 mb-3">
                                    <span class="daily-tag"><i class="fas fa-globe-americas mr-1"></i>${region}</span>
                                    <span class="daily-tag"><i class="fas fa-city mr-1"></i>${capital}</span>
                                </div>

                                ${desc ? `<p class="text-white/75 text-sm leading-relaxed mb-4 daily-desc">${desc}</p>` : ''}

                                <div class="flex flex-wrap gap-2 mb-5">
                                    <span class="daily-stat"><i class="fas fa-users text-blue-300 mr-1.5"></i>${poblacion}</span>
                                    <span class="daily-stat"><i class="fas fa-ruler-combined text-green-300 mr-1.5"></i>${area}</span>
                                </div>

                                <a href="paises.html?pais=${encodeURIComponent(country.name.common)}"
                                   class="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                                    <i class="fas fa-earth-americas"></i>
                                    ${t['home.daily_explore']}
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Error cargando país del día:', e);
        document.getElementById('daily-country-card').innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', renderDailyCountry);
