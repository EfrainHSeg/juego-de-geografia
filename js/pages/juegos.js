// --- SELECTORES DEL DOM ---
const loadingMessage = document.getElementById('loading-message');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const hud = document.getElementById('hud');

const flagImage = document.getElementById('flag-image');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-btn');

const scoreValue = document.getElementById('score-value');
const totalQuestionsElement = document.getElementById('total-questions');
const restartButton = document.getElementById('restart-btn');
const resultEmoji = document.getElementById('result-emoji');
const resultMessage = document.getElementById('result-message');

const modeFlagsBtn = document.getElementById('mode-flags-btn');
const modeCapitalsBtn = document.getElementById('mode-capitals-btn');

const questionCounter = document.getElementById('question-counter');
const progressBar = document.getElementById('progress-bar');
const timerDisplay = document.getElementById('timer-display');
const streakValue = document.getElementById('streak-value');

// --- VARIABLES GLOBALES ---
let allCountries = [];
let quizCountries = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
const numQuestions = 10;
const timerSeconds = 15;
let currentCorrectAnswer = '';
let quizMode = 'flags';
let quizStarted = false;
let timerInterval = null;
let timeLeft = timerSeconds;

// --- DATOS ---
async function fetchCountries() {
    try {
        allCountries = await getCountriesForQuiz();
        loadingMessage.classList.add('hidden');
    } catch (error) {
        console.error('Error al obtener los países:', error);
        loadingMessage.textContent = 'Error al cargar los países. Inténtalo de nuevo.';
    }
}

// --- QUIZ ---
function startQuiz(mode) {
    quizStarted = true;
    quizMode = mode;

    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    hud.classList.remove('hidden');

    setActiveMode(mode);

    currentQuestionIndex = 0;
    score = 0;
    streak = 0;

    quizCountries = shuffleArray(allCountries).slice(0, numQuestions);
    totalQuestionsElement.textContent = numQuestions;

    translatePage(currentLang);
    showQuestion();
}

function setActiveMode(mode) {
    modeFlagsBtn.classList.toggle('quiz-mode-card-active', mode === 'flags');
    modeCapitalsBtn.classList.toggle('quiz-mode-card-active', mode === 'capitals');
}

function showQuestion() {
    optionsContainer.innerHTML = '';
    feedbackElement.textContent = '';
    nextButton.classList.add('hidden');

    // HUD
    questionCounter.textContent = `${translations[currentLang]["quiz.question_of"] || 'Pregunta'} ${currentQuestionIndex + 1} / ${numQuestions}`;
    progressBar.style.width = `${(currentQuestionIndex / numQuestions) * 100}%`;
    streakValue.textContent = streak;

    const currentCountry = quizCountries[currentQuestionIndex];
    let options = [];

    if (quizMode === 'flags') {
        flagImage.classList.remove('hidden');
        flagImage.src = currentCountry.flags.svg;
        questionText.textContent = translations[currentLang]["quiz.question_header_flags"];

        const correctName = getCountryName(currentCountry);
        currentCorrectAnswer = correctName;

        const incorrectNames = getRandomOptions(allCountries, correctName, 3, getCountryName);
        options = shuffleArray([...incorrectNames, correctName]);

    } else {
        flagImage.classList.add('hidden');
        questionText.textContent = `${translations[currentLang]["quiz.question_header_capitals"]} ${currentCountry.name.common}?`;

        const correctCapital = currentCountry.capital[0];
        currentCorrectAnswer = correctCapital;

        const incorrectCapitals = getRandomOptions(allCountries, correctCapital, 3, c => c.capital[0]);
        options = shuffleArray([...incorrectCapitals, correctCapital]);
    }

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-white', 'p-4', 'rounded-lg', 'shadow-md', 'font-medium', 'text-lg', 'transition-colors', 'duration-200', 'hover:bg-gray-300', 'dark:hover:bg-gray-600');
        button.addEventListener('click', handleAnswer);
        optionsContainer.appendChild(button);
    });

    startTimer();
}

function getCountryName(country) {
    return currentLang === 'es' && country.name.translations?.spa
        ? country.name.translations.spa.common
        : country.name.common;
}

function getRandomOptions(pool, correctAnswer, count, getValue) {
    const results = [];
    while (results.length < count) {
        const random = pool[Math.floor(Math.random() * pool.length)];
        const value = getValue(random);
        if (value && value !== correctAnswer && !results.includes(value)) {
            results.push(value);
        }
    }
    return results;
}

// --- TEMPORIZADOR ---
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = timerSeconds;
    timerDisplay.textContent = timeLeft;
    timerDisplay.className = 'text-xl font-bold text-blue-600 dark:text-blue-400 w-6 text-center';

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 5) {
            timerDisplay.className = 'text-xl font-bold text-red-500 w-6 text-center';
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    streak = 0;
    streakValue.textContent = streak;

    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
        button.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');
        if (button.textContent === currentCorrectAnswer) {
            button.classList.add('bg-green-500', 'text-white');
        }
    });

    feedbackElement.textContent = translations[currentLang]["quiz.feedback_timeout"] || '⏱ Tiempo agotado';
    feedbackElement.className = 'text-center text-lg font-semibold my-4 text-yellow-500';
    nextButton.classList.remove('hidden');
}

// --- RESPUESTA ---
function handleAnswer(event) {
    clearInterval(timerInterval);
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
        streak++;
        feedbackElement.textContent = streak >= 3
            ? `🔥 ${translations[currentLang]["quiz.feedback_correct"]} (x${streak})`
            : translations[currentLang]["quiz.feedback_correct"];
        feedbackElement.className = 'text-center text-lg font-semibold my-4 text-green-500';
    } else {
        streak = 0;
        feedbackElement.textContent = translations[currentLang]["quiz.feedback_incorrect"];
        feedbackElement.className = 'text-center text-lg font-semibold my-4 text-red-500';
    }

    streakValue.textContent = streak;
    nextButton.classList.remove('hidden');
}

// --- RESULTADOS ---
function showResults() {
    clearInterval(timerInterval);
    quizContainer.classList.add('hidden');
    hud.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    scoreValue.textContent = score;
    progressBar.style.width = '100%';

    const ratio = score / numQuestions;
    if (ratio === 1) {
        resultEmoji.textContent = '🏆';
        resultMessage.textContent = translations[currentLang]["quiz.result_perfect"];
    } else if (ratio >= 0.8) {
        resultEmoji.textContent = '🌟';
        resultMessage.textContent = translations[currentLang]["quiz.result_great"];
    } else if (ratio >= 0.6) {
        resultEmoji.textContent = '👍';
        resultMessage.textContent = translations[currentLang]["quiz.result_good"];
    } else if (ratio >= 0.4) {
        resultEmoji.textContent = '📚';
        resultMessage.textContent = translations[currentLang]["quiz.result_ok"];
    } else {
        resultEmoji.textContent = '💪';
        resultMessage.textContent = translations[currentLang]["quiz.result_bad"];
    }
}

// --- UTILIDADES ---
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

restartButton.addEventListener('click', () => startQuiz(quizMode));
modeFlagsBtn.addEventListener('click', () => startQuiz('flags'));
modeCapitalsBtn.addEventListener('click', () => startQuiz('capitals'));

document.addEventListener('DOMContentLoaded', () => fetchCountries());
