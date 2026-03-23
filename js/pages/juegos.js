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
const funfactContainer = document.getElementById('funfact-container');
const funfactText = document.getElementById('funfact-text');

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

// --- DIFICULTAD ---
const DIFFICULTIES = {
    easy:   { time: 20, options: 4 },
    medium: { time: 15, options: 4 },
    hard:   { time: 8,  options: 6 }
};
let currentDifficulty = 'easy';

// --- VARIABLES GLOBALES ---
let allCountries = [];
let quizCountries = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
const numQuestions = 10;
let currentCorrectAnswer = '';
let quizMode = 'flags';
let quizStarted = false;
let timerInterval = null;
let timeLeft = DIFFICULTIES[currentDifficulty].time;

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
    funfactContainer.classList.add('hidden');

    // HUD
    questionCounter.textContent = `${translations[currentLang]["quiz.question_of"] || 'Pregunta'} ${currentQuestionIndex + 1} / ${numQuestions}`;
    progressBar.style.width = `${(currentQuestionIndex / numQuestions) * 100}%`;
    streakValue.textContent = streak;

    const currentCountry = quizCountries[currentQuestionIndex];
    let options = [];
    const numIncorrect = DIFFICULTIES[currentDifficulty].options - 1;

    if (quizMode === 'flags') {
        flagImage.classList.remove('hidden');
        flagImage.src = currentCountry.flags.svg;
        questionText.textContent = translations[currentLang]["quiz.question_header_flags"];

        const correctName = getCountryName(currentCountry);
        currentCorrectAnswer = correctName;

        const incorrectNames = getRandomOptions(allCountries, correctName, numIncorrect, getCountryName);
        options = shuffleArray([...incorrectNames, correctName]);

    } else {
        flagImage.classList.add('hidden');
        questionText.textContent = `${translations[currentLang]["quiz.question_header_capitals"]} ${currentCountry.name.common}?`;

        const correctCapital = currentCountry.capital[0];
        currentCorrectAnswer = correctCapital;

        const incorrectCapitals = getRandomOptions(allCountries, correctCapital, numIncorrect, c => c.capital[0]);
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
    timeLeft = DIFFICULTIES[currentDifficulty].time;
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
    showFunFact(quizCountries[currentQuestionIndex]);
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
    showFunFact(quizCountries[currentQuestionIndex]);
    nextButton.classList.remove('hidden');
}

// --- DATO CURIOSO ---
async function showFunFact(country) {
    try {
        const data = await getWikipediaSummary(country.name.common, currentLang);
        if (!data || !data.extract) return;
        const sentences = data.extract.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
        funfactText.textContent = sentences;
        funfactContainer.classList.remove('hidden');
    } catch (e) {
        // silently fail
    }
}

// --- HIGHSCORES ---
function getHighscores() {
    return JSON.parse(localStorage.getItem('quiz_highscores') || '[]');
}

function saveHighscore(score, total, mode, difficulty) {
    const scores = getHighscores();
    const name = prompt(currentLang === 'es' ? '¿Tu nombre para el ranking?' : 'Your name for the ranking?') || 'Anónimo';
    scores.push({ name, score, total, mode, difficulty, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('quiz_highscores', JSON.stringify(scores.slice(0, 10)));
    return scores;
}

function renderHighscores() {
    const list = document.getElementById('highscores-list');
    const scores = getHighscores();
    if (!scores.length) {
        list.innerHTML = `<p class="text-sm text-gray-400 text-center">Sin puntuaciones aún.</p>`;
        return;
    }
    list.innerHTML = scores.slice(0, 5).map((s, i) => `
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
            <span class="text-lg font-extrabold w-6 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-400'}">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
            <span class="flex-1 font-semibold text-sm truncate">${s.name}</span>
            <span class="text-sm font-bold text-blue-600 dark:text-blue-400">${s.score}/${s.total}</span>
            <span class="text-xs text-gray-400">${s.date}</span>
        </div>
    `).join('');
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

    saveHighscore(score, numQuestions, quizMode, currentDifficulty);
    renderHighscores();
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

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentDifficulty = btn.dataset.diff;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('diff-btn-active'));
        btn.classList.add('diff-btn-active');
    });
});

document.addEventListener('DOMContentLoaded', () => fetchCountries());
