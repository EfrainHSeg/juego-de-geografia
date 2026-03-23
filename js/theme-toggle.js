// --- Lógica para el Modo Oscuro ---
const themeToggles = document.querySelectorAll('#theme-toggle');
const html = document.documentElement;

function setThemeIcon(isDark) {
    themeToggles.forEach(btn => {
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

function toggleTheme() {
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setThemeIcon(isDark);
}

themeToggles.forEach(btn => btn.addEventListener('click', toggleTheme));

// Cargar el tema guardado al inicio
const savedDark = localStorage.getItem('theme') === 'dark';
if (savedDark) html.classList.add('dark');
setThemeIcon(savedDark);

// --- Animaciones GSAP para el efecto fade-in (solo se usa en index.html) ---
document.addEventListener('DOMContentLoaded', () => {
    // Verificamos si existe el elemento para evitar errores en otras páginas
    if (document.querySelector('.animate__fadeIn')) {
        document.querySelectorAll('.animate__fadeIn').forEach(el => {
            gsap.from(el, {
                opacity: 0,
                y: 20,
                duration: 1,
                delay: el.dataset.delay || 0,
                ease: 'power2.out'
            });
        });
    }
});