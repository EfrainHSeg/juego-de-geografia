// --- CAPA DE ACCESO A DATOS ---
// Toda llamada a la API y caché vive aquí.

const CACHE_KEYS = {
    quiz: 'countries_quiz',
    paises: 'countries_paises',
    detail: (name) => `country_detail_${name}`
};

async function _fetch(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
}

function _fromCache(key) {
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
}

function _toCache(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
}

// Países para el quiz (solo campos necesarios)
async function getCountriesForQuiz() {
    const cached = _fromCache(CACHE_KEYS.quiz);
    if (cached) return cached;

    const data = await _fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital');
    const filtered = data.filter(c => c.flags && c.capital && c.capital.length > 0);
    _toCache(CACHE_KEYS.quiz, filtered);
    return filtered;
}

// Países para la lista (campos completos)
async function getCountriesForList() {
    const cached = _fromCache(CACHE_KEYS.paises);
    if (cached) return cached;

    const data = await _fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,region,subregion,population,area,languages,currencies,latlng');
    const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    _toCache(CACHE_KEYS.paises, sorted);
    return sorted;
}

// Detalles de un país para el modal
async function getCountryDetails(nombre) {
    const key = CACHE_KEYS.detail(nombre);
    const cached = _fromCache(key);
    if (cached) return cached;

    const data = await _fetch(`https://restcountries.com/v3.1/name/${nombre}?fullText=true&fields=name,capital,flags,region,subregion,population,area,languages,currencies,latlng,maps`);
    const [detalles] = data;
    _toCache(key, detalles);
    return detalles;
}

// Jefe de gobierno actual desde Wikidata (P6 = head of government)
async function getCountryLeader(qid, lang = 'en') {
    if (!qid) return null;
    const key = `leader_${lang}_${qid}`;
    const cached = _fromCache(key);
    if (cached !== null) return cached;

    try {
        const sparql = `SELECT ?leaderLabel WHERE {
            wd:${qid} wdt:P6 ?leader .
            SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
        } LIMIT 1`;
        const data = await _fetch(
            `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`
        );
        const leader = data?.results?.bindings?.[0]?.leaderLabel?.value || null;
        _toCache(key, leader);
        return leader;
    } catch (e) {
        return null;
    }
}

// Resumen de Wikipedia (descripción + thumbnail)
async function getWikipediaSummary(term, lang = 'en') {
    const key = `wiki_${lang}_${term.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = _fromCache(key);
    if (cached) return cached;

    try {
        const data = await _fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`);
        _toCache(key, data);
        return data;
    } catch (e) {
        // Si falla en español, intenta en inglés como fallback
        if (lang !== 'en') {
            try {
                const fallback = await _fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`);
                _toCache(key, fallback);
                return fallback;
            } catch (e2) {
                return null;
            }
        }
        return null;
    }
}
