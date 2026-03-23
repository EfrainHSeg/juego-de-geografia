let allCountries = [];
let country1Data = null;
let country2Data = null;

async function initComparar() {
    allCountries = await getCountriesForList();
    populateDatalist('datalist-1');
    populateDatalist('datalist-2');
}

function populateDatalist(id) {
    const dl = document.getElementById(id);
    allCountries.forEach(c => {
        const nombre = currentLang === 'es' && c.name.translations?.spa
            ? c.name.translations.spa.common : c.name.common;
        const opt = document.createElement('option');
        opt.value = nombre;
        dl.appendChild(opt);
    });
}

function findCountryByInput(value) {
    return allCountries.find(c => {
        const es = c.name.translations?.spa?.common?.toLowerCase() || '';
        const en = c.name.common.toLowerCase();
        return es === value.toLowerCase() || en === value.toLowerCase();
    });
}

async function onCountryInput(inputId, slot) {
    const input = document.getElementById(inputId);
    const found = findCountryByInput(input.value.trim());
    if (!found) return;
    const details = await getCountryDetails(found.name.common);
    if (slot === 1) country1Data = details;
    else country2Data = details;
    if (country1Data && country2Data) renderComparison();
}

function getName(c) {
    return currentLang === 'es' && c.name.translations?.spa
        ? c.name.translations.spa.common : c.name.common;
}

function fmtPop(n) {
    if (!n) return '—';
    return n >= 1e9 ? `${(n/1e9).toFixed(1)}B`
         : n >= 1e6 ? `${(n/1e6).toFixed(1)}M`
         : `${(n/1e3).toFixed(0)}K`;
}

function fmtArea(n) {
    if (!n) return '—';
    return n >= 1e6 ? `${(n/1e6).toFixed(2)}M km²` : `${n.toLocaleString()} km²`;
}

function compareBar(val1, val2, fmt) {
    const max = Math.max(val1 || 0, val2 || 0);
    const pct1 = max > 0 ? Math.round((val1 / max) * 100) : 0;
    const pct2 = max > 0 ? Math.round((val2 / max) * 100) : 0;
    const w1 = val1 > val2 ? 'text-green-600 dark:text-green-400 font-extrabold' : 'text-gray-700 dark:text-gray-300';
    const w2 = val2 > val1 ? 'text-green-600 dark:text-green-400 font-extrabold' : 'text-gray-700 dark:text-gray-300';
    return `
        <div class="grid grid-cols-3 items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="text-right">
                <p class="text-sm ${w1} mb-1">${fmt(val1)}</p>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-700" style="width:${pct1}%"></div>
                </div>
            </div>
            <div class="text-center text-xs font-bold text-gray-400 uppercase tracking-wide">{LABEL}</div>
            <div class="text-left">
                <p class="text-sm ${w2} mb-1">${fmt(val2)}</p>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all duration-700" style="width:${pct2}%"></div>
                </div>
            </div>
        </div>`;
}

function compareText(val1, val2, label) {
    return `
        <div class="grid grid-cols-3 items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="text-right text-sm text-gray-700 dark:text-gray-300">${val1 || '—'}</div>
            <div class="text-center text-xs font-bold text-gray-400 uppercase tracking-wide">${label}</div>
            <div class="text-left text-sm text-gray-700 dark:text-gray-300">${val2 || '—'}</div>
        </div>`;
}

function renderComparison() {
    document.getElementById('comparison-placeholder').classList.add('hidden');
    const t = translations[currentLang];
    const n1 = getName(country1Data);
    const n2 = getName(country2Data);
    const cap1 = country1Data.capital?.[0] || '—';
    const cap2 = country2Data.capital?.[0] || '—';
    const idiomas1 = country1Data.languages ? Object.values(country1Data.languages).join(', ') : '—';
    const idiomas2 = country2Data.languages ? Object.values(country2Data.languages).join(', ') : '—';
    const mon1 = country1Data.currencies ? Object.values(country1Data.currencies)[0]?.name : '—';
    const mon2 = country2Data.currencies ? Object.values(country2Data.currencies)[0]?.name : '—';

    const popRow = compareBar(country1Data.population, country2Data.population, fmtPop).replace('{LABEL}', t['comparar.population'] || 'Población');
    const areaRow = compareBar(country1Data.area, country2Data.area, fmtArea).replace('{LABEL}', t['comparar.area'] || 'Área');

    document.getElementById('comparison-result').innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <!-- Flags header -->
            <div class="grid grid-cols-3 items-center gap-4 mb-6">
                <div class="text-center">
                    <img src="${country1Data.flags.svg}" class="mx-auto h-20 w-32 object-contain rounded-lg shadow border border-gray-200 dark:border-gray-600 mb-2">
                    <h3 class="font-extrabold text-lg leading-tight">${n1}</h3>
                    <p class="text-xs text-gray-400">${country1Data.region}</p>
                </div>
                <div class="text-center">
                    <span class="text-3xl font-black text-gray-200 dark:text-gray-700">VS</span>
                </div>
                <div class="text-center">
                    <img src="${country2Data.flags.svg}" class="mx-auto h-20 w-32 object-contain rounded-lg shadow border border-gray-200 dark:border-gray-600 mb-2">
                    <h3 class="font-extrabold text-lg leading-tight">${n2}</h3>
                    <p class="text-xs text-gray-400">${country2Data.region}</p>
                </div>
            </div>
            ${popRow}
            ${areaRow}
            ${compareText(cap1, cap2, t['comparar.capital'] || 'Capital')}
            ${compareText(country1Data.region, country2Data.region, t['comparar.region'] || 'Región')}
            ${compareText(idiomas1, idiomas2, t['comparar.languages'] || 'Idiomas')}
            ${compareText(mon1, mon2, t['comparar.currency'] || 'Moneda')}
        </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    initComparar();
    document.getElementById('search-1').addEventListener('change', () => onCountryInput('search-1', 1));
    document.getElementById('search-2').addEventListener('change', () => onCountryInput('search-2', 2));
    document.getElementById('search-1').addEventListener('blur', () => onCountryInput('search-1', 1));
    document.getElementById('search-2').addEventListener('blur', () => onCountryInput('search-2', 2));
});
