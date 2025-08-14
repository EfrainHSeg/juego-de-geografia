// --- SELECTORES DEL DOM ---
const loadingMessage = document.getElementById('loading-message');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');

const flagImage = document.getElementById('flag-image');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-btn');

const scoreValue = document.getElementById('score-value');
const totalQuestionsElement = document.getElementById('total-questions');
const restartButton = document.getElementById('restart-btn');

const modeFlagsBtn = document.getElementById('mode-flags-btn');
const modeCapitalsBtn = document.getElementById('mode-capitals-btn');

// --- VARIABLES GLOBALES ---
let allCountries = [];
let quizCountries = [];
let currentQuestionIndex = 0;
let score = 0;
const numQuestions = 10;
let currentCorrectAnswer = '';
let quizMode = 'flags'; // 'flags' o 'capitals'
let quizStarted = false;

// --- FUNCIÓN PARA OBTENER DATOS DE LA API ---
async function fetchCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        // Filtramos países que no tienen bandera o capital
        allCountries = data.filter(country => country.flags && country.capital && country.capital.length > 0);
        
        loadingMessage.classList.add('hidden');
        
    } catch (error) {
        console.error('Error al obtener los países:', error);
        loadingMessage.textContent = 'Error al cargar los países. Inténtalo de nuevo.';
    }
}

// --- FUNCIÓN PARA SELECCIONAR PAÍSES DEL QUIZ ---
function startQuiz(mode) {
    quizStarted = true;
    quizMode = mode;
    
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    
    // Resaltar el botón del modo de juego actual
    modeFlagsBtn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
    modeFlagsBtn.classList.add('bg-gray-200', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-200', 'border-gray-400', 'dark:border-gray-600');
    modeCapitalsBtn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
    modeCapitalsBtn.classList.add('bg-gray-200', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-200', 'border-gray-400', 'dark:border-gray-600');

    if (quizMode === 'flags') {
        modeFlagsBtn.classList.remove('bg-gray-200', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-200', 'border-gray-400', 'dark:border-gray-600');
        modeFlagsBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
    } else {
        modeCapitalsBtn.classList.remove('bg-gray-200', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-200', 'border-gray-400', 'dark:border-gray-600');
        modeCapitalsBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
    }

    currentQuestionIndex = 0;
    score = 0;
    
    quizCountries = shuffleArray(allCountries).slice(0, numQuestions);
    totalQuestionsElement.textContent = numQuestions;
    
    translatePage(currentLang);
    showQuestion();
}

// --- FUNCIÓN PARA MOSTRAR LA PREGUNTA ---
function showQuestion() {
    optionsContainer.innerHTML = '';
    feedbackElement.textContent = '';
    nextButton.classList.add('hidden');
    
    const currentCountry = quizCountries[currentQuestionIndex];
    
    let options = [];
    
    if (quizMode === 'flags') {
        flagImage.classList.remove('hidden');
        flagImage.src = currentCountry.flags.svg;
        questionText.textContent = translations[currentLang]["quiz.question_header_flags"];
        
        // La respuesta correcta es el nombre del país
        const correctName = currentLang === 'es' && currentCountry.name.translations && currentCountry.name.translations.spa 
                           ? currentCountry.name.translations.spa.common 
                           : currentCountry.name.common;
        currentCorrectAnswer = correctName;
        
        // Crear 3 opciones incorrectas (nombres de países)
        let incorrectNames = [];
        while (incorrectNames.length < 3) {
            const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
            const randomName = currentLang === 'es' && randomCountry.name.translations && randomCountry.name.translations.spa 
                               ? randomCountry.name.translations.spa.common 
                               : randomCountry.name.common;
            if (randomName !== correctName && !incorrectNames.includes(randomName)) {
                incorrectNames.push(randomName);
            }
        }
        options = shuffleArray([...incorrectNames, correctName]);

    } else if (quizMode === 'capitals') {
        flagImage.classList.add('hidden');
        questionText.textContent = `${translations[currentLang]["quiz.question_header_capitals"]} ${currentCountry.name.common}?`;
        
        // La respuesta correcta es el nombre de la capital
        const correctCapital = currentCountry.capital[0];
        currentCorrectAnswer = correctCapital;
        
        // Crear 3 opciones incorrectas (capitales)
        let incorrectCapitals = [];
        while (incorrectCapitals.length < 3) {
            const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
            const randomCapital = randomCountry.capital[0];
            if (randomCapital !== correctCapital && !incorrectCapitals.includes(randomCapital)) {
                incorrectCapitals.push(randomCapital);
            }
        }
        options = shuffleArray([...incorrectCapitals, correctCapital]);
    }
    
    // Crear los botones de opciones
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-white', 'p-4', 'rounded-lg', 'shadow-md', 'font-medium', 'text-lg', 'transition-colors', 'duration-200', 'hover:bg-gray-300', 'dark:hover:bg-gray-600');
        button.addEventListener('click', handleAnswer);
        optionsContainer.appendChild(button);
    });
}

// --- FUNCIÓN PARA MANEJAR LA RESPUESTA ---
function handleAnswer(event) {
    const selectedAnswer = event.target.textContent;
    const isCorrect = selectedAnswer === currentCorrectAnswer;
    
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
        button.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');
        if (button.textContent === currentCorrectAnswer) {
            button.classList.add('bg-green-500', 'text-white');
        } else if (button.textContent === selectedAnswer) {
            button.classList.add('bg-red-500', 'text-white');
        }
    });

    if (isCorrect) {
        score++;
        feedbackElement.textContent = translations[currentLang]["quiz.feedback_correct"];
        feedbackElement.classList.remove('text-red-500');
        feedbackElement.classList.add('text-green-500');
    } else {
        feedbackElement.textContent = translations[currentLang]["quiz.feedback_incorrect"];
        feedbackElement.classList.remove('text-green-500');
        feedbackElement.classList.add('text-red-500');
    }

    nextButton.classList.remove('hidden');
}

// --- FUNCIÓN PARA MOSTRAR LOS RESULTADOS ---
function showResults() {
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    scoreValue.textContent = score;
}

// --- FUNCIÓN PARA MEZCLAR UN ARRAY ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- EVENT LISTENERS ---
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < numQuestions) {
        showQuestion();
    } else {
        showResults();
    }
});

restartButton.addEventListener('click', () => {
    startQuiz(quizMode);
});

modeFlagsBtn.addEventListener('click', () => {
    startQuiz('flags');
});

modeCapitalsBtn.addEventListener('click', () => {
    startQuiz('capitals');
});


// --- INICIAMOS LA APLICACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    fetchCountries();
    // No empezamos el quiz hasta que el usuario elija un modo
});