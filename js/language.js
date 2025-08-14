const translations = {
    es: {
        "nav.paises": "Países",
        "nav.quiz": "Quiz",
        "home.title": "Explora el Mundo",
        "home.subtitle": "Descubre países, capitales y banderas con recursos educativos y juegos interactivos diseñados para todas las edades.",
        "home.explore_btn": "Explorar Países",
        "home.quiz_btn": "Jugar Quiz de Banderas",
        "cards.learn_title": "Aprende sobre Países",
        "cards.learn_text": "Explora información detallada sobre cada país, incluyendo sus capitales y datos geográficos.",
        "cards.discover_more": "Descubre más",
        "cards.quiz_title": "Quiz de Banderas",
        "cards.quiz_text": "Pon a prueba tus conocimientos con nuestro divertido juego interactivo de banderas.",
        "cards.play_now": "Jugar ahora",
        "home.why_title": "¿Por qué Explora el Mundo?",
        "home.why_text": "Nuestra plataforma combina educación y entretenimiento para ayudarte a aprender sobre el mundo de una manera divertida y accesible. Perfecta para estudiantes, profesores y curiosos de todas las edades.",
        "footer.rights": "Todos los derechos reservados.",

        "paises.title": "Países del Mundo",
        "paises.subtitle": "Busca y explora información detallada de cada país.",
        "paises.search_placeholder": "Buscar país por nombre o capital...",
        "paises.all_regions": "Todas las Regiones",
        "paises.no_countries_found": "No se encontraron países.",
        "paises.capital": "Capital:",
        "paises.details_capital": "Capital:",
        "paises.details_region": "Región:",
        "paises.details_subregion": "Subregión:",
        "paises.details_population": "Población:",
        "paises.details_area": "Área:",
        "paises.details_currency": "Moneda:",
        "paises.details_languages": "Idiomas:",
        "paises.details_loading": "Cargando detalles del país...",
        "paises.details_error": "No se pudo cargar la información de este país.",
        "paises.not_available": "No disponible",

        "quiz.title": "Quiz",
        "quiz.subtitle": "Pon a prueba tus conocimientos de geografía.",
        "quiz.select_mode": "Selecciona un modo de juego:",
        "quiz.mode_flags": "Banderas",
        "quiz.mode_capitals": "Capitales",
        "quiz.mode_map": "Mapa",
        "quiz.question_header_flags": "¿A qué país pertenece esta bandera?",
        "quiz.question_header_capitals": "¿Cuál es la capital de",
        "quiz.question_header_map": "Encuentra en el mapa a",
        "quiz.next_btn": "Siguiente Pregunta",
        "quiz.results_title": "Quiz Terminado",
        "quiz.score": "Tu puntuación:",
        "quiz.restart_btn": "Jugar de nuevo",
        "quiz.loading": "Cargando juego...",
        "quiz.feedback_correct": "¡Correcto!",
        "quiz.feedback_incorrect": "Incorrecto."
    },
    en: {
        "nav.paises": "Countries",
        "nav.quiz": "Quiz",
        "home.title": "Explore the World",
        "home.subtitle": "Discover countries, capitals, and flags with educational resources and interactive games designed for all ages.",
        "home.explore_btn": "Explore Countries",
        "home.quiz_btn": "Play Flags Quiz",
        "cards.learn_title": "Learn about Countries",
        "cards.learn_text": "Explore detailed information about each country, including its capitals and geographic data.",
        "cards.discover_more": "Discover more",
        "cards.quiz_title": "Flags Quiz",
        "cards.quiz_text": "Test your knowledge with our fun and interactive flags game.",
        "cards.play_now": "Play now",
        "home.why_title": "Why Explore the World?",
        "home.why_text": "Our platform combines education and entertainment to help you learn about the world in a fun and accessible way. Perfect for students, teachers, and curious minds of all ages.",
        "footer.rights": "All rights reserved.",
        
        "paises.title": "Countries of the World",
        "paises.subtitle": "Search and explore detailed information about each country.",
        "paises.search_placeholder": "Search country by name or capital...",
        "paises.all_regions": "All Regions",
        "paises.no_countries_found": "No countries found.",
        "paises.capital": "Capital:",
        "paises.details_capital": "Capital:",
        "paises.details_region": "Region:",
        "paises.details_subregion": "Subregion:",
        "paises.details_population": "Population:",
        "paises.details_area": "Area:",
        "paises.details_currency": "Currency:",
        "paises.details_languages": "Languages:",
        "paises.details_loading": "Loading country details...",
        "paises.details_error": "Could not load this country's information.",
        "paises.not_available": "Not available",

        "quiz.title": "Quiz",
        "quiz.subtitle": "Test your geography knowledge.",
        "quiz.select_mode": "Select a game mode:",
        "quiz.mode_flags": "Flags",
        "quiz.mode_capitals": "Capitals",
        "quiz.mode_map": "Map",
        "quiz.question_header_flags": "Which country does this flag belong to?",
        "quiz.question_header_capitals": "What is the capital of",
        "quiz.question_header_map": "Find on the map:",
        "quiz.next_btn": "Next Question",
        "quiz.results_title": "Quiz Finished",
        "quiz.score": "Your score:",
        "quiz.restart_btn": "Play again",
        "quiz.loading": "Loading game...",
        "quiz.feedback_correct": "Correct!",
        "quiz.feedback_incorrect": "Incorrect."
    }
};

const languageSwitcher = document.getElementById('language-switcher');
let currentLang = localStorage.getItem('lang') || 'es';

function translatePage(lang) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = translations[lang]["paises.search_placeholder"];
    }

    const titleElement = document.querySelector('title');
    if (titleElement) {
      const key = titleElement.getAttribute('data-translate');
      if (key && translations[lang] && translations[lang][key]) {
        titleElement.textContent = translations[lang][key];
      }
    }

    const navPaises = document.querySelector('a[href="paises.html"]');
    if (navPaises) navPaises.textContent = translations[lang]["nav.paises"];
    
    const navJuegos = document.querySelector('a[href="juegos.html"]');
    if (navJuegos) navJuegos.textContent = translations[lang]["nav.quiz"];

    if (languageSwitcher) {
        languageSwitcher.value = lang;
    }
    localStorage.setItem('lang', lang);

    if (document.getElementById('paises-container') && typeof mostrarPaises !== 'undefined' && todosLosPaises.length > 0) {
        mostrarPaises(todosLosPaises);
    }
    
    if (document.getElementById('quiz-container') && quizStarted) {
        showQuestion();
    }
}

if (languageSwitcher) {
    languageSwitcher.addEventListener('change', (e) => {
        currentLang = e.target.value;
        translatePage(currentLang);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    translatePage(currentLang);
});